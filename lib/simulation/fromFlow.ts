import type { Edge, Node } from "@xyflow/react";
import type { CircuitGraph, ValidationRules } from "./types";
import { DEFAULT_CIRCUIT_RULES } from "./types";
import type { CircuitNodeData } from "./flowTypes";
import { isAppliancePlug, isOutletSocket } from "./cables";

function isPlugWiringHandle(handle: string | null | undefined): boolean {
  return handle === "plug" || handle === "socket0" || handle === "socket1";
}

function applianceIsOn(node: Node<CircuitNodeData>): boolean {
  return node.data.switchClosed !== false;
}

function plugPair(
  edge: Edge,
  byId: Map<string, Node<CircuitNodeData>>,
): { outletId: string; applianceId: string; watts: number } | null {
  const from = byId.get(edge.source);
  const to = byId.get(edge.target);
  if (!from || !to) {
    return null;
  }
  if (
    isAppliancePlug(from.data.kind, edge.sourceHandle) &&
    isOutletSocket(to.data.kind, edge.targetHandle)
  ) {
    return {
      outletId: to.id,
      applianceId: from.id,
      watts: applianceIsOn(from) ? (from.data.watts ?? 0) : 0,
    };
  }
  if (
    isOutletSocket(from.data.kind, edge.sourceHandle) &&
    isAppliancePlug(to.data.kind, edge.targetHandle)
  ) {
    return {
      outletId: from.id,
      applianceId: to.id,
      watts: applianceIsOn(to) ? (to.data.watts ?? 0) : 0,
    };
  }
  return null;
}

export function graphFromFlow(
  nodes: Node<CircuitNodeData>[],
  edges: Edge[],
  reglas: ValidationRules = DEFAULT_CIRCUIT_RULES,
): CircuitGraph {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const wattsByOutlet = new Map<string, number>();
  const pluggedByOutlet = new Map<string, string[]>();

  for (const edge of edges) {
    const pair = plugPair(edge, byId);
    if (!pair) {
      continue;
    }
    wattsByOutlet.set(
      pair.outletId,
      (wattsByOutlet.get(pair.outletId) ?? 0) + pair.watts,
    );
    const plugged = pluggedByOutlet.get(pair.outletId) ?? [];
    if (!plugged.includes(pair.applianceId)) {
      plugged.push(pair.applianceId);
    }
    pluggedByOutlet.set(pair.outletId, plugged);
  }

  return {
    components: nodes.map((node) => ({
      id: node.id,
      kind: node.data.kind,
      terminals: node.data.terminals,
      state: {
        switchClosed: node.data.switchClosed,
        watts:
          node.data.kind === "outlet"
            ? (wattsByOutlet.get(node.id) ?? 0)
            : node.data.watts,
        pluggedIds:
          node.data.kind === "outlet"
            ? (pluggedByOutlet.get(node.id) ?? [])
            : undefined,
        tripAmps:
          node.data.kind === "mcb"
            ? (node.data.tripAmps as number | undefined)
            : undefined,
        meterMode: node.data.meterMode,
      },
    })),
    wires: edges
      .filter((edge) => {
        if (
          isPlugWiringHandle(edge.sourceHandle) ||
          isPlugWiringHandle(edge.targetHandle)
        ) {
          return false;
        }
        const from = byId.get(edge.source);
        const to = byId.get(edge.target);
        return Boolean(from && to);
      })
      .map((edge) => ({
        id: edge.id,
        from: {
          componentId: edge.source,
          terminalId: edge.sourceHandle as string,
        },
        to: {
          componentId: edge.target,
          terminalId: edge.targetHandle as string,
        },
      })),
    reglas,
  };
}
