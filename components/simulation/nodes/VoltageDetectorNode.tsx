"use client";

import { Position, type Node, type NodeProps } from "@xyflow/react";
import type { CircuitNodeData } from "@/lib/simulation/flowTypes";
import { CircuitHandle } from "./CircuitHandle";
import { LiveRing } from "./LiveRing";
import { RemovePartButton } from "./RemovePartButton";

export type VoltageDetectorFlowNode = Node<CircuitNodeData, "voltageDetector">;

export function VoltageDetectorNode({
  data,
}: NodeProps<VoltageDetectorFlowNode>) {
  const on = Boolean(data.detectorOn);

  return (
    <div className="node-3d relative w-[180px] rounded-2xl p-3 pt-6">
      <LiveRing active={on || data.live} />
      <RemovePartButton label={data.label} onRemove={data.onRemove} />
      <p className="text-center text-[11px] font-semibold leading-tight text-[#1a2430]">
        {data.label}
      </p>
      <img
        src="/simulation/voltage-detector.svg"
        alt="Detector de voltaje"
        draggable={false}
        className="circuit-photo mx-auto mt-1 h-20 w-full rounded-xl object-contain"
      />
      <p
        className={`chip-3d mt-2 grid min-h-10 place-items-center rounded-full px-3 text-sm font-bold ${
          on ? "bg-danger text-white" : "text-[#102030]"
        }`}
        aria-live="polite"
      >
        {on ? "Hay fase" : "Sin fase"}
      </p>
      <p className="mt-1 text-center text-[10px] font-semibold text-[#243140]">
        Toca un punto con la punta
      </p>
      <CircuitHandle
        id="tip"
        position={Position.Top}
        role={data.terminalRoles?.tip ?? "libre"}
        label="Punta del detector de voltaje"
        selected={data.selectedTerminalId === "tip"}
        onSelect={() => data.onSelectTerminal?.("tip")}
        onDisconnect={() => data.onDisconnectTerminal?.("tip")}
        style={{ left: "50%" }}
      />
    </div>
  );
}
