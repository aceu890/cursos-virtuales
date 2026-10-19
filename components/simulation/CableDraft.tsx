"use client";

import { type ConnectionLineComponentProps } from "@xyflow/react";
import {
  CABLE_COLORS,
  inherentRole,
  type CableRole,
  type TerminalRole,
} from "@/lib/simulation/cables";
import { orderedCablePath, type HandleSide } from "@/lib/simulation/cablePath";
import type { ComponentKind } from "@/lib/simulation/types";
import type { CircuitNodeData } from "@/lib/simulation/flowTypes";

function roleOfDraft(
  fromNode?: { data?: Partial<CircuitNodeData> },
  fromHandle?: { id?: string | null } | null,
): CableRole {
  const terminalId = fromHandle?.id ?? "";
  const painted = fromNode?.data?.terminalRoles?.[terminalId];
  const inherent = inherentRole(
    fromNode?.data?.kind as ComponentKind | undefined,
    terminalId,
  );
  const role: TerminalRole | undefined =
    painted && painted !== "libre" ? painted : inherent;
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

export function CableDraft({
  fromX,
  fromY,
  toX,
  toY,
  fromPosition,
  toPosition,
  fromNode,
  fromHandle,
}: ConnectionLineComponentProps) {
  const path = orderedCablePath({
    sourceX: fromX,
    sourceY: fromY,
    targetX: toX,
    targetY: toY,
    sourcePosition: fromPosition as HandleSide,
    targetPosition: toPosition as HandleSide,
    lane: 0,
  });
  const color = CABLE_COLORS[roleOfDraft(fromNode, fromHandle)];

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke="#1F1812"
        strokeWidth={9}
        strokeLinecap="round"
      />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
      />
    </g>
  );
}
