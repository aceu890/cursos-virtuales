"use client";

import { Position, type Node, type NodeProps } from "@xyflow/react";
import type { CircuitNodeData } from "@/lib/simulation/flowTypes";
import { formatAmps, formatVolts } from "@/lib/simulation/devices";
import { CircuitHandle } from "./CircuitHandle";
import { LiveRing } from "./LiveRing";
import { RemovePartButton } from "./RemovePartButton";

export type MultimeterFlowNode = Node<CircuitNodeData, "multimeter">;

const MODE_LABEL = {
  tension: "Tensión",
  corriente: "Corriente",
  continuidad: "Continuidad",
} as const;

export function MultimeterNode({ data }: NodeProps<MultimeterFlowNode>) {
  const mode = data.meterMode ?? "tension";
  const reading =
    mode === "corriente"
      ? formatAmps(data.currentAmps ?? 0)
      : mode === "continuidad"
        ? data.continuity === null || data.continuity === undefined
          ? "—"
          : data.continuity
            ? "Continuo"
            : "Abierto"
        : formatVolts(data.voltageVolts);

  return (
    <div className="node-3d relative w-[210px] rounded-2xl p-3 pt-6">
      <LiveRing active={data.live} />
      <RemovePartButton label={data.label} onRemove={data.onRemove} />
      <p className="text-center text-[11px] font-semibold leading-tight text-[#1a2430]">
        {data.label}
      </p>
      <img
        src="/simulation/multimeter.svg"
        alt="Multímetro"
        draggable={false}
        className="circuit-photo mx-auto mt-1 h-20 w-full rounded-xl object-contain"
      />
      <p
        className="chip-3d mt-2 grid min-h-10 place-items-center rounded-full px-3 font-mono text-base font-bold tracking-wide text-[#102030]"
        aria-live="polite"
      >
        {reading}
      </p>
      <button
        type="button"
        className="nodrag nopan btn-3d-soft mt-2 flex min-h-11 w-full items-center justify-center rounded-full px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          data.onCycleMeter?.();
        }}
      >
        {MODE_LABEL[mode]}
      </button>
      <CircuitHandle
        id="a"
        position={Position.Top}
        role={data.terminalRoles?.a ?? "libre"}
        label="Sonda A del multímetro"
        selected={data.selectedTerminalId === "a"}
        onSelect={() => data.onSelectTerminal?.("a")}
        onDisconnect={() => data.onDisconnectTerminal?.("a")}
        style={{ left: "32%" }}
      />
      <CircuitHandle
        id="b"
        position={Position.Top}
        role={data.terminalRoles?.b ?? "libre"}
        label="Sonda B del multímetro"
        selected={data.selectedTerminalId === "b"}
        onSelect={() => data.onSelectTerminal?.("b")}
        onDisconnect={() => data.onDisconnectTerminal?.("b")}
        style={{ left: "68%" }}
      />
    </div>
  );
}
