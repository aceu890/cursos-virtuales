"use client";

import { getEdgePosition } from "@xyflow/system";
import { useReactFlow, useStore, type Edge, type EdgeProps } from "@xyflow/react";
import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import {
  bundleCableRoutes,
  cableRoutePoints,
  roundedPolyline,
  seedManualVia,
  segmentKnobs,
  snapManualVia,
  type HandleSide,
  type Point,
  type SegmentAxis,
} from "@/lib/simulation/cablePath";
import { CABLE_COLORS, type CableRole } from "@/lib/simulation/cables";

export type CableEdgeData = {
  role: CableRole;
  pull?: Point;
  bends?: Point[];
  powered?: boolean;
  laneOffset?: number;
  sourceSpread?: number;
  targetSpread?: number;
  manual?: boolean;
  onRemove?: () => void;
  obstacles?: Array<{ x: number; y: number; w: number; h: number }>;
  junctionSource?: boolean;
  junctionTarget?: boolean;
};

export type CableEdgeType = Edge<CableEdgeData, "cable">;

function bendsOf(data?: CableEdgeData): Point[] {
  if (data?.bends && data.bends.length > 0) {
    return data.bends;
  }
  if (data?.pull) {
    return [data.pull];
  }
  return [];
}

let cachedSignature = "";
let cachedRoutes = new Map<string, Point[]>();

function bundleSignature(
  edges: Edge[],
  lookup: {
    get: (id: string) =>
      | {
          internals?: {
            positionAbsolute?: { x: number; y: number };
            handleBounds?: {
              source: Array<{ id?: string | null; x: number; y: number }> | null;
              target: Array<{ id?: string | null; x: number; y: number }> | null;
            } | null;
          };
          measured?: { width?: number; height?: number };
        }
      | undefined;
  },
) {
  return edges
    .map((edge) => {
      const data = edge.data as CableEdgeData | undefined;
      const mark = (id: string) => {
        const node = lookup.get(id);
        const place = node?.internals?.positionAbsolute;
        const handles = [
          ...(node?.internals?.handleBounds?.source ?? []),
          ...(node?.internals?.handleBounds?.target ?? []),
        ];
        return [
          Math.round(place?.x ?? 0),
          Math.round(place?.y ?? 0),
          Math.round(node?.measured?.width ?? 0),
          Math.round(node?.measured?.height ?? 0),
          handles
            .map((handle) => `${handle.id ?? ""}@${Math.round(handle.x)},${Math.round(handle.y)}`)
            .join(","),
        ].join("/");
      };
      const vias = bendsOf(data);
      return [
        edge.id,
        edge.sourceHandle ?? "",
        edge.targetHandle ?? "",
        data?.laneOffset ?? 0,
        data?.sourceSpread ?? 0,
        data?.targetSpread ?? 0,
        vias.map((point) => `${Math.round(point.x)},${Math.round(point.y)}`).join(";"),
        mark(edge.source),
        mark(edge.target),
      ].join(":");
    })
    .join("|");
}

