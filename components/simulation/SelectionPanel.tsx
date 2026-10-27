"use client";

import type { Edge, Node } from "@xyflow/react";
import {
  AMPS_PER_BULB,
  formatAmps,
  formatVolts,
  isSwitchLike,
  MCB_TRIP_AMPS,
  SUPPLY_VOLTS,
} from "@/lib/simulation/devices";
import { applianceById } from "@/lib/simulation/appliances";
import { CABLE_COLORS } from "@/lib/simulation/cables";
import type { CircuitNodeData } from "@/lib/simulation/flowTypes";
import type { ComponentKind, Terminal } from "@/lib/simulation/types";
import { componentTitle, terminalLabel } from "@/lib/simulation/terminalLabels";
import { Button } from "../ui/Button";

const ROLE_LABEL: Record<string, string> = {
  fase: "Fase",
  neutro: "Neutro",
  tierra: "Tierra",
  enchufe: "Enchufe",
  libre: "Libre",
};

const METER_LABEL = {
  tension: "Tensión",
  corriente: "Corriente",
  continuidad: "Continuidad",
} as const;

const TRIP_LABEL = {
  sobrecarga: "Sobrecarga",
  fuga: "Fuga a tierra",
  prueba: "Botón de prueba",
} as const;

const PART_DESCRIPTION: Record<ComponentKind, string> = {
  battery:
    "Fuente del circuito. El polo positivo entrega la fase y el negativo, el neutro.",
  switch:
    "Abre o cierra el camino de la fase. Va sobre la fase, no sobre el neutro.",
  bulb:
    "Enciende cuando le llegan la fase y el neutro por un camino cerrado. El borne verde es la tierra de protección.",
  ground:
    "Puesta a tierra. Solo se une al conductor de protección, nunca a la fase ni al neutro.",
  mainSwitch:
    "Corta la fase y el neutro de toda la instalación. La alimentación entra por arriba.",
  rcd:
    "Corta la fase y el neutro si hay una fuga a tierra. El botón de prueba simula esa fuga.",
  mcb:
    "Protege el circuito de una sobrecarga y se dispara si la corriente pasa de su calibre.",
  ammeter:
    "Mide la corriente que lo atraviesa. Se conecta en serie, nunca en paralelo.",
  voltmeter:
    "Mide la tensión entre sus dos sondas. Se conecta en paralelo, sin cortar el circuito.",
  multimeter:
    "Mide tensión, corriente o continuidad según la escala que elijas.",
  voltageDetector:
    "Avisa cuando la punta toca un punto con fase. No hace falta cerrar el circuito.",
  lightPole:
    "Acometida de la red domiciliaria. Entrega la fase y el neutro al resto de la instalación.",
  outlet:
    "Punto donde se enchufa un aparato. La fase y el neutro entran por los bornes de arriba.",
  appliance:
    "Carga que consume potencia cuando está encendida y el tomacorriente tiene tensión.",
  resistor:
    "Se opone al paso de la corriente y limita los amperes del circuito.",
  led:
    "Emite luz cuando la corriente lo recorre en el sentido correcto.",
};

const APPLIANCE_DESCRIPTION: Record<string, string> = {
  refrigerador: "Conserva los alimentos en frío y queda conectado de forma continua.",
  microondas: "Calienta alimentos con un consumo alto mientras está en marcha.",
  lavadora: "Lava la ropa y toma corriente del tomacorriente durante el ciclo.",
  fryer: "Fríe con resistencia eléctrica y es una de las cargas más exigentes.",
  tostadora: "Tuesta el pan durante un momento corto y con bastante potencia.",
  hervidor: "Hierve agua rápido. Es la carga de mayor potencia de esta práctica.",
  computador: "Equipo electrónico de consumo moderado, enchufado a la red.",
  secadora: "Seca la ropa con calor y pide una corriente alta mientras trabaja.",
};

const CABLE_DESCRIPTION: Record<string, string> = {
  fase: "Conductor activo. Lleva la fase desde la fuente hasta las cargas.",
  neutro: "Conductor de retorno. Cierra el camino de vuelta hacia la fuente.",
  tierra: "Conductor de protección. Solo une tierras y no alimenta las cargas.",
  enchufe: "Cordón del electrodoméstico. Se conecta a la cara del tomacorriente.",
};

