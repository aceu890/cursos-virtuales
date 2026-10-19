import type { CircuitLessonDefinition } from "../flowTypes";
import { PIEZAS_RED } from "./layouts";

const CABLES_RED = [
  {
    from: { kind: "lightPole" as const, terminalId: "lineL" },
    to: { kind: "switch" as const, terminalId: "a" },
  },
  {
    from: { kind: "switch" as const, terminalId: "b" },
    to: { kind: "bulb" as const, terminalId: "a" },
  },
  {
    from: { kind: "bulb" as const, terminalId: "b" },
    to: { kind: "lightPole" as const, terminalId: "lineN" },
  },
  {
    from: { kind: "bulb" as const, terminalId: "earth" },
    to: { kind: "ground" as const, terminalId: "earth" },
  },
];

export const DE_LA_PILA_A_LA_RED: CircuitLessonDefinition = {
  simulation: "circuit",
  concepto:
    "La pila era para aprender el círculo. Ahora la fuente es el poste: fase y neutro de 220 V. El circuito es el mismo —interruptor en la fase, carga, retorno, tierra— pero ya parece una lámpara de casa. El Laboratorio te espera con el tablero completo.",
  objetivo: "Enciende la lámpara desde el poste de 220 V",
  lectura: [
    {
      type: "h2",
      text: "Mismo círculo, otra fuente",
    },
    {
      type: "p",
      text: "Fase del poste al interruptor, del interruptor a la carga, neutro de vuelta al poste, tierra a la carcasa. Eso es alumbrado básico. En el Laboratorio puedes seguir: protecciones, tomacorrientes, fugas y el tablero de una vivienda. Aquí ya tienes el oficio de unir bien.",
    },
    {
      type: "ul",
      items: [
        "Fase (L) al interruptor, nunca el neutro.",
        "Neutro (N) de la carga de vuelta al poste.",
        "Cuando termines, ábrelo otra vez en el Laboratorio y súmale protecciones.",
      ],
    },
  ],
  pistaInicial:
    "El poste es la fuente: une la fase al interruptor y a la carga, el neutro de vuelta al poste, y la tierra a la carcasa. Enciende y pulsa Comprobar.",
  componentesDisponibles: [
    { kind: "lightPole", label: "Poste de luz", count: 1 },
    { kind: "switch", label: "Interruptor", count: 1 },
    { kind: "bulb", label: "Portalámparas", count: 1 },
    { kind: "ground", label: "Tierra", count: 1 },
  ],
  reglas: {
    requiereCircuitoCerrado: true,
    componentesObligatorios: ["lightPole", "switch", "bulb"],
    maxConexionesPorTerminal: 1,
    requiereTierra: true,
  },
  tableroInicial: {
    piezas: PIEZAS_RED,
    cables: [],
    interruptorCerrado: false,
  },
  solucion: {
    explicacion:
      "Esta es una solución: la corriente sale por la fase del poste, pasa por el interruptor y la ampolleta, y vuelve por el neutro. La tierra queda en la carcasa. Es el mismo círculo de la primera lección, ahora con 220 V. El siguiente paso está en el Laboratorio.",
    piezas: PIEZAS_RED,
    cables: CABLES_RED,
    interruptorCerrado: true,
  },
};