export function CableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<CableEdgeType>) {
  const { screenToFlowPosition, setEdges } = useReactFlow();
  const lastTap = useRef(0);
  const role = data?.role ?? "fase";
  const live = role === "fase";
  const powered = Boolean(data?.powered);
  const color = CABLE_COLORS[role];
  const manual = Boolean(data?.manual);
  const vias = bendsOf(data);
  const nodeLookup = useStore((state) => state.nodeLookup);
  const flowEdges = useStore((state) => state.edges);
  const connectionMode = useStore((state) => state.connectionMode);
  const routeOpts = {
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition: sourcePosition as HandleSide,
    targetPosition: targetPosition as HandleSide,
    lane: data?.laneOffset ?? 0,
    sourceSpread: data?.sourceSpread ?? 0,
    targetSpread: data?.targetSpread ?? 0,
    obstacles: data?.obstacles,
  };
  const signature = bundleSignature(flowEdges, nodeLookup);
  if (signature !== cachedSignature) {
    const items = [];
    for (const edge of flowEdges) {
      const sourceNode = nodeLookup.get(edge.source);
      const targetNode = nodeLookup.get(edge.target);
      if (!sourceNode || !targetNode) {
        continue;
      }
      const place = getEdgePosition({
        id: edge.id,
        sourceNode,
        sourceHandle: edge.sourceHandle ?? null,
        targetNode,
        targetHandle: edge.targetHandle ?? null,
        connectionMode,
      });
      if (!place) {
        continue;
      }
      const edgeData = edge.data as CableEdgeData | undefined;
      const edgeVias = bendsOf(edgeData);
      items.push({
        id: edge.id,
        sourceX: place.sourceX,
        sourceY: place.sourceY,
        targetX: place.targetX,
        targetY: place.targetY,
        sourcePosition: place.sourcePosition as HandleSide,
        targetPosition: place.targetPosition as HandleSide,
        lane: edgeData?.laneOffset ?? 0,
        sourceSpread: edgeData?.sourceSpread ?? 0,
        targetSpread: edgeData?.targetSpread ?? 0,
        obstacles: edgeData?.obstacles,
        vias: edgeVias.length > 0 ? edgeVias : undefined,
      });
    }
    cachedSignature = signature;
    cachedRoutes = items.length > 0 ? bundleCableRoutes(items) : new Map();
  }
  const routePoints = cachedRoutes.get(id) ?? cableRoutePoints({ ...routeOpts, vias });
  const path = roundedPolyline(routePoints, 6);

  const writeBends = (next: Point[] | undefined) => {
    setEdges((current) =>
      current.map((edge) =>
        edge.id === id
          ? {
              ...edge,
              data: {
                ...edge.data,
                bends: next && next.length > 0 ? next : undefined,
                pull: undefined,
              },
            }
          : edge,
      ),
    );
  };

  const flowPoint = (event: { clientX: number; clientY: number }) =>
    screenToFlowPosition({ x: event.clientX, y: event.clientY });

  const snap = (pointer: Point, current: Point, axis?: SegmentAxis) =>
    snapManualVia(
      pointer,
      sourcePosition as HandleSide,
      targetPosition as HandleSide,
      sourceX,
      sourceY,
      targetX,
      targetY,
      current,
      axis,
    );

  const dragAxis = (axis: SegmentAxis, event: ReactPointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const origin = vias[0] ?? seedManualVia(routeOpts);
    const apply = (pointer: Point) => {
      writeBends([snap(pointer, origin, axis)]);
    };
    apply(flowPoint(event));
    const onMove = (moveEvent: PointerEvent) => {
      apply(flowPoint(moveEvent));
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const onCableDown = (event: ReactPointerEvent) => {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const now = performance.now();
    if (!manual && now - lastTap.current < 420) {
      lastTap.current = 0;
      data?.onRemove?.();
      return;
    }
    lastTap.current = now;
    if (!manual) {
      return;
    }
    const origin = { x: event.clientX, y: event.clientY };
    const originVia = vias[0] ?? seedManualVia(routeOpts);
    let dragging = false;

    const onMove = (moveEvent: PointerEvent) => {
      if (
        !dragging &&
        Math.hypot(moveEvent.clientX - origin.x, moveEvent.clientY - origin.y) <
          5
      ) {
        return;
      }
      dragging = true;
      writeBends([snap(flowPoint(moveEvent), originVia)]);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const knobs = manual ? segmentKnobs(routePoints) : [];

  return (
    <>
      <path
        d={path}
        fill="none"
        stroke={selected ? "var(--primary)" : "#1F1812"}
        strokeWidth={selected ? 13 : 9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={path}
        className={live ? "cable-live-core" : undefined}
        fill="none"
        stroke={color}
        strokeWidth={selected ? 7 : 5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {live ? (
        <>
          <path
            d={path}
            className={`cable-live-flow${powered ? " is-powered" : ""}`}
            fill="none"
            stroke={powered ? "#ffe082" : "#ffcc80"}
            strokeWidth={3}
            strokeDasharray="12 16"
            strokeLinecap="round"
          />
          <LiveBeads path={path} powered={powered} />
        </>
      ) : null}
      {data?.junctionSource ? (
        <circle cx={sourceX} cy={sourceY} r={5} fill="#1a1a1a" className="pointer-events-none" />
      ) : null}
      {data?.junctionTarget ? (
        <circle cx={targetX} cy={targetY} r={5} fill="#1a1a1a" className="pointer-events-none" />
      ) : null}
      <path
        d={path}
        className="nopan nodrag cable-hit"
        fill="none"
        stroke="transparent"
        strokeWidth={32}
        strokeLinecap="round"
        onPointerDown={onCableDown}
        onDoubleClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!manual) {
            data?.onRemove?.();
          }
        }}
      />
      {manual
        ? knobs.map((knob, index) => {
            const horizontal = knob.axis === "h";
            return (
              <g key={`${id}-knob-${index}`}>
                <rect
                  className="nopan nodrag"
                  x={knob.x - (horizontal ? 16 : 9)}
                  y={knob.y - (horizontal ? 9 : 16)}
                  width={horizontal ? 32 : 18}
                  height={horizontal ? 18 : 32}
                  rx={9}
                  fill="#1F1812"
                  stroke="#fffaf3"
                  strokeWidth={2}
                  style={{
                    cursor: horizontal ? "ns-resize" : "ew-resize",
                  }}
                  onPointerDown={(event) => {
                    dragAxis(knob.axis, event);
                  }}
                  onDoubleClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    writeBends(undefined);
                  }}
                />
                <rect
                  className="nopan nodrag"
                  x={knob.x - (horizontal ? 8 : 3)}
                  y={knob.y - (horizontal ? 3 : 8)}
                  width={horizontal ? 16 : 6}
                  height={horizontal ? 6 : 16}
                  rx={3}
                  fill={color}
                  pointerEvents="none"
                />
              </g>
            );
          })
        : null}
    </>
  );
}

function LiveBeads({ path, powered }: { path: string; powered: boolean }) {
  const trackRef = useRef<SVGPathElement>(null);
  const firstRef = useRef<SVGCircleElement>(null);
  const secondRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    const speed = powered ? 260 : 150;
    const begun = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const length = track.getTotalLength();
      if (length > 1) {
        const travel = ((now - begun) / 1000) * speed;
        const first = track.getPointAtLength(travel % length);
        const second = track.getPointAtLength((travel + length / 2) % length);
        firstRef.current?.setAttribute("cx", String(first.x));
        firstRef.current?.setAttribute("cy", String(first.y));
        secondRef.current?.setAttribute("cx", String(second.x));
        secondRef.current?.setAttribute("cy", String(second.y));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [path, powered]);

  const size = powered ? 5.5 : 4.5;
  return (
    <>
      <path ref={trackRef} d={path} fill="none" stroke="none" />
      <circle
        ref={firstRef}
        className="cable-live-bead"
        r={size}
        cx={0}
        cy={0}
      />
      <circle
        ref={secondRef}
        className="cable-live-bead"
        r={size}
        cx={0}
        cy={0}
      />
    </>
  );
}
