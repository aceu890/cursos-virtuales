import { describe, expect, it } from "vitest";
import { placeSchematic } from "./schematicLayout";

describe("placeSchematic", () => {
  it("alinea un circuito en serie de izquierda a derecha", () => {
    const placed = placeSchematic(
      [
        { id: "b", kind: "battery", w: 200, h: 160 },
        { id: "s", kind: "switch", w: 180, h: 200 },
        { id: "l", kind: "bulb", w: 160, h: 220 },
      ],
      [],
    );
    const battery = placed.get("b");
    const sw = placed.get("s");
    const bulb = placed.get("l");
    expect(battery && sw && bulb).toBeTruthy();
    expect(battery!.x).toBeLessThan(sw!.x);
    expect(sw!.x).toBeLessThan(bulb!.x);
    expect(battery!.y).toBe(sw!.y);
    expect(sw!.x - (battery!.x + 200)).toBeGreaterThanOrEqual(100);
  });

  it("apila las ramas de un paralelo", () => {
    const placed = placeSchematic(
      [
        { id: "b", kind: "battery", w: 200, h: 160 },
        { id: "l1", kind: "bulb", w: 160, h: 200 },
        { id: "l2", kind: "bulb", w: 160, h: 200 },
      ],
      [
        { source: "b", target: "l1" },
        { source: "b", target: "l2" },
        { source: "l1", target: "b" },
        { source: "l2", target: "b" },
      ],
    );
    const first = placed.get("l1");
    const second = placed.get("l2");
    expect(first && second).toBeTruthy();
    expect(first!.x).toBe(second!.x);
    expect(Math.abs(first!.y - second!.y)).toBeGreaterThanOrEqual(100);
  });
});
