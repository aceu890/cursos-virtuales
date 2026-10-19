"use client";

import { Position, type Node, type NodeProps } from "@xyflow/react";
import type { CircuitNodeData } from "@/lib/simulation/flowTypes";
import { formatVolts } from "@/lib/simulation/devices";
import { CircuitHandle } from "./CircuitHandle";
import { LiveRing } from "./LiveRing";
import { RemovePartButton } from "./RemovePartButton";

export type VoltmeterFlowNode = Node<CircuitNodeData, "voltmeter">;

export function VoltmeterNode({ data }: NodeProps<VoltmeterFlowNode>) {
  return (
    <div className="node-3d relative w-[200px] rounded-2xl p-3 pt-6">
      <LiveRing active={data.live} />
      <RemovePartButton label={data.label} onRemove={data.onRemove} />
      <p className="text-center text-[11px] font-semibold leading-tight text-[#1a2430]">
        {data.label}
      </p>
      <img
        src="/simulation/voltmeter.svg"
        alt="Medidor de tensión"
        draggable={false}
        className="circuit-photo mx-auto mt-1 h-24 w-full rounded-xl object-contain"
      />
      <p
        className="chip-3d mt-2 grid min-h-10 place-items-center rounded-full px-3 font-mono text-base font-bold tracking-wide text-[#102030]"
        aria-live="polite"
      >
        {formatVolts(data.voltageVolts)}
      </p>
      <p className="mt-1 text-center text-[10px] font-semibold text-[#243140]">
        Tensión
      </p>
      <CircuitHandle
        id="a"
        position={Position.Top}
        role={data.terminalRoles?.a ?? "libre"}
        label="Sonda A del medidor de tensión"
        selected={data.selectedTerminalId === "a"}
        onSelect={() => data.onSelectTerminal?.("a")}
        onDisconnect={() => data.onDisconnectTerminal?.("a")}
        style={{ left: "32%" }}
      />
      <CircuitHandle
        id="b"
        position={Position.Top}
        role={data.terminalRoles?.b ?? "libre"}
        label="Sonda B del medidor de tensión"
        selected={data.selectedTerminalId === "b"}
        onSelect={() => data.onSelectTerminal?.("b")}
        onDisconnect={() => data.onDisconnectTerminal?.("b")}
        style={{ left: "68%" }}
      />
    </div>
  );
}
