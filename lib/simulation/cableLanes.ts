import type { CableRole } from "./cables";

export const CABLE_GAP = 48;
export const TERMINAL_GAP = 22;

export const ROLE_LANE: Record<CableRole, number> = {
  fase: -72,
  neutro: 56,
  tierra: 124,
  enchufe: 0,
};

export function laneBase(index: number, total: number, gap = CABLE_GAP) {
  if (total <= 1) {
    return 0;
  }
  return (index - (total - 1) / 2) * gap;
}

/** One corridor per cable: red above, white in the middle, green below. */
export function assignLaneOffsets(
  cables: Array<{ id: string; role: CableRole }>,
): Map<string, number> {
  const grouped: Record<CableRole, string[]> = {
    fase: [],
    neutro: [],
    tierra: [],
    enchufe: [],
  };
  for (const cable of cables) {
    grouped[cable.role].push(cable.id);
  }

  const lanes = new Map<string, number>();
  (Object.keys(grouped) as CableRole[]).forEach((role) => {
    const ids = grouped[role].slice().sort();
    ids.forEach((id, index) => {
      lanes.set(id, ROLE_LANE[role] + laneBase(index, ids.length));
    });
  });
  return lanes;
}

/** Offset each cable that shares a terminal so they leave as a fork, not a single line. */
export function assignTerminalSpreads(
  cables: Array<{
    id: string;
    source: string;
    sourceHandle?: string | null;
    target: string;
    targetHandle?: string | null;
  }>,
): Map<string, { source: number; target: number }> {
  const groups = new Map<
    string,
    Array<{ id: string; end: "source" | "target" }>
  >();
  const push = (
    node: string,
    handle: string | null | undefined,
    id: string,
    end: "source" | "target",
  ) => {
    const key = `${node}::${handle ?? ""}`;
    const list = groups.get(key) ?? [];
    list.push({ id, end });
    groups.set(key, list);
  };
  for (const cable of cables) {
    push(cable.source, cable.sourceHandle, cable.id, "source");
    push(cable.target, cable.targetHandle, cable.id, "target");
  }

  const spreads = new Map<string, { source: number; target: number }>();
  for (const cable of cables) {
    spreads.set(cable.id, { source: 0, target: 0 });
  }
  for (const members of groups.values()) {
    const ordered = members
      .slice()
      .sort((a, b) => a.id.localeCompare(b.id) || a.end.localeCompare(b.end));
    ordered.forEach((member, index) => {
      const current = spreads.get(member.id);
      if (!current) {
        return;
      }
      spreads.set(member.id, {
        ...current,
        [member.end]: laneBase(index, ordered.length, TERMINAL_GAP),
      });
    });
  }
  return spreads;
}
