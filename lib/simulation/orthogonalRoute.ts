export type Point = { x: number; y: number };
export type HandleSide = "left" | "right" | "top" | "bottom";

/** Paso de la grilla de los quiebres. Los bornes reales no se mueven. */
export const ROUTE_GRID = 10;
/** Tramo recto al salir de un borne, antes de poder girar. */
export const ROUTE_STUB = 20;
/** Margen con el que un cable rodea una pieza. */
export const ROUTE_MARGIN = 18;
/** Separación entre cables que comparten un pasillo. Supera el trazo de 9 px. */
export const ROUTE_LANE = 20;

export type RouteRect = { x: number; y: number; w: number; h: number };

const DIR: Record<HandleSide, Point> = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  top: { x: 0, y: -1 },
  bottom: { x: 0, y: 1 },
};

function near(a: number, b: number) {
  return Math.abs(a - b) < 0.8;
}

function snap(value: number) {
  return Math.round(value / ROUTE_GRID) * ROUTE_GRID;
}

function dedupe(points: Point[]): Point[] {
  const next: Point[] = [];
  for (const point of points) {
    const last = next[next.length - 1];
    if (!last || !near(last.x, point.x) || !near(last.y, point.y)) {
      next.push(point);
    }
  }
  return next;
}

function between(a: number, b: number, c: number) {
  return (a <= b && b <= c) || (c <= b && b <= a);
}

function collinear(a: Point, b: Point, c: Point) {
  if (near(a.x, b.x) && near(b.x, c.x)) {
    return between(a.y, b.y, c.y);
  }
  if (near(a.y, b.y) && near(b.y, c.y)) {
    return between(a.x, b.x, c.x);
  }
  return false;
}

export function simplifyRoute(points: Point[]): Point[] {
  const pts = dedupe(points);
  if (pts.length < 3) {
    return pts;
  }
  const next: Point[] = [pts[0]];
  for (let i = 1; i < pts.length - 1; i += 1) {
    const prev = next[next.length - 1];
    const curr = pts[i];
    const after = pts[i + 1];
    if (!prev || !curr || !after || !collinear(prev, curr, after)) {
      next.push(curr);
    }
  }
  const last = pts[pts.length - 1];
  if (last) {
    next.push(last);
  }
  return dedupe(next);
}

export function bendCount(points: Point[]): number {
  let bends = 0;
  for (let i = 1; i < points.length - 1; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    if (!prev || !curr || !next) {
      continue;
    }
    const inX = curr.x - prev.x;
    const inY = curr.y - prev.y;
    const outX = next.x - curr.x;
    const outY = next.y - curr.y;
    if (inX * outY - inY * outX !== 0) {
      bends += 1;
    }
  }
  return bends;
}

function lengthOf(points: Point[]) {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    if (prev && curr) {
      total += Math.abs(curr.x - prev.x) + Math.abs(curr.y - prev.y);
    }
  }
  return total;
}

function hitsRect(a: Point, b: Point, rect: RouteRect) {
  const minX = Math.min(a.x, b.x);
  const maxX = Math.max(a.x, b.x);
  const minY = Math.min(a.y, b.y);
  const maxY = Math.max(a.y, b.y);
  return (
    maxX > rect.x + 0.5 &&
    minX < rect.x + rect.w - 0.5 &&
    maxY > rect.y + 0.5 &&
    minY < rect.y + rect.h - 0.5
  );
}

export function routeHits(points: Point[], obstacles: RouteRect[]) {
  let hits = 0;
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    if (!a || !b) {
      continue;
    }
    if (obstacles.some((rect) => hitsRect(a, b, rect))) {
      hits += 1;
    }
  }
  return hits;
}

function stubOf(point: Point, side: HandleSide) {
  const dir = DIR[side];
  return {
    x: point.x + dir.x * ROUTE_STUB,
    y: point.y + dir.y * ROUTE_STUB,
  };
}

function spreadOf(point: Point, side: HandleSide, spread: number): Point {
  if (spread === 0) {
    return point;
  }
  if (side === "left" || side === "right") {
    return { x: point.x, y: point.y + spread };
  }
  return { x: point.x + spread, y: point.y };
}

function jog(from: Point, to: Point, lane: number): Point[] {
  if (near(from.y, to.y)) {
    const y = from.y + lane;
    return [from, { x: from.x, y }, { x: to.x, y }, to];
  }
  const x = from.x + lane;
  return [from, { x, y: from.y }, { x, y: to.y }, to];
}