function partPhoto(node: Node<CircuitNodeData>): { src: string; alt: string } | null {
  const alt = node.data.label;
  const closed = Boolean(node.data.switchClosed);
  switch (node.data.kind) {
    case "battery":
      return { src: "/Artefactos/bateria.png", alt };
    case "switch":
      return {
        src: closed
          ? "/Artefactos/interruptor-arriba.png"
          : "/Artefactos/interruptor-abajo.png",
        alt,
      };
    case "outlet":
      return { src: "/Artefactos/tomacorriente_uno.png", alt };
    case "bulb":
      return {
        src: node.data.energized
          ? "/simulation/lampholder-on.png"
          : "/simulation/lampholder-off.png",
        alt,
      };
    case "ground":
      return { src: "/simulation/ground-clip.png", alt };
    case "lightPole":
      return { src: "/Artefactos/poste-luz.png", alt };
    case "mainSwitch":
      return {
        src: closed
          ? "/Artefactos/interruptor-general-arriba.png"
          : "/Artefactos/interruptor-general-abajo.png",
        alt,
      };
    case "rcd":
      return {
        src: closed
          ? "/Artefactos/diferencial-arriba.png"
          : "/Artefactos/diferencial-abajo.png",
        alt,
      };
    case "mcb":
      return {
        src: closed
          ? "/Artefactos/interruptor-auto-arriba.png"
          : "/Artefactos/interruptor-auto-abajo.png",
        alt,
      };
    case "multimeter":
      return { src: "/simulation/multimeter.svg", alt };
    case "voltageDetector":
      return { src: "/simulation/voltage-detector.svg", alt };
    case "voltmeter":
      return { src: "/simulation/voltmeter.svg", alt };
    case "ammeter":
      return { src: "/simulation/ammeter.png", alt };
    case "appliance": {
      const spec = applianceById(node.data.applianceId);
      return {
        src: spec?.src ?? node.data.src ?? "/electrodomesticos/refrigerador.png",
        alt,
      };
    }
    default:
      return null;
  }
}

function PartPhoto({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="mt-3 flex h-28 items-center justify-center rounded-2xl bg-background px-3">
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="circuit-photo max-h-24 w-full object-contain"
      />
    </div>
  );
}

