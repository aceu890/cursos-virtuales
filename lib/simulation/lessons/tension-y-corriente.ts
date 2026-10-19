import type { CircuitLessonDefinition } from "../flowTypes";
import { PIEZAS_DOS_MEDIDORES } from "./layouts";

const CABLES_SERIE_CON_AMPERIMETRO = [
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

export const TENSION_Y_CORRIENTE: CircuitLessonDefinition = {
  simulation: "circuit",
  concepto:
    "Tensión y corriente no se miden igual. El circuito ya está en serie con el amperímetro: ves la corriente. Ahora agrega el voltímetro en paralelo, a caballo de + y −, para ver los 220 V. Dos lecturas, dos formas de conectar.",
  objetivo: "Lee tensión y corriente a la vez",
  lectura: [
    {
      type: "h2",
      text: "Dos medidores, dos reglas",
    },
    {
      type: "p",
      text: "El voltímetro se pone al lado del circuito (paralelo). El amperímetro se pone dentro (serie). Si los intercambias, o no lees nada, o haces un corto. Esta es la base para medir en un tablero de verdad.",
    },
    {
      type: "ul",
      items: [
        "El amperímetro ya está en el camino: no lo muevas.",
        "Une el voltímetro al + y al −, sin desarmar el resto.",
        "Debe encender la ampolleta y leer 220 V.",
      ],
    },
  ],
  pistaInicial:
    "El amperímetro ya está en serie. Une el voltímetro en paralelo: un borne al + y el otro al −. Enciende si hace falta y pulsa Comprobar.",
  componentesDisponibles: [
    { kind: "battery", label: "Batería", count: 1 },
    { kind: "switch", label: "Interruptor", count: 1 },
    { kind: "ammeter", label: "Medidor de corriente", count: 1 },
    { kind: "voltmeter", label: "Medidor de tensión", count: 1 },
    { kind: "bulb", label: "Portalámparas", count: 1 },
    { kind: "ground", label: "Tierra", count: 1 },
  ],
  reglas: {
    requiereCircuitoCerrado: true,
    componentesObligatorios: ["battery", "switch", "bulb", "ammeter", "voltmeter"],
    maxConexionesPorTerminal: 2,
    requiereMedicion: true,
  },
  tableroInicial: {
    piezas: PIEZAS_DOS_MEDIDORES,
    cables: CABLES_SERIE_CON_AMPERIMETRO,
    interruptorCerrado: true,
  },
  solucion: {
    explicacion:
      "Esta es una solución: el amperímetro sigue en serie y el voltímetro quedó en paralelo con la fuente. La ampolleta enciende, hay corriente en el camino y 220 V entre + y −.",
    piezas: PIEZAS_DOS_MEDIDORES,
    cables: [
      ...CABLES_SERIE_CON_AMPERIMETRO,
      {
        from: { kind: "voltmeter", terminalId: "a" },
        to: { kind: "battery", terminalId: "positive" },
      },
      {
        from: { kind: "voltmeter", terminalId: "b" },
        to: { kind: "battery", terminalId: "negative" },
      },
    ],
    interruptorCerrado: true,
  },
};
