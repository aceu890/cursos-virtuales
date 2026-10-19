"use client";

import { Handle, Position } from "@xyflow/react";
import { useRef } from "react";
import { CABLE_COLORS, type TerminalRole } from "@/lib/simulation/cables";

const ROLE_CLASS: Record<TerminalRole, string> = {
  fase: "border-red-800",
  neutro: "border-zinc-500",
  tierra: "border-green-900",
  enchufe: "border-zinc-800",
  libre: "border-zinc-500",
};

interface CircuitHandleProps {
  id: string;
  position: Position;
  role: TerminalRole;
  label: string;
  selected?: boolean;
  onSelect?: () => void;
  onDisconnect?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

export function CircuitHandle({
  id,
  position,
  role,
  label,
  selected = false,
  onSelect,
  onDisconnect,
  style,
  className = "",
}: CircuitHandleProps) {
  const pointer = useRef({ x: 0, y: 0, dragged: false, lastTap: 0 });

  return (
    <Handle
      type="source"
      id={id}
      position={position}
      isConnectable
      aria-label={label}
      aria-pressed={selected}
      title={label}
      onPointerDown={(event) => {
        const now = performance.now();
        if (now - pointer.current.lastTap < 420) {
          pointer.current.lastTap = 0;
          event.preventDefault();
          event.stopPropagation();
          onDisconnect?.();
          return;
        }
        pointer.current = {
          x: event.clientX,
          y: event.clientY,
          dragged: false,
          lastTap: now,
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
        if (pointer.current.dragged || event.detail === 2) {
          return;
        }
        onSelect?.();
      }}
      onDoubleClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onDisconnect?.();
      }}
      className={`term-3d !border-0 rounded-full ${ROLE_CLASS[role]} ${
        selected
          ? "term-picked outline-4 outline-offset-[4px] outline-[#ffe566]"
          : ""
      } ${className}`}
      style={{
        background: CABLE_COLORS[role],
        cursor: 'url("/cursors/cable-cross.png") 16 16, default',
        ...style,
      }}
    />
  );
}
