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
    ).toBeGreaterThan(40);
  });

  it("abre espacio entre dos cables del mismo color", () => {
    const lanes = assignLaneOffsets([
      { id: "r1", role: "fase" },
      { id: "r2", role: "fase" },
    ]);
    expect(Math.abs((lanes.get("r1") ?? 0) - (lanes.get("r2") ?? 0))).toBe(48);
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
    ).toBe(22);
    expect(spreads.get("a")?.target).toBe(0);
    expect(spreads.get("b")?.target).toBe(0);
  });
});

describe("orderedCablePath", () => {
  it("envuelve el neutro por abajo y la fase por arriba cuando van hacia atrás", () => {
    const red = cableWaypoints({
      sourceX: 500,
      sourceY: 80,
      targetX: 40,
      targetY: 90,
      sourcePosition: "right",
      targetPosition: "left",
      lane: -72,
    });
    const white = cableWaypoints({
      sourceX: 500,
      sourceY: 80,
      targetX: 40,
      targetY: 90,
      sourcePosition: "right",
      targetPosition: "left",
      lane: 56,
    });
    const redBand = Math.min(...red.map((point) => point.y));
    const whiteBand = Math.max(...white.map((point) => point.y));
    expect(whiteBand - redBand).toBeGreaterThan(80);
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
      lane: -72,
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
      lane: -72,
    });
    expect(Math.min(...points.map((point) => point.y))).toBeLessThan(80);
    expect(Math.max(...points.map((point) => point.x))).toBeLessThanOrEqual(400);
  });

  it("saca la tierra por el costado y no la mezcla con fase y neutro", () => {
    const earth = cableWaypoints({
      sourceX: 400,
      sourceY: 80,
      targetX: 520,
      targetY: 280,
      sourcePosition: "top",
      targetPosition: "top",
      lane: 124,
    });
    expect(Math.max(...earth.map((point) => point.x))).toBeGreaterThan(520);
    expect(Math.min(...earth.map((point) => point.y))).toBeGreaterThan(40);
  });

  it("separa dos cables que salen del mismo borne de arriba", () => {
    const left = cableWaypoints({
      sourceX: 200,
      sourceY: 80,
      targetX: 80,
      targetY: 80,
      sourcePosition: "top",
      targetPosition: "top",
      lane: -72,
      sourceSpread: -9,
    });
    const right = cableWaypoints({
      sourceX: 200,
      sourceY: 80,
      targetX: 360,
      targetY: 80,
      sourcePosition: "top",
      targetPosition: "top",
      lane: -24,
      sourceSpread: 9,
    });
    const leftExit = left.find((point) => point.y < 80);
    const rightExit = right.find((point) => point.y < 80);
    expect(leftExit?.x).toBeLessThan(200);
    expect(rightExit?.x).toBeGreaterThan(200);
    expect(Math.abs((rightExit?.x ?? 0) - (leftExit?.x ?? 0))).toBeGreaterThan(
      12,
    );
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

  it("pone los puntos de mover en el hueco, no pegados al artefacto", () => {
    const jump = cableWaypoints({
      sourceX: 200,
      sourceY: 380,
      targetX: 520,
      targetY: 100,
      sourcePosition: "bottom",
      targetPosition: "top",
      lane: -72,
    });
    const jumpOut = jump[1];
    const jumpIn = jump[jump.length - 2];
    const jumpKnobs = segmentKnobs(jump);
    const jumpH = jumpKnobs.find((knob) => knob.axis === "h");
    const jumpV = jumpKnobs.find((knob) => knob.axis === "v");
    expect(jumpH).toBeTruthy();
    expect(jumpV).toBeTruthy();
    expect(Math.abs((jumpH?.y ?? 0) - (jumpOut?.y ?? 0))).toBeGreaterThan(24);
    expect(Math.abs((jumpH?.y ?? 0) - (jumpIn?.y ?? 0))).toBeGreaterThan(24);

    const bus = cableWaypoints({
      sourceX: 120,
      sourceY: 80,
      targetX: 400,
      targetY: 80,
      sourcePosition: "top",
      targetPosition: "top",
      lane: -72,
    });
    const busOut = bus[1];
    const busIn = bus[bus.length - 2];
    const busKnobs = segmentKnobs(bus);
    const busV = busKnobs.find((knob) => knob.axis === "v");
    const busH = busKnobs.find((knob) => knob.axis === "h");
    expect(busH).toBeTruthy();
    expect(busV).toBeTruthy();
    expect(Math.abs((busV?.x ?? 0) - (busOut?.x ?? 0))).toBeGreaterThan(24);
    expect(Math.abs((busV?.x ?? 0) - (busIn?.x ?? 0))).toBeGreaterThan(24);
  });

  it("parte del pasillo automático para no quebrar el cable al primer arrastre", () => {
    const seed = seedManualVia({
      sourceX: 200,
      sourceY: 380,
      targetX: 520,
      targetY: 100,
      sourcePosition: "bottom",
      targetPosition: "top",
      lane: -72,
    });
    expect(seed.x).toBeGreaterThan(220);
    expect(seed.x).toBeLessThan(500);
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
      lane: -72,
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
      lane: -72,
    });
    expect(path.startsWith("M ")).toBe(true);
    expect(path).toContain("L 300 80");
    expect(path).not.toMatch(/Q /);
  });

  it("sube por el pasillo y no atraviesa la pieza al ir de un borne derecho a uno de arriba", () => {
    const points = cableWaypoints({
      sourceX: 280,
      sourceY: 200,
      targetX: 520,
      targetY: 48,
      sourcePosition: "right",
      targetPosition: "top",
      lane: -72,
    });
    const throughTheCard = points.some(
      (point) => point.x > 440 && point.y > 90 && point.y < 190,
    );
    expect(throughTheCard).toBe(false);
    const aisle = points.find((point) => point.y < 80);
    expect(aisle?.x).toBeLessThan(400);
  });

  it("salta por el hueco entre dos protecciones en fila", () => {
    const red = cableWaypoints({
      sourceX: 200,
      sourceY: 380,
      targetX: 520,
      targetY: 100,
      sourcePosition: "bottom",
      targetPosition: "top",
      lane: -72,
    });
    const white = cableWaypoints({
      sourceX: 268,
      sourceY: 380,
      targetX: 588,
      targetY: 100,
      sourcePosition: "bottom",
      targetPosition: "top",
      lane: 56,
    });
    const redAisle = red.find((point) => point.y < 160 && point.x > 220);
    const whiteAisle = white.find((point) => point.y < 160 && point.x > 280);
    expect(redAisle?.x).toBeGreaterThan(220);
    expect(redAisle?.x).toBeLessThan(500);
    expect(whiteAisle?.x).toBeGreaterThan(redAisle?.x ?? 0);
    expect(Math.min(...red.map((point) => point.x))).toBeGreaterThan(180);
    expect(Math.min(...white.map((point) => point.y))).toBeLessThan(
      Math.min(...red.map((point) => point.y)) - 20,
    );
  });

  it("baja fase y neutro en pasillos paralelos entre protecciones", () => {
    const red = cableWaypoints({
      sourceX: 504,
      sourceY: 400,
      targetX: 504,
      targetY: 456,
      sourcePosition: "bottom",
      targetPosition: "top",
      lane: -72,
    });
    const white = cableWaypoints({
      sourceX: 576,
      sourceY: 400,
      targetX: 576,
      targetY: 456,
      sourcePosition: "bottom",
      targetPosition: "top",
      lane: 56,
    });
    expect(Math.max(...red.map((point) => Math.abs(point.x - 504)))).toBeLessThan(
      8,
    );
    expect(
      Math.max(...white.map((point) => Math.abs(point.x - 576))),
    ).toBeLessThan(8);
    expect(Math.min(...red.map((point) => point.x))).toBeLessThan(
      Math.min(...white.map((point) => point.x)),
    );
  });
});
