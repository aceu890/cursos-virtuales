"use client";

import { Position, type Node, type NodeProps } from "@xyflow/react";
import { useEffect, useRef } from "react";
import type { CircuitNodeData } from "@/lib/simulation/flowTypes";
import { playBulbSound } from "@/lib/simulation/circuitSounds";
import { CircuitHandle } from "./CircuitHandle";
import { LiveRing } from "./LiveRing";
import { RemovePartButton } from "./RemovePartButton";

export type BulbFlowNode = Node<CircuitNodeData, "bulb">;

export function BulbNode({ data }: NodeProps<BulbFlowNode>) {
  const on = Boolean(data.energized);
  const previous = useRef<boolean | null>(null);

  useEffect(() => {
    const before = previous.current;
    previous.current = on;
    if (before === null || before === on) {
      return;
    }
    playBulbSound(on);
  }, [on]);

  return (
    <div className="node-3d relative flex w-[170px] flex-col items-center rounded-2xl p-3 pt-6 pb-7">
      <LiveRing active={data.live} />
      <RemovePartButton label={data.label} onRemove={data.onRemove} />
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {data.label}
      </p>
      <div className="relative mt-1 h-44 w-full">
        <img
          src="/simulation/lampholder-off.png"
          alt=""
          draggable={false}
          className={`circuit-photo absolute inset-0 h-full w-full object-contain ${
            on ? "opacity-0" : "opacity-100"
          }`}
        />
        <img
          src="/simulation/lampholder-on.png"
          alt=""
          draggable={false}
          className={`circuit-photo absolute inset-0 h-full w-full object-contain ${
            on ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>
      <span className="sr-only">
        {on
          ? "La ampolleta del portalámparas está encendida"
          : "La ampolleta del portalámparas está apagada"}
      </span>
      <CircuitHandle
        id="a"
        position={Position.Top}
        role={data.terminalRoles?.a ?? "libre"}
        label="Borne A del portalámparas"
        selected={data.selectedTerminalId === "a"}
        onSelect={() => data.onSelectTerminal?.("a")}
        onDisconnect={() => data.onDisconnectTerminal?.("a")}
        style={{ left: "32%" }}
      />
      <CircuitHandle
        id="b"
        position={Position.Top}
        role={data.terminalRoles?.b ?? "libre"}
        label="Borne B del portalámparas"
        selected={data.selectedTerminalId === "b"}
        onSelect={() => data.onSelectTerminal?.("b")}
        onDisconnect={() => data.onDisconnectTerminal?.("b")}
        style={{ left: "68%" }}
      />
      <CircuitHandle
        id="earth"
        position={Position.Bottom}
        role="tierra"
        label="Terminal de tierra del portalámparas"
        selected={data.selectedTerminalId === "earth"}
        onSelect={() => data.onSelectTerminal?.("earth")}
        onDisconnect={() => data.onDisconnectTerminal?.("earth")}
      />
    </div>
  );
}
