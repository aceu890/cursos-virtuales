"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import {
  EXAMPLE_MARKS,
  HOUSE_BOUNDS,
  PLAN_CABLES,
  PLAN_STORAGE_KEY,
  PLAN_SYMBOLS,
  PLAN_VIEW,
  cableColor,
  cablePoints,
  nearestMark,
  type CableKind,
  type PlanAnchor,
  type PlanCable,
  type PlanMark,
  type PlanPoint,
  type SymbolKind,
} from "@/lib/planos/casa";
import {
  PLAN_LAYERS,
  clonePlanData,
  emptyLayers,
  readLibrary,
  writeLibrary,
  type PlanLayer,
  type SavedPlan,
} from "@/lib/planos/library";
import { PlanGlyph } from "./PlanGlyph";

const BOUNDS = HOUSE_BOUNDS;

function isMark(mark: PlanMark) {
  return (
    Boolean(mark) &&
    typeof mark.id === "string" &&
    typeof mark.x === "number" &&
    typeof mark.y === "number" &&
    PLAN_SYMBOLS.some((item) => item.kind === mark.kind)
  );
}

function isAnchor(value: unknown): value is PlanAnchor {
  if (!value || typeof value !== "object") {
    return false;
  }
  const anchor = value as PlanAnchor;
  if (anchor.type === "symbol") {
    return typeof anchor.id === "string";
  }
  return anchor.type === "point" && typeof anchor.x === "number" && typeof anchor.y === "number";
}

function normalizeCable(value: unknown): PlanCable | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const raw = value as Partial<PlanCable> & {
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
  };
  const kind = PLAN_CABLES.find((item) => item.kind === raw.kind)?.kind;
  if (typeof raw.id !== "string" || !kind) {
    return null;
  }
  if (Array.isArray(raw.anchors)) {
    const anchors = raw.anchors.filter(isAnchor);
    return anchors.length >= 2 ? { id: raw.id, kind, anchors } : null;
  }
  if ([raw.x1, raw.y1, raw.x2, raw.y2].every((item) => typeof item === "number")) {
    return {
      id: raw.id,
      kind,
      anchors: [
        { type: "point", x: raw.x1 as number, y: raw.y1 as number },
        { type: "point", x: raw.x2 as number, y: raw.y2 as number },
      ],
    };
  }
  return null;
}

