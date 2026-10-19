import {
  isBipolarBreaker,
  isSwitchLike,
  rcdTerminalRole,
  RCD_POLES,
} from "./devices";
import type { ComponentKind } from "./types";

export type CableRole = "fase" | "neutro" | "tierra" | "enchufe";
export type TerminalRole = CableRole | "libre";

export const CABLE_COLORS: Record<TerminalRole, string> = {
  fase: "#C62828",
  neutro: "#F4F1EA",
  tierra: "#2E7D32",
  enchufe: "#3D4450",
  libre: "#8A9199",
};

export const CABLE_LABELS: Record<CableRole, string> = {
  fase: "Fase (rojo)",
  neutro: "Neutro (blanco)",
  tierra: "Tierra (verde)",
  enchufe: "Enchufe (cordón)",
};

export function isAppliancePlug(
  kind?: ComponentKind,
  terminalId?: string | null,
): boolean {
  return kind === "appliance" && terminalId === "plug";
}

export function isOutletSocket(
  kind?: ComponentKind,
  terminalId?: string | null,
): boolean {
  return kind === "outlet" && (terminalId === "socket0" || terminalId === "socket1");
}

export function isPlugFace(
  kind?: ComponentKind,
  terminalId?: string | null,
): boolean {
  return isAppliancePlug(kind, terminalId) || isOutletSocket(kind, terminalId);
}

export function isEarthTerminal(
  kind?: ComponentKind,
  terminalId?: string | null,
): boolean {
  return terminalId === "earth" || kind === "ground";
}

/** Color fijo del borne antes de cablearlo: solo polos de la batería y tierra. */
export function inherentRole(
  kind?: ComponentKind,
  terminalId?: string | null,
): TerminalRole {
  if (isEarthTerminal(kind, terminalId)) {
    return "tierra";
  }
  if (kind === "battery" && terminalId === "positive") {
    return "fase";
  }
  if (kind === "battery" && terminalId === "negative") {
    return "neutro";
  }
  if (isPlugFace(kind, terminalId)) {
    return "enchufe";
  }
  if (
    isBipolarBreaker(kind) ||
    kind === "lightPole" ||
    kind === "outlet"
  ) {
    return rcdTerminalRole(terminalId) ?? "libre";
  }
  return "libre";
}

/**
 * Tierra solo se une a tierra (puesta a tierra de protección).
 * Los bornes de trabajo sí pueden unirse: el color lo decide el conductor,
 * no una pintura fija en la ampolleta.
 */
export function canConnectTerminals(
  fromKind: ComponentKind | undefined,
  fromTerminal: string,
  toKind: ComponentKind | undefined,
  toTerminal: string,
  options?: { allowEarthFault?: boolean },
): boolean {
  if (isPlugFace(fromKind, fromTerminal) || isPlugFace(toKind, toTerminal)) {
    return (
      (isAppliancePlug(fromKind, fromTerminal) &&
        isOutletSocket(toKind, toTerminal)) ||
      (isOutletSocket(fromKind, fromTerminal) &&
        isAppliancePlug(toKind, toTerminal))
    );
  }
  if (fromKind === "appliance" || toKind === "appliance") {
    return false;
  }
  if (
    isEarthTerminal(fromKind, fromTerminal) !==
    isEarthTerminal(toKind, toTerminal)
  ) {
    return Boolean(options?.allowEarthFault);
  }
  const fromRole = inherentRole(fromKind, fromTerminal);
  const toRole = inherentRole(toKind, toTerminal);
  if (
    fromRole !== "libre" &&
    toRole !== "libre" &&
    fromRole !== toRole &&
    fromRole !== "enchufe" &&
    toRole !== "enchufe"
  ) {
    return false;
  }
  return true;
}

export function terminalKey(nodeId: string, terminalId: string): string {
  return `${nodeId}::${terminalId}`;
}

type RoleNode = {
  id: string;
  kind: ComponentKind;
  terminals: Array<{ id: string }>;
  switchClosed?: boolean;
  meterMode?: "tension" | "corriente" | "continuidad";
};

type RoleEdge = {
  source: string;
  sourceHandle?: string | null;
  target: string;
  targetHandle?: string | null;
};

/**
 * El color es del conductor (nodo eléctrico), no del artefacto:
 * - unido al polo + (o puente entre cargas): fase
 * - unido al polo −: neutro
 * - tierra: verde
 * El filament de la ampolleta NO une sus bornes: a y b pueden ser de distinto color.
 */
