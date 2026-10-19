import type { CircuitLessonDefinition } from "../flowTypes";
import { CABLES_SERIE_SIMPLE, PARTES_BASICO, PIEZAS_CIRCUITO } from "./layouts";

export const COLORES_DE_CABLES: CircuitLessonDefinition = {
  simulation: "circuit",
  concepto:
    "En el tablero el color no es decoración: rojo es fase, blanco es neutro, verde es tierra. Arma otra vez el circuito simple, pero ahora fíjate en los colores. En una vivienda se lee el cable antes de tocarlo.",
  objetivo: "Arma el circuito respetando fase, neutro y tierra",
  lectura: [
    {
      type: "h2",
      text: "Leer un cable",
    },
    {
      type: "p",
      text: "Fase lleva la tensión de trabajo. Neutro cierra el circuito. Tierra protege. Mezclarlos —por ejemplo fase en un borne de neutro— es un error de oficio, no un atajo inteligente.",
    },
    {
      type: "ul",
      items: [
        "Rojo: del + al interruptor y a la carga.",
        "Blanco: de la carga de vuelta al −.",
        "Verde: carcasa al conector de tierra, sin interruptor por medio.",
      ],
    },
  ],
  pistaInicial:
    "Une fase (rojo) del + al interruptor y a la carga, neutro (blanco) de vuelta al −, y tierra (verde) a la carcasa. Enciende y pulsa Comprobar.",
  componentesDisponibles: PARTES_BASICO,
  reglas: {
    requiereCircuitoCerrado: true,
    componentesObligatorios: ["battery", "switch", "bulb"],
    maxConexionesPorTerminal: 1,
    requiereTierra: true,
  },
  tableroInicial: {
    piezas: PIEZAS_CIRCUITO,
    cables: [],
    interruptorCerrado: false,
  },
  solucion: {
    explicacion:
      "Esta es una solución: rojo en la fase, blanco en el neutro, verde en la tierra. El interruptor corta la fase. Los colores coinciden con el trabajo de cada conductor.",
    piezas: PIEZAS_CIRCUITO,
    cables: CABLES_SERIE_SIMPLE,
    interruptorCerrado: true,
  },
};
