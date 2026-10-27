import { orthogonalWaypoints, type RouteRect } from "./orthogonalRoute";
import { separateRoutes } from "./separateRoutes";

export type Point = { x: number; y: number };

export type HandleSide = "left" | "right" | "top" | "bottom";

/** Quadratic curve that actually passes through `through`. */
export function curveThrough(from: Point, through: Point, to: Point): string {
  return `M ${from.x} ${from.y} Q ${2 * through.x - (from.x + to.x) / 2} ${
    2 * through.y - (from.y + to.y) / 2
  } ${to.x} ${to.y}`;
}

function dirOf(side: HandleSide): Point {
  if (side === "left") {
    return { x: -1, y: 0 };
  }
  if (side === "right") {
    return { x: 1, y: 0 };
  }
  if (side === "top") {
    return { x: 0, y: -1 };
  }
  return { x: 0, y: 1 };
}

function almostEqual(a: number, b: number, eps = 0.6) {
  return Math.abs(a - b) < eps;
}

function between(a: number, b: number, c: number) {
  return (a <= b && b <= c) || (c <= b && b <= a);
}

function collinear(a: Point, b: Point, c: Point) {
  if (almostEqual(a.x, b.x) && almostEqual(b.x, c.x)) {
    return between(a.y, b.y, c.y);
  }
  if (almostEqual(a.y, b.y) && almostEqual(b.y, c.y)) {
    return between(a.x, b.x, c.x);
  }
  return false;
}

