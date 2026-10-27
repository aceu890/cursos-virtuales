import { describe, expect, it } from "vitest";
import { assignLaneOffsets, assignTerminalSpreads } from "./cableLanes";
import {
  cableWaypoints,
  manhattanThrough,
  orderedCablePath,
  seedManualVia,
  segmentKnobs,
  snapManualVia,
} from "./cablePath";

describe("assignLaneOffsets", () => {
  it("separa fase, neutro y tierra en pasillos distintos", () => {
    const lanes = assignLaneOffsets([
      { id: "a", role: "fase" },
      { id: "b", role: "neutro" },
      { id: "c", role: "tierra" },
    ]);
    expect(lanes.get("a")).toBeLessThan(lanes.get("b") ?? 0);
    expect(lanes.get("b")).toBeLessThan(lanes.get("c") ?? 0);
    expect(
      Math.abs((lanes.get("a") ?? 0) - (lanes.get("b") ?? 0)),
    ).toBe(20);
  });

  it("abre espacio entre dos cables del mismo color", () => {
    const lanes = assignLaneOffsets([
      { id: "r1", role: "fase" },
      { id: "r2", role: "fase" },
    ]);
    expect(Math.abs((lanes.get("r1") ?? 0) - (lanes.get("r2") ?? 0))).toBe(20);
  });
});

describe("assignTerminalSpreads", () => {
  it("abre en horquilla dos cables que salen del mismo borne", () => {
    const spreads = assignTerminalSpreads([
      {
        id: "a",
        source: "pole",
        sourceHandle: "lineL",
        target: "sw",
        targetHandle: "lineL",
      },
      {
        id: "b",
        source: "pole",
        sourceHandle: "lineL",
        target: "rcd",
        targetHandle: "lineL",
      },
    ]);
    expect(spreads.get("a")?.source).not.toBe(spreads.get("b")?.source);
    expect(
      Math.abs((spreads.get("a")?.source ?? 0) - (spreads.get("b")?.source ?? 0)),
    ).toBe(20);
    expect(spreads.get("a")?.target).toBe(0);
    expect(spreads.get("b")?.target).toBe(0);
  });
});

