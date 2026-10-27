import { CABLE_GAP } from "./cableLanes";
import {
  routeHits,
  simplifyRoute,
  type Point,
  type RouteRect,
} from "./orthogonalRoute";

const CLEAR = CABLE_GAP;
const MIN_SPAN = 12;

type Axis = "h" | "v";

type Segment = {
  i: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

function rangeOverlap(a1: number, a2: number, b1: number, b2: number) {
  const lo = Math.max(Math.min(a1, a2), Math.min(b1, b2));
  const hi = Math.min(Math.max(a1, a2), Math.max(b1, b2));
  return hi - lo;
}

function listSegments(points: Point[], axis: Axis): Segment[] {
  const segments: Segment[] = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    if (!a || !b) {
      continue;
    }
    const horizontal = Math.abs(a.y - b.y) < 0.8;
    const vertical = Math.abs(a.x - b.x) < 0.8;
    if (axis === "h" && horizontal && Math.abs(b.x - a.x) >= MIN_SPAN) {
      segments.push({ i, x1: a.x, y1: a.y, x2: b.x, y2: b.y });
    }
    if (axis === "v" && vertical && Math.abs(b.y - a.y) >= MIN_SPAN) {
      segments.push({ i, x1: a.x, y1: a.y, x2: b.x, y2: b.y });
    }
  }
  return segments;
}

function spanOverlap(a: Segment, b: Segment, axis: Axis) {
  return axis === "h"
    ? rangeOverlap(a.x1, a.x2, b.x1, b.x2)
    : rangeOverlap(a.y1, a.y2, b.y1, b.y2);
}

function coordOf(segment: Segment, axis: Axis) {
  return axis === "h" ? segment.y1 : segment.x1;
}

function preferredSign(segment: Segment, axis: Axis, obstacles: RouteRect[]): 1 | -1 {
  const value =
    axis === "h" ? (segment.y1 + segment.y2) / 2 : (segment.x1 + segment.x2) / 2;
  if (obstacles.length === 0) {
    return axis === "h" ? -1 : 1;
  }
  let best = Number.POSITIVE_INFINITY;
  let sign: 1 | -1 = axis === "h" ? -1 : 1;
  for (const rect of obstacles) {
    const center = axis === "h" ? rect.y + rect.h / 2 : rect.x + rect.w / 2;
    const dist = Math.abs(center - value);
    if (dist < best) {
      best = dist;
      sign = value < center ? -1 : 1;
    }
  }
  return sign;
}

function clearanceTarget(
  routes: Point[][],
  routeIndex: number,
  segment: Segment,
  axis: Axis,
  sign: 1 | -1,
) {
  let target = coordOf(segment, axis);
  let needed = false;
  for (let guard = 0; guard < routes.length + 1; guard += 1) {
    let changed = false;
    for (let earlier = 0; earlier < routeIndex; earlier += 1) {
      const others = listSegments(routes[earlier] ?? [], axis);
      for (const other of others) {
        if (spanOverlap(segment, other, axis) < MIN_SPAN) {
          continue;
        }
        if (Math.abs(target - coordOf(other, axis)) >= CLEAR - 0.5) {
          continue;
        }
        needed = true;
        const limit = coordOf(other, axis) + sign * CLEAR;
        const next = sign < 0 ? Math.min(target, limit) : Math.max(target, limit);
        if (Math.abs(next - target) > 0.5) {
          target = next;
          changed = true;
        }
      }
    }
    if (!changed) {
      break;
    }
  }
  if (!needed || Math.abs(target - coordOf(segment, axis)) < 0.5) {
    return null;
  }
  const current = coordOf(segment, axis);
  const capped = Math.max(current - 400, Math.min(current + 400, target));
  return capped;
}

function runBounds(points: Point[], index: number, axis: Axis) {
  const origin = points[index];
  if (!origin) {
    return { start: index, end: index };
  }
  const same = (point: Point) =>
    axis === "h"
      ? Math.abs(point.y - origin.y) < 0.8
      : Math.abs(point.x - origin.x) < 0.8;
  const aligned = (a: Point, b: Point) =>
    axis === "h" ? Math.abs(a.y - b.y) < 0.8 : Math.abs(a.x - b.x) < 0.8;
  let start = index;
  let end = Math.min(index + 1, points.length - 1);
  while (start > 0) {
    const prev = points[start - 1];
    const curr = points[start];
    if (!prev || !curr || !same(prev) || !aligned(prev, curr)) {
      break;
    }
    start -= 1;
  }
  while (end < points.length - 1) {
    const curr = points[end];
    const next = points[end + 1];
    if (!curr || !next || !same(next) || !aligned(curr, next)) {
      break;
    }
    end += 1;
  }
  return { start, end };
}

function atCoord(point: Point, axis: Axis, value: number): Point {
  return axis === "h" ? { x: point.x, y: value } : { x: value, y: point.y };
}

