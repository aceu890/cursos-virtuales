import { describe, expect, it } from "vitest";
import { bundleCableRoutes, cableWaypoints, type Point } from "./cablePath";
import { separateRoutes } from "./separateRoutes";

const parts = [{ x: 40, y: 70, w: 460, h: 120 }];

function parallelGaps(routes: Point[][]) {
  const gaps: number[] = [];
  routes.forEach((route, index) => {
    for (let other = index + 1; other < routes.length; other += 1) {
      const b = routes[other] ?? [];
      for (let i = 0; i < route.length - 1; i += 1) {
        const a1 = route[i];
        const a2 = route[i + 1];
        if (!a1 || !a2) continue;
        for (let j = 0; j < b.length - 1; j += 1) {
          const b1 = b[j];
          const b2 = b[j + 1];
          if (!b1 || !b2) continue;
          const aH = Math.abs(a1.y - a2.y) < 0.8;
          const bH = Math.abs(b1.y - b2.y) < 0.8;
          const aV = Math.abs(a1.x - a2.x) < 0.8;
          const bV = Math.abs(b1.x - b2.x) < 0.8;
          if (aH && bH) {
            const overlap =
              Math.min(Math.max(a1.x, a2.x), Math.max(b1.x, b2.x)) -
              Math.max(Math.min(a1.x, a2.x), Math.min(b1.x, b2.x));
            if (overlap > 12) gaps.push(Math.abs(a1.y - b1.y));
          }
          if (aV && bV) {
            const overlap =
              Math.min(Math.max(a1.y, a2.y), Math.max(b1.y, b2.y)) -
              Math.max(Math.min(a1.y, a2.y), Math.min(b1.y, b2.y));
            if (overlap > 12) gaps.push(Math.abs(a1.x - b1.x));
          }
        }
      }
    }
  });
  return gaps;
}

function orthogonal(points: Point[]) {
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    if (!prev || !curr) continue;
    expect(prev.x === curr.x || prev.y === curr.y).toBe(true);
  }
}

describe("separateRoutes", () => {
  it("separa dos cables idénticos para que no se tapen", () => {
    const opts = {
      sourceX: 80,
      sourceY: 80,
      targetX: 420,
      targetY: 80,
      sourcePosition: "top" as const,
      targetPosition: "top" as const,
      lane: 0,
    };
    const red = cableWaypoints(opts);
    const white = cableWaypoints(opts);
    const separated = separateRoutes([red, white], parts);
    const gaps = parallelGaps(separated);
    expect(gaps.length).toBeGreaterThan(0);
    for (const gap of gaps) {
      expect(gap).toBeGreaterThanOrEqual(20);
    }
    expect(separated[0]?.[0]).toEqual(red[0]);
    expect(separated[0]?.at(-1)).toEqual(red.at(-1));
    expect(separated[1]?.[0]).toEqual(white[0]);
    expect(separated[1]?.at(-1)).toEqual(white.at(-1));
    separated.forEach(orthogonal);
  });

  it("mantiene separados tres cables que comparten el mismo pasillo", () => {
    const base = {
      sourceX: 90,
      sourceY: 90,
      targetX: 480,
      targetY: 90,
      sourcePosition: "top" as const,
      targetPosition: "top" as const,
    };
    const routes = [0, 0, 0].map((lane) => cableWaypoints({ ...base, lane }));
    const separated = separateRoutes(routes, parts);
    const gaps = parallelGaps(separated);
    expect(gaps.length).toBeGreaterThan(0);
    for (const gap of gaps) {
      expect(gap).toBeGreaterThanOrEqual(20);
    }
    const busY = (points: Point[]) => {
      let best = 0;
      let y = points[0]?.y ?? 0;
      for (let i = 0; i < points.length - 1; i += 1) {
        const a = points[i];
        const b = points[i + 1];
        if (!a || !b || Math.abs(a.y - b.y) > 0.8) continue;
        const length = Math.abs(b.x - a.x);
        if (length > best) {
          best = length;
          y = a.y;
        }
      }
      return y;
    };
    const buses = separated.map(busY);
    expect(new Set(buses).size).toBe(3);
  });

  it("no mueve cables que ya están a 20 px", () => {
    const red = cableWaypoints({
      sourceX: 80,
      sourceY: 80,
      targetX: 420,
      targetY: 80,
      sourcePosition: "top",
      targetPosition: "top",
      lane: 0,
    });
    const white = cableWaypoints({
      sourceX: 80,
      sourceY: 80,
      targetX: 420,
      targetY: 80,
      sourcePosition: "top",
      targetPosition: "top",
      lane: 20,
    });
    const separated = separateRoutes([red, white], parts);
    expect(separated[0]).toEqual(red);
  });
});

describe("bundleCableRoutes", () => {
  it("entrega un trazo distinto para cada cable del circuito", () => {
    const shared = {
      sourceX: 100,
      sourceY: 100,
      targetX: 500,
      targetY: 100,
      sourcePosition: "top" as const,
      targetPosition: "top" as const,
      obstacles: parts,
    };
    const map = bundleCableRoutes([
      { ...shared, id: "fase", lane: 0 },
      { ...shared, id: "neutro", lane: 0 },
      { ...shared, id: "tierra", lane: 0 },
    ]);
    const routes = ["fase", "neutro", "tierra"].map((id) => map.get(id) ?? []);
    const gaps = parallelGaps(routes);
    expect(gaps.length).toBeGreaterThan(0);
    for (const gap of gaps) {
      expect(gap).toBeGreaterThanOrEqual(20);
    }
    routes.forEach(orthogonal);
  });
});
