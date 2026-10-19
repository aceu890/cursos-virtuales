import type { CircuitLessonDefinition } from "../flowTypes";
import { PIEZAS_TOMACORRIENTE } from "./layouts";

const CABLES_TOMA = [
  {
    from: { kind: "battery" as const, terminalId: "positive" },
    to: { kind: "switch" as const, terminalId: "a" },
  },
  {
    from: { kind: "switch" as const, terminalId: "b" },
    to: { kind: "outlet" as const, terminalId: "lineL" },
  },
  {
    from: { kind: "outlet" as const, terminalId: "lineN" },
    to: { kind: "battery" as const, terminalId: "negative" },
  },
  {
    from: { kind: "outlet" as const, terminalId: "earth" },
    to: { kind: "ground" as const, terminalId: "earth" },
  },
  {
    from: { kind: "appliance" as const, terminalId: "plug" },
    to: { kind: "outlet" as const, terminalId: "socket0" },
  },
];

export const EL_TOMACORRIENTE: CircuitLessonDefinition = {
  simulation: "circuit",
  concepto:
    "Un tomacorriente es una carga con enchufe: le llegan fase, neutro y tierra, y el electrodoméstico se conecta al frente. No es el tablero de la casa: es el mismo círculo de siempre, con un enchufe en el medio.",
  objetivo: "Alimenta el tomacorriente y enchufa el equipo",
  lectura: [
    {
      type: "h2",
      text: "Tres bornes, un enchufe",
    },
    {
      type: "p",
      text: "Fase al borne L, neutro al N, tierra al PE. El electrodoméstico se enchufa al frente, no se cablea a la batería. Si omites la tierra, el equipo puede funcionar y igual queda inseguro.",
    },
    {
      type: "ul",
      items: [
        "Fase: + → interruptor → borne L del tomacorriente.",
        "Neutro: borne N de vuelta al −.",
        "Tierra al conector verde, y el enchufe al frente del tomacorriente.",
      ],
    },
  ],
  pistaInicial:
    "Une fase al borne L del tomacorriente (pasando por el interruptor), neutro al N, tierra al PE, y enchufa el computador al frente. Enciende y pulsa Comprobar.",
  componentesDisponibles: [
    { kind: "battery", label: "Batería", count: 1 },
    { kind: "switch", label: "Interruptor", count: 1 },
    { kind: "outlet", label: "Tomacorriente", count: 1 },
    { kind: "appliance", label: "Electrodoméstico", count: 1 },
    { kind: "ground", label: "Tierra", count: 1 },
  ],
  reglas: {
    requiereCircuitoCerrado: true,
    componentesObligatorios: ["battery", "switch", "outlet"],
    maxConexionesPorTerminal: 1,
    requiereTierra: true,
  },
  tableroInicial: {
    piezas: PIEZAS_TOMACORRIENTE,
    cables: [],
    interruptorCerrado: false,
  },
  solucion: {
    explicacion:
      "Esta es una solución: fase y neutro llegan al tomacorriente, la tierra va al PE y el computador está enchufado al frente. El interruptor corta la fase. La tierra no se corta.",
    piezas: PIEZAS_TOMACORRIENTE,
    cables: CABLES_TOMA,
    interruptorCerrado: true,
  },
};
