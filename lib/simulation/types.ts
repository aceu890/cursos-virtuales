/**
 * Tipos del motor de circuitos.
 * `resistor` y `led` quedan listos para lecciones futuras; el MVP solo usa
 * batería, interruptor y ampolleta.
 */
export type ComponentKind =
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
  | "resistor"
  | "led";

export type TerminalPolarity = "positive" | "negative" | "a" | "b" | "earth";

export interface Terminal {
  id: string;
  polarity: TerminalPolarity;
}

export interface ComponentState {
  switchClosed?: boolean;
  /** Potencia nominal de un electrodoméstico, o suma enchufada en un tomacorriente. */
  watts?: number;
  /** Electrodomésticos enchufados a este tomacorriente. */
  pluggedIds?: string[];
  /** Calibre del automático, en amperes. */
  tripAmps?: number;
  /** Escala del multímetro. */
  meterMode?: "tension" | "corriente" | "continuidad";
  /** Reservado: resistencia en ohmios (no usado en el MVP). */
  resistanceOhms?: number;
}

export interface CircuitComponent {
  id: string;
  kind: ComponentKind;
  terminals: Terminal[];
  state?: ComponentState;
}

export interface TerminalRef {
  componentId: string;
  terminalId: string;
}

export interface Wire {
  id: string;
  from: TerminalRef;
  to: TerminalRef;
}

export interface ValidationRules {
  requiereCircuitoCerrado: boolean;
  componentesObligatorios: ComponentKind[];
  maxConexionesPorTerminal: number;
  minPorTipo?: Partial<Record<ComponentKind, number>>;
  /** Si es true, no vale un paralelo: apagar una carga debe abrir el circuito. */
  requiereSerie?: boolean;
  /** Si es true, cada carga debe tener el conductor de protección unido a tierra. */
  requiereTierra?: boolean;
  /** Si es true, hay que leer tensión con el voltímetro en paralelo. */
  requiereMedicion?: boolean;
}

export interface CircuitGraph {
  components: CircuitComponent[];
  wires: Wire[];
  reglas?: ValidationRules;
}

export type CircuitEstado =
  | "correcto"
  | "circuito_abierto"
  | "componente_sin_conectar"
  | "conexion_invalida"
  | "incompleto";

export type FeedbackKind = "error" | "exito" | "pista";

export interface FeedbackMessage {
  tipo: FeedbackKind;
  codigo: string;
  texto: string;
}

export interface ProtectionTrip {
  id: string;
  tipo: "sobrecarga" | "fuga";
  texto: string;
}

export interface EvaluationResult {
  estado: CircuitEstado;
  mensajes: FeedbackMessage[];
  energizados: string[];
  corrientes?: Record<string, number>;
  /** Electrodomésticos con tensión en el tomacorriente (pueden encenderse). */
  conTension?: string[];
  /** Piezas alcanzadas por la fase desde la fuente, aunque el circuito esté abierto. */
  vivos?: string[];
  /** Lectura de cada voltímetro: voltios, o null si un borne está suelto. */
  tensiones?: Record<string, number | null>;
  /** Detector de voltaje: true si la punta toca un punto con fase. */
  detectores?: Record<string, boolean>;
  /** Multímetro en continuidad: true si las sondas se tocan, null si falta un cable. */
  continuidades?: Record<string, boolean | null>;
  /** Avisos que no abren el circuito (p. ej. sin tierra). */
  avisos?: FeedbackMessage[];
  /** Protecciones que deben disparar con el estado actual. */
  disparos?: ProtectionTrip[];
}

export const DEFAULT_CIRCUIT_RULES: ValidationRules = {
  requiereCircuitoCerrado: true,
  componentesObligatorios: ["battery", "switch", "bulb"],
  maxConexionesPorTerminal: 1,
};
