import type { CircuitLessonDefinition } from "../flowTypes";
import { PIEZAS_AMPERIMETRO } from "./layouts";

const CABLES_CON_AMPERIMETRO = [
  {
    from: { kind: "battery" as const, terminalId: "positive" },
    to: { kind: "switch" as const, terminalId: "a" },
  },
  {
    from: { kind: "switch" as const, terminalId: "b" },
    to: { kind: "ammeter" as const, terminalId: "a" },
  },
  {
    from: { kind: "ammeter" as const, terminalId: "b" },
    to: { kind: "bulb" as const, terminalId: "a" },
  },
  {
    from: { kind: "bulb" as const, terminalId: "b" },
    to: { kind: "battery" as const, terminalId: "negative" },
  },
  {
    from: { kind: "bulb" as const, terminalId: "earth" },
    to: { kind: "ground" as const, terminalId: "earth" },
  },
];

export const MEDIR_CORRIENTE: CircuitLessonDefinition = {
  simulation: "circuit",
  concepto:
    "La corriente se mide en serie: el amperímetro se corta en el camino, como un eslabón más. Si lo pones a caballo entre + y −, haces un corto. Aquí el medidor espera en el tablero: insértalo entre el interruptor y la ampolleta.",
  objetivo: "Mide la corriente: pon el amperímetro en serie",
  lectura: [
    {
      type: "h2",
      text: "En el camino, no al lado",
    },
    {
      type: "p",
      text: "El amperímetro tiene que ser recorrido por la misma corriente que la carga. Por eso se abre el circuito, se mete el medidor y se cierra otra vez. En paralelo con la fuente es un atajo peligroso.",
    },
    {
      type: "ul",
      items: [
        "Del interruptor al borne A del medidor.",
        "Del borne B del medidor a la carga.",
        "Nunca del + al − pasando solo por el amperímetro.",
      ],
    },
  ],
  pistaInicial:
    "Inserta el medidor de corriente en el camino: interruptor → amperímetro → portalámparas → −. Enciende el interruptor y pulsa Comprobar. No lo pongas entre + y −.",
  componentesDisponibles: [
    { kind: "battery", label: "Batería", count: 1 },
    { kind: "switch", label: "Interruptor", count: 1 },
    { kind: "ammeter", label: "Medidor de corriente", count: 1 },
    { kind: "bulb", label: "Portalámparas", count: 1 },
    { kind: "ground", label: "Tierra", count: 1 },
  ],
  reglas: {
    requiereCircuitoCerrado: true,
    componentesObligatorios: ["battery", "switch", "bulb", "ammeter"],
    maxConexionesPorTerminal: 1,
  },
  tableroInicial: {
    piezas: PIEZAS_AMPERIMETRO,
    cables: [
      {
        from: { kind: "battery", terminalId: "positive" },
        to: { kind: "switch", terminalId: "a" },
      },
      {
        from: { kind: "bulb", terminalId: "b" },
        to: { kind: "battery", terminalId: "negative" },
      },
      {
        from: { kind: "bulb", terminalId: "earth" },
        to: { kind: "ground", terminalId: "earth" },
      },
    ],
    interruptorCerrado: true,
  },
  solucion: {
    explicacion:
      "Esta es una solución: el amperímetro quedó en serie, en el camino de la corriente. La ampolleta enciende y el medidor muestra cuánta corriente pasa. En paralelo habría sido un corto.",
    piezas: PIEZAS_AMPERIMETRO,
    cables: CABLES_CON_AMPERIMETRO,
    interruptorCerrado: true,
  },
};
