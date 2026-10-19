"use client";

import { Position, type Node, type NodeProps } from "@xyflow/react";
import { useEffect, useRef, type MouseEvent } from "react";
import type { CircuitNodeData } from "@/lib/simulation/flowTypes";
import { playSwitchSound } from "@/lib/simulation/circuitSounds";
import { CircuitHandle } from "./CircuitHandle";
import { LiveRing } from "./LiveRing";
import { RemovePartButton } from "./RemovePartButton";

type BreakerKind = "mainSwitch" | "rcd" | "mcb";

const SPEC: Record<
  BreakerKind,
  {
    onSrc: string;
    offSrc: string;
    onText: string;
    offText: string;
    caption?: string;
    testId: string;
    hasTest?: boolean;
  }
> = {
  mainSwitch: {
    onSrc: "/Artefactos/interruptor-general-arriba.png",
    offSrc: "/Artefactos/interruptor-general-abajo.png",
    onText: "Encendido",
    offText: "Apagado",
    caption: "Fase y neutro · entra arriba",
    testId: "main-switch-toggle",
  },
  rcd: {
    onSrc: "/Artefactos/diferencial-arriba.png",
    offSrc: "/Artefactos/diferencial-abajo.png",
    onText: "Encendido",
    offText: "Disparado",
    caption: "Fase y neutro · entra arriba",
    testId: "rcd-toggle",
    hasTest: true,
  },
  mcb: {
    onSrc: "/Artefactos/interruptor-auto-arriba.png",
    offSrc: "/Artefactos/interruptor-auto-abajo.png",
    onText: "Encendido",
    offText: "Disparado",
    caption: "10 A · fase y neutro",
    testId: "mcb-toggle",
  },
};

export type BreakerFlowNode = Node<CircuitNodeData, BreakerKind>;

function BreakerCard({
  kind,
  data,
}: {
  kind: BreakerKind;
  data: CircuitNodeData;
}) {
  const spec = SPEC[kind];
  const closed = Boolean(data.switchClosed);
  const tripped = Boolean(data.tripped);
  const offLabel = tripped || kind === "rcd" ? spec.offText : "Apagado";
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

  const toggleIfIdle = (event: MouseEvent) => {
    event.stopPropagation();
    if (pointer.current.dragged) {
      return;
    }
    data.onToggleSwitch?.();
  };

  return (
    <div
      className="node-3d relative w-[200px] rounded-2xl p-3 pt-6 pb-6"
    >
      <LiveRing active={data.live} />
      <RemovePartButton label={data.label} onRemove={data.onRemove} />
      <p className="text-center text-[11px] font-semibold leading-tight text-muted">
        {data.label}
      </p>
      {spec.caption ? (
        <p className="text-center text-[10px] text-muted">{spec.caption}</p>
      ) : null}
      <div className="relative mx-auto mt-1 h-28 w-full">
        <img
          src={spec.offSrc}
          alt=""
          draggable={false}
          className={`circuit-photo absolute inset-0 h-full w-full rounded-xl object-contain ${
            closed ? "opacity-0" : "opacity-100"
          }`}
        />
        <img
          src={spec.onSrc}
          alt=""
          draggable={false}
          className={`circuit-photo absolute inset-0 h-full w-full rounded-xl object-contain ${
            closed ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>
      <span className="sr-only">
        {closed
          ? `${data.label} encendido`
          : `${data.label} ${offLabel.toLowerCase()}`}
      </span>
      <button
        type="button"
        aria-pressed={closed}
        data-testid={spec.testId}
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
        onClick={toggleIfIdle}
        onDoubleClick={(event) => {
          event.stopPropagation();
        }}
        className="btn-3d-soft mt-2 flex min-h-11 w-full items-center justify-between rounded-full px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <span>{closed ? spec.onText : offLabel}</span>
        <span
          className={`chip-3d grid h-7 w-12 place-items-center rounded-full text-xs text-white ${
            closed ? "bg-success" : "bg-muted"
          }`}
        >
          {closed ? "ON" : "OFF"}
        </span>
      </button>
      {spec.hasTest ? (
        <button
          type="button"
          disabled={!closed}
          onClick={(event) => {
            event.stopPropagation();
            if (closed) {
              data.onTestTrip?.();
            }
          }}
          onDoubleClick={(event) => {
            event.stopPropagation();
          }}
          className="btn-3d-soft mt-2 min-h-11 w-full rounded-full px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
        >
          Probar
        </button>
      ) : null}
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
        id="loadL"
        position={Position.Bottom}
        role={data.terminalRoles?.loadL ?? "fase"}
        label="Fase salida, abajo"
        selected={data.selectedTerminalId === "loadL"}
        onSelect={() => data.onSelectTerminal?.("loadL")}
        onDisconnect={() => data.onDisconnectTerminal?.("loadL")}
        style={{ left: "32%" }}
      />
      <CircuitHandle
        id="loadN"
        position={Position.Bottom}
        role={data.terminalRoles?.loadN ?? "neutro"}
        label="Neutro salida, abajo"
        selected={data.selectedTerminalId === "loadN"}
        onSelect={() => data.onSelectTerminal?.("loadN")}
        onDisconnect={() => data.onDisconnectTerminal?.("loadN")}
        style={{ left: "68%" }}
      />
    </div>
  );
}

export function MainSwitchNode({ data }: NodeProps<BreakerFlowNode>) {
  return <BreakerCard kind="mainSwitch" data={data} />;
}

export function RcdNode({ data }: NodeProps<BreakerFlowNode>) {
  return <BreakerCard kind="rcd" data={data} />;
}

export function McbNode({ data }: NodeProps<BreakerFlowNode>) {
  return <BreakerCard kind="mcb" data={data} />;
}
