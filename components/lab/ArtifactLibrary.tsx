"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { APPLIANCES } from "@/lib/simulation/appliances";
import type { CircuitBoardLayout, PlaceableKind } from "@/lib/simulation/flowTypes";
import { LAB_CIRCUITS } from "@/lib/simulation/labCircuits";

const DRAG_THRESHOLD = 8;

type LabTab = "artefactos" | "testers" | "circuitos" | "electrodomesticos";

const TABS: Array<{ id: LabTab; label: string }> = [
  { id: "artefactos", label: "Artefactos" },
  { id: "testers", label: "Testers" },
  { id: "circuitos", label: "Circuitos" },
  { id: "electrodomesticos", label: "Electrodomésticos" },
];

const ARTIFACTS: Array<{
  kind: PlaceableKind;
  label: string;
  hint?: string;
  src: string;
  alt: string;
}> = [
  {
    kind: "battery",
    label: "Batería",
    src: "/Artefactos/bateria.png",
    alt: "Batería",
  },
  {
    kind: "switch",
    label: "Interruptor",
    hint: "Corta la fase, no el neutro",
    src: "/Artefactos/interruptor-arriba.png",
    alt: "Interruptor",
  },
  {
    kind: "outlet",
    label: "Tomacorriente",
    hint: "Fase y neutro arriba",
    src: "/Artefactos/tomacorriente_uno.png",
    alt: "Tomacorriente",
  },
  {
    kind: "bulb",
    label: "Portalámparas",
    src: "/simulation/lampholder-off.png",
    alt: "Ampolleta en portalámparas",
  },
  {
    kind: "ground",
    label: "Tierra",
    hint: "Solo PE, nunca fase ni neutro",
    src: "/simulation/ground-clip.png",
    alt: "Conector de tierra",
  },
  {
    kind: "lightPole",
    label: "Poste de luz",
    hint: "Fase y neutro",
    src: "/Artefactos/poste-luz.png",
    alt: "Poste de luz de la red domiciliaria",
  },
  {
    kind: "mainSwitch",
    label: "Interruptor general",
    hint: "Fase y neutro · entra arriba",
    src: "/Artefactos/interruptor-general-arriba.png",
    alt: "Interruptor general del tablero",
  },
  {
    kind: "rcd",
    label: "Interruptor diferencial",
    hint: "Fase y neutro · entra arriba",
    src: "/Artefactos/diferencial-arriba.png",
    alt: "Interruptor diferencial",
  },
  {
    kind: "mcb",
    label: "Interruptor automático",
    hint: "10 A · fase y neutro",
    src: "/Artefactos/interruptor-auto-arriba.png",
    alt: "Interruptor automático de circuitos",
  },
];

const TESTERS: Array<{
  kind: PlaceableKind;
  label: string;
  hint?: string;
  src: string;
  alt: string;
}> = [
  {
    kind: "multimeter",
    label: "Multímetro",
    hint: "Tensión, corriente o continuidad",
    src: "/simulation/multimeter.svg",
    alt: "Multímetro",
  },
  {
    kind: "voltageDetector",
    label: "Detector de voltaje",
    hint: "La punta avisa si hay fase",
    src: "/simulation/voltage-detector.svg",
    alt: "Detector de voltaje",
  },
  {
    kind: "voltmeter",
    label: "Medidor de tensión",
    hint: "En paralelo, 220 V",
    src: "/simulation/voltmeter.svg",
    alt: "Medidor de tensión",
  },
  {
    kind: "ammeter",
    label: "Medidor de corriente",
    hint: "En serie, nunca en paralelo",
    src: "/simulation/ammeter.png",
    alt: "Medidor de corriente consumida",
  },
];

