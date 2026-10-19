"use client";

import { Position, type Node, type NodeProps } from "@xyflow/react";
import { useEffect, useRef, useState } from "react";
import type { CircuitNodeData } from "@/lib/simulation/flowTypes";
import {
  formatAmps,
  formatEnergyWh,
  SUPPLY_VOLTS,
} from "@/lib/simulation/devices";
import { CircuitHandle } from "./CircuitHandle";
import { LiveRing } from "./LiveRing";
import { RemovePartButton } from "./RemovePartButton";

export type AmmeterFlowNode = Node<CircuitNodeData, "ammeter">;

export function AmmeterNode({ data }: NodeProps<AmmeterFlowNode>) {
  const amps = data.currentAmps ?? 0;
  const [energyWh, setEnergyWh] = useState(0);
  const energyRef = useRef(0);

  useEffect(() => {
    if (amps <= 0) {
      return;
    }
    const watts = amps * SUPPLY_VOLTS;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      energyRef.current += (watts * (now - last)) / 3_600_000;
      last = now;
      setEnergyWh(energyRef.current);
    }, 120);
    return () => window.clearInterval(id);
  }, [amps]);

  return (
    <div className="node-3d relative w-[200px] rounded-2xl p-3 pt-6">
      <LiveRing active={data.live} />
      <RemovePartButton label={data.label} onRemove={data.onRemove} />
      <p className="text-center text-[11px] font-semibold leading-tight text-[#1a2430]">
        {data.label}
      </p>
      <img
        src="/simulation/ammeter.png"
        alt="Medidor de corriente"
        draggable={false}
        className="circuit-photo mx-auto mt-1 h-24 w-full rounded-xl object-contain"
      />
      <p
        className="chip-3d mt-2 grid min-h-10 place-items-center rounded-full px-3 font-mono text-base font-bold tracking-wide text-[#102030]"
        aria-live="polite"
      >
        {formatAmps(amps)}
      </p>
      <p className="mt-1 text-center text-[10px] font-semibold text-[#243140]">
        Corriente
      </p>
      <p className="chip-3d mt-2 grid min-h-10 place-items-center rounded-full px-3 font-mono text-base font-bold tracking-wide text-[#102030]">
        {formatEnergyWh(energyWh)}
      </p>
      <p className="mt-1 text-center text-[10px] font-semibold text-[#243140]">
        Energía
      </p>
      <CircuitHandle
        id="a"
        position={Position.Top}
        role={data.terminalRoles?.a ?? "libre"}
        label="Borne A del medidor de corriente"
        selected={data.selectedTerminalId === "a"}
        onSelect={() => data.onSelectTerminal?.("a")}
        onDisconnect={() => data.onDisconnectTerminal?.("a")}
        style={{ left: "32%" }}
      />
      <CircuitHandle
        id="b"
        position={Position.Top}
        role={data.terminalRoles?.b ?? "libre"}
        label="Borne B del medidor de corriente"
        selected={data.selectedTerminalId === "b"}
        onSelect={() => data.onSelectTerminal?.("b")}
        onDisconnect={() => data.onDisconnectTerminal?.("b")}
        style={{ left: "68%" }}
      />
    </div>
  );
}
