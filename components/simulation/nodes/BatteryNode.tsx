"use client";

import { Position, type Node, type NodeProps } from "@xyflow/react";
import type { CircuitNodeData } from "@/lib/simulation/flowTypes";
import { CircuitHandle } from "./CircuitHandle";
import { LiveRing } from "./LiveRing";
import { RemovePartButton } from "./RemovePartButton";

export type BatteryFlowNode = Node<CircuitNodeData, "battery">;

export function BatteryNode({ data }: NodeProps<BatteryFlowNode>) {
  return (
    <div className="node-3d relative w-[230px] rounded-2xl p-3 pt-6">
      <LiveRing active={data.live} />
      <RemovePartButton label={data.label} onRemove={data.onRemove} />
      <p className="text-center text-xs font-semibold uppercase tracking-wide text-muted">
        Batería
      </p>
      <img
        src="/Artefactos/bateria.png"
        alt="Batería"
        draggable={false}
        className="circuit-photo mx-auto mt-1 h-24 w-full rounded-xl object-contain"
      />
      <CircuitHandle
        id="negative"
        position={Position.Top}
        role="neutro"
        label="Polo negativo de la batería, neutro"
        selected={data.selectedTerminalId === "negative"}
        onSelect={() => data.onSelectTerminal?.("negative")}
        onDisconnect={() => data.onDisconnectTerminal?.("negative")}
        style={{ left: "32%" }}
      />
      <CircuitHandle
        id="positive"
        position={Position.Top}
        role="fase"
        label="Polo positivo de la batería, fase"
        selected={data.selectedTerminalId === "positive"}
        onSelect={() => data.onSelectTerminal?.("positive")}
        onDisconnect={() => data.onDisconnectTerminal?.("positive")}
        style={{ left: "68%" }}
      />
    </div>
  );
}