function readStored(): {
  marks: PlanMark[];
  cables: PlanCable[];
  planId: string | null;
  planName: string;
} | null {
  try {
    const raw = localStorage.getItem(PLAN_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as
      | PlanMark[]
      | { marks?: PlanMark[]; cables?: PlanCable[]; planId?: string | null; planName?: string };
    if (Array.isArray(parsed)) {
      return { marks: parsed.filter(isMark), cables: [], planId: null, planName: "Mi plano" };
    }
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    return {
      marks: (parsed.marks ?? []).filter(isMark),
      cables: (parsed.cables ?? [])
        .map((cable) => normalizeCable(cable))
        .filter((cable): cable is PlanCable => cable !== null),
      planId: typeof parsed.planId === "string" ? parsed.planId : null,
      planName: typeof parsed.planName === "string" && parsed.planName.trim() ? parsed.planName : "Mi plano",
    };
  } catch {
    return null;
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

interface CableDraft {
  kind: CableKind;
  anchors: PlanAnchor[];
}

function pathLength(points: PlanPoint[]) {
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    total += Math.hypot(
      points[index].x - points[index - 1].x,
      points[index].y - points[index - 1].y,
    );
  }
  return total;
}

function pathMiddle(points: PlanPoint[]): PlanPoint {
  let total = 0;
  const lengths: number[] = [];
  for (let index = 1; index < points.length; index += 1) {
    const length = Math.hypot(
      points[index].x - points[index - 1].x,
      points[index].y - points[index - 1].y,
    );
    lengths.push(length);
    total += length;
  }
  let walk = total / 2;
  for (let index = 0; index < lengths.length; index += 1) {
    if (walk <= lengths[index]) {
      const ratio = lengths[index] === 0 ? 0 : walk / lengths[index];
      return {
        x: points[index].x + (points[index + 1].x - points[index].x) * ratio,
        y: points[index].y + (points[index + 1].y - points[index].y) * ratio,
      };
    }
    walk -= lengths[index];
  }
  return points[points.length - 1];
}

function distanceToSegment(point: PlanPoint, start: PlanPoint, end: PlanPoint) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = dx * dx + dy * dy;
  if (length === 0) {
    return Math.hypot(point.x - start.x, point.y - start.y);
  }
  const t = Math.min(1, Math.max(0, ((point.x - start.x) * dx + (point.y - start.y) * dy) / length));
  return Math.hypot(point.x - (start.x + t * dx), point.y - (start.y + t * dy));
}

export function PlanosView() {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{ id: string } | null>(null);
  const cableDragRef = useRef<{
    id: string;
    origin: PlanPoint;
    anchors: PlanAnchor[];
    mode: "translate" | "vertex" | "pull";
    vertexIndex: number;
    follow: boolean;
    moved: boolean;
  } | null>(null);
  const draftRef = useRef<CableDraft | null>(null);
  const marksRef = useRef<PlanMark[]>(EXAMPLE_MARKS);
  const cablesRef = useRef<PlanCable[]>([]);
  const historyRef = useRef<{ marks: PlanMark[]; cables: PlanCable[] }[]>([]);
  const gestureRef = useRef<{ adding: boolean; moved: boolean; origin: PlanPoint } | null>(null);
  const lastUpRef = useRef<{ t: number; x: number; y: number } | null>(null);
  const [marks, setMarks] = useState<PlanMark[]>(EXAMPLE_MARKS);
  const [cables, setCables] = useState<PlanCable[]>([]);
  const [draft, setDraft] = useState<CableDraft | null>(null);
  const [cursor, setCursor] = useState<PlanPoint | null>(null);
  const [ready, setReady] = useState(false);
  const [tool, setTool] = useState<
    { type: "symbol"; kind: SymbolKind } | { type: "cable"; kind: CableKind } | null
  >({ type: "symbol", kind: "luz" });
  const [selectedId, setSelectedId] = useState<string | null>("ej-luz-living");
  const [selectedCableId, setSelectedCableId] = useState<string | null>(null);
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [planName, setPlanName] = useState("Mi plano");
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [shown, setShown] = useState(emptyLayers);
  const shownRef = useRef(shown);
  marksRef.current = marks;
  cablesRef.current = cables;
  shownRef.current = shown;

  useEffect(() => {
    const stored = readStored();
    if (stored) {
      setMarks(stored.marks);
      setCables(stored.cables);
      setSelectedId(stored.marks[0]?.id ?? null);
      setActivePlanId(stored.planId);
      setPlanName(stored.planName);
    }
    setPlans(readLibrary());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }
    try {
      localStorage.setItem(
        PLAN_STORAGE_KEY,
        JSON.stringify({ marks, cables, planId: activePlanId, planName }),
      );
    } catch {
      /* private mode */
    }
  }, [marks, cables, activePlanId, planName, ready]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.code === "KeyZ" && !event.shiftKey) {
        event.preventDefault();
        if (draftRef.current) {
          const anchors = draftRef.current.anchors;
          if (anchors.length <= 1) {
            cancelDraft();
            return;
          }
          const next = { ...draftRef.current, anchors: anchors.slice(0, -1) };
          draftRef.current = next;
          setDraft(next);
          return;
        }
        undo();
        return;
      }
      if (event.key === "Escape" && draftRef.current) {
        event.preventDefault();
        cancelDraft();
        return;
      }
      if (event.key !== "Delete" && event.key !== "Backspace") {
        return;
      }
      if (draftRef.current) {
        event.preventDefault();
        const anchors = draftRef.current.anchors;
        if (anchors.length <= 1) {
          cancelDraft();
          return;
        }
        const next = { ...draftRef.current, anchors: anchors.slice(0, -1) };
        draftRef.current = next;
        setDraft(next);
        return;
      }
      if (selectedId) {
        event.preventDefault();
        removeMark(selectedId);
        return;
      }
      if (selectedCableId) {
        event.preventDefault();
        removeCable(selectedCableId);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, selectedCableId]);

  function pointFromEvent(event: { clientX: number; clientY: number }) {
    const svg = svgRef.current;
    if (!svg) {
      return null;
    }
    const matrix = svg.getScreenCTM();
    if (!matrix) {
      return null;
    }
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const local = point.matrixTransform(matrix.inverse());
    return {
      x: clamp(local.x, BOUNDS.minX, BOUNDS.maxX),
      y: clamp(local.y, BOUNDS.minY, BOUNDS.maxY),
    };
  }

  function sameAnchor(a: PlanAnchor | undefined, b: PlanAnchor | undefined) {
    if (!a || !b) {
      return false;
    }
    if (a.type === "symbol" && b.type === "symbol") {
      return a.id === b.id;
    }
    const pointA = anchorCenter(a);
    const pointB = anchorCenter(b);
    if (!pointA || !pointB) {
      return false;
    }
    return Math.hypot(pointA.x - pointB.x, pointA.y - pointB.y) < 8;
  }

  function anchorCenter(anchor: PlanAnchor): PlanPoint | null {
    if (anchor.type === "point") {
      return { x: anchor.x, y: anchor.y };
    }
    const mark = marksRef.current.find((item) => item.id === anchor.id);
    return mark ? { x: mark.x, y: mark.y } : null;
  }

  function anchorAt(
    event: { target: EventTarget | null },
    point: PlanPoint,
  ): PlanAnchor {
    const hitId = (event.target as Element | null)
      ?.closest?.("[data-symbol]")
      ?.getAttribute("data-symbol");
    if (hitId && marksRef.current.some((item) => item.id === hitId)) {
      return { type: "symbol", id: hitId };
    }
    const near = nearestMark(
      point,
      marksRef.current.filter((mark) => shownRef.current[mark.kind]),
    );
    if (near) {
      return { type: "symbol", id: near.id };
    }
    return { type: "point", x: point.x, y: point.y };
  }

  function cancelDraft() {
    gestureRef.current = null;
    draftRef.current = null;
    setDraft(null);
  }

  function remember() {
    historyRef.current.push({
      marks: marksRef.current.map((mark) => ({ ...mark })),
      cables: cablesRef.current.map((cable) => ({
        ...cable,
        anchors: cable.anchors.map((anchor) => ({ ...anchor })),
      })),
    });
    if (historyRef.current.length > 80) {
      historyRef.current.shift();
    }
  }

  function undo() {
    const previous = historyRef.current.pop();
    if (!previous) {
      return;
    }
    cancelDraft();
    dragRef.current = null;
    cableDragRef.current = null;
    setMarks(previous.marks);
    setCables(previous.cables);
    setSelectedId(null);
    setSelectedCableId(null);
  }

  function dropEmptyUndo() {
    const previous = historyRef.current[historyRef.current.length - 1];
    if (!previous) {
      return;
    }
    const same =
      JSON.stringify(previous) ===
      JSON.stringify({ marks: marksRef.current, cables: cablesRef.current });
    if (same) {
      historyRef.current.pop();
    }
  }

  function writeCable(id: string, anchors: PlanAnchor[]) {
    setCables((current) =>
      current.map((cable) => (cable.id === id ? { ...cable, anchors } : cable)),
    );
  }

  function beginCableMove(event: ReactPointerEvent<SVGGElement>, cableId: string) {
    if (draftRef.current) {
      return;
    }
    const cable = cablesRef.current.find((item) => item.id === cableId);
    const point = pointFromEvent(event);
    if (!cable || !point) {
      return;
    }
    event.stopPropagation();
    remember();
    const anchors = cable.anchors.map((anchor) => ({ ...anchor }));
    let mode: "translate" | "vertex" | "pull" = "translate";
    let vertexIndex = -1;
    let best = 16;
    anchors.forEach((anchor, index) => {
      if (anchor.type !== "point") {
        return;
      }
      const distance = Math.hypot(anchor.x - point.x, anchor.y - point.y);
      if (distance <= best) {
        best = distance;
        vertexIndex = index;
        mode = "vertex";
      }
    });
    if (mode === "translate" && !anchors.some((anchor) => anchor.type === "point")) {
      const resolved = cablePoints(anchors, marksRef.current);
      let nearest = Infinity;
      vertexIndex = Math.min(1, anchors.length);
      for (let index = 1; index < resolved.length; index += 1) {
        const distance = distanceToSegment(point, resolved[index - 1], resolved[index]);
        if (distance < nearest) {
          nearest = distance;
          vertexIndex = index;
        }
      }
      mode = "pull";
    }
    cableDragRef.current = {
      id: cableId,
      origin: point,
      anchors,
      mode,
      vertexIndex,
      follow: false,
      moved: false,
    };
    setSelectedCableId(cableId);
    setSelectedId(null);
    svgRef.current?.setPointerCapture(event.pointerId);
  }

  function applyCableDrag(point: PlanPoint) {
    const drag = cableDragRef.current;
    if (!drag) {
      return;
    }
    const dx = point.x - drag.origin.x;
    const dy = point.y - drag.origin.y;
    if (!drag.moved && Math.hypot(dx, dy) < 6) {
      return;
    }
    drag.moved = true;
    if (drag.mode === "pull") {
      const anchors = drag.anchors.map((anchor) => ({ ...anchor }));
      anchors.splice(drag.vertexIndex, 0, {
        type: "point",
        x: clamp(point.x, BOUNDS.minX, BOUNDS.maxX),
        y: clamp(point.y, BOUNDS.minY, BOUNDS.maxY),
      });
      drag.mode = "vertex";
      drag.follow = true;
      drag.anchors = anchors;
      writeCable(drag.id, anchors);
      return;
    }
    if (drag.follow) {
      const anchors = drag.anchors.map((anchor) => ({ ...anchor }));
      anchors[drag.vertexIndex] = {
        type: "point",
        x: clamp(point.x, BOUNDS.minX, BOUNDS.maxX),
        y: clamp(point.y, BOUNDS.minY, BOUNDS.maxY),
      };
      drag.anchors = anchors;
      writeCable(drag.id, anchors);
      return;
    }
    writeCable(
      drag.id,
      drag.anchors.map((anchor, index) => {
        if (anchor.type !== "point") {
          return anchor;
        }
        if (drag.mode === "vertex" && index !== drag.vertexIndex) {
          return anchor;
        }
        return {
          type: "point",
          x: clamp(anchor.x + dx, BOUNDS.minX, BOUNDS.maxX),
          y: clamp(anchor.y + dy, BOUNDS.minY, BOUNDS.maxY),
        };
      }),
    );
  }

  function commitCable(anchors: PlanAnchor[]) {
    const current = draftRef.current;
    draftRef.current = null;
    setDraft(null);
    if (!current) {
      return;
    }
    const points = cablePoints(anchors, marksRef.current);
    if (points.length < 2 || pathLength(points) < 12) {
      return;
    }
    remember();
    const id = `c-${Date.now()}`;
    setCables((list) => [...list, { id, kind: current.kind, anchors }]);
    setSelectedCableId(id);
    setSelectedId(null);
  }

  function beginCable(event: ReactPointerEvent<SVGSVGElement | SVGGElement>) {
    if (tool?.type !== "cable") {
      return false;
    }
    const target = event.target as Element;
    if (target.closest("[data-remove]")) {
      return false;
    }
    if (target.closest("[data-cable]") && !draftRef.current) {
      return false;
    }
    const point = pointFromEvent(event);
    if (!point) {
      return false;
    }
    const last = lastUpRef.current;
    if (
      last &&
      Date.now() - last.t < 400 &&
      Math.hypot(point.x - last.x, point.y - last.y) < 14
    ) {
      event.stopPropagation();
      if (draftRef.current && draftRef.current.anchors.length >= 2) {
        commitCable(draftRef.current.anchors);
      }
      return true;
    }
    event.stopPropagation();
    gestureRef.current = {
      adding: Boolean(draftRef.current),
      moved: false,
      origin: point,
    };
    if (!draftRef.current) {
      const next = { kind: tool.kind, anchors: [anchorAt(event, point)] };
      draftRef.current = next;
      setDraft(next);
    }
    setSelectedId(null);
    setSelectedCableId(null);
    svgRef.current?.setPointerCapture(event.pointerId);
    return true;
  }

  function endCableGesture(event: ReactPointerEvent<SVGSVGElement>) {
    const gesture = gestureRef.current;
    gestureRef.current = null;
    if (!gesture || !draftRef.current) {
      return;
    }
    const point = pointFromEvent(event);
    if (!point) {
      return;
    }
    lastUpRef.current = { t: Date.now(), x: point.x, y: point.y };
    const anchor = anchorAt(event, point);
    const current = draftRef.current;
    if (!gesture.adding) {
      if (
        anchor.type === "symbol" &&
        gesture.moved &&
        !sameAnchor(current.anchors[0], anchor)
      ) {
        commitCable([...current.anchors, anchor]);
        return;
      }
      if (gesture.moved && !sameAnchor(current.anchors[current.anchors.length - 1], anchor)) {
        const next = { ...current, anchors: [...current.anchors, anchor] };
        draftRef.current = next;
        setDraft(next);
      }
      return;
    }
    if (sameAnchor(current.anchors[current.anchors.length - 1], anchor)) {
      return;
    }
    const nextAnchors = [...current.anchors, anchor];
    if (anchor.type === "symbol") {
      commitCable(nextAnchors);
      return;
    }
    const next = { ...current, anchors: nextAnchors };
    draftRef.current = next;
    setDraft(next);
  }

  function place(event: ReactPointerEvent<SVGSVGElement>) {
    if (beginCable(event)) {
      return;
    }
    if (tool?.type === "cable") {
      return;
    }
    const target = event.target as Element;
    if (target.closest("[data-symbol]") || target.closest("[data-remove]")) {
      return;
    }
    const point = pointFromEvent(event);
    if (!point) {
      return;
    }
    if (tool?.type !== "symbol") {
      setSelectedId(null);
      setSelectedCableId(null);
      return;
    }
    const id = `m-${Date.now()}`;
    remember();
    setMarks((current) => [...current, { id, kind: tool.kind, x: point.x, y: point.y }]);
    setSelectedId(id);
    setSelectedCableId(null);
  }

  function detach(anchors: PlanAnchor[], mark: PlanMark): PlanAnchor[] {
    return anchors.map((anchor) =>
      anchor.type === "symbol" && anchor.id === mark.id
        ? { type: "point", x: mark.x, y: mark.y }
        : anchor,
    );
  }

  function removeMark(id: string) {
    dragRef.current = null;
    remember();
    const mark = marksRef.current.find((item) => item.id === id);
    setMarks((current) => current.filter((item) => item.id !== id));
    if (mark) {
      setCables((current) =>
        current.map((cable) => ({ ...cable, anchors: detach(cable.anchors, mark) })),
      );
      if (draftRef.current) {
        const next = { ...draftRef.current, anchors: detach(draftRef.current.anchors, mark) };
        draftRef.current = next;
        setDraft(next);
      }
    }
    setSelectedId((current) => (current === id ? null : current));
  }

  function removeCable(id: string) {
    remember();
    setCables((current) => current.filter((cable) => cable.id !== id));
    setSelectedCableId((current) => (current === id ? null : current));
  }

  function move(event: ReactPointerEvent<SVGSVGElement>) {
    const point = pointFromEvent(event);
    if (point && cableDragRef.current) {
      applyCableDrag(point);
      return;
    }
    if (tool?.type === "cable") {
      if (!point) {
        return;
      }
      setCursor(point);
      const gesture = gestureRef.current;
      if (gesture && Math.hypot(point.x - gesture.origin.x, point.y - gesture.origin.y) > 8) {
        gesture.moved = true;
      }
      return;
    }
    const drag = dragRef.current;
    if (!drag || !point) {
      return;
    }
    setMarks((current) =>
      current.map((mark) =>
        mark.id === drag.id ? { ...mark, x: point.x, y: point.y } : mark,
      ),
    );
  }

  function reveal(layer: PlanLayer) {
    setShown((current) => (current[layer] ? current : { ...current, [layer]: true }));
  }

  function showAll() {
    setShown(emptyLayers());
  }

  function toggleLayer(layer: PlanLayer) {
    setShown((current) => {
      const allOn = PLAN_LAYERS.every((item) => current[item.id]);
      const cableLayer = PLAN_CABLES.some((item) => item.kind === layer);
      if (allOn) {
        const next = emptyLayers();
        for (const item of PLAN_LAYERS) {
          const isCable = PLAN_CABLES.some((cable) => cable.kind === item.id);
          next[item.id] = cableLayer ? isCable : item.id === layer;
        }
        return next;
      }
      const next = { ...current, [layer]: !current[layer] };
      if (PLAN_LAYERS.every((item) => !next[item.id])) {
        return emptyLayers();
      }
      return next;
    });
  }

  function saveCurrentPlan() {
    const name = planName.trim() || "Plano sin nombre";
    const id = activePlanId ?? `plan-${Date.now()}`;
    const data = clonePlanData({ marks: marksRef.current, cables: cablesRef.current });
    const entry: SavedPlan = { id, name, updatedAt: Date.now(), ...data };
    const next = plans.some((item) => item.id === id)
      ? plans.map((item) => (item.id === id ? entry : item))
      : [entry, ...plans];
    setPlans(next);
    writeLibrary(next);
    setActivePlanId(id);
    setPlanName(name);
  }

  function openSavedPlan(plan: SavedPlan) {
    const data = clonePlanData(plan);
    cancelDraft();
    remember();
    setMarks(data.marks);
    setCables(data.cables);
    setActivePlanId(plan.id);
    setPlanName(plan.name);
    setSelectedId(data.marks[0]?.id ?? null);
    setSelectedCableId(null);
    setLibraryOpen(false);
  }

  function deleteSavedPlan(id: string) {
    const next = plans.filter((item) => item.id !== id);
    setPlans(next);
    writeLibrary(next);
    if (activePlanId === id) {
      setActivePlanId(null);
    }
  }

  function startNewPlan() {
    cancelDraft();
    remember();
    setMarks([]);
    setCables([]);
    setSelectedId(null);
    setSelectedCableId(null);
    setActivePlanId(null);
    setPlanName("Plano nuevo");
  }

  const selected = marks.find((mark) => mark.id === selectedId) ?? null;
  const selectedCable = cables.find((cable) => cable.id === selectedCableId) ?? null;
  const visibleMarks = marks.filter((mark) => shown[mark.kind]);
  const visibleCables = cables.filter((cable) => shown[cable.kind]);
  const allShown = PLAN_LAYERS.every((item) => shown[item.id]);
  const magnet =
    tool?.type === "cable" && cursor ? nearestMark(cursor, visibleMarks) : null;
  const previewAnchors = draft ? [...draft.anchors] : null;
  if (previewAnchors && cursor && tool?.type === "cable") {
    const end: PlanAnchor = magnet
      ? { type: "symbol", id: magnet.id }
      : { type: "point", x: cursor.x, y: cursor.y };
    if (!sameAnchor(previewAnchors[previewAnchors.length - 1], end)) {
      previewAnchors.push(end);
    }
  }
  const toolLabel =
    tool?.type === "symbol"
      ? PLAN_SYMBOLS.find((item) => item.kind === tool.kind)?.label
      : tool?.type === "cable"
        ? PLAN_CABLES.find((item) => item.kind === tool.kind)?.label
        : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
      <aside className="neu order-2 flex max-h-[70vh] w-full shrink-0 flex-col gap-4 overflow-auto rounded-[28px] p-4 lg:order-1 lg:max-h-full lg:w-72">
        <div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">Ver</p>
            <button
              type="button"
              aria-pressed={allShown}
              onClick={showAll}
              className={`pressable rounded-full px-3 py-1 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                allShown ? "bg-foreground text-background" : "bg-background text-muted"
              }`}
            >
              Todo
            </button>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Pulsa una capa para ver solo eso. En cables, el primer clic muestra los tres colores.
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {PLAN_LAYERS.map((layer) => {
              const active = shown[layer.id];
              const cable = PLAN_CABLES.find((item) => item.kind === layer.id);
              return (
                <li key={layer.id}>
                  <button
                    type="button"
                    title={layer.title}
                    aria-pressed={active}
                    onClick={() => toggleLayer(layer.id)}
                    className={`pressable inline-flex min-h-8 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                      active ? "bg-foreground text-background" : "bg-background text-muted"
                    }`}
                  >
                    {cable ? (
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: cable.color }}
                        aria-hidden
                      />
                    ) : null}
                    {layer.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Símbolos</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Elige un símbolo y pulsa el plano. Para un cable, elige el color y
            pulsa un símbolo: la línea se pega a los cercanos y se conecta al
            pulsar otro. Un clic en el plano la dobla. Al marcarlo aparece la X.
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {PLAN_SYMBOLS.map((item) => {
            const active = tool?.type === "symbol" && tool.kind === item.kind;
            return (
              <li key={item.kind}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    cancelDraft();
                    if (!active) {
                      reveal(item.kind);
                    }
                    setTool(active ? null : { type: "symbol", kind: item.kind });
                  }}
                  className={`pressable flex min-h-16 w-full items-center gap-3 rounded-2xl px-3 py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    active ? "bg-primary text-primary-foreground" : "bg-background"
                  }`}
                >
                  <svg
                    viewBox="-20 -20 40 40"
                    className="h-10 w-10 shrink-0"
                    aria-hidden
                  >
                    <PlanGlyph kind={item.kind} />
                  </svg>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{item.label}</span>
                    <span
                      className={`mt-0.5 block text-[11px] leading-snug ${
                        active ? "text-primary-foreground/80" : "text-muted"
                      }`}
                    >
                      {item.note}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <div>
          <p className="text-sm font-semibold">Cables</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Pulsa el tablero y después otro símbolo. La línea se pega sola.
            Mantén el clic sobre un cable para acomodarlo. Ctrl+Z deshace.
          </p>
        </div>
        <ul className="grid grid-cols-3 gap-2 lg:grid-cols-1">
          {PLAN_CABLES.map((item) => {
            const active = tool?.type === "cable" && tool.kind === item.kind;
            return (
              <li key={item.kind}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    if (active) {
                      cancelDraft();
                      setTool(null);
                      return;
                    }
                    reveal(item.kind);
                    setTool({ type: "cable", kind: item.kind });
                    if (draftRef.current) {
                      const next = { ...draftRef.current, kind: item.kind };
                      draftRef.current = next;
                      setDraft(next);
                    }
                  }}
                  className="pressable flex min-h-12 w-full items-center gap-3 rounded-2xl bg-background px-3 py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  style={
                    active ? { boxShadow: `inset 0 0 0 2px ${item.color}` } : undefined
                  }
                >
                  <svg viewBox="0 0 36 12" className="h-4 w-10 shrink-0" aria-hidden>
                    <line
                      x1="2"
                      y1="6"
                      x2="34"
                      y2="6"
                      stroke={item.color}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{item.label}</span>
                    <span className="mt-0.5 hidden text-[11px] text-muted lg:block">
                      {item.note}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="text-xs leading-relaxed text-muted">
          {tool?.type === "cable"
            ? draft
              ? `Cable de ${toolLabel?.toLowerCase()}: suelta en un símbolo para conectar, o pulsa el plano para doblar.`
              : `Cable de ${toolLabel?.toLowerCase()}: pulsa un símbolo para empezar, por ejemplo el tablero.`
            : toolLabel
              ? `Colocando: ${toolLabel}.`
              : "Sin herramienta: pulsa el plano para deseleccionar."}{" "}
          {selected
            ? "El símbolo marcado se puede arrastrar o quitar."
            : selectedCable
              ? "Mantén el clic para acomodar el cable."
              : "Casa de ejemplo, lista para marcar."}{" "}
          Ctrl+Z deshace.
        </p>
      </aside>

      <div className="neu order-1 flex min-h-0 min-w-0 flex-1 flex-col rounded-[28px] p-3 sm:p-4 lg:order-2">
        <div className="mb-3 flex items-baseline justify-between gap-3 px-1">
          <div>
            <p className="text-sm font-semibold">{planName}</p>
            <p className="text-xs text-muted">
              {activePlanId ? "Guardado en este dispositivo" : "Todavía no está guardado"}
              {allShown ? "" : " · Vista filtrada"}
            </p>
          </div>
          <p className="text-xs text-muted">
            {allShown ? marks.length : `${visibleMarks.length} de ${marks.length}`} símbolos
            {cables.length > 0
              ? ` · ${allShown ? cables.length : `${visibleCables.length} de ${cables.length}`} ${
                  cables.length === 1 ? "cable" : "cables"
                }`
              : ""}
          </p>
        </div>
        <div className="relative min-h-0 flex-1">
        <BoardActions
          saveOpen={libraryOpen}
          onSave={() => setLibraryOpen((open) => !open)}
          removeLabel={selectedCable ? "Quitar cable" : "Quitar símbolo"}
          canRemove={Boolean(selected || selectedCable)}
          onRemove={() => {
            if (selected) {
              removeMark(selected.id);
            } else if (selectedCable) {
              removeCable(selectedCable.id);
            }
          }}
          onRestore={() => {
            cancelDraft();
            remember();
            setMarks(EXAMPLE_MARKS);
            setCables([]);
            setSelectedId(EXAMPLE_MARKS[0]?.id ?? null);
            setSelectedCableId(null);
            setActivePlanId(null);
            setPlanName("Casa de ejemplo");
          }}
          onClear={() => {
            cancelDraft();
            remember();
            setMarks([]);
            setCables([]);
            setSelectedId(null);
            setSelectedCableId(null);
            setActivePlanId(null);
            setPlanName("Plano nuevo");
          }}
        />
        {libraryOpen ? (
          <form
            className="absolute top-14 right-3 z-20 flex w-[min(18rem,calc(100%-1.5rem))] flex-col gap-3 rounded-2xl border border-[#1a2744]/10 bg-white p-3 text-[#1a2744] shadow-[0_8px_24px_rgb(26_39_68_/_0.16)]"
            onSubmit={(event) => {
              event.preventDefault();
              saveCurrentPlan();
            }}
          >
            <label className="flex flex-col gap-1 text-xs font-semibold">
              Nombre del plano
              <input
                value={planName}
                onChange={(event) => setPlanName(event.target.value)}
                maxLength={40}
                className="min-h-10 rounded-xl border border-[#1a2744]/15 bg-[#f7f4ee] px-3 text-sm font-medium outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              />
            </label>
            <div className="flex gap-2">
              <button
                type="submit"
                className="pressable min-h-10 flex-1 rounded-full bg-[#1a2744] px-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={startNewPlan}
                className="pressable min-h-10 rounded-full border border-[#1a2744]/15 px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Nuevo
              </button>
            </div>
            <div>
              <p className="text-xs font-semibold">Planos guardados</p>
              {plans.length === 0 ? (
                <p className="mt-1 text-xs text-[#5c6570]">Todavía no hay planos guardados.</p>
              ) : (
                <ul className="mt-2 flex max-h-40 flex-col gap-1 overflow-auto">
                  {plans.map((plan) => (
                    <li key={plan.id} className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openSavedPlan(plan)}
                        className={`pressable min-h-9 min-w-0 flex-1 truncate rounded-xl px-2 text-left text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                          plan.id === activePlanId ? "bg-[#e7eef8] font-semibold" : "hover:bg-[#f7f4ee]"
                        }`}
                      >
                        {plan.name}
                      </button>
                      <button
                        type="button"
                        aria-label={`Borrar plano ${plan.name}`}
                        onClick={() => deleteSavedPlan(plan.id)}
                        className="pressable grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#c23b4a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </form>
        ) : null}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${PLAN_VIEW.width} ${PLAN_VIEW.height}`}
          className={`h-auto min-h-[420px] w-full flex-1 touch-none rounded-2xl bg-[#f6f1e6] ${
            tool?.type === "cable" ? "cursor-crosshair" : ""
          }`}
          role="application"
          aria-label="Plano de una casa pequeña"
          onPointerDown={place}
          onPointerMove={move}
          onPointerUp={(event) => {
            const dragged = Boolean(dragRef.current || cableDragRef.current);
            dragRef.current = null;
            cableDragRef.current = null;
            if (dragged) {
              dropEmptyUndo();
            }
            endCableGesture(event);
          }}
          onPointerCancel={() => {
            dragRef.current = null;
            gestureRef.current = null;
          }}
          onPointerLeave={() => {
            if (!dragRef.current) {
              return;
            }
            dragRef.current = null;
            dropEmptyUndo();
          }}
          onDoubleClick={(event) => {
            if (tool?.type !== "cable" || !draftRef.current) {
              return;
            }
            if ((event.target as Element).closest("[data-symbol], [data-remove]")) {
              return;
            }
            event.preventDefault();
            if (draftRef.current.anchors.length >= 2) {
              commitCable(draftRef.current.anchors);
            }
          }}
        >
          <HouseSheet />
          {visibleCables.map((cable) => (
            <CableStroke
              key={cable.id}
              points={cablePoints(cable.anchors, marks)}
              color={cableColor(cable.kind)}
              cableId={cable.id}
              selected={cable.id === selectedCableId}
              onRemove={() => removeCable(cable.id)}
              onGrab={(event) => beginCableMove(event, cable.id)}
              routing={Boolean(draft)}
              onDraw={(event) => beginCable(event)}
            />
          ))}
          {previewAnchors && draft && shown[draft.kind] ? (
            <CableStroke
              points={cablePoints(previewAnchors, marks)}
              color={cableColor(draft?.kind ?? "fase")}
              preview
            />
          ) : null}
          {visibleMarks.map((mark) => {
            const spec = PLAN_SYMBOLS.find((item) => item.kind === mark.kind);
            const active = mark.id === selectedId;
            return (
              <g
                key={mark.id}
                data-symbol={mark.id}
                transform={`translate(${mark.x} ${mark.y})`}
                className={tool?.type === "cable" ? "cursor-crosshair" : "cursor-grab"}
                role="button"
                tabIndex={0}
                aria-label={spec?.label ?? "Símbolo"}
                aria-pressed={active}
                onPointerDown={(event) => {
                  if ((event.target as Element).closest("[data-remove]")) {
                    return;
                  }
                  if (beginCable(event)) {
                    return;
                  }
                  event.stopPropagation();
                  remember();
                  setSelectedId(mark.id);
                  setSelectedCableId(null);
                  dragRef.current = { id: mark.id };
                }}
                onDoubleClick={(event) => {
                  if ((event.target as Element).closest("[data-remove]")) {
                    return;
                  }
                  event.preventDefault();
                  event.stopPropagation();
                  if (tool?.type === "cable") {
                    if (draftRef.current && draftRef.current.anchors.length >= 2) {
                      commitCable(draftRef.current.anchors);
                    }
                    return;
                  }
                  removeMark(mark.id);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedId(mark.id);
                  }
                }}
              >
                {magnet?.id === mark.id ? (
                  <circle
                    data-snap={mark.id}
                    r="22"
                    fill="rgb(26 39 68 / 0.06)"
                    stroke={tool?.type === "cable" ? cableColor(tool.kind) : "#C62828"}
                    strokeWidth="1.2"
                    className="pointer-events-none"
                  />
                ) : null}
                {active ? (
                  <circle
                    r="22"
                    fill="rgb(26 86 176 / 0.12)"
                    stroke="#1a56b0"
                    strokeWidth="1.6"
                  />
                ) : null}
                <circle r="18" fill="transparent" />
                <g className="pointer-events-none text-[#1a56b0]">
                  <PlanGlyph kind={mark.kind} />
                </g>
                {active ? (
                  <g
                    data-remove={mark.id}
                    transform="translate(16 -16)"
                    role="button"
                    aria-label={`Quitar ${spec?.label ?? "símbolo"}`}
                    className="cursor-pointer"
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      dragRef.current = null;
                    }}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      removeMark(mark.id);
                    }}
                  >
                    <circle r="8" fill="#fff" stroke="#c23b4a" strokeWidth="1.4" />
                    <path
                      d="M-3.4 -3.4 L3.4 3.4 M3.4 -3.4 L-3.4 3.4"
                      fill="none"
                      stroke="#c23b4a"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </g>
                ) : null}
              </g>
            );
          })}
        </svg>
        </div>
      </div>
    </div>
  );
}

function BoardActions({
  saveOpen,
  onSave,
  removeLabel,
  canRemove,
  onRemove,
  onRestore,
  onClear,
}: {
  saveOpen: boolean;
  onSave: () => void;
  removeLabel: string;
  canRemove: boolean;
  onRemove: () => void;
  onRestore: () => void;
  onClear: () => void;
}) {
  return (
    <div className="absolute top-3 right-3 z-10 flex gap-1.5">
      <ActionButton label="Guardar plano" pressed={saveOpen} onClick={onSave}>
        <path d="M6 4h9l3 3v13H6z" />
        <path d="M8 4v5h8" />
        <path d="M8 15h8" />
      </ActionButton>
      <ActionButton label={removeLabel} disabled={!canRemove} onClick={onRemove} tone="danger">
        <path d="M5 7h14M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M7.5 7l.7 12h7.6l.7-12" />
      </ActionButton>
      <ActionButton label="Restaurar ejemplo" onClick={onRestore}>
        <path d="M5 12a7 7 0 1 0 2-4.9" />
        <path d="M5 4.5V9h4.5" />
      </ActionButton>
      <ActionButton label="Limpiar plano" onClick={onClear}>
        <path d="M14 4.5 19.5 10 11 18.5H6.5L3.5 15.5 12 7" />
        <path d="M4 19.5h9" />
      </ActionButton>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  disabled = false,
  pressed = false,
  tone = "ink",
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
  tone?: "ink" | "danger";
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={`pressable grid h-10 w-10 place-items-center rounded-full border border-[#1a2744]/15 bg-white shadow-[0_1px_4px_rgb(26_39_68_/_0.16)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40 ${
        pressed ? "ring-2 ring-[#1a2744]" : ""
      } ${tone === "danger" ? "text-[#c23b4a]" : "text-[#1a2744]"}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {children}
      </svg>
    </button>
  );
}

function CableStroke({
  points,
  color,
  cableId,
  selected = false,
  preview = false,
  onRemove,
  onDraw,
  onGrab,
  routing = false,
}: {
  points: PlanPoint[];
  color: string;
  cableId?: string;
  selected?: boolean;
  preview?: boolean;
  onRemove?: () => void;
  onDraw?: (event: ReactPointerEvent<SVGGElement>) => boolean;
  onGrab?: (event: ReactPointerEvent<SVGGElement>) => void;
  routing?: boolean;
}) {
  if (points.length < 2) {
    return null;
  }
  const d = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const mid = pathMiddle(points);
  return (
    <g
      data-cable={preview ? undefined : cableId}
      className={preview ? "pointer-events-none" : "cursor-grab"}
      onPointerDown={(event) => {
        if (preview || (event.target as Element).closest("[data-remove]")) {
          return;
        }
        if (onDraw?.(event)) {
          return;
        }
        onGrab?.(event);
      }}
      onDoubleClick={(event) => {
        if (preview || (event.target as Element).closest("[data-remove]")) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        if (routing) {
          return;
        }
        onRemove?.();
      }}
    >
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={selected ? 2.6 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none"
      />
      {preview ? null : (
        <path
          d={d}
          fill="none"
          stroke="transparent"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {preview
        ? null
        : points.map((point, index) =>
            index === 0 || index === points.length - 1 ? (
              <circle
                key={`${point.x}-${point.y}-${index}`}
                cx={point.x}
                cy={point.y}
                r="2.2"
                fill={color}
                className="pointer-events-none"
              />
            ) : null,
          )}
      {selected && onRemove ? (
        <g
          data-remove={cableId}
          transform={`translate(${mid.x} ${mid.y - 14})`}
          role="button"
          aria-label="Quitar cable"
          className="cursor-pointer"
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onRemove();
          }}
        >
          <circle r="8" fill="#fff" stroke="#c23b4a" strokeWidth="1.4" />
          <path
            d="M-3.4 -3.4 L3.4 3.4 M3.4 -3.4 L-3.4 3.4"
            fill="none"
            stroke="#c23b4a"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </g>
      ) : null}
    </g>
  );
}

function HouseSheet() {
  const paper = "#f7f4ee";
  const ink = "#1a2744";
  const line = "#31415c";

  return (
    <g className="pointer-events-none">
      <rect x="0" y="0" width="980" height="860" fill={paper} />
      <rect x={X0} y={Y0} width={6 * S} height={6 * S} fill="#fffdf8" />

      <Furniture ink={line} />

      <g stroke={ink} strokeWidth="9" strokeLinecap="square" fill="none">
        <path d={`M${mx(0)} ${my(0)} H${mx(6)} V${my(6)} H${mx(0)} Z`} />
        <path d={`M${mx(0)} ${my(3)} H${mx(3.6)}`} />
        <path d={`M${mx(2.4)} ${my(0)} V${my(3)}`} />
        <path d={`M${mx(3.8)} ${my(0)} V${my(2)}`} />
        <path d={`M${mx(2.4)} ${my(2.4)} H${mx(3.8)}`} />
        <path d={`M${mx(3.8)} ${my(2)} H${mx(6)}`} />
        <path d={`M${mx(3.6)} ${my(2.5)} V${my(6)}`} />
        <path d={`M${mx(3.6)} ${my(2.5)} H${mx(6)}`} />
      </g>

      <g fill="#fffdf8">
        <rect x={mx(1.55)} y={my(3) - 8} width={0.75 * S} height="16" />
        <rect x={mx(2.75)} y={my(3) - 8} width={0.7 * S} height="16" />
        <rect x={mx(2.55)} y={my(2.4) - 8} width={0.7 * S} height="16" />
        <rect x={mx(4.35)} y={my(2) - 8} width={0.7 * S} height="16" />
        <rect x={mx(3.6) - 8} y={my(3.15)} width="16" height={0.75 * S} />
        <rect x={mx(4.3)} y={my(6) - 8} width={0.8 * S} height="16" />
        <rect x={mx(0.7)} y={my(0) - 8} width={1 * S} height="16" />
        <rect x={mx(0) - 8} y={my(4.1)} width="16" height={0.9 * S} />
        <rect x={mx(4.5)} y={my(0) - 8} width={0.9 * S} height="16" />
        <rect x={mx(6) - 8} y={my(4.2)} width="16" height={1 * S} />
      </g>

      <g stroke={ink} strokeWidth="1.5" fill="none">
        <path d={`M${mx(2.3)} ${my(3)} A${0.75 * S} ${0.75 * S} 0 0 1 ${mx(1.55)} ${my(3.75)}`} />
        <path d={`M${mx(1.55)} ${my(3)} V${my(3.75)}`} />
        <path d={`M${mx(2.75)} ${my(3)} A${0.7 * S} ${0.7 * S} 0 0 0 ${mx(3.45)} ${my(2.3)}`} />
        <path d={`M${mx(3.45)} ${my(3)} V${my(2.3)}`} />
        <path d={`M${mx(2.55)} ${my(2.4)} A${0.7 * S} ${0.7 * S} 0 0 1 ${mx(3.25)} ${my(3.1)}`} />
        <path d={`M${mx(3.25)} ${my(2.4)} V${my(3.1)}`} />
        <path d={`M${mx(5.05)} ${my(2)} A${0.7 * S} ${0.7 * S} 0 0 1 ${mx(4.35)} ${my(2.7)}`} />
        <path d={`M${mx(4.35)} ${my(2)} V${my(2.7)}`} />
        <path d={`M${mx(3.6)} ${my(3.9)} A${0.75 * S} ${0.75 * S} 0 0 0 ${mx(4.35)} ${my(3.15)}`} />
        <path d={`M${mx(3.6)} ${my(3.15)} H${mx(4.35)}`} />
        <path d={`M${mx(5.1)} ${my(6)} A${0.8 * S} ${0.8 * S} 0 0 0 ${mx(4.3)} ${my(5.2)}`} />
        <path d={`M${mx(4.3)} ${my(6)} V${my(5.2)}`} />
        <path d={`M${mx(0.78)} ${my(0) - 3} H${mx(1.62)} M${mx(0.78)} ${my(0) + 5} H${mx(1.62)}`} />
        <path d={`M${mx(0) - 3} ${my(4.18)} V${my(4.92)} M${mx(0) + 5} ${my(4.18)} V${my(4.92)}`} />
        <path d={`M${mx(4.58)} ${my(0) - 3} H${mx(5.32)} M${mx(4.58)} ${my(0) + 5} H${mx(5.32)}`} />
        <path d={`M${mx(6) - 3} ${my(4.28)} V${my(5.12)} M${mx(6) + 5} ${my(4.28)} V${my(5.12)}`} />
      </g>

      <g fill={ink} fontSize="15" fontWeight="650" letterSpacing="0.04em">
        <text x={mx(1.2)} y={my(2.35)} textAnchor="middle">
          DORMITORIO
        </text>
        <text x={mx(3.1)} y={my(1.55)} textAnchor="middle" fontSize="13">
          BAÑO
        </text>
        <text x={mx(5.2)} y={my(1.45)} textAnchor="middle">
          COCINA
        </text>
        <text x={mx(1.8)} y={my(4.15)} textAnchor="middle">
          DORMITORIO
        </text>
        <text x={mx(4.85)} y={my(4.55)} textAnchor="middle">
          LIVING
        </text>
        <text x={mx(4.8)} y={my(6) + 72} textAnchor="middle" fontSize="16">
          PORCHE
        </text>
      </g>

      <Dimensions />
    </g>
  );
}

const S = 100;
const X0 = 160;
const Y0 = 120;
const mx = (meters: number) => X0 + meters * S;
const my = (meters: number) => Y0 + meters * S;

function Furniture({ ink }: { ink: string }) {
  return (
    <g stroke={ink} fill="none" strokeWidth="1.6">
      <Bed x={mx(0.18)} y={my(0.18)} w={0.9 * S} h={1.7 * S} pillow="top" />
      <Bed x={mx(1.32)} y={my(0.18)} w={0.9 * S} h={1.7 * S} pillow="top" />
      <Bed x={mx(0.25)} y={my(4.15)} w={1.15 * S} h={1.55 * S} pillow="bottom" />
      <rect x={mx(0.2)} y={my(3.12)} width={2.15 * S} height={0.22 * S} />

      <rect x={mx(2.55)} y={my(0.18)} width={1.1 * S} height={0.55 * S} rx="16" />
      <rect x={mx(2.66)} y={my(0.28)} width={0.88 * S} height={0.36 * S} rx="12" />
      <ellipse cx={mx(2.7)} cy={my(1.15)} rx="14" ry="10" />
      <path d={`M${mx(2.55)} ${my(1.15)} H${mx(2.85)}`} />
      <rect x={mx(3.15)} y={my(1.55)} width={0.28 * S} height={0.42 * S} rx="4" />
      <ellipse cx={mx(3.29)} cy={my(1.35)} rx="16" ry="12" />

      <path d={`M${mx(3.95)} ${my(0.18)} H${mx(4.7)} V${my(1.7)} H${mx(3.95)} Z`} />
      <rect x={mx(4.05)} y={my(0.4)} width="22" height="22" />
      <rect x={mx(4.05)} y={my(0.85)} width="22" height="22" />
      <rect x={mx(4.05)} y={my(1.28)} width="22" height="18" />

      <circle cx={mx(4.85)} cy={my(3.55)} r="28" />
      <rect x={mx(4.7)} y={my(3.05)} width="30" height="14" rx="3" />
      <rect x={mx(4.7)} y={my(3.85)} width="30" height="14" rx="3" />
      <rect x={mx(4.4)} y={my(3.4)} width="14" height="28" rx="3" />
      <rect x={mx(5.15)} y={my(3.4)} width="14" height="28" rx="3" />
      <rect x={mx(5.35)} y={my(4.15)} width={0.5 * S} height={0.95 * S} rx="8" />
      <path d={`M${mx(5.42)} ${my(4.35)} H${mx(5.78)}`} />
      <rect x={mx(4.15)} y={my(5.15)} width={0.42 * S} height={0.42 * S} rx="6" />
    </g>
  );
}

function Bed({
  x,
  y,
  w,
  h,
  pillow,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  pillow: "top" | "bottom";
}) {
  const pillowY = pillow === "top" ? y + 8 : y + h - 30;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="4" />
      <rect x={x + 8} y={pillowY} width={w - 16} height="22" rx="3" />
    </g>
  );
}

function Dimensions() {
  const ink = "#4d5c78";
  return (
    <g stroke={ink} fill={ink} strokeWidth="1" fontSize="13" fontWeight="600">
      <HDim x1={mx(0)} x2={mx(2.4)} y={my(0) - 28} label="2.40" />
      <HDim x1={mx(2.4)} x2={mx(3.8)} y={my(0) - 28} label="1.40" />
      <HDim x1={mx(3.8)} x2={mx(6)} y={my(0) - 28} label="2.20" />
      <HDim x1={mx(0)} x2={mx(3.6)} y={my(6) + 28} label="3.60" />
      <HDim x1={mx(3.6)} x2={mx(6)} y={my(6) + 28} label="2.40" />
      <VDim y1={my(0)} y2={my(3)} x={mx(0) - 36} label="3.00" />
      <VDim y1={my(3)} y2={my(6)} x={mx(0) - 36} label="3.00" />
      <VDim y1={my(0)} y2={my(2)} x={mx(6) + 36} label="2.00" />
      <VDim y1={my(2.5)} y2={my(6)} x={mx(6) + 36} label="3.50" />
    </g>
  );
}

function HDim({
  x1,
  x2,
  y,
  label,
}: {
  x1: number;
  x2: number;
  y: number;
  label: string;
}) {
  return (
    <g>
      <path d={`M${x1} ${y} H${x2}`} />
      <path d={`M${x1} ${y - 5} V${y + 5} M${x2} ${y - 5} V${y + 5}`} />
      <text x={(x1 + x2) / 2} y={y - 8} textAnchor="middle" stroke="none">
        {label}
      </text>
    </g>
  );
}

function VDim({
  y1,
  y2,
  x,
  label,
}: {
  y1: number;
  y2: number;
  x: number;
  label: string;
}) {
  const mid = (y1 + y2) / 2;
  return (
    <g>
      <path d={`M${x} ${y1} V${y2}`} />
      <path d={`M${x - 5} ${y1} H${x + 5} M${x - 5} ${y2} H${x + 5}`} />
      <text
        x={x}
        y={mid}
        textAnchor="middle"
        stroke="none"
        transform={`rotate(-90 ${x} ${mid})`}
        dy="-8"
      >
        {label}
      </text>
    </g>
  );
}
