import type { CircuitLessonDefinition } from "../flowTypes";
import {
  CABLES_SERIE_SIMPLE,
  CABLES_TRABAJO_SIMPLE,
  PARTES_BASICO,
  PIEZAS_CIRCUITO,
} from "./layouts";

export const TIERRA_DE_PROTECCION: CircuitLessonDefinition = {
  simulation: "circuit",
  concepto:
    "La ampolleta ya puede encender con fase y neutro. La tierra de protección es otro conductor: no alimenta la luz, protege. Une la carcasa del portalámparas al conector de tierra. Ese cable no pasa por el interruptor.",
  objetivo: "Une la tierra de protección y deja la ampolleta encendida",
  lectura: [
    {
      type: "h2",
      text: "El tercer conductor",
    },
    {
      type: "p",
      text: "Fase y neutro hacen el trabajo. El PE (tierra) es el camino de seguridad: si una parte metálica queda en contacto con la fase, la fuga se va a tierra y las protecciones pueden cortar. Nunca uses la tierra como neutro ni la pases por el interruptor.",
    },
    {
      type: "ul",
      items: [
        "Verde: del borne de tierra del portalámparas al conector de tierra.",
        "La luz puede encender sin PE; igual no es una instalación completa.",
        "Tierra no se corta: el interruptor va en la fase.",
      ],
    },
  ],
  pistaInicial:
    "La ampolleta ya enciende: fase y neutro bastan para la luz. Falta el verde de protección. Une el borne de tierra del portalámparas con el conector de tierra y pulsa Comprobar.",
  componentesDisponibles: PARTES_BASICO,
  reglas: {
    requiereCircuitoCerrado: true,
    componentesObligatorios: ["battery", "switch", "bulb"],
    maxConexionesPorTerminal: 1,
    requiereTierra: true,
  },
  tableroInicial: {
    piezas: PIEZAS_CIRCUITO,
    cables: CABLES_TRABAJO_SIMPLE,
    interruptorCerrado: true,
  },
  solucion: {
    explicacion:
      "Esta es una solución: fase y neutro ya encendían la ampolleta. El cable verde une la carcasa al conector de tierra. La tierra no pasa por el interruptor.",
    piezas: PIEZAS_CIRCUITO,
    cables: CABLES_SERIE_SIMPLE,
    interruptorCerrado: true,
  },
};
