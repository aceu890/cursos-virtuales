import type { PlaceableKind } from "./flowTypes";

/** Grilla de las piezas. Los quiebres de los cables usan una más fina. */
export const LAYOUT_GRID = 20;
/** Hueco mínimo entre piezas, de borde a borde. */
export const LAYOUT_GAP = 100;

const KIND_ORDER: PlaceableKind[] = [
  "lightPole",
  "battery",
  "mainSwitch",
  "rcd",
  "mcb",
  "switch",
  "ammeter",
  "voltmeter",
  "multimeter",
  "voltageDetector",
  "outlet",
  "bulb",
  "appliance",
  "ground",
];

export type LayoutNode = {
  id: string;
  kind: string;
  w: number;
  h: number;
};

export type LayoutLink = { source: string; target: string };

function snap(value: number) {
  return Math.round(value / LAYOUT_GRID) * LAYOUT_GRID;
}

function kindRank(kind: string) {
  const index = KIND_ORDER.indexOf(kind as PlaceableKind);
  return index === -1 ? KIND_ORDER.length : index;
}

/**
 * Coloca las piezas de izquierda a derecha.
 * Sin cables, o en un circuito en serie, quedan en una sola fila.
 * Si una pieza alimenta varias ramas, esas ramas se apilan con el mismo hueco.
 */
export function placeSchematic(
  nodes: LayoutNode[],
  links: LayoutLink[],
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  if (nodes.length === 0) {
    return positions;
  }

  const neighbors = new Map<string, Set<string>>();
  for (const node of nodes) {
    neighbors.set(node.id, new Set());
  }
  for (const link of links) {
    neighbors.get(link.source)?.add(link.target);
    neighbors.get(link.target)?.add(link.source);
  }

  const row = nodes
    .slice()
    .sort(
      (a, b) => kindRank(a.kind) - kindRank(b.kind) || a.id.localeCompare(b.id),
    );
  const placed: Array<LayoutNode & { x: number; y: number }> = [];
  let x = LAYOUT_GRID * 2;
  for (const node of row) {
    const previous = [...placed]
      .reverse()
      .find((item) => item.kind === node.kind);
    const sharesBranch =
      previous !== undefined &&
      [...(neighbors.get(node.id) ?? [])].some((id) =>
        neighbors.get(previous.id)?.has(id),
      );
    if (sharesBranch && previous) {
      positions.set(node.id, {
        x: previous.x,
        y: snap(previous.y + previous.h + LAYOUT_GAP),
      });
    } else {
      positions.set(node.id, { x: snap(x), y: LAYOUT_GRID * 2 });
      x += node.w + LAYOUT_GAP;
    }
    const position = positions.get(node.id);
    if (position) {
      placed.push({ ...node, ...position });
    }
  }
  return positions;
}