function candidates(from: Point, to: Point, lane: number): Point[][] {
  const routes: Point[][] = [];
  const add = (middle: Point[]) => {
    routes.push(simplifyRoute([from, ...middle, to]));
  };
  const aligned =
    near(from.x, to.x) || near(from.y, to.y);
  if (aligned && lane === 0) {
    add([]);
  }
  if (aligned && lane !== 0) {
    routes.push(simplifyRoute(jog(from, to, lane)));
  }

  add([{ x: to.x, y: from.y }]);
  add([{ x: from.x, y: to.y }]);

  const shifts = [lane, lane + ROUTE_LANE, lane - ROUTE_LANE, 0];
  const ys = [
    Math.min(from.y, to.y) - 30,
    Math.max(from.y, to.y) + 30,
    (from.y + to.y) / 2,
  ];
  const xs = [
    Math.min(from.x, to.x) - 30,
    Math.max(from.x, to.x) + 30,
    (from.x + to.x) / 2,
  ];
  for (const shift of shifts) {
    for (const y of ys) {
      const bus = snap(y + shift);
      add([
        { x: from.x, y: bus },
        { x: to.x, y: bus },
      ]);
    }
    for (const x of xs) {
      const bus = snap(x + shift);
      add([
        { x: bus, y: from.y },
        { x: bus, y: to.y },
      ]);
    }
  }
  return routes;
}

type Dir = "l" | "r" | "u" | "d";

const STEPS: Array<{ dir: Dir; x: number; y: number }> = [
  { dir: "r", x: ROUTE_GRID, y: 0 },
  { dir: "l", x: -ROUTE_GRID, y: 0 },
  { dir: "d", x: 0, y: ROUTE_GRID },
  { dir: "u", x: 0, y: -ROUTE_GRID },
];

function inside(point: Point, rect: RouteRect) {
  return (
    point.x > rect.x + 0.5 &&
    point.x < rect.x + rect.w - 0.5 &&
    point.y > rect.y + 0.5 &&
    point.y < rect.y + rect.h - 0.5
  );
}

function searchGrid(from: Point, to: Point, obstacles: RouteRect[]): Point[] | null {
  const start = { x: snap(from.x), y: snap(from.y) };
  const goal = { x: snap(to.x), y: snap(to.y) };
  let minX = Math.min(start.x, goal.x) - 80;
  let maxX = Math.max(start.x, goal.x) + 80;
  let minY = Math.min(start.y, goal.y) - 80;
  let maxY = Math.max(start.y, goal.y) + 80;
  for (const rect of obstacles) {
    minX = Math.min(minX, rect.x - 20);
    maxX = Math.max(maxX, rect.x + rect.w + 20);
    minY = Math.min(minY, rect.y - 20);
    maxY = Math.max(maxY, rect.y + rect.h + 20);
  }
  minX = snap(minX);
  maxX = snap(maxX);
  minY = snap(minY);
  maxY = snap(maxY);

  const keyOf = (point: Point, dir: Dir | "s") =>
    `${point.x},${point.y},${dir}`;
  const startKey = keyOf(start, "s");
  const g = new Map<string, number>([[startKey, 0]]);
  const prev = new Map<string, { key: string; point: Point }>();
  const open: Array<{ key: string; point: Point; dir: Dir | "s"; f: number }> = [
    {
      key: startKey,
      point: start,
      dir: "s",
      f: Math.abs(goal.x - start.x) + Math.abs(goal.y - start.y),
    },
  ];
  const closed = new Set<string>();
  let guard = 0;

  while (open.length > 0 && guard < 4000) {
    guard += 1;
    open.sort((a, b) => a.f - b.f);
    const current = open.shift();
    if (!current || closed.has(current.key)) {
      continue;
    }
    if (near(current.point.x, goal.x) && near(current.point.y, goal.y)) {
      const path: Point[] = [current.point];
      let cursor = current.key;
      while (prev.has(cursor)) {
        const step = prev.get(cursor);
        if (!step) {
          break;
        }
        path.push(step.point);
        cursor = step.key;
      }
      path.reverse();
      const head = path[0] ?? start;
      const tail = path[path.length - 1] ?? goal;
      return simplifyRoute([
        ...linkOrthogonal(from, head).slice(0, -1),
        ...path,
        ...linkOrthogonal(tail, to).slice(1),
      ]);
    }
    closed.add(current.key);
    for (const step of STEPS) {
      const next = {
        x: current.point.x + step.x,
        y: current.point.y + step.y,
      };
      if (next.x < minX || next.x > maxX || next.y < minY || next.y > maxY) {
        continue;
      }
      if (obstacles.some((rect) => inside(next, rect)) && !(near(next.x, goal.x) && near(next.y, goal.y))) {
        continue;
      }
      const nextKey = keyOf(next, step.dir);
      if (closed.has(nextKey)) {
        continue;
      }
      const bend = current.dir !== "s" && current.dir !== step.dir ? 28 : 0;
      const cost = (g.get(current.key) ?? 0) + ROUTE_GRID + bend;
      if (cost >= (g.get(nextKey) ?? Number.POSITIVE_INFINITY)) {
        continue;
      }
      g.set(nextKey, cost);
      prev.set(nextKey, { key: current.key, point: current.point });
      open.push({
        key: nextKey,
        point: next,
        dir: step.dir,
        f: cost + Math.abs(goal.x - next.x) + Math.abs(goal.y - next.y),
      });
    }
  }
  return null;
}

