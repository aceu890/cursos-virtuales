"use client";

import { Position, type Node, type NodeProps } from "@xyflow/react";
import type { CircuitNodeData } from "@/lib/simulation/flowTypes";
import { CircuitHandle } from "./CircuitHandle";
import { LiveRing } from "./LiveRing";
import { RemovePartButton } from "./RemovePartButton";

export type OutletFlowNode = Node<CircuitNodeData, "outlet">;

export function OutletNode({ data }: NodeProps<OutletFlowNode>) {
  const on = Boolean(data.energized);

  return (
    <div className="node-3d relative w-[240px] rounded-2xl p-3 pt-6 pb-6">
      <LiveRing active={data.live} />
      <RemovePartButton label={data.label} onRemove={data.onRemove} />
      <p className="text-center text-[11px] font-semibold leading-tight text-muted">
        {data.label}
      </p>
      <p className="text-center text-[10px] text-muted">
        Fase y neutro arriba · tierra abajo
      </p>
      <div className="relative mx-auto mt-1 h-36 w-full">
        <img
          src="/Artefactos/tomacorriente_uno.png"
          alt="Tomacorriente"
          draggable={false}
          className={`circuit-photo h-full w-full rounded-xl object-contain ${
            on ? "brightness-105" : "opacity-95"
          }`}
        />
        <CircuitHandle
          id="socket0"
          position={Position.Top}
          role={data.terminalRoles?.socket0 ?? "enchufe"}
          label="Enchufe del tomacorriente"
          selected={data.selectedTerminalId === "socket0"}
          onSelect={() => data.onSelectTerminal?.("socket0")}
          onDisconnect={() => data.onDisconnectTerminal?.("socket0")}
          style={{ left: "50%", top: "48%" }}
        />
      </div>
      <span className="sr-only">
        {on
          ? "El tomacorriente está alimentando un electrodoméstico"
          : "El tomacorriente no tiene carga conectada"}
      </span>
      <CircuitHandle
        id="lineL"
        position={Position.Top}
        role={data.terminalRoles?.lineL ?? "fase"}
        label="Fase entrada, arriba"
        selected={data.selectedTerminalId === "lineL"}
        onSelect={() => data.onSelectTerminal?.("lineL")}
        onDisconnect={() => data.onDisconnectTerminal?.("lineL")}
        style={{ left: "32%" }}
      />
      <CircuitHandle
        id="lineN"
        position={Position.Top}
        role={data.terminalRoles?.lineN ?? "neutro"}
        label="Neutro entrada, arriba"
        selected={data.selectedTerminalId === "lineN"}
        onSelect={() => data.onSelectTerminal?.("lineN")}
        onDisconnect={() => data.onDisconnectTerminal?.("lineN")}
        style={{ left: "68%" }}
      />
      <CircuitHandle
        id="earth"
        position={Position.Bottom}
        role="tierra"
        label="Tierra del tomacorriente"
        selected={data.selectedTerminalId === "earth"}
        onSelect={() => data.onSelectTerminal?.("earth")}
        onDisconnect={() => data.onDisconnectTerminal?.("earth")}
      />
    </div>
  );
}
