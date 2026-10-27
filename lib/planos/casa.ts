export const PLAN_VIEW = { width: 980, height: 860 };

/** Metros del plano de la foto, en pixeles del tablero. */
export const HOUSE_SCALE = 100;
export const HOUSE_ORIGIN = { x: 160, y: 120 };
export const HOUSE_BOUNDS = { minX: 180, maxX: 740, minY: 140, maxY: 700 };

export function housePoint(metersX: number, metersY: number) {
  return {
    x: HOUSE_ORIGIN.x + metersX * HOUSE_SCALE,
    y: HOUSE_ORIGIN.y + metersY * HOUSE_SCALE,
  };
}

export type SymbolKind =
  | "luz"
  | "interruptor"
  | "toma"
  | "tablero"
  | "aplique";

export interface PlanSymbolSpec {
  kind: SymbolKind;
  label: string;
  note: string;
}

export interface PlanMark {
  id: string;
  kind: SymbolKind;
  x: number;
  y: number;
}

export type CableKind = "fase" | "neutro" | "tierra";

export interface PlanCableSpec {
  kind: CableKind;
  label: string;
  note: string;
  color: string;
}

export interface PlanPoint {
  x: number;
  y: number;
}

export type PlanAnchor =
  | { type: "point"; x: number; y: number }
  | { type: "symbol"; id: string };

export interface PlanCable {
  id: string;
  kind: CableKind;
  anchors: PlanAnchor[];
}

/** Distancia a la que el cable se pega a un símbolo. */
export const CABLE_SNAP = 42;
/** El trazo llega al borde del símbolo, no lo cruza. */
export const SYMBOL_REACH = 16;

export function nearestMark(
  point: PlanPoint,
  marks: PlanMark[],
  radius = CABLE_SNAP,
): PlanMark | null {
  let best: PlanMark | null = null;
  let bestDistance = radius;
  for (const mark of marks) {
    const distance = Math.hypot(mark.x - point.x, mark.y - point.y);
    if (distance <= bestDistance) {
      best = mark;
      bestDistance = distance;
    }
  }
  return best;
}

export function cablePoints(anchors: PlanAnchor[], marks: PlanMark[]): PlanPoint[] {
  const centers = anchors.map((anchor) => {
    if (anchor.type === "point") {
      return { x: anchor.x, y: anchor.y };
    }
    const mark = marks.find((item) => item.id === anchor.id);
    return mark ? { x: mark.x, y: mark.y } : null;
  });
  const points: PlanPoint[] = [];
  anchors.forEach((anchor, index) => {
    const center = centers[index];
    if (!center) {
      return;
    }
    if (anchor.type !== "symbol") {
      points.push(center);
      return;
    }
    const previous = points[points.length - 1];
    const next = centers.slice(index + 1).find((item) => item !== null);
    const toward = index === 0 ? next : previous;
    const atEnd = index === 0 || index === anchors.length - 1;
    if (!atEnd || !toward) {
      points.push(center);
      return;
    }
    points.push(reachToward(center, toward, SYMBOL_REACH));
  });
  return points;
}

function reachToward(from: PlanPoint, to: PlanPoint, reach: number): PlanPoint {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  if (length <= reach) {
    return { x: from.x, y: from.y };
  }
  return {
    x: from.x + (dx / length) * reach,
    y: from.y + (dy / length) * reach,
  };
}

export const PLAN_CABLES: PlanCableSpec[] = [
  { kind: "fase", label: "Fase", note: "Cable rojo", color: "#C62828" },
  { kind: "neutro", label: "Neutro", note: "Cable azul", color: "#1565C0" },
  { kind: "tierra", label: "Tierra", note: "Cable verde", color: "#2E7D32" },
];

export function cableColor(kind: CableKind) {
  return PLAN_CABLES.find((item) => item.kind === kind)?.color ?? "#1a1c1f";
}

export const PLAN_SYMBOLS: PlanSymbolSpec[] = [
  {
    kind: "luz",
    label: "Luz",
    note: "Punto de luz en el techo",
  },
  {
    kind: "interruptor",
    label: "Interruptor",
    note: "Llave de un punto de luz",
  },
  {
    kind: "toma",
    label: "Tomacorriente",
    note: "Enchufe de pared",
  },
  {
    kind: "aplique",
    label: "Aplique",
    note: "Luz fija en el muro",
  },
  {
    kind: "tablero",
    label: "Tablero",
    note: "Tablero general de la vivienda",
  },
];

/** Casa de la foto: dos dormitorios, baño, cocina, living y porche. */
export const EXAMPLE_MARKS: PlanMark[] = [
  { id: "ej-luz-dorm-1", kind: "luz", ...housePoint(1.2, 1.6) },
  { id: "ej-int-dorm-1", kind: "interruptor", ...housePoint(2.05, 2.55) },
  { id: "ej-toma-dorm-1", kind: "toma", ...housePoint(0.4, 2.2) },
  { id: "ej-luz-bano", kind: "luz", ...housePoint(3.1, 1.15) },
  { id: "ej-int-bano", kind: "interruptor", ...housePoint(2.7, 2.05) },
  { id: "ej-tablero", kind: "tablero", ...housePoint(4.3, 0.45) },
  { id: "ej-luz-cocina", kind: "luz", ...housePoint(5.25, 0.7) },
  { id: "ej-int-cocina", kind: "interruptor", ...housePoint(4.35, 1.65) },
  { id: "ej-toma-cocina", kind: "toma", ...housePoint(5.55, 1.45) },
  { id: "ej-luz-dorm-2", kind: "luz", ...housePoint(1.7, 4.5) },
  { id: "ej-int-dorm-2", kind: "interruptor", ...housePoint(3.05, 3.4) },
  { id: "ej-toma-dorm-2", kind: "toma", ...housePoint(0.45, 5.3) },
  { id: "ej-luz-living", kind: "luz", ...housePoint(4.8, 3.6) },
  { id: "ej-int-living", kind: "interruptor", ...housePoint(3.95, 3.2) },
  { id: "ej-toma-living", kind: "toma", ...housePoint(5.55, 5.35) },
  { id: "ej-aplique-living", kind: "aplique", ...housePoint(4.15, 5.45) },
];

export const PLAN_STORAGE_KEY = "practica-plano-casa-v2";