function linkOrthogonal(from: Point, to: Point): Point[] {
  if (near(from.x, to.x) || near(from.y, to.y)) {
    return [from, to];
  }
  return [from, { x: to.x, y: from.y }, to];
}

/**
 * Ruta ortogonal entre dos bornes.
 * Sale 20 px en la dirección del borne, rodea las piezas y separa
 * los cables del mismo pasillo con `lane` (en px, de 20 en 20).
 */
export function orthogonalWaypoints(opts: {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: HandleSide;
  targetPosition: HandleSide;
  lane?: number;
  sourceSpread?: number;
  targetSpread?: number;
  obstacles?: RouteRect[];
}): Point[] {
  const lane = opts.lane ?? 0;
  const source = { x: opts.sourceX, y: opts.sourceY };
  const target = { x: opts.targetX, y: opts.targetY };
  const covers = (rect: RouteRect, point: Point) =>
    point.x >= rect.x &&
    point.x <= rect.x + rect.w &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.h;
  const obstacles = (opts.obstacles ?? []).filter(
    (rect) => !covers(rect, source) && !covers(rect, target),
  );
  const sourceExit = spreadOf(source, opts.sourcePosition, opts.sourceSpread ?? 0);
  const targetExit = spreadOf(target, opts.targetPosition, opts.targetSpread ?? 0);
  const sourceStub = stubOf(sourceExit, opts.sourcePosition);
  const targetStub = stubOf(targetExit, opts.targetPosition);

  const shifted = (points: Point[]) =>
    lane === 0 ||
    points.some(
      (point) =>
        Math.abs(point.y - sourceStub.y - lane) < 1 ||
        Math.abs(point.x - sourceStub.x - lane) < 1 ||
        Math.abs(point.y - targetStub.y - lane) < 1 ||
        Math.abs(point.x - targetStub.x - lane) < 1,
    );
  if (opts.sourcePosition === opts.targetPosition) {
    const outward = Math.abs(lane);
    const horizontal =
      opts.sourcePosition === "top" || opts.sourcePosition === "bottom";
    const base = horizontal
      ? snap(
          opts.sourcePosition === "top"
            ? Math.min(sourceStub.y, targetStub.y) - 30
            : Math.max(sourceStub.y, targetStub.y) + 30,
        )
      : snap(
          opts.sourcePosition === "left"
            ? Math.min(sourceStub.x, targetStub.x) - 30
            : Math.max(sourceStub.x, targetStub.x) + 30,
        );
    const bus = horizontal
      ? opts.sourcePosition === "top"
        ? base - outward
        : base + outward
      : opts.sourcePosition === "left"
        ? base - outward
        : base + outward;
    const along = horizontal
      ? [
          sourceStub,
          { x: sourceStub.x, y: bus },
          { x: targetStub.x, y: bus },
          targetStub,
        ]
      : [
          sourceStub,
          { x: bus, y: sourceStub.y },
          { x: bus, y: targetStub.y },
          targetStub,
        ];
    const busRoute = simplifyRoute(along);
    if (routeHits(busRoute, obstacles) === 0) {
      return simplifyRoute([
        source,
        sourceExit,
        ...busRoute,
        targetExit,
        target,
      ]);
    }
  }

  const ranked = candidates(sourceStub, targetStub, lane)
    .map((points) => ({
      points,
      hits: routeHits(points, obstacles),
      bends: bendCount(points),
      length: lengthOf(points),
      offset: shifted(points) ? 0 : 1,
    }))
    .sort(
      (a, b) =>
        a.hits - b.hits ||
        a.offset - b.offset ||
        a.bends - b.bends ||
        a.length - b.length,
    );
  const clear = ranked.find((route) => route.hits === 0);
  const middle =
    clear?.points ??
    searchGrid(sourceStub, targetStub, obstacles) ??
    ranked[0]?.points ??
    linkOrthogonal(sourceStub, targetStub);

  return simplifyRoute([
    source,
    sourceExit,
    ...middle,
    targetExit,
    target,
  ]);
}
