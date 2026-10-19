import type { Edge, Node } from "@xyflow/react";
import type { CircuitNodeData } from "./flowTypes";

const STORAGE_KEY = "practica.labBoard";
const VERSION = 2;

export interface SavedLabBoard {
  version: number;
  circuitId: string | null;
  counters: Record<string, number>;
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    kind: CircuitNodeData["kind"];
    label: string;
    switchClosed?: boolean;
    tripped?: boolean;
    trippedReason?: CircuitNodeData["trippedReason"];
    applianceId?: string;
    watts?: number;
    src?: string;
    tripAmps?: number;
    meterMode?: "tension" | "corriente" | "continuidad";
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
    pull?: { x: number; y: number };
    bends?: Array<{ x: number; y: number }>;
  }>;
}

export function loadLabBoard(): SavedLabBoard | null {
  if (typeof localStorage === "undefined") {
    return null;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as SavedLabBoard;
    if (parsed.version !== VERSION || !Array.isArray(parsed.nodes)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveLabBoard(board: SavedLabBoard) {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
}

export function clearLabBoard() {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
}

export function snapshotLabBoard(
  nodes: Node<CircuitNodeData>[],
  edges: Edge[],
  circuitId: string | null,
  counters: Record<string, number>,
): SavedLabBoard {
  return {
    version: VERSION,
    circuitId,
    counters: { ...counters },
    nodes: nodes.map((node) => ({
      id: node.id,
      type: String(node.type ?? node.data.kind),
      position: node.position,
      kind: node.data.kind,
      label: node.data.label,
      switchClosed: node.data.switchClosed,
      tripped: node.data.tripped,
      trippedReason: node.data.trippedReason,
      applianceId: node.data.applianceId,
      watts: node.data.watts,
      src: node.data.src,
      tripAmps: node.data.tripAmps,
      meterMode: node.data.meterMode,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      pull: (edge.data as { pull?: { x: number; y: number } } | undefined)?.pull,
      bends: (
        edge.data as { bends?: Array<{ x: number; y: number }> } | undefined
      )?.bends,
    })),
  };
}
