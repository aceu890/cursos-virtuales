import { describe, expect, it } from "vitest";
import type { Edge, Node } from "@xyflow/react";
import type { CircuitNodeData } from "./flowTypes";
import { graphFromFlow } from "./fromFlow";

function node(
  id: string,
  kind: CircuitNodeData["kind"],
  terminals: CircuitNodeData["terminals"],
  extra: Partial<CircuitNodeData> = {},
): Node<CircuitNodeData> {
  return {
    id,
    position: { x: 0, y: 0 },
    data: { kind, label: id, terminals, ...extra },
  };
}

describe("graphFromFlow", () => {
  it("suma la potencia del electrodoméstico enchufado al tomacorriente", () => {
    const nodes: Node<CircuitNodeData>[] = [
      node("bat", "battery", [
        { id: "positive", polarity: "positive" },
        { id: "negative", polarity: "negative" },
      ]),
      node("out", "outlet", [
        { id: "lineL", polarity: "a" },
        { id: "lineN", polarity: "b" },
        { id: "earth", polarity: "earth" },
        { id: "socket0", polarity: "a" },
      ]),
      node(
        "kettle",
        "appliance",
        [{ id: "plug", polarity: "a" }],
        { watts: 2200 },
      ),
    ];
    const edges: Edge[] = [
      {
        id: "w1",
        source: "bat",
        sourceHandle: "positive",
        target: "out",
        targetHandle: "lineL",
      },
      {
        id: "w2",
        source: "out",
        sourceHandle: "lineN",
        target: "bat",
        targetHandle: "negative",
      },
      {
        id: "plug",
        source: "kettle",
        sourceHandle: "plug",
        target: "out",
        targetHandle: "socket0",
      },
    ];

    const graph = graphFromFlow(nodes, edges);
    const outlet = graph.components.find((component) => component.id === "out");
    expect(outlet?.state?.watts).toBe(2200);
    expect(outlet?.state?.pluggedIds).toEqual(["kettle"]);
    expect(
      graph.wires.some(
        (wire) =>
          wire.from.terminalId === "plug" || wire.to.terminalId === "socket0",
      ),
    ).toBe(false);
  });

  it("un electrodoméstico apagado no aporta potencia al tomacorriente", () => {
    const nodes: Node<CircuitNodeData>[] = [
      node("out", "outlet", [
        { id: "lineL", polarity: "a" },
        { id: "lineN", polarity: "b" },
        { id: "socket0", polarity: "a" },
      ]),
      node(
        "kettle",
        "appliance",
        [{ id: "plug", polarity: "a" }],
        { watts: 2200, switchClosed: false },
      ),
    ];
    const edges: Edge[] = [
      {
        id: "plug",
        source: "kettle",
        sourceHandle: "plug",
        target: "out",
        targetHandle: "socket0",
      },
    ];

    const graph = graphFromFlow(nodes, edges);
    const outlet = graph.components.find((component) => component.id === "out");
    expect(outlet?.state?.watts).toBe(0);
    expect(outlet?.state?.pluggedIds).toEqual(["kettle"]);
  });
});
