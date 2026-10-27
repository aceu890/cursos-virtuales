import {
  PLAN_CABLES,
  PLAN_SYMBOLS,
  type CableKind,
  type PlanAnchor,
  type PlanCable,
  type PlanMark,
  type SymbolKind,
} from "./casa";

export const PLAN_LIBRARY_KEY = "practica-planos-guardados";

export type PlanLayer = SymbolKind | CableKind;

export const PLAN_LAYERS: { id: PlanLayer; label: string; title: string }[] = [
  { id: "luz", label: "Luces", title: "Puntos de luz" },
  { id: "interruptor", label: "Llaves", title: "Interruptores" },
  { id: "toma", label: "Tomas", title: "Tomacorrientes" },
  { id: "aplique", label: "Apliques", title: "Luces de muro" },
  { id: "tablero", label: "Tablero", title: "Tablero general" },
  { id: "fase", label: "Fase", title: "Cable de fase" },
  { id: "neutro", label: "Neutro", title: "Cable neutro" },
  { id: "tierra", label: "Tierra", title: "Cable de tierra" },
];

export function emptyLayers(): Record<PlanLayer, boolean> {
  return {
    luz: true,
    interruptor: true,
    toma: true,
    aplique: true,
    tablero: true,
    fase: true,
    neutro: true,
    tierra: true,
  };
}

export interface SavedPlan {
  id: string;
  name: string;
  updatedAt: number;
  marks: PlanMark[];
  cables: PlanCable[];
}

function isMark(value: unknown): value is PlanMark {
  if (!value || typeof value !== "object") {
    return false;
  }
  const mark = value as PlanMark;
  return (
    typeof mark.id === "string" &&
    typeof mark.x === "number" &&
    typeof mark.y === "number" &&
    PLAN_SYMBOLS.some((item) => item.kind === mark.kind)
  );
}

function isAnchor(value: unknown): value is PlanAnchor {
  if (!value || typeof value !== "object") {
    return false;
  }
  const anchor = value as PlanAnchor;
  if (anchor.type === "symbol") {
    return typeof anchor.id === "string";
  }
  return anchor.type === "point" && typeof anchor.x === "number" && typeof anchor.y === "number";
}

function normalizeCable(value: unknown): PlanCable | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const raw = value as Partial<PlanCable> & { x1?: number; y1?: number; x2?: number; y2?: number };
  const kind = PLAN_CABLES.find((item) => item.kind === raw.kind)?.kind;
  if (typeof raw.id !== "string" || !kind) {
    return null;
  }
  if (Array.isArray(raw.anchors)) {
    const anchors = raw.anchors.filter(isAnchor);
    return anchors.length >= 2 ? { id: raw.id, kind, anchors } : null;
  }
  if ([raw.x1, raw.y1, raw.x2, raw.y2].every((item) => typeof item === "number")) {
    return {
      id: raw.id,
      kind,
      anchors: [
        { type: "point", x: raw.x1 as number, y: raw.y1 as number },
        { type: "point", x: raw.x2 as number, y: raw.y2 as number },
      ],
    };
  }
  return null;
}

function normalizePlan(value: unknown): SavedPlan | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const raw = value as Partial<SavedPlan>;
  if (typeof raw.id !== "string" || typeof raw.name !== "string") {
    return null;
  }
  const name = raw.name.trim();
  if (!name) {
    return null;
  }
  return {
    id: raw.id,
    name,
    updatedAt: typeof raw.updatedAt === "number" ? raw.updatedAt : Date.now(),
    marks: (raw.marks ?? []).filter(isMark),
    cables: (raw.cables ?? [])
      .map((cable) => normalizeCable(cable))
      .filter((cable): cable is PlanCable => cable !== null),
  };
}

export function readLibrary(): SavedPlan[] {
  try {
    const raw = localStorage.getItem(PLAN_LIBRARY_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map((item) => normalizePlan(item))
      .filter((item): item is SavedPlan => item !== null);
  } catch {
    return [];
  }
}

export function writeLibrary(plans: SavedPlan[]) {
  try {
    localStorage.setItem(PLAN_LIBRARY_KEY, JSON.stringify(plans));
  } catch {
    /* private mode */
  }
}

export function clonePlanData(plan: { marks: PlanMark[]; cables: PlanCable[] }) {
  return {
    marks: plan.marks.map((mark) => ({ ...mark })),
    cables: plan.cables.map((cable) => ({
      ...cable,
      anchors: cable.anchors.map((anchor) => ({ ...anchor })),
    })),
  };
}
