import type { ComponentKind } from "./types";

/** Bornes de protecciones bipolares: fase y neutro entran arriba y salen abajo. */
export const RCD_POLES = [
  { line: "lineL", load: "loadL", role: "fase" as const },
  { line: "lineN", load: "loadN", role: "neutro" as const },
];

export function isBipolarBreaker(kind?: ComponentKind): boolean {
  return kind === "mainSwitch" || kind === "rcd" || kind === "mcb";
}

export function rcdTerminalRole(
  terminalId: string | null | undefined,
): "fase" | "neutro" | null {
  if (terminalId === "lineL" || terminalId === "loadL") {
    return "fase";
  }
  if (terminalId === "lineN" || terminalId === "loadN") {
    return "neutro";
  }
  return null;
}

/** Interruptor de palanca y protecciones del tablero: conducen solo si están cerrados. */
export function isSwitchLike(kind: ComponentKind): boolean {
  return (
    kind === "switch" ||
    kind === "mainSwitch" ||
    kind === "rcd" ||
    kind === "mcb"
  );
}

export type MeterMode = "tension" | "corriente" | "continuidad";

/** El medidor de corriente, o el multímetro en amperes, se pone en serie. */
export function isPassThrough(kind: ComponentKind, mode?: MeterMode): boolean {
  if (kind === "ammeter") {
    return true;
  }
  return kind === "multimeter" && mode === "corriente";
}

/** El voltímetro, o el multímetro en voltios, se pone en paralelo y no une sus bornes. */
export function isVoltmeter(kind: ComponentKind, mode?: MeterMode): boolean {
  if (kind === "voltmeter") {
    return true;
  }
  return kind === "multimeter" && (mode ?? "tension") === "tension";
}

/** Cargas de dos bornes en el grafo de potencia (no el electrodoméstico: se enchufa). */
export function isLoad(kind: ComponentKind): boolean {
  return kind === "bulb" || kind === "resistor" || kind === "led";
}

/** Carga en el camino de corriente: ampolleta o tomacorriente con algo enchufado. */
export function isCircuitLoad(component: {
  kind: ComponentKind;
  state?: { watts?: number };
}): boolean {
  if (component.kind === "outlet") {
    return (component.state?.watts ?? 0) > 0;
  }
  return isLoad(component.kind);
}

/** Batería o poste de la red: origen de fase y neutro. */
export function isSource(kind: ComponentKind): boolean {
  return kind === "battery" || kind === "lightPole";
}

export function sourcePoles(component: {
  kind: ComponentKind;
  terminals: Array<{ id: string; polarity?: string }>;
}): { liveId: string; returnId: string } | null {
  if (component.kind === "battery") {
    const live = component.terminals.find(
      (terminal) =>
        terminal.id === "positive" || terminal.polarity === "positive",
    );
    const ret = component.terminals.find(
      (terminal) =>
        terminal.id === "negative" || terminal.polarity === "negative",
    );
    if (live && ret) {
      return { liveId: live.id, returnId: ret.id };
    }
    return null;
  }
  if (component.kind === "lightPole") {
    return { liveId: "lineL", returnId: "lineN" };
  }
  return null;
}

/** ~60 W sobre 220 V: una ampolleta de alumbrado típica. */
export const AMPS_PER_BULB = 0.27;
export const SUPPLY_VOLTS = 220;
/** Calibre de un automático de enchufes en el tablero de práctica. */
export const MCB_TRIP_AMPS = 10;

export function formatAmps(value: number): string {
  return `${value.toFixed(2).replace(".", ",")} A`;
}

export function formatEnergyWh(value: number): string {
  if (value < 1) {
    return `${(value * 1000).toFixed(1).replace(".", ",")} mWh`;
  }
  return `${value.toFixed(2).replace(".", ",")} Wh`;
}

export function formatVolts(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "—";
  }
  return `${Math.round(value)} V`;
}

export function loadAmps(
  kind: ComponentKind,
  watts?: number,
): number {
  if (kind === "appliance" || kind === "outlet") {
    return (watts ?? 0) / SUPPLY_VOLTS;
  }
  if (kind === "bulb") {
    return AMPS_PER_BULB;
  }
  return 0;
}