describe("orderedCablePath", () => {
  it("separa fase y neutro 10 px cuando comparten pasillo", () => {
    const red = cableWaypoints({
      sourceX: 80,
      sourceY: 40,
      targetX: 420,
      targetY: 40,
      sourcePosition: "top",
      targetPosition: "top",
      lane: 0,
    });
    const white = cableWaypoints({
      sourceX: 80,
      sourceY: 40,
      targetX: 420,
      targetY: 40,
      sourcePosition: "top",
      targetPosition: "top",
      lane: 10,
    });
    const redYs = new Set(red.map((point) => point.y));
    const whiteOnly = white.filter((point) => !redYs.has(point.y));
    expect(whiteOnly.length).toBeGreaterThan(0);
    for (const route of [red, white]) {
      for (let i = 1; i < route.length; i += 1) {
        const prev = route[i - 1];
        const curr = route[i];
        expect(prev?.x === curr?.x || prev?.y === curr?.y).toBe(true);
      }
    }
  });

  it("une bornes cercanos que se miran sin subir por encima", () => {
    const points = cableWaypoints({
      sourceX: 276,
      sourceY: 150,
      targetX: 284,
      targetY: 148,
      sourcePosition: "right",
      targetPosition: "left",
      lane: -96,
    });
    expect(Math.min(...points.map((point) => point.y))).toBeGreaterThan(100);
  });

  it("no se pasa de largo cuando los bornes están cerca", () => {
    const points = cableWaypoints({
      sourceX: 250,
      sourceY: 80,
      targetX: 300,
      targetY: 80,
      sourcePosition: "right",
      targetPosition: "left",
      lane: 0,
    });
    const maxX = Math.max(...points.map((point) => point.x));
    const minX = Math.min(...points.map((point) => point.x));
    expect(minX).toBeGreaterThanOrEqual(249);
    expect(maxX).toBeLessThanOrEqual(301);
  });

  it("une dos bornes de arriba por un bus sobre las piezas", () => {
    const points = cableWaypoints({
      sourceX: 120,
      sourceY: 80,
      targetX: 400,
      targetY: 80,
      sourcePosition: "top",
      targetPosition: "top",
      lane: 0,
    });
    expect(Math.min(...points.map((point) => point.y))).toBeLessThan(80);
    expect(Math.max(...points.map((point) => point.x))).toBeLessThanOrEqual(400);
  });

  it("rodea una pieza que queda en el camino recto", () => {
    const points = cableWaypoints({
      sourceX: 40,
      sourceY: 80,
      targetX: 400,
      targetY: 80,
      sourcePosition: "right",
      targetPosition: "left",
      lane: 0,
      obstacles: [{ x: 140, y: 40, w: 120, h: 80 }],
    });
    const crosses = points.some(
      (point, index) => {
        const next = points[index + 1];
        if (!next) {
          return false;
        }
        const minX = Math.min(point.x, next.x);
        const maxX = Math.max(point.x, next.x);
        const minY = Math.min(point.y, next.y);
        const maxY = Math.max(point.y, next.y);
        return maxX > 141 && minX < 259 && maxY > 41 && minY < 119;
      },
    );
    expect(crosses).toBe(false);
  });

  it("sale 20 px en la dirección del borne antes de girar", () => {
    const points = cableWaypoints({
      sourceX: 100,
      sourceY: 80,
      targetX: 280,
      targetY: 200,
      sourcePosition: "top",
      targetPosition: "left",
      lane: 0,
    });
    expect(points[1]).toEqual({ x: 100, y: 60 });
  });

  it("respeta un punto que el usuario coloca a mano", () => {
    const points = manhattanThrough({
      sourceX: 100,
      sourceY: 80,
      targetX: 400,
      targetY: 80,
      sourcePosition: "top",
      targetPosition: "top",
      lane: 0,
      vias: [{ x: 250, y: 20 }],
    });
    expect(points.some((point) => point.y === 20)).toBe(true);
    expect(points.some((point) => point.x === 250)).toBe(true);
    for (let i = 1; i < points.length; i += 1) {
      const prev = points[i - 1];
      const curr = points[i];
      expect(prev.x === curr.x || prev.y === curr.y).toBe(true);
    }
  });

  it("al mover a mano desplaza el bus horizontal o el vertical", () => {
    const current = { x: 250, y: 20 };
    expect(
      snapManualVia({ x: 10, y: 40 }, "top", "top", 100, 80, 400, 80, current, "h"),
    ).toEqual({ x: 250, y: 40 });
    expect(
      snapManualVia({ x: 10, y: 40 }, "top", "top", 100, 80, 400, 80, current, "v"),
    ).toEqual({ x: 10, y: 20 });
    expect(
      snapManualVia({ x: 10, y: 40 }, "top", "top", 100, 80, 400, 80, current),
    ).toEqual({ x: 10, y: 40 });
  });

  it("deja un asa para mover un cable con tramo horizontal y vertical", () => {
    const bus = cableWaypoints({
      sourceX: 120,
      sourceY: 80,
      targetX: 400,
      targetY: 80,
      sourcePosition: "top",
      targetPosition: "top",
      lane: 0,
    });
    const knobs = segmentKnobs(bus);
    expect(knobs.length).toBeGreaterThan(0);
    for (let i = 1; i < bus.length; i += 1) {
      const prev = bus[i - 1];
      const curr = bus[i];
      expect(prev?.x === curr?.x || prev?.y === curr?.y).toBe(true);
    }
  });

  it("parte del pasillo automático para no quebrar el cable al primer arrastre", () => {
    const seed = seedManualVia({
      sourceX: 200,
      sourceY: 380,
      targetX: 520,
      targetY: 100,
      sourcePosition: "bottom",
      targetPosition: "top",
      lane: 0,
    });
    expect(seed.x).toBeGreaterThanOrEqual(200);
    expect(seed.x).toBeLessThanOrEqual(520);
    const moved = snapManualVia(
      { x: 310, y: 200 },
      "bottom",
      "top",
      200,
      380,
      520,
      100,
      seed,
      "v",
    );
    expect(moved.x).toBe(310);
    expect(moved.y).toBe(seed.y);
    const routed = manhattanThrough({
      sourceX: 200,
      sourceY: 380,
      targetX: 520,
      targetY: 100,
      sourcePosition: "bottom",
      targetPosition: "top",
      lane: 0,
      vias: [moved],
    });
    expect(routed.some((point) => point.x === 310)).toBe(true);
    for (let i = 1; i < routed.length; i += 1) {
      const prev = routed[i - 1];
      const curr = routed[i];
      expect(prev.x === curr.x || prev.y === curr.y).toBe(true);
    }
    const knobs = segmentKnobs(routed);
    expect(knobs.some((knob) => knob.axis === "v")).toBe(true);
    expect(knobs.some((knob) => knob.axis === "h")).toBe(true);
  });

  it("dibuja un tramo directo cuando los bornes se miran", () => {
    const path = orderedCablePath({
      sourceX: 100,
      sourceY: 80,
      targetX: 300,
      targetY: 80,
      sourcePosition: "right",
      targetPosition: "left",
      lane: 0,
    });
    expect(path.startsWith("M ")).toBe(true);
    expect(path).toContain("L 300 80");
    expect(path).not.toMatch(/Q /);
  });

  it("no cruza la caja al ir de un borne derecho a uno de arriba", () => {
    const points = cableWaypoints({
      sourceX: 280,
      sourceY: 200,
      targetX: 520,
      targetY: 48,
      sourcePosition: "right",
      targetPosition: "top",
      lane: 0,
      obstacles: [{ x: 300, y: 60, w: 200, h: 160 }],
    });
    const crosses = points.some((point, index) => {
      const next = points[index + 1];
      if (!next) {
        return false;
      }
      const minX = Math.min(point.x, next.x);
      const maxX = Math.max(point.x, next.x);
      const minY = Math.min(point.y, next.y);
      const maxY = Math.max(point.y, next.y);
      return maxX > 301 && minX < 499 && maxY > 61 && minY < 219;
    });
    expect(crosses).toBe(false);
  });

  it("mantiene en su eje un tramo vertical corto", () => {
    const red = cableWaypoints({
      sourceX: 504,
      sourceY: 400,
      targetX: 504,
      targetY: 456,
      sourcePosition: "bottom",
      targetPosition: "top",
      lane: 0,
    });
    expect(Math.max(...red.map((point) => Math.abs(point.x - 504)))).toBeLessThan(1);
  });
});