export function ArtifactLibrary({
  onAdd,
  onPlace,
  isOverBoard,
  selectedCircuitId,
  onLoadCircuit,
}: {
  onAdd: (kind: PlaceableKind, extra?: { applianceId?: string }) => void;
  onPlace: (
    kind: PlaceableKind,
    clientX: number,
    clientY: number,
    extra?: { applianceId?: string },
  ) => void;
  isOverBoard: (clientX: number, clientY: number) => boolean;
  selectedCircuitId?: string | null;
  onLoadCircuit?: (id: string, layout: CircuitBoardLayout) => void;
}) {
  const [tab, setTab] = useState<LabTab>("artefactos");
  const libraryRef = useRef<HTMLElement>(null);
  const drag = useRef<{
    kind: PlaceableKind;
    applianceId?: string;
    pointerId: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);
  const [ghost, setGhost] = useState<{
    kind: PlaceableKind;
    applianceId?: string;
    x: number;
    y: number;
    overBoard: boolean;
  } | null>(null);
  const onAddRef = useRef(onAdd);
  const onPlaceRef = useRef(onPlace);
  const isOverBoardRef = useRef(isOverBoard);
  onAddRef.current = onAdd;
  onPlaceRef.current = onPlace;
  isOverBoardRef.current = isOverBoard;

  useEffect(() => {
    function clearStyles() {
      document.body.style.removeProperty("cursor");
      document.body.style.removeProperty("user-select");
    }

    function overLibrary(clientX: number, clientY: number) {
      const rect = libraryRef.current?.getBoundingClientRect();
      if (!rect) {
        return false;
      }
      return (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      );
    }

    function onMove(event: PointerEvent) {
      const current = drag.current;
      if (!current || current.pointerId !== event.pointerId) {
        return;
      }
      const dx = event.clientX - current.startX;
      const dy = event.clientY - current.startY;
      const distance = Math.hypot(dx, dy);
      if (!current.moved) {
        if (distance < DRAG_THRESHOLD) {
          return;
        }
        const pullingOut =
          !overLibrary(event.clientX, event.clientY) || Math.abs(dx) > 16;
        if (!pullingOut) {
          return;
        }
        current.moved = true;
      }
      event.preventDefault();
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
      setGhost({
        kind: current.kind,
        applianceId: current.applianceId,
        x: event.clientX,
        y: event.clientY,
        overBoard: isOverBoardRef.current(event.clientX, event.clientY),
      });
    }

    function onUp(event: PointerEvent) {
      const current = drag.current;
      if (!current || current.pointerId !== event.pointerId) {
        return;
      }
      const { kind, applianceId, moved } = current;
      drag.current = null;
      setGhost(null);
      clearStyles();
      const extra = applianceId ? { applianceId } : undefined;
      if (moved) {
        onPlaceRef.current(kind, event.clientX, event.clientY, extra);
        return;
      }
      onAddRef.current(kind, extra);
    }

    function onCancel(event: PointerEvent) {
      const current = drag.current;
      if (!current || current.pointerId !== event.pointerId) {
        return;
      }
      drag.current = null;
      setGhost(null);
      clearStyles();
    }

    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      clearStyles();
    };
  }, []);

  const ghostItem = ghost
    ? ghost.applianceId
      ? APPLIANCES.find((item) => item.id === ghost.applianceId)
      : [...ARTIFACTS, ...TESTERS].find((item) => item.kind === ghost.kind)
    : null;

  return (
    <aside
      ref={libraryRef}
      className="neu flex h-36 w-full shrink-0 flex-col overflow-hidden rounded-3xl p-2 md:h-full md:min-h-0 md:w-56 md:shrink-0 md:self-stretch md:p-3 lg:w-72"
    >
      <div
        role="tablist"
        aria-label="Panel del laboratorio"
        className="lab-tabs shrink-0"
      >
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`lab-tab-${item.id}`}
            aria-selected={tab === item.id}
            aria-controls={`lab-panel-${item.id}`}
            onClick={() => setTab(item.id)}
            className="lab-tab"
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-2 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
        {tab === "artefactos" ? (
          <div
            role="tabpanel"
            id="lab-panel-artefactos"
            aria-labelledby="lab-tab-artefactos"
          >
            <p className="hidden px-1 text-xs text-muted md:block">
              Arrastra un artefacto al tablero, o púlsalo para colocarlo.
            </p>
            <ul className="lab-shelf mt-1 md:mt-3">
              {ARTIFACTS.map((item) => (
                <li key={item.kind}>
                  <button
                    type="button"
                    aria-label={`${item.label}. Arrastra al tablero o pulsa para agregar.`}
                    onPointerDown={(event) => {
                      if (event.button !== 0) {
                        return;
                      }
                      drag.current = {
                        kind: item.kind,
                        pointerId: event.pointerId,
                        startX: event.clientX,
                        startY: event.clientY,
                        moved: false,
                      };
                    }}
                    onDragStart={(event) => event.preventDefault()}
                    className="pressable flex min-h-11 w-full cursor-grab flex-col items-center rounded-2xl bg-transparent px-2 py-3 text-center select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:cursor-grabbing"
                  >
                    <img
                      src={item.src}
                      alt=""
                      draggable={false}
                      className="circuit-photo pointer-events-none h-12 w-full bg-transparent object-contain md:h-16"
                    />
                    <span className="mt-2 w-full truncate text-xs font-semibold md:overflow-visible md:whitespace-normal">
                      {item.label}
                    </span>
                    {item.hint ? (
                      <span className="mt-0.5 hidden text-[10px] text-muted md:block">
                        {item.hint}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {tab === "testers" ? (
          <div
            role="tabpanel"
            id="lab-panel-testers"
            aria-labelledby="lab-tab-testers"
          >
            <p className="hidden px-1 text-xs text-muted md:block">
              Arrastra un tester al tablero. El multímetro cambia de escala
              al pulsarlo. El detector enciende si la punta toca fase.
            </p>
            <ul className="lab-shelf mt-1 md:mt-3">
              {TESTERS.map((item) => (
                <li key={item.kind}>
                  <button
                    type="button"
                    aria-label={`${item.label}. Arrastra al tablero o pulsa para agregar.`}
                    onPointerDown={(event) => {
                      if (event.button !== 0) {
                        return;
                      }
                      drag.current = {
                        kind: item.kind,
                        pointerId: event.pointerId,
                        startX: event.clientX,
                        startY: event.clientY,
                        moved: false,
                      };
                    }}
                    onDragStart={(event) => event.preventDefault()}
                    className="pressable flex min-h-11 w-full cursor-grab flex-col items-center rounded-2xl bg-transparent px-2 py-3 text-center select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:cursor-grabbing"
                  >
                    <img
                      src={item.src}
                      alt=""
                      draggable={false}
                      className="circuit-photo pointer-events-none h-12 w-full bg-transparent object-contain md:h-16"
                    />
                    <span className="mt-2 w-full truncate text-xs font-semibold md:overflow-visible md:whitespace-normal">
                      {item.label}
                    </span>
                    {item.hint ? (
                      <span className="mt-0.5 hidden text-[10px] text-muted md:block">
                        {item.hint}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {tab === "circuitos" ? (
          <div
            role="tabpanel"
            id="lab-panel-circuitos"
            aria-labelledby="lab-tab-circuitos"
          >
            <p className="hidden px-1 text-xs text-muted md:block">
              Pulsa un circuito para verlo armado. Los de fallo están
              marcados: no los copies en una vivienda.
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {LAB_CIRCUITS.map((circuit) => {
                const selected = selectedCircuitId === circuit.id;
                return (
                  <li key={circuit.id}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() =>
                        onLoadCircuit?.(circuit.id, circuit.layout)
                      }
                      className={`pressable min-h-11 w-full rounded-2xl px-3 py-2.5 text-left text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                        selected ? "btn-3d-soft" : "bg-transparent"
                      }`}
                    >
                      <span className="block">{circuit.nombre}</span>
                      {circuit.nota ? (
                        <span className="mt-0.5 block text-[10px] font-normal text-muted">
                          {circuit.nota}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
        {tab === "electrodomesticos" ? (
          <div
            role="tabpanel"
            id="lab-panel-electrodomesticos"
            aria-labelledby="lab-tab-electrodomesticos"
          >
            <p className="hidden px-1 text-xs text-muted md:block">
              Arrastra un electrodoméstico al tablero, o púlsalo para
              colocarlo.
            </p>
            <ul className="lab-shelf mt-1 md:mt-3">
              {APPLIANCES.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-label={`${item.label}. Arrastra al tablero o pulsa para agregar.`}
                    onPointerDown={(event) => {
                      if (event.button !== 0) {
                        return;
                      }
                      drag.current = {
                        kind: "appliance",
                        applianceId: item.id,
                        pointerId: event.pointerId,
                        startX: event.clientX,
                        startY: event.clientY,
                        moved: false,
                      };
                    }}
                    onDragStart={(event) => event.preventDefault()}
                    className="pressable flex min-h-11 w-full cursor-grab flex-col items-center rounded-2xl bg-transparent px-2 py-3 text-center select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:cursor-grabbing"
                  >
                    <img
                      src={item.src}
                      alt=""
                      draggable={false}
                      className="circuit-photo pointer-events-none h-12 w-full bg-transparent object-contain md:h-16"
                    />
                    <span className="mt-2 w-full truncate text-xs font-semibold md:overflow-visible md:whitespace-normal">
                      {item.label}
                    </span>
                    <span className="mt-0.5 text-[10px] text-muted">
                      {item.watts} W
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
      {ghost && ghostItem
        ? createPortal(
            <div
              aria-hidden
              className={`pointer-events-none fixed z-300 w-28 -translate-x-1/2 -translate-y-1/2 ${
                ghost.overBoard ? "opacity-100" : "opacity-70"
              }`}
              style={{ left: ghost.x, top: ghost.y }}
            >
              <img
                src={ghostItem.src}
                alt=""
                className="circuit-photo h-16 w-full bg-transparent object-contain drop-shadow-lg"
              />
              <p className="mt-1 text-center text-xs font-semibold">
                {ghostItem.label}
              </p>
            </div>,
            document.body,
          )
        : null}
    </aside>
  );
}
