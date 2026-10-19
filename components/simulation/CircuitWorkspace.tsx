"use client";

import {
  addEdge,
  Background,
  ConnectionMode,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "@xyflow/react/dist/style.css";
import { evaluateCircuit } from "@/lib/simulation/evaluateCircuit";
import { graphFromFlow } from "@/lib/simulation/fromFlow";
import {
  clearLabBoard,
  loadLabBoard,
  saveLabBoard,
  snapshotLabBoard,
} from "@/lib/simulation/labBoard";
import { MCB_TRIP_AMPS } from "@/lib/simulation/devices";
import {
  assignLaneOffsets,
  assignTerminalSpreads,
} from "@/lib/simulation/cableLanes";
import {
  canConnectTerminals,
  cableRoleFromMap,
  isPlugFace,
  resolveConductorRoles,
  terminalKey,
} from "@/lib/simulation/cables";
import { CableDraft } from "./CableDraft";
import type {
  CircuitBoardLayout,
  CircuitLessonDefinition,
  CircuitNodeData,
  PlaceableKind,
} from "@/lib/simulation/flowTypes";
import { applianceById } from "@/lib/simulation/appliances";
import { isSwitchLike } from "@/lib/simulation/devices";
import type { Terminal } from "@/lib/simulation/types";
import {
  componentTitle,
  terminalLabel,
} from "@/lib/simulation/terminalLabels";
import { Button } from "../ui/Button";
import { IconCompress, IconExpand } from "../ui/Icons";
import { CableEdge } from "./CableEdge";
import { CableLegend } from "./CableLegend";
import { FeedbackPanel } from "./FeedbackPanel";
import { LabStatus } from "./LabStatus";
import { circuitNodeTypes } from "./nodeTypes";
import { ArtifactLibrary } from "../lab/ArtifactLibrary";
import { useBoardSettings } from "@/lib/settings/BoardSettingsProvider";

const edgeTypes = { cable: CableEdge };

const NODE_SPAN: Record<PlaceableKind, { w: number; h: number }> = {
  battery: { w: 290, h: 190 },
  switch: { w: 270, h: 260 },
  bulb: { w: 220, h: 320 },
  ground: { w: 220, h: 190 },
  mainSwitch: { w: 270, h: 320 },
  rcd: { w: 270, h: 320 },
  mcb: { w: 270, h: 320 },
  ammeter: { w: 270, h: 300 },
  voltmeter: { w: 270, h: 280 },
  multimeter: { w: 270, h: 340 },
  voltageDetector: { w: 220, h: 280 },
  lightPole: { w: 250, h: 400 },
  outlet: { w: 280, h: 320 },
  appliance: { w: 230, h: 340 },
};

const SLOT_GAP = 36;
const SLOT_ORIGIN = { x: 36, y: 48 };
const ROW_LIMIT = 1080;

function overlaps(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
) {
  return (
    a.x < b.x + b.w + SLOT_GAP &&
    a.x + a.w + SLOT_GAP > b.x &&
    a.y < b.y + b.h + SLOT_GAP &&
    a.y + a.h + SLOT_GAP > b.y
  );
}

function nextFreeSlot(
  nodes: Node<CircuitNodeData>[],
  kind: PlaceableKind,
) {
  const size = NODE_SPAN[kind];
  const taken = nodes.map((node) => ({
    x: node.position.x,
    y: node.position.y,
    ...(NODE_SPAN[node.data.kind as PlaceableKind] ?? size),
  }));
  const rowHeight =
    Math.max(...Object.values(NODE_SPAN).map((item) => item.h)) + SLOT_GAP;

  for (let row = 0; row < 8; row += 1) {
    const y = SLOT_ORIGIN.y + row * rowHeight;
    const inRow = taken
      .filter((item) => item.y >= y - 12 && item.y < y + rowHeight - 12)
      .sort((left, right) => left.x - right.x);
    const candidates = [
      SLOT_ORIGIN.x,
      ...inRow.map((item) => item.x + item.w + SLOT_GAP),
    ];
    for (const x of candidates) {
      if (inRow.length > 0 && x + size.w > SLOT_ORIGIN.x + ROW_LIMIT) {
        continue;
      }
      const candidate = { x, y, ...size };
      if (!taken.some((item) => overlaps(candidate, item))) {
        return { x, y };
      }
    }
  }

  return {
    x: SLOT_ORIGIN.x,
    y: SLOT_ORIGIN.y + taken.length * rowHeight,
  };
}

function terminalsFor(kind: PlaceableKind): Terminal[] {
  if (kind === "battery") {
    return [
      { id: "positive", polarity: "positive" },
      { id: "negative", polarity: "negative" },
    ];
  }
  if (kind === "bulb") {
    return [
      { id: "a", polarity: "a" },
      { id: "b", polarity: "b" },
      { id: "earth", polarity: "earth" },
    ];
  }
  if (kind === "ground") {
    return [{ id: "earth", polarity: "earth" }];
  }
  if (kind === "rcd" || kind === "mainSwitch" || kind === "mcb") {
    return [
      { id: "lineL", polarity: "a" },
      { id: "lineN", polarity: "b" },
      { id: "loadL", polarity: "a" },
      { id: "loadN", polarity: "b" },
    ];
  }
  if (kind === "lightPole") {
    return [
      { id: "lineL", polarity: "positive" },
      { id: "lineN", polarity: "negative" },
    ];
  }
  if (kind === "outlet") {
    return [
      { id: "lineL", polarity: "a" },
      { id: "lineN", polarity: "b" },
      { id: "earth", polarity: "earth" },
      { id: "socket0", polarity: "a" },
    ];
  }
  if (kind === "appliance") {
    return [{ id: "plug", polarity: "a" }];
  }
  if (kind === "voltmeter" || kind === "multimeter") {
    return [
      { id: "a", polarity: "a" },
      { id: "b", polarity: "b" },
    ];
  }
  if (kind === "voltageDetector") {
    return [{ id: "tip", polarity: "a" }];
  }
  return [
    { id: "a", polarity: "a" },
    { id: "b", polarity: "b" },
  ];
}

function useBoardTheme() {
  const [board, setBoard] = useState({
    fill: "#f3e6d4",
    grid: "#e6d8c4",
    mask: "rgb(251 246 238 / 0.7)",
  });

  useEffect(() => {
    const read = () => {
      const styles = getComputedStyle(document.documentElement);
      setBoard({
        fill: styles.getPropertyValue("--board").trim() || "#f3e6d4",
        grid: styles.getPropertyValue("--board-grid").trim() || "#e6d8c4",
        mask: styles.getPropertyValue("--board-mask").trim() || "rgb(251 246 238 / 0.7)",
      });
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return board;
}

function connectableTerminals(node: Node<CircuitNodeData>) {
  const terminals = [...node.data.terminals];
  if (
    node.data.kind === "bulb" &&
    !terminals.some((terminal) => terminal.id === "earth")
  ) {
    terminals.push({ id: "earth", polarity: "earth" });
  }
  return terminals;
}

interface CircuitWorkspaceProps {
  definition: CircuitLessonDefinition;
  onSolved?: () => void;
  sandbox?: boolean;
}

export function CircuitWorkspace({
  definition,
  onSolved,
  sandbox = false,
}: CircuitWorkspaceProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<CircuitNodeData>>(
    [],
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [pending, setPending] = useState<{
    nodeId: string;
    terminalId: string;
  } | null>(null);
  const [fromSelect, setFromSelect] = useState("");
  const [toSelect, setToSelect] = useState("");
  const { connectWithoutDrag, showLiveBorders, manualCables, setManualCables } =
    useBoardSettings();
  const [interacted, setInteracted] = useState(false);
  const [showedSolution, setShowedSolution] = useState(false);
  const [showMinimap, setShowMinimap] = useState(false);
  const [loadedCircuitId, setLoadedCircuitId] = useState<string | null>(null);
  const [protectionNote, setProtectionNote] = useState<string | null>(null);
  const [cssFull, setCssFull] = useState(false);
  const [nativeFull, setNativeFull] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [flowReady, setFlowReady] = useState(false);
  const counters = useRef<Record<string, number>>({});
  const notifiedRef = useRef(false);
  const nodesRef = useRef<Node<CircuitNodeData>[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const supplyRef = useRef<string[]>([]);
  const shouldFrame = useRef(false);
  const revealRequested = useRef(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const boardFull = cssFull || nativeFull;
  const flowApi = useRef<{
    fitView: (opts?: {
      padding?: number;
      minZoom?: number;
      maxZoom?: number;
      duration?: number;
    }) => Promise<unknown>;
    setViewport: (viewport: { x: number; y: number; zoom: number }) => Promise<unknown>;
    screenToFlowPosition: (position: { x: number; y: number }) => {
      x: number;
      y: number;
    };
  } | null>(null);
  nodesRef.current = nodes;
  edgesRef.current = edges;

  const undoStack = useRef<
    Array<{ nodes: Node<CircuitNodeData>[]; edges: Edge[] }>
  >([]);
  const redoStack = useRef<
    Array<{ nodes: Node<CircuitNodeData>[]; edges: Edge[] }>
  >([]);
  const applyingHistory = useRef(false);
  const pushedThisTick = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const syncHistoryButtons = useCallback(() => {
    setCanUndo(undoStack.current.length > 0);
    setCanRedo(redoStack.current.length > 0);
  }, []);

  const cloneBoard = useCallback(
    () => ({
      nodes: nodesRef.current.map((node) => ({
        ...node,
        position: { ...node.position },
        data: { ...node.data },
      })),
      edges: edgesRef.current.map((edge) => ({
        ...edge,
        data: edge.data ? { ...edge.data } : edge.data,
      })),
    }),
    [],
  );

  const clearHistory = useCallback(() => {
    undoStack.current = [];
    redoStack.current = [];
    setCanUndo(false);
    setCanRedo(false);
  }, []);

  const restoreBoard = useCallback(
    (snapshot: { nodes: Node<CircuitNodeData>[]; edges: Edge[] }) => {
      applyingHistory.current = true;
      setPending(null);
      setFromSelect("");
      setToSelect("");
      setNodes(
        snapshot.nodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            onToggleSwitch: () => handlersRef.current.toggle(node.id),
            onCycleMeter: () => handlersRef.current.cycleMeter(node.id),
            onTestTrip: () => handlersRef.current.trip(node.id, "prueba"),
            onSelectTerminal: (terminalId: string) =>
              handlersRef.current.select(node.id, terminalId),
            onDisconnectTerminal: (terminalId: string) =>
              handlersRef.current.disconnect(node.id, terminalId),
            onRemove: () => handlersRef.current.removeNode(node.id),
          },
        })),
      );
      setEdges(snapshot.edges);
      window.setTimeout(() => {
        applyingHistory.current = false;
      }, 0);
    },
    [setEdges, setNodes],
  );

  const pushHistory = useCallback(() => {
    if (applyingHistory.current || pushedThisTick.current) {
      return;
    }
    pushedThisTick.current = true;
    undoStack.current.push(cloneBoard());
    if (undoStack.current.length > 40) {
      undoStack.current.shift();
    }
    redoStack.current = [];
    syncHistoryButtons();
    queueMicrotask(() => {
      pushedThisTick.current = false;
    });
  }, [cloneBoard, syncHistoryButtons]);

  const undoBoard = useCallback(() => {
    const previous = undoStack.current.pop();
    if (!previous) {
      return;
    }
    redoStack.current.push(cloneBoard());
    restoreBoard(previous);
    setInteracted(true);
    syncHistoryButtons();
  }, [cloneBoard, restoreBoard, syncHistoryButtons]);

  const redoBoard = useCallback(() => {
    const next = redoStack.current.pop();
    if (!next) {
      return;
    }
    undoStack.current.push(cloneBoard());
    restoreBoard(next);
    setInteracted(true);
    syncHistoryButtons();
  }, [cloneBoard, restoreBoard, syncHistoryButtons]);

  const allowedConnection = useCallback(
    (
      source: string,
      sourceHandle: string,
      target: string,
      targetHandle: string,
    ) => {
      const from = nodesRef.current.find((node) => node.id === source);
      const to = nodesRef.current.find((node) => node.id === target);
      if (!from || !to) {
        return false;
      }
      if (
        !canConnectTerminals(
          from.data.kind,
          sourceHandle,
          to.data.kind,
          targetHandle,
          { allowEarthFault: sandbox },
        )
      ) {
        return false;
      }
      const plugTaken = (nodeId: string, handle: string) => {
        const node = nodesRef.current.find((item) => item.id === nodeId);
        if (!isPlugFace(node?.data.kind, handle)) {
          return false;
        }
        return edgesRef.current.some(
          (edge) =>
            (edge.source === nodeId && edge.sourceHandle === handle) ||
            (edge.target === nodeId && edge.targetHandle === handle),
        );
      };
      if (plugTaken(source, sourceHandle) || plugTaken(target, targetHandle)) {
        return false;
      }
      return true;
    },
    [sandbox],
  );

  const handlersRef = useRef({
    toggle: (id: string) => {
      void id;
    },
    select: (nodeId: string, terminalId: string) => {
      void nodeId;
      void terminalId;
    },
    disconnect: (nodeId: string, terminalId: string) => {
      void nodeId;
      void terminalId;
    },
    remove: (id: string) => {
      void id;
    },
    removeNode: (id: string) => {
      void id;
    },
    trip: (id: string, reason: "sobrecarga" | "fuga" | "prueba") => {
      void id;
      void reason;
    },
    cycleMeter: (id: string) => {
      void id;
    },
  });

  const connect = useCallback(
    (source: string, sourceHandle: string, target: string, targetHandle: string) => {
      if (source === target && sourceHandle === targetHandle) {
        return;
      }
      if (!allowedConnection(source, sourceHandle, target, targetHandle)) {
        return;
      }
      setInteracted(true);
      setEdges((current) =>
        addEdge(
          {
            id: `wire-${crypto.randomUUID()}`,
            source,
            sourceHandle,
            target,
            targetHandle,
            type: "cable",
          },
          current,
        ),
      );
    },
    [allowedConnection, setEdges],
  );

  useEffect(() => {
    handlersRef.current.toggle = (id: string) => {
      setInteracted(true);
      setProtectionNote(null);
      setNodes((current) =>
        current.map((node) => {
          if (node.id !== id) {
            return node;
          }
          const turningOn = !node.data.switchClosed;
          if (
            turningOn &&
            node.data.kind === "appliance" &&
            !supplyRef.current.includes(id)
          ) {
            return node;
          }
          return {
            ...node,
            data: {
              ...node.data,
              switchClosed: !node.data.switchClosed,
              tripped: turningOn ? false : node.data.tripped,
              trippedReason: turningOn ? undefined : node.data.trippedReason,
            },
          };
        }),
      );
    };
    handlersRef.current.cycleMeter = (id: string) => {
      const order = ["tension", "corriente", "continuidad"] as const;
      setInteracted(true);
      setNodes((current) =>
        current.map((node) => {
          if (node.id !== id || node.data.kind !== "multimeter") {
            return node;
          }
          const mode = node.data.meterMode ?? "tension";
          const next = order[(order.indexOf(mode) + 1) % order.length] ?? "tension";
          return {
            ...node,
            data: {
              ...node.data,
              meterMode: next,
            },
          };
        }),
      );
    };
    handlersRef.current.select = (nodeId: string, terminalId: string) => {
      setInteracted(true);
      setPending((current) => {
        if (!current) {
          return { nodeId, terminalId };
        }
        if (current.nodeId === nodeId && current.terminalId === terminalId) {
          return null;
        }
        if (
          !allowedConnection(
            current.nodeId,
            current.terminalId,
            nodeId,
            terminalId,
          )
        ) {
          return current;
        }
        connect(current.nodeId, current.terminalId, nodeId, terminalId);
        return null;
      });
    };
    handlersRef.current.disconnect = (nodeId: string, terminalId: string) => {
      pushHistory();
      setInteracted(true);
      setEdges((current) =>
        current.filter(
          (edge) =>
            !(
              (edge.source === nodeId && edge.sourceHandle === terminalId) ||
              (edge.target === nodeId && edge.targetHandle === terminalId)
            ),
        ),
      );
    };
    handlersRef.current.remove = (id: string) => {
      pushHistory();
      setInteracted(true);
      setEdges((current) => current.filter((edge) => edge.id !== id));
    };
    handlersRef.current.trip = (id, reason) => {
      setInteracted(true);
      if (reason === "prueba") {
        setProtectionNote(
          "El diferencial disparó por el botón Probar. Reármalo para volver a alimentar el circuito.",
        );
      }
      setNodes((current) =>
        current.map((node) =>
          node.id === id
            ? {
                ...node,
                data: {
                  ...node.data,
                  switchClosed: false,
                  tripped: true,
                  trippedReason: reason,
                },
              }
            : node,
        ),
      );
    };
    handlersRef.current.removeNode = (id: string) => {
      pushHistory();
      setInteracted(true);
      setShowedSolution(false);
      setPending((current) => (current?.nodeId === id ? null : current));
      setFromSelect((value) => (value.startsWith(`${id}::`) ? "" : value));
      setToSelect((value) => (value.startsWith(`${id}::`) ? "" : value));
      setEdges((current) =>
        current.filter((edge) => edge.source !== id && edge.target !== id),
      );
      setNodes((current) => current.filter((node) => node.id !== id));
    };
  }, [allowedConnection, connect, pushHistory, setEdges, setNodes]);

  const makeNode = useCallback(
    (
      kind: PlaceableKind,
      position: { x: number; y: number },
      switchClosed = false,
      extra?: { applianceId?: string; switchClosed?: boolean },
    ): Node<CircuitNodeData> => {
      const spec = extra?.applianceId
        ? applianceById(extra.applianceId)
        : undefined;
      const counterKey = spec ? `${kind}-${spec.id}` : kind;
      counters.current[counterKey] = (counters.current[counterKey] ?? 0) + 1;
      const id = `${counterKey}-${counters.current[counterKey]}`;
      const copies =
        definition.componentesDisponibles.find((part) => part.kind === kind)
          ?.count ?? 1;
      const title = spec?.label ?? componentTitle(kind);
      return {
        id,
        type: kind,
        position,
        data: {
          kind,
          label:
            sandbox || copies > 1
              ? `${title} ${counters.current[counterKey]}`
              : title,
          terminals: terminalsFor(kind),
          switchClosed:
            kind === "appliance"
              ? Boolean(extra?.switchClosed)
              : isSwitchLike(kind)
                ? kind === "switch"
                  ? switchClosed
                  : true
                : undefined,
          applianceId: spec?.id,
          watts: spec?.watts,
          src: spec?.src,
          tripAmps: kind === "mcb" ? MCB_TRIP_AMPS : undefined,
          meterMode: kind === "multimeter" ? "tension" : undefined,
          onToggleSwitch: () => handlersRef.current.toggle(id),
          onCycleMeter: () => handlersRef.current.cycleMeter(id),
          onTestTrip: () => handlersRef.current.trip(id, "prueba"),
          onSelectTerminal: (terminalId) =>
            handlersRef.current.select(id, terminalId),
          onDisconnectTerminal: (terminalId) =>
            handlersRef.current.disconnect(id, terminalId),
          onRemove: () => handlersRef.current.removeNode(id),
        },
      };
    },
    [definition.componentesDisponibles, sandbox],
  );

  const addPart = useCallback(
    (
      kind: PlaceableKind,
      position?: { x: number; y: number },
      extra?: { applianceId?: string; switchClosed?: boolean },
    ) => {
      if (!sandbox) {
        const allowed =
          definition.componentesDisponibles.find((part) => part.kind === kind)
            ?.count ?? 0;
        const used = nodes.filter((node) => node.data.kind === kind).length;
        if (used >= allowed) {
          return;
        }
      }
      const node = makeNode(
        kind,
        position ?? nextFreeSlot(nodes, kind),
        false,
        extra,
      );
      setInteracted(true);
      setShowedSolution(false);
      if (!position) {
        shouldFrame.current = true;
      }
      setNodes((current) => [...current, node]);
    },
    [definition.componentesDisponibles, makeNode, nodes, sandbox, setNodes],
  );

  const isOverBoard = useCallback((clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) {
      return false;
    }
    return (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    );
  }, []);

  const placeFromLibrary = useCallback(
    (
      kind: PlaceableKind,
      clientX: number,
      clientY: number,
      extra?: { applianceId?: string; switchClosed?: boolean },
    ) => {
      if (!isOverBoard(clientX, clientY)) {
        return;
      }
      const flow = flowApi.current;
      if (!flow) {
        addPart(kind, undefined, extra);
        return;
      }
      const size = NODE_SPAN[kind];
      const point = flow.screenToFlowPosition({ x: clientX, y: clientY });
      addPart(
        kind,
        {
          x: point.x - size.w / 2,
          y: point.y - size.h / 2,
        },
        extra,
      );
    },
    [addPart, isOverBoard],
  );

  const applyLayout = useCallback(
    (layout: CircuitBoardLayout, asSolution: boolean) => {
      clearHistory();
      setProtectionNote(null);
      counters.current = {};
      const nextNodes = layout.piezas.map((pieza) =>
        makeNode(
          pieza.kind,
          pieza.position,
          layout.interruptorCerrado && pieza.kind === "switch",
          pieza.applianceId || pieza.encendido
            ? {
                applianceId: pieza.applianceId,
                switchClosed: pieza.encendido,
              }
            : undefined,
        ),
      );
      const ofKind = (kind: PlaceableKind, index = 0) =>
        nextNodes.filter((node) => node.data.kind === kind)[index];
      const nextEdges: Edge[] = [];
      for (const cable of layout.cables) {
        const from = ofKind(cable.from.kind, cable.from.index ?? 0);
        const to = ofKind(cable.to.kind, cable.to.index ?? 0);
        if (!from || !to) {
          continue;
        }
        nextEdges.push({
          id: `wire-${crypto.randomUUID()}`,
          source: from.id,
          sourceHandle: cable.from.terminalId,
          target: to.id,
          targetHandle: cable.to.terminalId,
          type: "cable",
        });
      }
      shouldFrame.current = true;
      setNodes(nextNodes);
      setEdges(nextEdges);
      setPending(null);
      setFromSelect("");
      setToSelect("");
      setInteracted(asSolution);
      setShowedSolution(asSolution);
      if (!asSolution) {
        notifiedRef.current = false;
      }
    },
    [clearHistory, makeNode, setEdges, setNodes],
  );

  const showSolution = useCallback(() => {
    const solucion = definition.solucion;
    if (!solucion) {
      return;
    }
    applyLayout(solucion, true);
  }, [applyLayout, definition.solucion]);

  const inicialApplied = useRef(false);
  const boardReady = useRef(false);
  useEffect(() => {
    if (inicialApplied.current) {
      return;
    }
    inicialApplied.current = true;
    if (sandbox) {
      const saved = loadLabBoard();
      if (saved && saved.nodes.length > 0) {
        counters.current = saved.counters ?? {};
        setLoadedCircuitId(saved.circuitId);
        setNodes(
          saved.nodes.map((item) => ({
            id: item.id,
            type: item.type,
            position: item.position,
            data: {
              kind: item.kind,
              label: item.label,
              terminals: terminalsFor(item.kind as PlaceableKind),
              switchClosed: item.switchClosed,
              tripped: item.tripped,
              trippedReason: item.trippedReason,
              applianceId: item.applianceId,
              watts: item.watts,
              src: item.src,
              tripAmps: item.tripAmps,
              meterMode: item.meterMode,
              onToggleSwitch: () => handlersRef.current.toggle(item.id),
              onCycleMeter: () => handlersRef.current.cycleMeter(item.id),
              onTestTrip: () => handlersRef.current.trip(item.id, "prueba"),
              onSelectTerminal: (terminalId: string) =>
                handlersRef.current.select(item.id, terminalId),
              onDisconnectTerminal: (terminalId: string) =>
                handlersRef.current.disconnect(item.id, terminalId),
              onRemove: () => handlersRef.current.removeNode(item.id),
            },
          })),
        );
        setEdges(
          saved.edges.map((edge) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
            type: "cable" as const,
            data: {
              pull: edge.pull,
              bends: edge.bends,
            },
          })),
        );
        shouldFrame.current = true;
        boardReady.current = true;
        return;
      }
    }
    if (definition.tableroInicial) {
      applyLayout(definition.tableroInicial, false);
    } else {
      setCameraReady(true);
    }
    boardReady.current = true;
  }, [applyLayout, definition.tableroInicial, sandbox, setEdges, setNodes]);

  useEffect(() => {
    if (!sandbox) {
      return;
    }
    const timer = window.setTimeout(() => {
      if (!boardReady.current) {
        return;
      }
      saveLabBoard(
        snapshotLabBoard(
          nodesRef.current,
          edgesRef.current,
          loadedCircuitId,
          counters.current,
        ),
      );
    }, 400);
    return () => window.clearTimeout(timer);
  }, [edges, loadedCircuitId, nodes, sandbox]);

  const frameBoard = useCallback((duration = 0) => {
    const flow = flowApi.current;
    if (!flow) {
      return Promise.resolve(false);
    }
    if (nodesRef.current.length === 0) {
      return flow.setViewport({ x: 20, y: 16, zoom: 0.7 });
    }
    return flow.fitView({
      padding: 0.2,
      minZoom: 0.22,
      maxZoom: 1.15,
      duration,
    });
  }, []);

  const scheduleFrame = useCallback(() => {
    shouldFrame.current = true;
    window.setTimeout(() => frameBoard(0), 60);
  }, [frameBoard]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) {
        return;
      }
      connect(
        connection.source,
        connection.sourceHandle ?? "",
        connection.target,
        connection.targetHandle ?? "",
      );
    },
    [connect],
  );

  const evaluation = useMemo(
    () => graphFromFlow(nodes, edges, definition.reglas),
    [nodes, edges, definition.reglas],
  );
  const result = useMemo(() => evaluateCircuit(evaluation), [evaluation]);
  supplyRef.current = result.conTension ?? [];

  useEffect(() => {
    if (!sandbox) {
      return;
    }
    const trips = result.disparos ?? [];
    if (trips.length === 0) {
      return;
    }
    const liveTrips = trips.filter((trip) =>
      nodesRef.current.some(
        (node) => node.id === trip.id && node.data.switchClosed !== false,
      ),
    );
    if (liveTrips.length === 0) {
      return;
    }
    setProtectionNote(liveTrips[0]?.texto ?? null);
    setNodes((current) => {
      let changed = false;
      const next = current.map((node) => {
        const trip = trips.find((item) => item.id === node.id);
        if (!trip || node.data.switchClosed === false) {
          return node;
        }
        changed = true;
        return {
          ...node,
          data: {
            ...node.data,
            switchClosed: false,
            tripped: true,
            trippedReason: trip.tipo,
          },
        };
      });
      return changed ? next : current;
    });
  }, [result.disparos, sandbox, setNodes]);

  const conductorRoles = useMemo(
    () =>
      resolveConductorRoles(
        nodes.map((node) => ({
          id: node.id,
          kind: node.data.kind,
          terminals: connectableTerminals(node),
          switchClosed: node.data.switchClosed,
          meterMode: node.data.meterMode,
        })),
        edges,
      ),
    [edges, nodes],
  );

  const displayNodes = useMemo(
    () =>
      nodes.map((node) => {
        const live =
          showLiveBorders &&
          (result.vivos ?? result.energizados).includes(node.id);
        return {
          ...node,
          className: live ? "node-is-live" : undefined,
          data: {
            ...node.data,
            live,
            energized: result.energizados.includes(node.id),
            hasSupply: (result.conTension ?? []).includes(node.id),
            currentAmps: result.corrientes?.[node.id] ?? 0,
            voltageVolts:
              node.data.kind === "voltmeter" ||
              (node.data.kind === "multimeter" &&
                (node.data.meterMode ?? "tension") === "tension")
                ? (result.tensiones?.[node.id] ?? null)
                : undefined,
            detectorOn:
              node.data.kind === "voltageDetector"
                ? Boolean(result.detectores?.[node.id])
                : undefined,
            continuity:
              node.data.kind === "multimeter" &&
              node.data.meterMode === "continuidad"
                ? (result.continuidades?.[node.id] ?? null)
                : undefined,
            selectedTerminalId:
              pending?.nodeId === node.id ? pending.terminalId : null,
            terminalRoles: Object.fromEntries(
              connectableTerminals(node).map((terminal) => [
                terminal.id,
                conductorRoles.get(terminalKey(node.id, terminal.id)) ?? "libre",
              ]),
            ),
          },
        };
      }),
    [
      conductorRoles,
      nodes,
      pending,
      result.conTension,
      result.corrientes,
      result.detectores,
      result.continuidades,
      result.energizados,
      result.tensiones,
      result.vivos,
      showLiveBorders,
    ],
  );

  const displayEdges = useMemo(() => {
    const roles = edges.map((edge) => {
      return {
        id: edge.id,
        role: cableRoleFromMap(
          conductorRoles,
          edge.source,
          edge.sourceHandle,
          edge.target,
          edge.targetHandle,
        ),
      };
    });
    const lanes = assignLaneOffsets(roles);
    const spreads = assignTerminalSpreads(edges);
    return edges.map((edge, index) => {
      const role = roles[index]?.role ?? "fase";
      const spread = spreads.get(edge.id);
      return {
        ...edge,
        type: "cable" as const,
        data: {
          role,
          powered: result.estado === "correcto" && role === "fase",
          pull: (edge.data as { pull?: { x: number; y: number } } | undefined)
            ?.pull,
          bends: (
            edge.data as { bends?: Array<{ x: number; y: number }> } | undefined
          )?.bends,
          manual: manualCables,
          laneOffset: lanes.get(edge.id) ?? 0,
          sourceSpread: spread?.source ?? 0,
          targetSpread: spread?.target ?? 0,
          onRemove: () => handlersRef.current.remove(edge.id),
        },
        animated: false,
        zIndex: manualCables ? 1000 : undefined,
      };
    });
  }, [conductorRoles, edges, manualCables, result.estado]);

  const terminalOptions = nodes.flatMap((node) =>
    connectableTerminals(node).map((terminal) => ({
      value: `${node.id}::${terminal.id}`,
      label: `${node.data.label} · ${terminalLabel(node.data.kind, terminal.id)}`,
    })),
  );

  function reset() {
    clearHistory();
    notifiedRef.current = false;
    counters.current = {};
    setPending(null);
    setFromSelect("");
    setToSelect("");
    setInteracted(false);
    setShowedSolution(false);
    setLoadedCircuitId(null);
    setProtectionNote(null);
    if (sandbox) {
      clearLabBoard();
    }
    if (definition.tableroInicial) {
      applyLayout(definition.tableroInicial, false);
    } else {
      setNodes([]);
      setEdges([]);
    }
    scheduleFrame();
  }

  useEffect(() => {
    if (
      result.estado === "correcto" &&
      result.mensajes[0]?.tipo === "exito" &&
      interacted &&
      !notifiedRef.current
    ) {
      notifiedRef.current = true;
      onSolved?.();
    }
  }, [interacted, onSolved, result.estado, result.mensajes]);

  useEffect(() => {
    if (cameraReady || revealRequested.current) {
      return;
    }
    if (nodes.length === 0) {
      if (boardReady.current && !shouldFrame.current) {
        setCameraReady(true);
      }
      return;
    }
    if (!flowApi.current) {
      return;
    }

    revealRequested.current = true;
    const timeout = window.setTimeout(() => {
      shouldFrame.current = false;
      setCameraReady(true);
    }, 700);
    void frameBoard(0).finally(() => {
      window.clearTimeout(timeout);
      shouldFrame.current = false;
      setCameraReady(true);
    });
  }, [cameraReady, flowReady, frameBoard, nodes.length]);

  useEffect(() => {
    const sync = () => {
      const active =
        document.fullscreenElement ??
        (document as Document & { webkitFullscreenElement?: Element })
          .webkitFullscreenElement;
      setNativeFull(active === boardRef.current);
    };
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, []);

  useEffect(() => {
    if (!cssFull) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCssFull(false);
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [cssFull]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) {
        return;
      }
      const key = event.key.toLowerCase();
      if (key !== "z" && key !== "y") {
        return;
      }
      const target = event.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          tag === "SELECT" ||
          target.isContentEditable
        ) {
          return;
        }
      }
      event.preventDefault();
      if (key === "y" || (key === "z" && event.shiftKey)) {
        redoBoard();
        return;
      }
      undoBoard();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [redoBoard, undoBoard]);

  useEffect(() => {
    if (!cameraReady) {
      return;
    }
    const canvas = canvasRef.current;
    let frame = 0;
    const observer =
      canvas && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            window.cancelAnimationFrame(frame);
            frame = window.requestAnimationFrame(() => {
              void frameBoard(0);
            });
          })
        : null;
    if (canvas) {
      observer?.observe(canvas);
    }
    const stop = window.setTimeout(() => observer?.disconnect(), 700);
    return () => {
      observer?.disconnect();
      window.cancelAnimationFrame(frame);
      window.clearTimeout(stop);
    };
  }, [boardFull, cameraReady, frameBoard]);

  async function toggleBoardFull() {
    const board = boardRef.current;
    if (!board) {
      return;
    }
    if (boardFull) {
      const doc = document as Document & { webkitExitFullscreen?: () => Promise<void> };
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen();
      }
      setCssFull(false);
      return;
    }
    const el = board as HTMLDivElement & {
      webkitRequestFullscreen?: () => Promise<void>;
    };
    try {
      if (el.requestFullscreen) {
        await el.requestFullscreen();
        return;
      }
      if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
        return;
      }
    } catch {
      /* iOS / PWA: overlay fallback */
    }
    setCssFull(true);
  }

  function comprobar() {
    setInteracted(true);
  }

  const board = useBoardTheme();

  return (
    <div className="space-y-4">
      {!sandbox &&
      definition.componentesDisponibles.some((part) => {
        const used = nodes.filter((n) => n.data.kind === part.kind).length;
        return used < part.count;
      }) ? (
        <div className="flex flex-wrap gap-2 pb-2">
          {definition.componentesDisponibles.map((part) => {
            const used = nodes.filter((n) => n.data.kind === part.kind).length;
            const left = part.count - used;
            return (
              <Button
                key={part.kind}
                variant="secondary"
                disabled={left <= 0}
                onClick={() => addPart(part.kind)}
              >
                Agregar {part.label}
                <span className="text-xs font-normal text-muted">({left})</span>
              </Button>
            );
          })}
        </div>
      ) : null}

      <div className="contents">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <CableLegend />
          {manualCables ? (
            <p className="text-xs text-muted">
              Modo ordenar cables: arrastra el cable o sus puntos. El trazo
              plano sube y baja; el de pie se corre a los lados. Doble toque
              en el punto para restablecer el cable.
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="btn-3d-soft pressable inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-3 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-line accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              checked={showMinimap}
              onChange={(event) => setShowMinimap(event.target.checked)}
            />
            Mostrar minimapa
          </label>
          <label className="btn-3d-soft pressable inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-3 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-line accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              checked={manualCables}
              onChange={(event) => setManualCables(event.target.checked)}
            />
            Ordenar cables
          </label>
          {manualCables ? (
            <Button
              variant="secondary"
              onClick={() => {
                setEdges((current) =>
                  current.map((edge) => ({
                    ...edge,
                    data: {
                      ...edge.data,
                      bends: undefined,
                      pull: undefined,
                    },
                  })),
                );
              }}
            >
              Restablecer cables
            </Button>
          ) : null}
          {sandbox ? (
            <>
              <Button
                variant="secondary"
                disabled={!canUndo}
                aria-label="Deshacer el último borrado"
                onClick={undoBoard}
              >
                Deshacer
              </Button>
              <Button
                variant="secondary"
                disabled={!canRedo}
                aria-label="Rehacer"
                onClick={redoBoard}
              >
                Rehacer
              </Button>
              <Button variant="secondary" onClick={reset}>
                Reiniciar
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <div
        className={
          sandbox
            ? "flex flex-col gap-4 lg:h-[min(68vh,560px)] lg:min-h-[380px] lg:flex-row lg:items-stretch"
            : "contents"
        }
      >
      {sandbox ? (
        <ArtifactLibrary
          onAdd={(kind, extra) => addPart(kind, undefined, extra)}
          onPlace={placeFromLibrary}
          isOverBoard={isOverBoard}
          selectedCircuitId={loadedCircuitId}
          onLoadCircuit={(id, layout) => {
            setLoadedCircuitId(id);
            applyLayout(layout, false);
          }}
        />
      ) : null}
      <div
        ref={boardRef}
        className={`circuit-board neu-inset rounded-3xl p-1.5 ${
          sandbox
            ? "flex h-[min(68vh,560px)] min-h-[380px] min-w-0 flex-1 flex-col lg:h-full lg:min-h-0"
            : ""
        } ${cssFull ? "is-full" : ""}`}
      >
        <div
          ref={canvasRef}
          className={`circuit-canvas relative w-full overflow-hidden rounded-[22px] ${
            boardFull || sandbox
              ? "h-full min-h-0 flex-1"
              : "h-[min(68vh,560px)] min-h-[380px]"
          }`}
          style={cameraReady ? undefined : { visibility: "hidden" }}
        >
          <ReactFlow
            colorMode="light"
            nodes={displayNodes}
            edges={displayEdges}
            onNodesChange={(changes) => {
              if (changes.some((change) => change.type === "remove")) {
                pushHistory();
              }
              onNodesChange(changes);
            }}
            onEdgesChange={(changes) => {
              if (changes.some((change) => change.type === "remove")) {
                pushHistory();
              }
              setInteracted(true);
              onEdgesChange(changes);
            }}
            onConnect={onConnect}
            nodeTypes={circuitNodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={{ type: "cable", interactionWidth: 28 }}
            elevateEdgesOnSelect
            connectionLineComponent={CableDraft}
            connectionMode={ConnectionMode.Loose}
            defaultViewport={{ x: 20, y: 16, zoom: 0.7 }}
            minZoom={0.22}
            maxZoom={1.4}
            panOnDrag
            zoomOnPinch
            zoomOnDoubleClick={false}
            onMoveStart={() => {
              canvasRef.current?.classList.add("is-board-hand");
            }}
            onMoveEnd={() => {
              canvasRef.current?.classList.remove("is-board-hand");
            }}
            onNodeDragStart={() => {
              canvasRef.current?.classList.add("is-board-hand");
            }}
            onNodeDragStop={() => {
              canvasRef.current?.classList.remove("is-board-hand");
            }}
            onNodeDoubleClick={(event, node) => {
              const target = event.target as HTMLElement | null;
              if (
                target?.closest("button") ||
                target?.closest(".react-flow__handle")
              ) {
                return;
              }
              handlersRef.current.removeNode(node.id);
            }}
            onNodesDelete={(deleted) => {
              const ids = new Set(deleted.map((node) => node.id));
              setInteracted(true);
              setPending((current) =>
                current && ids.has(current.nodeId) ? null : current,
              );
              setFromSelect((value) => {
                const nodeId = value.split("::")[0] ?? "";
                return ids.has(nodeId) ? "" : value;
              });
              setToSelect((value) => {
                const nodeId = value.split("::")[0] ?? "";
                return ids.has(nodeId) ? "" : value;
              });
              setEdges((current) =>
                current.filter(
                  (edge) => !ids.has(edge.source) && !ids.has(edge.target),
                ),
              );
            }}
            onInit={(instance) => {
              flowApi.current = instance;
              setFlowReady(true);
            }}
            deleteKeyCode={["Backspace", "Delete"]}
            nodesFocusable
            edgesFocusable
            aria-label="Tablero del circuito"
            isValidConnection={(connection) => {
              if (
                connection.source === connection.target &&
                connection.sourceHandle === connection.targetHandle
              ) {
                return false;
              }
              return allowedConnection(
                connection.source ?? "",
                connection.sourceHandle ?? "",
                connection.target ?? "",
                connection.targetHandle ?? "",
              );
            }}
          >
            <Background gap={20} color={board.grid} bgColor={board.fill} />
            <Panel position="top-right" className="circuit-full-panel m-3">
              <button
                type="button"
                className="btn-3d-soft pressable inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-3 text-sm font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                aria-pressed={boardFull}
                aria-label={
                  boardFull ? "Salir de pantalla completa" : "Pantalla completa"
                }
                onClick={() => {
                  void toggleBoardFull();
                }}
              >
                {boardFull ? (
                  <IconCompress className="h-5 w-5" />
                ) : (
                  <IconExpand className="h-5 w-5" />
                )}
                {boardFull ? "Salir" : "Pantalla completa"}
              </button>
            </Panel>
            <Controls showInteractive={false} />
            {showMinimap ? (
              <MiniMap
                pannable
                zoomable
                maskColor={board.mask}
              />
            ) : null}
          </ReactFlow>
          {nodes.length === 0 ? (
            <p className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6 text-center text-sm text-(--board-ink)">
              {sandbox
                ? "El tablero está vacío. Arrastra un artefacto al tablero."
                : "Cargando el tablero…"}
            </p>
          ) : null}
        </div>
      </div>
      </div>

      {sandbox ? (
        <LabStatus
          result={result}
          empty={nodes.length === 0}
          hold={protectionNote}
        />
      ) : null}

      {connectWithoutDrag ? (
        <fieldset className="neu rounded-[24px] p-4">
          <legend className="px-1 text-sm font-semibold">
            Conectar sin arrastrar
          </legend>
          <p className="mb-3 text-xs text-muted">
            Elige origen y destino, o pulsa un borne (queda marcado) y luego el
            otro para unirlos. Doble clic en un cable o en su borne para
            desconectarlo. Ctrl+Z restaura lo último que borraste.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex-1 text-sm">
              Origen
              <select
                className="neu-inset mt-1 w-full rounded-2xl px-3 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                value={fromSelect}
                onChange={(e) => setFromSelect(e.target.value)}
              >
                <option value="">Elige un terminal</option>
                {terminalOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex-1 text-sm">
              Destino
              <select
                className="neu-inset mt-1 w-full rounded-2xl px-3 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                value={toSelect}
                onChange={(e) => setToSelect(e.target.value)}
              >
                <option value="">Elige un terminal</option>
                {terminalOptions.map((option) => (
                  <option key={`to-${option.value}`} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <Button
              variant="secondary"
              disabled={!fromSelect || !toSelect}
              onClick={() => {
                const [sNode, sTerm] = fromSelect.split("::");
                const [tNode, tTerm] = toSelect.split("::");
                if (sNode && sTerm && tNode && tTerm) {
                  connect(sNode, sTerm, tNode, tTerm);
                }
              }}
            >
              Unir
            </Button>
          </div>
        </fieldset>
      ) : null}

      {sandbox ? null : (
        <>
          <div className="flex flex-wrap gap-2 pb-2">
            <Button onClick={comprobar}>Comprobar</Button>
            {definition.solucion ? (
              <Button
                variant="secondary"
                aria-label="Mostrar la solución del circuito"
                onClick={showSolution}
              >
                Solución
              </Button>
            ) : null}
            <Button
              variant="secondary"
              disabled={!canUndo}
              aria-label="Deshacer el último borrado"
              onClick={undoBoard}
            >
              Deshacer
            </Button>
            <Button
              variant="secondary"
              disabled={!canRedo}
              aria-label="Rehacer"
              onClick={redoBoard}
            >
              Rehacer
            </Button>
            <Button variant="secondary" onClick={reset}>
              Reiniciar
            </Button>
          </div>
          <FeedbackPanel
            evaluation={result}
            interacted={interacted}
            startHint={definition.pistaInicial}
            solutionText={
              showedSolution ? definition.solucion?.explicacion : null
            }
          />
        </>
      )}
      </div>
    </div>
  );
}