export function resolveConductorRoles(
  nodes: RoleNode[],
  edges: RoleEdge[],
): Map<string, TerminalRole> {
  const parent = new Map<string, string>();
  const members = new Map<string, string[]>();

  const find = (key: string): string => {
    let root = parent.get(key) ?? key;
    while (root !== (parent.get(root) ?? root)) {
      const next = parent.get(root) ?? root;
      parent.set(root, next);
      root = next;
    }
    parent.set(key, root);
    return root;
  };

  const union = (a: string, b: string) => {
    const ra = find(a);
    const rb = find(b);
    if (ra === rb) {
      return;
    }
    parent.set(ra, rb);
  };

  const keys: string[] = [];
  for (const node of nodes) {
    const terminals = [...node.terminals];
    if (
      node.kind === "bulb" &&
      !terminals.some((terminal) => terminal.id === "earth")
    ) {
      terminals.push({ id: "earth" });
    }
    for (const terminal of terminals) {
      const key = terminalKey(node.id, terminal.id);
      keys.push(key);
      parent.set(key, key);
    }
  }

  const byKind = new Map(nodes.map((node) => [node.id, node]));
  for (const edge of edges) {
    if (!edge.sourceHandle || !edge.targetHandle) {
      continue;
    }
    const fromNode = byKind.get(edge.source);
    const toNode = byKind.get(edge.target);
    if (
      isEarthTerminal(fromNode?.kind, edge.sourceHandle) !==
      isEarthTerminal(toNode?.kind, edge.targetHandle)
    ) {
      continue;
    }
    const from = terminalKey(edge.source, edge.sourceHandle);
    const to = terminalKey(edge.target, edge.targetHandle);
    if (parent.has(from) && parent.has(to)) {
      union(from, to);
    }
  }

  for (const node of nodes) {
    if (isBipolarBreaker(node.kind) && node.switchClosed) {
      for (const pole of RCD_POLES) {
        const line = terminalKey(node.id, pole.line);
        const load = terminalKey(node.id, pole.load);
        if (parent.has(line) && parent.has(load)) {
          union(line, load);
        }
      }
      continue;
    }
    if (isSwitchLike(node.kind) && node.switchClosed) {
      const a = terminalKey(node.id, "a");
      const b = terminalKey(node.id, "b");
      if (parent.has(a) && parent.has(b)) {
        union(a, b);
      }
    }
    if (
      node.kind === "ammeter" ||
      (node.kind === "multimeter" && node.meterMode === "corriente")
    ) {
      const a = terminalKey(node.id, "a");
      const b = terminalKey(node.id, "b");
      if (parent.has(a) && parent.has(b)) {
        union(a, b);
      }
    }
  }

  for (const key of keys) {
    const root = find(key);
    const list = members.get(root) ?? [];
    list.push(key);
    members.set(root, list);
  }

  const rootRole = new Map<string, CableRole>();
  const assign = (root: string, role: CableRole) => {
    const previous = rootRole.get(root);
    if (!previous) {
      rootRole.set(root, role);
      return;
    }
    if (previous === role) {
      return;
    }
    if (previous === "tierra" || role === "tierra") {
      rootRole.set(root, "tierra");
      return;
    }
    rootRole.set(root, "fase");
  };

  const byId = new Map(nodes.map((node) => [node.id, node]));
  for (const key of keys) {
    const split = key.indexOf("::");
    const nodeId = key.slice(0, split);
    const terminalId = key.slice(split + 2);
    const node = byId.get(nodeId);
    const inherent = inherentRole(node?.kind, terminalId);
    if (inherent === "libre") {
      continue;
    }
    assign(find(key), inherent);
  }

  const roles = new Map<string, TerminalRole>();
  for (const key of keys) {
    const root = find(key);
    const known = rootRole.get(root);
    if (known) {
      roles.set(key, known);
      continue;
    }
    const size = members.get(root)?.length ?? 1;
    roles.set(key, size > 1 ? "fase" : inherentRoleFromKey(key, byId));
  }
  return roles;
}

function inherentRoleFromKey(
  key: string,
  byId: Map<string, RoleNode>,
): TerminalRole {
  const split = key.indexOf("::");
  const node = byId.get(key.slice(0, split));
  return inherentRole(node?.kind, key.slice(split + 2));
}

export function cableRoleFromMap(
  roles: Map<string, TerminalRole>,
  source: string,
  sourceHandle: string | null | undefined,
  target: string,
  targetHandle: string | null | undefined,
): CableRole {
  const from = roles.get(terminalKey(source, sourceHandle ?? ""));
  const to = roles.get(terminalKey(target, targetHandle ?? ""));
  const role = from === "libre" ? to : from;
  if (
    role === "neutro" ||
    role === "tierra" ||
    role === "fase" ||
    role === "enchufe"
  ) {
    return role;
  }
  return "fase";
}

/** @deprecated Usar resolveConductorRoles: el color no es fijo en la ampolleta. */
export function terminalRole(
  kind?: ComponentKind,
  terminalId?: string | null,
): TerminalRole {
  return inherentRole(kind, terminalId);
}

export function cableRole(
  sourceHandle: string | null | undefined,
  targetHandle: string | null | undefined,
  sourceKind?: ComponentKind,
  targetKind?: ComponentKind,
): CableRole {
  const from = inherentRole(sourceKind, sourceHandle);
  const to = inherentRole(targetKind, targetHandle);
  if (from === to && from !== "libre") {
    return from;
  }
  if (from === "enchufe" || to === "enchufe") {
    return "enchufe";
  }
  if (from === "tierra" || to === "tierra") {
    return "tierra";
  }
  if (from === "neutro" || to === "neutro") {
    return "neutro";
  }
  return "fase";
}
