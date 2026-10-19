import { describe, expect, it } from "vitest";
import {
  canConnectTerminals,
  resolveConductorRoles,
  terminalKey,
} from "./cables";

const twoBulbs = {
  nodes: [
    {
      id: "bat",
      kind: "battery" as const,
      terminals: [{ id: "positive" }, { id: "negative" }],
    },
    {
      id: "sw",
      kind: "switch" as const,
      terminals: [{ id: "a" }, { id: "b" }],
      switchClosed: true,
    },
    {
      id: "bulb-1",
      kind: "bulb" as const,
      terminals: [{ id: "a" }, { id: "b" }, { id: "earth" }],
    },
    {
      id: "bulb-2",
      kind: "bulb" as const,
      terminals: [{ id: "a" }, { id: "b" }, { id: "earth" }],
    },
    {
      id: "gnd",
      kind: "ground" as const,
      terminals: [{ id: "earth" }],
    },
  ],
  edges: [
    { source: "bat", sourceHandle: "positive", target: "sw", targetHandle: "a" },
    { source: "sw", sourceHandle: "b", target: "bulb-1", targetHandle: "a" },
    { source: "bulb-1", sourceHandle: "b", target: "bulb-2", targetHandle: "a" },
    { source: "bulb-2", sourceHandle: "b", target: "bat", targetHandle: "negative" },
    { source: "bulb-2", sourceHandle: "earth", target: "gnd", targetHandle: "earth" },
  ],
};

describe("conductores", () => {
  it("permite el puente en serie entre bornes de dos ampolletas", () => {
    expect(canConnectTerminals("bulb", "b", "bulb", "a")).toBe(true);
    expect(canConnectTerminals("bulb", "earth", "bulb", "a")).toBe(false);
    expect(
      canConnectTerminals("bulb", "earth", "bulb", "a", {
        allowEarthFault: true,
      }),
    ).toBe(true);
    expect(canConnectTerminals("bulb", "earth", "ground", "earth")).toBe(true);
  });

  it("el electrodoméstico solo enchufa al tomacorriente", () => {
    expect(canConnectTerminals("appliance", "plug", "outlet", "socket0")).toBe(
      true,
    );
    expect(canConnectTerminals("outlet", "socket0", "appliance", "plug")).toBe(
      true,
    );
    expect(canConnectTerminals("appliance", "plug", "battery", "positive")).toBe(
      false,
    );
    expect(canConnectTerminals("appliance", "plug", "ground", "earth")).toBe(
      false,
    );
    expect(canConnectTerminals("outlet", "socket0", "switch", "a")).toBe(false);
    expect(canConnectTerminals("outlet", "lineL", "battery", "positive")).toBe(
      true,
    );
    expect(canConnectTerminals("outlet", "earth", "ground", "earth")).toBe(true);
  });

  it("el diferencial mantiene fase roja y neutro blanco en polos distintos", () => {
    expect(canConnectTerminals("rcd", "lineL", "battery", "positive")).toBe(
      true,
    );
    expect(canConnectTerminals("rcd", "lineN", "battery", "negative")).toBe(
      true,
    );
    expect(canConnectTerminals("rcd", "lineL", "rcd", "lineN")).toBe(false);
    expect(canConnectTerminals("rcd", "loadL", "battery", "negative")).toBe(
      false,
    );
    expect(
      canConnectTerminals("mainSwitch", "lineL", "battery", "negative"),
    ).toBe(false);
    expect(canConnectTerminals("mcb", "lineL", "mcb", "lineN")).toBe(false);
    expect(canConnectTerminals("lightPole", "lineL", "outlet", "lineN")).toBe(
      false,
    );
    expect(canConnectTerminals("lightPole", "lineL", "outlet", "lineL")).toBe(
      true,
    );
    expect(canConnectTerminals("lightPole", "lineN", "outlet", "lineN")).toBe(
      true,
    );

    const roles = resolveConductorRoles(
      [
        {
          id: "bat",
          kind: "battery",
          terminals: [{ id: "positive" }, { id: "negative" }],
        },
        {
          id: "id",
          kind: "rcd",
          terminals: [
            { id: "lineL" },
            { id: "lineN" },
            { id: "loadL" },
            { id: "loadN" },
          ],
          switchClosed: true,
        },
        {
          id: "bulb",
          kind: "bulb",
          terminals: [{ id: "a" }, { id: "b" }],
        },
      ],
      [
        {
          source: "bat",
          sourceHandle: "positive",
          target: "id",
          targetHandle: "lineL",
        },
        {
          source: "id",
          sourceHandle: "loadL",
          target: "bulb",
          targetHandle: "a",
        },
        {
          source: "bulb",
          sourceHandle: "b",
          target: "id",
          targetHandle: "loadN",
        },
        {
          source: "id",
          sourceHandle: "lineN",
          target: "bat",
          targetHandle: "negative",
        },
      ],
    );
    expect(roles.get(terminalKey("id", "lineL"))).toBe("fase");
    expect(roles.get(terminalKey("id", "loadL"))).toBe("fase");
    expect(roles.get(terminalKey("id", "lineN"))).toBe("neutro");
    expect(roles.get(terminalKey("id", "loadN"))).toBe("neutro");
  });

  it("pinta de rojo el puente entre dos ampolletas y de blanco solo el retorno al −", () => {
    const roles = resolveConductorRoles(twoBulbs.nodes, twoBulbs.edges);
    expect(roles.get(terminalKey("bat", "positive"))).toBe("fase");
    expect(roles.get(terminalKey("sw", "a"))).toBe("fase");
    expect(roles.get(terminalKey("bulb-1", "a"))).toBe("fase");
    expect(roles.get(terminalKey("bulb-1", "b"))).toBe("fase");
    expect(roles.get(terminalKey("bulb-2", "a"))).toBe("fase");
    expect(roles.get(terminalKey("bulb-2", "b"))).toBe("neutro");
    expect(roles.get(terminalKey("bat", "negative"))).toBe("neutro");
    expect(roles.get(terminalKey("bulb-2", "earth"))).toBe("tierra");
  });
});