function shiftRun(route: Point[], segment: Segment, axis: Axis, target: number) {
  const { start, end } = runBounds(route, segment.i, axis);
  const left = route[start];
  const right = route[end];
  if (!left || !right) {
    return route;
  }
  const before = route.slice(0, start);
  const after = route.slice(end + 1);
  const mid: Point[] = [];
  if (start === 0) {
    mid.push(left, atCoord(left, axis, target));
  } else {
    mid.push(atCoord(left, axis, target));
  }
  if (end === route.length - 1) {
    mid.push(atCoord(right, axis, target), right);
  } else {
    mid.push(atCoord(right, axis, target));
  }
  return simplifyRoute([...before, ...mid, ...after]);
}

function relevantObstacles(route: Point[], obstacles: RouteRect[]) {
  const ends = [route[0], route[route.length - 1]];
  return obstacles.filter((rect) =>
    ends.every((point) => {
      if (!point) {
        return true;
      }
      return (
        point.x < rect.x ||
        point.x > rect.x + rect.w ||
        point.y < rect.y ||
        point.y > rect.y + rect.h
      );
    }),
  );
}

function overlapScore(route: Point[], earlier: Point[][]) {
  let score = 0;
  let incident = 0;
  const terminals = [route[0], route[route.length - 1]].filter(
    (point): point is Point => Boolean(point),
  );
  const touches = (segment: Segment) =>
    terminals.some(
      (point) =>
        (Math.abs(point.x - segment.x1) < 0.8 && Math.abs(point.y - segment.y1) < 0.8) ||
        (Math.abs(point.x - segment.x2) < 0.8 && Math.abs(point.y - segment.y2) < 0.8),
    );
  for (const axis of ["h", "v"] as Axis[]) {
    for (const segment of listSegments(route, axis)) {
      for (const otherRoute of earlier) {
        for (const other of listSegments(otherRoute, axis)) {
          if (spanOverlap(segment, other, axis) < MIN_SPAN) {
            continue;
          }
          if (Math.abs(coordOf(segment, axis) - coordOf(other, axis)) >= CLEAR - 0.5) {
            continue;
          }
          score += 1;
          if (touches(segment)) {
            incident += 1;
          }
        }
      }
    }
  }
  return { score, incident };
}

function pushAxis(routes: Point[][], axis: Axis, obstacles: RouteRect[]) {
  let moved = false;
  for (let index = 1; index < routes.length; index += 1) {
    const skipped = new Set<string>();
    for (let guard = 0; guard < 10; guard += 1) {
      const segments = listSegments(routes[index] ?? [], axis);
      const earlier = routes.slice(0, index);
      let did = false;
      for (const segment of segments) {
        const key = `${segment.i}:${Math.round(coordOf(segment, axis))}`;
        if (skipped.has(key)) {
          continue;
        }
        const current = routes[index] ?? [];
        const before = overlapScore(current, earlier);
        const sign = preferredSign(segment, axis, obstacles);
        const signs: Array<1 | -1> = [sign, sign === -1 ? 1 : -1];
        let best: { route: Point[]; score: number; incident: number } | null = null;
        let alreadyClear = false;
        for (const candidate of signs) {
          const target = clearanceTarget(routes, index, segment, axis, candidate);
          if (target === null) {
            alreadyClear = true;
            break;
          }
          const updated = shiftRun(current, segment, axis, target);
          const blocked = relevantObstacles(current, obstacles);
          if (routeHits(updated, blocked) > routeHits(current, blocked)) {
            continue;
          }
          const nextScore = overlapScore(updated, earlier);
          if (
            !best ||
            nextScore.score < best.score ||
            (nextScore.score === best.score && nextScore.incident < best.incident)
          ) {
            best = { route: updated, ...nextScore };
          }
        }
        if (alreadyClear) {
          continue;
        }
        if (best && (best.score < before.score || (best.score === before.score && best.incident < before.incident))) {
          routes[index] = best.route;
          moved = true;
          did = true;
          break;
        }
        skipped.add(key);
      }
      if (!did) {
        break;
      }
    }
  }
  return moved;
}

/**
 * Separa tramos paralelos que se montarían.
 * Los extremos siguen en el borne; el resto del cable se corre
 * hasta dejar al menos `CABLE_GAP` px entre centros.
 */
export function separateRoutes(routes: Point[][], obstacles: RouteRect[] = []): Point[][] {
  const next = routes.map((points) => points.map((point) => ({ ...point })));
  for (let pass = 0; pass < 12; pass += 1) {
    const movedH = pushAxis(next, "h", obstacles);
    const movedV = pushAxis(next, "v", obstacles);
    if (!movedH && !movedV) {
      break;
    }
  }
  return next.map((points) => simplifyRoute(points));
}
