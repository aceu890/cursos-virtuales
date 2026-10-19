import type { CircuitLessonDefinition } from "../flowTypes";
import { CABLES_SERIE_SIMPLE, PARTES_BASICO, PIEZAS_CIRCUITO } from "./layouts";

const CABLES_NEUTRO_CONMUTADO = [
  {
    from: { kind: "battery" as const, terminalId: "positive" },
    to: { kind: "bulb" as const, terminalId: "a" },
  },
  {
    from: { kind: "bulb" as const, terminalId: "b" },
    to: { kind: "switch" as const, terminalId: "a" },
  },
  {
    from: { kind: "switch" as const, terminalId: "b" },
    to: { kind: "battery" as const, terminalId: "negative" },
  },
  {
    from: { kind: "bulb" as const, terminalId: "earth" },
    to: { kind: "ground" as const, terminalId: "earth" },
  },
];

export const INTERRUPTOR_EN_FASE: CircuitLessonDefinition = {
  simulation: "circuit",
  concepto:
    "Este circuito enciende, pero el interruptor está del lado del neutro. La fase sigue llegando a la carga aunque apagues. Eso es peligroso: la ampolleta parece muerta y el portalámparas sigue vivo. Muévelo a la fase.",
  objetivo: "Coloca el interruptor en la fase, no en el neutro",
  lectura: [
    {
      type: "h2",
      text: "Apagar de verdad",
    },
    {
      type: "p",
      text: "Un interruptor unipolar se instala en la fase. Si cortas solo el neutro, la luz se apaga y la tensión de trabajo sigue en la carga. En el tablero vas a ver el aviso: corrige el cableado hasta que el interruptor quede entre el + y la ampolleta.",
    },
    {
      type: "ul",
      items: [
        "Quita los cables de trabajo (doble clic) y vuelve a unir.",
        "Camino correcto: + → interruptor → carga → −.",
        "La tierra se queda: no la pases por el interruptor.",
      ],
    },
  ],
  pistaInicial:
    "La ampolleta puede encender, pero el interruptor está cortando el neutro. Desarma los cables de trabajo y pon el interruptor entre el + y la carga. Después pulsa Comprobar.",
  componentesDisponibles: PARTES_BASICO,
  reglas: {
    requiereCircuitoCerrado: true,
    componentesObligatorios: ["battery", "switch", "bulb"],
    maxConexionesPorTerminal: 1,
  },
  tableroInicial: {
    piezas: PIEZAS_CIRCUITO,
    cables: CABLES_NEUTRO_CONMUTADO,
    interruptorCerrado: true,
  },
  solucion: {
    explicacion:
      "Esta es una solución: el interruptor quedó en la fase, entre el + y la carga. Al apagar, la ampolleta queda sin tensión de trabajo. Cortar solo el neutro encendía la luz, pero no era seguro.",
    piezas: PIEZAS_CIRCUITO,
    cables: CABLES_SERIE_SIMPLE,
    interruptorCerrado: true,
  },
};
