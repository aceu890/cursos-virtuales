import type { TerminalRole } from "./cables";
import type { ComponentKind, Terminal } from "./types";

export interface CircuitNodeData extends Record<string, unknown> {
  kind: ComponentKind;
  label: string;
  terminals: Terminal[];
  switchClosed?: boolean;
  energized?: boolean;
  live?: boolean;
  hasSupply?: boolean;
  currentAmps?: number;
  selectedTerminalId?: string | null;
  onToggleSwitch?: () => void;
  onTestTrip?: () => void;
  onSelectTerminal?: (terminalId: string) => void;
  onDisconnectTerminal?: (terminalId: string) => void;
  onRemove?: () => void;
  terminalRoles?: Partial<Record<string, TerminalRole>>;
  applianceId?: string;
  watts?: number;
  src?: string;
  tripAmps?: number;
  tripped?: boolean;
  trippedReason?: "sobrecarga" | "fuga" | "prueba";
  voltageVolts?: number | null;
  meterMode?: "tension" | "corriente" | "continuidad";
  detectorOn?: boolean;
  continuity?: boolean | null;
  onCycleMeter?: () => void;
}

export type PlaceableKind = Extract<
  ComponentKind,
  | "battery"
  | "switch"
  | "bulb"
  | "ground"
  | "mainSwitch"
  | "rcd"
  | "mcb"
  | "ammeter"
  | "voltmeter"
  | "multimeter"
  | "voltageDetector"
  | "lightPole"
  | "outlet"
  | "appliance"
>;

export interface AvailablePart {
  kind: PlaceableKind;
  label: string;
  count: number;
}

export interface CircuitSolutionWire {
  from: { kind: AvailablePart["kind"]; terminalId: string; index?: number };
  to: { kind: AvailablePart["kind"]; terminalId: string; index?: number };
}

export interface CircuitBoardLayout {
  piezas: Array<{
    kind: AvailablePart["kind"];
    position: { x: number; y: number };
    applianceId?: string;
    encendido?: boolean;
  }>;
  cables: CircuitSolutionWire[];
  interruptorCerrado: boolean;
}

export interface CircuitSolution extends CircuitBoardLayout {
  explicacion: string;
}

export interface LessonReadingBlock {
  type: "p" | "h2" | "ul";
  text?: string;
  items?: string[];
}

export interface CircuitLessonDefinition {
  simulation: "circuit";
  concepto: string;
  objetivo: string;
  /** Texto breve de la lección, encima del tablero. */
  lectura?: LessonReadingBlock[];
  componentesDisponibles: AvailablePart[];
  reglas: {
    requiereCircuitoCerrado: boolean;
    componentesObligatorios: Array<AvailablePart["kind"]>;
    maxConexionesPorTerminal: number;
    minPorTipo?: Partial<Record<AvailablePart["kind"], number>>;
    requiereSerie?: boolean;
    requiereTierra?: boolean;
    requiereMedicion?: boolean;
  };
  tableroInicial?: CircuitBoardLayout;
  pistaInicial?: string;
  solucion?: CircuitSolution;
}