function collapseColinear(points: Point[]): Point[] {
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

function dedupe(points: Point[]): Point[] {
  const next: Point[] = [];
  for (const point of points) {
    const last = next[next.length - 1];
    if (
      !last ||
      !almostEqual(last.x, point.x) ||
      !almostEqual(last.y, point.y)
    ) {
      next.push(point);
    }
  }
  return next;
}

export function roundedPolyline(points: Point[], radius = 16): string {
  const pts = dedupe(points);
  if (pts.length === 0) {
    return "";
  }
  if (pts.length === 1) {
    return `M ${pts[0].x} ${pts[0].y}`;
  }
  if (pts.length === 2) {
    return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;
  }

  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i += 1) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const next = pts[i + 1];
    const vx1 = prev.x - curr.x;
    const vy1 = prev.y - curr.y;
    const vx2 = next.x - curr.x;
    const vy2 = next.y - curr.y;
    const len1 = Math.hypot(vx1, vy1) || 1;
    const len2 = Math.hypot(vx2, vy2) || 1;
    const r = Math.min(radius, len1 / 2, len2 / 2);
    d += ` L ${curr.x + (vx1 / len1) * r} ${curr.y + (vy1 / len1) * r}`;
    d += ` Q ${curr.x} ${curr.y} ${curr.x + (vx2 / len2) * r} ${curr.y + (vy2 / len2) * r}`;
  }
  const last = pts[pts.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

function isHorizontal(side: HandleSide) {
  return side === "left" || side === "right";
}

function flareOffset(side: HandleSide, spread: number): Point {
  if (spread === 0) {
    return { x: 0, y: 0 };
  }
  if (isHorizontal(side)) {
    return { x: 0, y: spread };
  }
  return { x: spread, y: 0 };
}

function stubExit(
  x: number,
  y: number,
  side: HandleSide,
  stub: number,
  spread = 0,
) {
  const flare = flareOffset(side, spread);
  const dir = dirOf(side);
  const flared = { x: x + flare.x, y: y + flare.y };
  return {
    flared,
    out: { x: flared.x + dir.x * stub, y: flared.y + dir.y * stub },
  };
}

export function cableWaypoints(opts: {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: HandleSide;
  targetPosition: HandleSide;
  lane: number;
  sourceSpread?: number;
  targetSpread?: number;
  obstacles?: Array<{ x: number; y: number; w: number; h: number }>;
}): Point[] {
  return orthogonalWaypoints(opts);
}

export type SegmentAxis = "h" | "v";

export function snapManualVia(
  pointer: Point,
  _sourcePosition: HandleSide,
  _targetPosition: HandleSide,
  sourceX: number,
  sourceY: number,
  _targetX: number,
  _targetY: number,
  current?: Point,
  axis?: SegmentAxis,
): Point {
  const fallback = current ?? { x: sourceX, y: sourceY };
  if (axis === "h") {
    return { x: fallback.x, y: pointer.y };
  }
  if (axis === "v") {
    return { x: pointer.x, y: fallback.y };
  }
  return { x: pointer.x, y: pointer.y };
}

function along(a: Point, b: Point, t: number): Point {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

export function segmentKnobs(
  points: Point[],
  minLength = 20,
): Array<Point & { axis: SegmentAxis }> {
  const start = points[0];
  const end = points[points.length - 1];
  if (!start || !end) {
    return [];
  }

  let bestH: { length: number; a: Point; b: Point } | undefined;
  let bestV: { length: number; a: Point; b: Point } | undefined;
  for (let i = 1; i < points.length - 2; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    if (!a || !b) {
      continue;
    }
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    if (length < minLength) {
      continue;
    }
    if (almostEqual(a.y, b.y)) {
      if (!bestH || length > bestH.length) {
        bestH = { length, a, b };
      }
    } else if (almostEqual(a.x, b.x)) {
      if (!bestV || length > bestV.length) {
        bestV = { length, a, b };
      }
    }
  }

  const nearStub = (value: number, other: number) => Math.abs(value - other) < 44;
  const hIsStub =
    !bestH ||
    nearStub(bestH.a.y, start.y) ||
    nearStub(bestH.a.y, end.y);
  const vIsStub =
    !bestV ||
    nearStub(bestV.a.x, start.x) ||
    nearStub(bestV.a.x, end.x);

  const knobs: Array<Point & { axis: SegmentAxis }> = [];
  if (!hIsStub && bestH) {
    knobs.push({ ...along(bestH.a, bestH.b, 0.5), axis: "h" });
  } else if (bestV) {
    knobs.push({ ...along(bestV.a, bestV.b, 0.65), axis: "h" });
  }
  if (!vIsStub && bestV) {
    knobs.push({ ...along(bestV.a, bestV.b, 0.5), axis: "v" });
  } else if (bestH) {
    knobs.push({ ...along(bestH.a, bestH.b, 0.35), axis: "v" });
  }
  return knobs;
}

export function seedManualVia(
  opts: Parameters<typeof cableWaypoints>[0],
): Point {
  const points = cableWaypoints(opts);
  let busY = Math.min(opts.sourceY, opts.targetY) - 36;
  let aisleX = (opts.sourceX + opts.targetX) / 2;
  let hLen = 0;
  let vLen = 0;
  for (let i = 1; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    if (!a || !b) {
      continue;
    }
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    if (almostEqual(a.y, b.y) && length >= hLen) {
      hLen = length;
      busY = a.y;
    }
    if (almostEqual(a.x, b.x) && length > vLen) {
      vLen = length;
      aisleX = a.x;
    }
  }
  return { x: aisleX, y: busY };
}

export function cableRoutePoints(
  opts: Parameters<typeof cableWaypoints>[0] & { vias?: Point[] },
): Point[] {
  return opts.vias && opts.vias.length > 0
    ? manhattanThrough({ ...opts, vias: opts.vias })
    : cableWaypoints(opts);
}

/** Traza todos los cables juntos y separa los tramos que quedarían tapados. */
export function bundleCableRoutes(
  items: Array<Parameters<typeof cableRoutePoints>[0] & { id: string; lane: number }>,
): Map<string, Point[]> {
  const ordered = items
    .slice()
    .sort((a, b) => a.lane - b.lane || a.id.localeCompare(b.id));
  const routed = ordered.map((item) => cableRoutePoints(item));
  const obstacles = ordered.reduce<RouteRect[]>(
    (best, item) =>
      (item.obstacles?.length ?? 0) > best.length ? (item.obstacles ?? best) : best,
    [],
  );
  const separated = separateRoutes(routed, obstacles);
  const map = new Map<string, Point[]>();
  ordered.forEach((item, index) => {
    map.set(item.id, separated[index] ?? routed[index] ?? []);
  });
  return map;
}

function elbowScore(points: Point[], via: Point) {
  let horizontal = 0;
  let vertical = 0;
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    if (!a || !b) {
      continue;
    }
    if (almostEqual(a.y, b.y) && almostEqual(a.y, via.y)) {
      horizontal = Math.max(horizontal, Math.abs(b.x - a.x));
    }
    if (almostEqual(a.x, b.x) && almostEqual(a.x, via.x)) {
      vertical = Math.max(vertical, Math.abs(b.y - a.y));
    }
  }
  return horizontal + vertical;
}

function elbowInterior(out: Point, inn: Point, via: Point): Point[] {
  const routeA = collapseColinear([
    out,
    { x: via.x, y: out.y },
    { x: via.x, y: via.y },
    { x: inn.x, y: via.y },
    inn,
  ]);
  const routeB = collapseColinear([
    out,
    { x: out.x, y: via.y },
    { x: via.x, y: via.y },
    { x: via.x, y: inn.y },
    inn,
  ]);
  const chosen =
    elbowScore(routeB, via) > elbowScore(routeA, via) ? routeB : routeA;
  return chosen.slice(1, -1);
}

export function manhattanThrough(
  opts: Parameters<typeof cableWaypoints>[0] & { vias: Point[] },
): Point[] {
  const {
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    vias,
    sourceSpread = 0,
    targetSpread = 0,
  } = opts;
  const stub = 20;
  const start = { x: sourceX, y: sourceY };
  const end = { x: targetX, y: targetY };
  const sourceExit = stubExit(
    sourceX,
    sourceY,
    sourcePosition,
    stub,
    sourceSpread,
  );
  const targetExit = stubExit(
    targetX,
    targetY,
    targetPosition,
    stub,
    targetSpread,
  );
  const out = sourceExit.out;
  const inn = targetExit.out;
  const points: Point[] = [start, sourceExit.flared, out];

  if (vias.length === 1 && vias[0]) {
    points.push(...elbowInterior(out, inn, vias[0]));
  } else {
    let cursor = out;
    let preferH = !isHorizontal(sourcePosition);
    for (const via of vias) {
      if (almostEqual(cursor.x, via.x) || almostEqual(cursor.y, via.y)) {
        points.push(via);
      } else if (preferH) {
        points.push({ x: via.x, y: cursor.y }, via);
      } else {
        points.push({ x: cursor.x, y: via.y }, via);
      }
      cursor = via;
      preferH = !preferH;
    }
    if (!(almostEqual(cursor.x, inn.x) && almostEqual(cursor.y, inn.y))) {
      if (almostEqual(cursor.x, inn.x) || almostEqual(cursor.y, inn.y)) {
        points.push(inn);
      } else if (preferH) {
        points.push({ x: inn.x, y: cursor.y }, inn);
      } else {
        points.push({ x: cursor.x, y: inn.y }, inn);
      }
    }
  }

  points.push(inn, targetExit.flared, end);
  return collapseColinear(points);
}

export function orderedCablePath(
  opts: Parameters<typeof cableWaypoints>[0] & {
    radius?: number;
    vias?: Point[];
  },
): string {
  return roundedPolyline(cableRoutePoints(opts), opts.radius ?? 6);
}
