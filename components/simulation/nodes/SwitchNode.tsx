"use client";

import { Position, type Node, type NodeProps } from "@xyflow/react";
import { useEffect, useRef } from "react";
import type { CircuitNodeData } from "@/lib/simulation/flowTypes";
import { playSwitchSound } from "@/lib/simulation/circuitSounds";
import { CircuitHandle } from "./CircuitHandle";
import { LiveRing } from "./LiveRing";
import { RemovePartButton } from "./RemovePartButton";

export type SwitchFlowNode = Node<CircuitNodeData, "switch">;

export function SwitchNode({ data }: NodeProps<SwitchFlowNode>) {
  const closed = Boolean(data.switchClosed);
  const pointer = useRef({ x: 0, y: 0, dragged: false });
  const previous = useRef<boolean | null>(null);

  useEffect(() => {
    const before = previous.current;
    previous.current = closed;
    if (before === null || before === closed) {
      return;
    }
    playSwitchSound(closed);
  }, [closed]);

  return (
    <div className="node-3d relative w-[200px] rounded-2xl p-3 pt-6">
      <LiveRing active={data.live} />
      <RemovePartButton label={data.label} onRemove={data.onRemove} />
      <p className="text-center text-xs font-semibold uppercase tracking-wide text-muted">
        Interruptor
      </p>
      <div className="relative mx-auto mt-1 h-28 w-full">
        <img
          src="/Artefactos/interruptor-abajo.png"
          alt=""
          draggable={false}
          className={`circuit-photo absolute inset-0 h-full w-full rounded-xl object-contain ${
            closed ? "opacity-0" : "opacity-100"
          }`}
        />
        <img
          src="/Artefactos/interruptor-arriba.png"
          alt=""
          draggable={false}
          className={`circuit-photo absolute inset-0 h-full w-full rounded-xl object-contain ${
            closed ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>
      <span className="sr-only">
        {closed
          ? "El interruptor está encendido, palanca arriba"
          : "El interruptor está apagado, palanca abajo"}
      </span>
      <button
        type="button"
        aria-pressed={closed}
        data-testid="switch-toggle"
        onPointerDown={(event) => {
          pointer.current = {
            x: event.clientX,
            y: event.clientY,
            dragged: false,
          };
        }}
        onPointerMove={(event) => {
          if (
            Math.hypot(
              event.clientX - pointer.current.x,
              event.clientY - pointer.current.y,
            ) > 6
          ) {
            pointer.current.dragged = true;
          }
        }}
        onClick={(event) => {
          event.stopPropagation();
          if (pointer.current.dragged) {
            return;
          }
          data.onToggleSwitch?.();
        }}
        onDoubleClick={(event) => {
          event.stopPropagation();
        }}
        className="btn-3d-soft mt-2 flex min-h-11 w-full items-center justify-between rounded-full px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <span>{closed ? "Encendido" : "Apagado"}</span>
        <span
          className={`chip-3d grid h-7 w-12 place-items-center rounded-full text-xs text-white ${
            closed ? "bg-success" : "bg-muted"
          }`}
        >
          {closed ? "ON" : "OFF"}
        </span>
      </button>
      <CircuitHandle
        id="a"
        position={Position.Top}
        role={data.terminalRoles?.a ?? "libre"}
        label="Borne A del interruptor"
        selected={data.selectedTerminalId === "a"}
        onSelect={() => data.onSelectTerminal?.("a")}
        onDisconnect={() => data.onDisconnectTerminal?.("a")}
        style={{ left: "32%" }}
      />
      <CircuitHandle
        id="b"
        position={Position.Top}
        role={data.terminalRoles?.b ?? "libre"}
        label="Borne B del interruptor"
        selected={data.selectedTerminalId === "b"}
        onSelect={() => data.onSelectTerminal?.("b")}
        onDisconnect={() => data.onDisconnectTerminal?.("b")}
        style={{ left: "68%" }}
      />
    </div>
  );
}
