"use client";

import { Position, type Node, type NodeProps } from "@xyflow/react";
import type { CircuitNodeData } from "@/lib/simulation/flowTypes";
import { CircuitHandle } from "./CircuitHandle";
import { LiveRing } from "./LiveRing";
import { RemovePartButton } from "./RemovePartButton";

export type GroundFlowNode = Node<CircuitNodeData, "ground">;

export function GroundNode({ data }: NodeProps<GroundFlowNode>) {
  return (
    <div className="node-3d relative w-[170px] rounded-2xl p-3 pt-6">
      <LiveRing active={data.live} />
      <RemovePartButton label={data.label} onRemove={data.onRemove} />
      <p className="text-center text-xs font-semibold uppercase tracking-wide text-muted">
        Tierra
      </p>
      <img
        src="/simulation/ground-clip.png"
        alt="Conector de tierra"
        draggable={false}
        className="circuit-photo mx-auto mt-1 h-24 w-full rounded-xl object-contain"
      />
      <CircuitHandle
        id="earth"
        position={Position.Top}
        role="tierra"
        label="Terminal de tierra"
        selected={data.selectedTerminalId === "earth"}
        onSelect={() => data.onSelectTerminal?.("earth")}
        onDisconnect={() => data.onDisconnectTerminal?.("earth")}
      />
    </div>
  );
}
