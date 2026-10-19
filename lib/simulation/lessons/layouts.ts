import type { AvailablePart, CircuitSolutionWire } from "../flowTypes";

/** Piezas alineadas en fila, con tierra debajo de la última ampolleta. */
export const PIEZAS_CIRCUITO = [
  { kind: "battery" as const, position: { x: 24, y: 90 } },
  { kind: "switch" as const, position: { x: 360, y: 70 } },
  { kind: "bulb" as const, position: { x: 680, y: 28 } },
  { kind: "ground" as const, position: { x: 680, y: 400 } },
];

export const PIEZAS_DOS_AMPOLLETAS = [
  { kind: "battery" as const, position: { x: 24, y: 90 } },
  { kind: "switch" as const, position: { x: 340, y: 70 } },
  { kind: "bulb" as const, position: { x: 640, y: 28 } },
  { kind: "bulb" as const, position: { x: 900, y: 28 } },
  { kind: "ground" as const, position: { x: 900, y: 420 } },
];

export const PIEZAS_PARALELO = [
  { kind: "battery" as const, position: { x: 24, y: 180 } },
  { kind: "switch" as const, position: { x: 340, y: 160 } },
  { kind: "bulb" as const, position: { x: 680, y: 28 } },
  { kind: "bulb" as const, position: { x: 680, y: 310 } },
  { kind: "ground" as const, position: { x: 920, y: 310 } },
];

export const PIEZAS_VOLTIMETRO = [
  { kind: "battery" as const, position: { x: 200, y: 90 } },
  { kind: "voltmeter" as const, position: { x: 560, y: 40 } },
];

export const PIEZAS_AMPERIMETRO = [
  { kind: "battery" as const, position: { x: 24, y: 90 } },
  { kind: "switch" as const, position: { x: 300, y: 70 } },
  { kind: "ammeter" as const, position: { x: 540, y: 40 } },
  { kind: "bulb" as const, position: { x: 820, y: 28 } },
  { kind: "ground" as const, position: { x: 820, y: 400 } },
];

export const PIEZAS_DOS_MEDIDORES = [
  { kind: "battery" as const, position: { x: 24, y: 90 } },
  { kind: "switch" as const, position: { x: 280, y: 70 } },
  { kind: "ammeter" as const, position: { x: 500, y: 40 } },
  { kind: "bulb" as const, position: { x: 760, y: 28 } },
  { kind: "voltmeter" as const, position: { x: 24, y: 380 } },
  { kind: "ground" as const, position: { x: 760, y: 400 } },
];

export const PIEZAS_TOMACORRIENTE = [
  { kind: "battery" as const, position: { x: 24, y: 90 } },
  { kind: "switch" as const, position: { x: 300, y: 70 } },
  { kind: "outlet" as const, position: { x: 560, y: 40 } },
  {
    kind: "appliance" as const,
    applianceId: "computador",
    encendido: true,
    position: { x: 840, y: 80 },
  },
  { kind: "ground" as const, position: { x: 560, y: 400 } },
];

export const PIEZAS_RED = [
  { kind: "lightPole" as const, position: { x: 24, y: 20 } },
  { kind: "switch" as const, position: { x: 360, y: 70 } },
  { kind: "bulb" as const, position: { x: 680, y: 28 } },
  { kind: "ground" as const, position: { x: 680, y: 400 } },
];

export const PARTES_BASICO: AvailablePart[] = [
  { kind: "battery", label: "Batería", count: 1 },
  { kind: "switch", label: "Interruptor", count: 1 },
  { kind: "bulb", label: "Portalámparas", count: 1 },
  { kind: "ground", label: "Tierra", count: 1 },
];

export const PARTES_DOS_AMPOLLETAS: AvailablePart[] = [
  { kind: "battery", label: "Batería", count: 1 },
  { kind: "switch", label: "Interruptor", count: 1 },
  { kind: "bulb", label: "Portalámparas", count: 2 },
  { kind: "ground", label: "Tierra", count: 1 },
];

export const CABLES_TRABAJO_SIMPLE: CircuitSolutionWire[] = [
  {
    from: { kind: "battery", terminalId: "positive" },
    to: { kind: "switch", terminalId: "a" },
  },
  {
    from: { kind: "switch", terminalId: "b" },
    to: { kind: "bulb", terminalId: "a" },
  },
  {
    from: { kind: "bulb", terminalId: "b" },
    to: { kind: "battery", terminalId: "negative" },
  },
];

export const CABLES_TIERRA_SIMPLE: CircuitSolutionWire[] = [
  {
    from: { kind: "bulb", terminalId: "earth" },
    to: { kind: "ground", terminalId: "earth" },
  },
];

export const CABLES_SERIE_SIMPLE: CircuitSolutionWire[] = [
  ...CABLES_TRABAJO_SIMPLE,
  ...CABLES_TIERRA_SIMPLE,
];

export const CABLES_SERIE_DOS: CircuitSolutionWire[] = [
  {
    from: { kind: "battery", terminalId: "positive" },
    to: { kind: "switch", terminalId: "a" },
  },
  {
    from: { kind: "switch", terminalId: "b" },
    to: { kind: "bulb", terminalId: "a", index: 0 },
  },
  {
    from: { kind: "bulb", terminalId: "b", index: 0 },
    to: { kind: "bulb", terminalId: "a", index: 1 },
  },
  {
    from: { kind: "bulb", terminalId: "b", index: 1 },
    to: { kind: "battery", terminalId: "negative" },
  },
  {
    from: { kind: "bulb", terminalId: "earth", index: 1 },
    to: { kind: "ground", terminalId: "earth" },
  },
];

export const CABLES_PARALELO: CircuitSolutionWire[] = [
  {
    from: { kind: "battery", terminalId: "positive" },
    to: { kind: "switch", terminalId: "a" },
  },
  {
    from: { kind: "switch", terminalId: "b" },
    to: { kind: "bulb", terminalId: "a", index: 0 },
  },
  {
    from: { kind: "switch", terminalId: "b" },
    to: { kind: "bulb", terminalId: "a", index: 1 },
  },
  {
    from: { kind: "bulb", terminalId: "b", index: 0 },
    to: { kind: "battery", terminalId: "negative" },
  },
  {
    from: { kind: "bulb", terminalId: "b", index: 1 },
    to: { kind: "battery", terminalId: "negative" },
  },
  {
    from: { kind: "bulb", terminalId: "earth", index: 0 },
    to: { kind: "ground", terminalId: "earth" },
  },
  {
    from: { kind: "bulb", terminalId: "earth", index: 1 },
    to: { kind: "ground", terminalId: "earth" },
  },
];
