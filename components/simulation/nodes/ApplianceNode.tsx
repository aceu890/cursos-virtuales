"use client";

import { Position, type Node, type NodeProps } from "@xyflow/react";
import { useEffect, useRef } from "react";
import { applianceById } from "@/lib/simulation/appliances";
import { playSwitchSound } from "@/lib/simulation/circuitSounds";
import type { CircuitNodeData } from "@/lib/simulation/flowTypes";
import { CircuitHandle } from "./CircuitHandle";
import { AppliancePowerButton } from "./AppliancePowerButton";
import { LiveRing } from "./LiveRing";
import { RemovePartButton } from "./RemovePartButton";

export type ApplianceFlowNode = Node<CircuitNodeData, "appliance">;

export function ApplianceNode({ data }: NodeProps<ApplianceFlowNode>) {
  const spec = applianceById(data.applianceId);
  const hasSupply = Boolean(data.hasSupply);
  const switchedOn = data.switchClosed === true;
  const on = switchedOn && hasSupply;
  const powered = on && Boolean(data.energized);
  const src = spec?.src ?? data.src ?? "/electrodomesticos/refrigerador.png";
  const previous = useRef<boolean | null>(null);

  useEffect(() => {
    const before = previous.current;
    previous.current = switchedOn;
    if (before === null || before === switchedOn) {
      return;
    }
    playSwitchSound(switchedOn);
  }, [switchedOn]);

  return (
    <div className="node-3d relative flex w-[180px] flex-col items-center rounded-2xl p-3 pb-7">
      <LiveRing active={data.live} />
      <AppliancePowerButton
        label={data.label}
        on={on}
        hasSupply={hasSupply}
        onToggle={data.onToggleSwitch}
      />
      <RemovePartButton label={data.label} onRemove={data.onRemove} />
      <p className="px-6 text-center text-[11px] font-semibold leading-tight text-[#1a2430]">
        {data.label}
      </p>
      <img
        src={src}
        alt={spec?.label ?? "Electrodoméstico"}
        draggable={false}
        className={`circuit-photo mx-auto mt-1 h-36 w-full rounded-xl object-contain ${
          powered ? "brightness-105" : "opacity-70"
        }`}
      />
      {spec ? (
        <p className="mt-1 text-center text-[10px] font-semibold text-[#243140]">
          {spec.watts} W
        </p>
      ) : null}
      <span className="sr-only">
        {powered
          ? `${data.label} está encendido y recibiendo corriente`
          : on
            ? `${data.label} está encendido, pero no recibe corriente`
            : hasSupply
              ? `${data.label} está apagado`
              : `${data.label} no tiene corriente y no se puede encender`}
      </span>
      <CircuitHandle
        id="plug"
        position={Position.Bottom}
        role={data.terminalRoles?.plug ?? "enchufe"}
        label={`Enchufe de ${data.label}. Conéctalo al tomacorriente`}
        selected={data.selectedTerminalId === "plug"}
        onSelect={() => data.onSelectTerminal?.("plug")}
        onDisconnect={() => data.onDisconnectTerminal?.("plug")}
      />
    </div>
  );
}