function CablePhoto({ role, label }: { role: string; label: string }) {
  const color = CABLE_COLORS[role as keyof typeof CABLE_COLORS] ?? CABLE_COLORS.fase;
  return (
    <div className="mt-3 flex h-28 items-center justify-center rounded-2xl bg-background px-4">
      <svg viewBox="0 0 160 48" className="h-12 w-full" role="img" aria-label={label}>
        <path
          d="M8 24 H152"
          stroke="#1F1812"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M8 24 H152"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

function partDescription(node: Node<CircuitNodeData>): string {
  if (node.data.kind === "appliance") {
    const spec = applianceById(node.data.applianceId);
    if (spec && APPLIANCE_DESCRIPTION[spec.id]) {
      return APPLIANCE_DESCRIPTION[spec.id];
    }
  }
  return PART_DESCRIPTION[node.data.kind];
}

function terminalsOf(node: Node<CircuitNodeData>): Terminal[] {
  const terminals = [...node.data.terminals];
  if (
    node.data.kind === "bulb" &&
    !terminals.some((terminal) => terminal.id === "earth")
  ) {
    terminals.push({ id: "earth", polarity: "earth" });
  }
  return terminals;
}

function endpointLabel(
  nodeId: string,
  handle: string | null | undefined,
  nodes: Node<CircuitNodeData>[],
): string {
  const node = nodes.find((item) => item.id === nodeId);
  if (!node) {
    return "Otra pieza";
  }
  return `${node.data.label} · ${terminalLabel(node.data.kind, handle ?? "")}`;
}

function peerLabel(
  edge: Edge,
  nodeId: string,
  nodes: Node<CircuitNodeData>[],
): string {
  const otherId = edge.source === nodeId ? edge.target : edge.source;
  const otherHandle =
    (edge.source === nodeId ? edge.targetHandle : edge.sourceHandle) ?? "";
  const other = nodes.find((item) => item.id === otherId);
  if (!other) {
    return "Otra pieza";
  }
  return `${other.data.label} · ${terminalLabel(other.data.kind, otherHandle)}`;
}

function supplyText(node: Node<CircuitNodeData>): string {
  if ((node.data.currentAmps ?? 0) > 0 || node.data.energized) {
    return "Con corriente";
  }
  if (node.data.hasSupply) {
    return "Con tensión";
  }
  if (node.data.live) {
    return "Con fase";
  }
  return "Sin alimentación";
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line/80 py-2">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-right text-sm font-semibold text-foreground">{value}</dd>
    </div>
  );
}

export function SelectionPanel({
  node,
  edge,
  nodes,
  edges,
  variant,
  extra = 0,
  onClear,
}: {
  node: Node<CircuitNodeData> | null;
  edge: Edge | null;
  nodes: Node<CircuitNodeData>[];
  edges: Edge[];
  variant: "dock" | "sheet";
  extra?: number;
  onClear: () => void;
}) {
  const dock = variant === "dock";
  const cableRole =
    (edge?.data as { role?: string; powered?: boolean } | undefined)?.role ??
    "fase";
  const cablePowered = Boolean(
    (edge?.data as { powered?: boolean } | undefined)?.powered,
  );
  const photo = node ? partPhoto(node) : null;

  return (
    <aside
      aria-label="Propiedades de la pieza seleccionada"
      className={
        dock
          ? "neu hidden h-full min-h-0 w-56 shrink-0 flex-col overflow-hidden rounded-3xl p-3 lg:flex lg:self-stretch lg:w-72"
          : "neu absolute inset-x-2 bottom-16 z-30 max-h-[46%] overflow-y-auto rounded-2xl p-3 lg:hidden"
      }
    >
      <div className="flex shrink-0 items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Propiedades</h2>
        {node || edge ? (
          <button
            type="button"
            className="pressable rounded-full px-2 py-1 text-xs font-semibold text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={onClear}
          >
            Cerrar
          </button>
        ) : null}
      </div>

      {!node && !edge ? (
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Selecciona un artefacto o una tarjeta del tablero para ver sus datos.
        </p>
      ) : null}

      {node ? (
        <div className={dock ? "mt-2 min-h-0 flex-1 overflow-y-auto pr-1" : "mt-2"}>
          <p className="text-base font-semibold leading-tight" aria-live="polite">
            {node.data.label}
          </p>
          <p className="mt-0.5 text-xs text-muted">{componentTitle(node.data.kind)}</p>
          {photo ? <PartPhoto src={photo.src} alt={photo.alt} /> : null}
          <p className="mt-2 text-sm leading-relaxed">{partDescription(node)}</p>
          {extra > 0 ? (
            <p className="mt-1 text-xs text-muted">
              Hay {extra} {extra === 1 ? "pieza más" : "piezas más"} seleccionadas.
            </p>
          ) : null}

          <dl className="mt-2">
            <Row label="Alimentación" value={supplyText(node)} />
            {(node.data.currentAmps ?? 0) > 0 ? (
              <Row label="Corriente" value={formatAmps(node.data.currentAmps ?? 0)} />
            ) : null}
            {isSwitchLike(node.data.kind) ? (
              <Row
                label="Interruptor"
                value={
                  node.data.tripped
                    ? "Disparado"
                    : node.data.switchClosed
                      ? "Encendido"
                      : "Apagado"
                }
              />
            ) : null}
            {node.data.tripped && node.data.trippedReason ? (
              <Row label="Motivo" value={TRIP_LABEL[node.data.trippedReason]} />
            ) : null}
            {node.data.kind === "mcb" ? (
              <Row
                label="Calibre"
                value={`${node.data.tripAmps ?? MCB_TRIP_AMPS} A`}
              />
            ) : null}
            {node.data.kind === "appliance" && node.data.watts ? (
              <Row label="Potencia" value={`${node.data.watts} W`} />
            ) : null}
            {node.data.kind === "appliance" ? (
              <Row
                label="Encendido"
                value={node.data.switchClosed ? "Sí" : "No"}
              />
            ) : null}
            {node.data.kind === "bulb" ? (
              <Row
                label="Potencia"
                value={`${Math.round(AMPS_PER_BULB * SUPPLY_VOLTS)} W`}
              />
            ) : null}
            {node.data.kind === "multimeter" ? (
              <Row
                label="Escala"
                value={METER_LABEL[node.data.meterMode ?? "tension"]}
              />
            ) : null}
            {node.data.voltageVolts !== undefined ? (
              <Row label="Lectura" value={formatVolts(node.data.voltageVolts)} />
            ) : null}
            {node.data.kind === "voltageDetector" ? (
              <Row
                label="Detector"
                value={node.data.detectorOn ? "Detecta fase" : "Sin fase"}
              />
            ) : null}
            {node.data.continuity !== undefined ? (
              <Row
                label="Continuidad"
                value={
                  node.data.continuity === null
                    ? "Falta una sonda"
                    : node.data.continuity
                      ? "Hay continuidad"
                      : "No hay continuidad"
                }
              />
            ) : null}
          </dl>

          <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
            Bornes
          </h3>
          <ul className="mt-2 space-y-2">
            {terminalsOf(node).map((terminal) => {
              const links = edges
                .filter(
                  (item) =>
                    (item.source === node.id && item.sourceHandle === terminal.id) ||
                    (item.target === node.id && item.targetHandle === terminal.id),
                )
                .map((item) => peerLabel(item, node.id, nodes));
              const role = node.data.terminalRoles?.[terminal.id] ?? "libre";
              return (
                <li
                  key={terminal.id}
                  className="rounded-xl bg-background px-3 py-2"
                >
                  <p className="text-sm font-semibold">
                    {terminalLabel(node.data.kind, terminal.id)}
                  </p>
                  <p className="text-xs text-muted">
                    {ROLE_LABEL[role] ?? role}
                    {" · "}
                    {links.length > 0 ? links.join(", ") : "Sin cable"}
                  </p>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 flex flex-col gap-2 pb-1">
            {node.data.onToggleSwitch &&
            (isSwitchLike(node.data.kind) || node.data.kind === "appliance") ? (
              <Button
                variant="secondary"
                className="w-full"
                onClick={node.data.onToggleSwitch}
              >
                {node.data.switchClosed ? "Apagar" : "Encender"}
              </Button>
            ) : null}
            {node.data.kind === "multimeter" && node.data.onCycleMeter ? (
              <Button
                variant="secondary"
                className="w-full"
                onClick={node.data.onCycleMeter}
              >
                Cambiar escala
              </Button>
            ) : null}
            {node.data.onTestTrip && node.data.kind === "rcd" ? (
              <Button
                variant="secondary"
                className="w-full"
                onClick={node.data.onTestTrip}
              >
                Probar disparo
              </Button>
            ) : null}
            {node.data.onRemove ? (
              <Button variant="secondary" className="w-full" onClick={node.data.onRemove}>
                Quitar del tablero
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {!node && edge ? (
        <div className={dock ? "mt-2 min-h-0 flex-1 overflow-y-auto pr-1" : "mt-2"}>
          <p className="text-base font-semibold" aria-live="polite">
            Cable
          </p>
          <CablePhoto role={cableRole} label={ROLE_LABEL[cableRole] ?? "Fase"} />
          <p className="mt-2 text-sm leading-relaxed">
            {CABLE_DESCRIPTION[cableRole] ?? CABLE_DESCRIPTION.fase}
          </p>
          <dl className="mt-2">
            <Row label="Conductor" value={ROLE_LABEL[cableRole] ?? "Fase"} />
            <Row
              label="Estado"
              value={cablePowered ? "Con corriente" : "Sin corriente"}
            />
            <Row
              label="Desde"
              value={endpointLabel(edge.source, edge.sourceHandle, nodes)}
            />
            <Row
              label="Hasta"
              value={endpointLabel(edge.target, edge.targetHandle, nodes)}
            />
          </dl>
        </div>
      ) : null}
    </aside>
  );
}
