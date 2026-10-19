import type { CircuitLessonDefinition } from "../flowTypes";
import { CABLES_SERIE_SIMPLE, PARTES_BASICO, PIEZAS_CIRCUITO } from "./layouts";

export const CIRCUITO_SIMPLE: CircuitLessonDefinition = {
  simulation: "circuit",
  concepto:
    "Un circuito cerrado es un camino continuo por donde puede circular la corriente: sale del polo +, pasa por el interruptor y la carga, y vuelve al polo −. Si falta un cable o el interruptor está apagado, el camino se corta y la ampolleta no enciende. Las piezas ya están en el tablero: únelas con cables.",
  objetivo: "Haz que la ampolleta se encienda",
  lectura: [
    {
      type: "h2",
      text: "Tres piezas, un círculo",
    },
    {
      type: "p",
      text: "La batería empuja, el interruptor decide si deja pasar, la ampolleta convierte esa corriente en luz. Sin el círculo completo no hay trabajo: la electricidad no “salta” el hueco.",
    },
    {
      type: "ul",
      items: [
        "Fase (rojo): del + al interruptor y de ahí a un borne de la carga.",
        "Neutro (blanco): del otro borne de vuelta al −.",
        "Si el interruptor está apagado, el círculo se abre aunque los cables estén bien.",
      ],
    },
  ],
  pistaInicial:
    "Las piezas ya están en el tablero. Únelas: del + al interruptor, del interruptor a un borne del portalámparas y del otro borne de vuelta al −. Los cables van al portalámparas, no a la ampolleta. Enciende el interruptor y pulsa Comprobar.",
  componentesDisponibles: PARTES_BASICO,
  reglas: {
    requiereCircuitoCerrado: true,
    componentesObligatorios: ["battery", "switch", "bulb"],
    maxConexionesPorTerminal: 1,
  },
  tableroInicial: {
    piezas: PIEZAS_CIRCUITO,
    cables: [],
    interruptorCerrado: false,
  },
  solucion: {
    explicacion:
      "Esta es una solución: cable rojo (fase) del + al interruptor y de ahí a un borne del portalámparas; cable blanco (neutro) del otro borne de vuelta al −; cable verde (tierra) a la carcasa del portalámparas. Los cables no van a la ampolleta: van a los tornillos del portalámparas. El interruptor queda encendido y la ampolleta se ilumina.",
    piezas: PIEZAS_CIRCUITO,
    cables: CABLES_SERIE_SIMPLE,
    interruptorCerrado: true,
  },
};
