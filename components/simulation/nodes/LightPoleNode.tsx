"use client";

import { Position, type Node, type NodeProps } from "@xyflow/react";
import type { CircuitNodeData } from "@/lib/simulation/flowTypes";
import { CircuitHandle } from "./CircuitHandle";
import { LiveRing } from "./LiveRing";
import { RemovePartButton } from "./RemovePartButton";

export type LightPoleFlowNode = Node<CircuitNodeData, "lightPole">;

export function LightPoleNode({ data }: NodeProps<LightPoleFlowNode>) {
  return (
    <div className="node-3d relative w-[200px] rounded-2xl p-3 pt-6 pb-6">
      <LiveRing active={data.live} />
      <RemovePartButton label={data.label} onRemove={data.onRemove} />
      <p className="text-center text-[11px] font-semibold leading-tight text-muted">
        {data.label}
      </p>
      <p className="text-center text-[10px] text-muted">
        Fase y neutro arriba
      </p>
      <img
        src="/Artefactos/poste-luz.png"
        alt="Poste de luz de la red domiciliaria"
        draggable={false}
        className="circuit-photo mx-auto mt-1 h-52 w-full rounded-xl object-contain"
      />
      <CircuitHandle
        id="lineL"
        position={Position.Top}
        role={data.terminalRoles?.lineL ?? "fase"}
        label="Fase del poste de luz"
        selected={data.selectedTerminalId === "lineL"}
        onSelect={() => data.onSelectTerminal?.("lineL")}
        onDisconnect={() => data.onDisconnectTerminal?.("lineL")}
        style={{ left: "32%" }}
      />
      <CircuitHandle
        id="lineN"
        position={Position.Top}
        role={data.terminalRoles?.lineN ?? "neutro"}
        label="Neutro del poste de luz"
        selected={data.selectedTerminalId === "lineN"}
        onSelect={() => data.onSelectTerminal?.("lineN")}
        onDisconnect={() => data.onDisconnectTerminal?.("lineN")}
        style={{ left: "68%" }}
      />
    </div>
  );
}
