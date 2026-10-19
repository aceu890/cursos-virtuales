import type { CircuitLessonDefinition } from "../flowTypes";
import {
  CABLES_SERIE_SIMPLE,
  CABLES_TIERRA_SIMPLE,
  CABLES_TRABAJO_SIMPLE,
  PARTES_BASICO,
  PIEZAS_CIRCUITO,
} from "./layouts";

export const CAMINO_CERRADO: CircuitLessonDefinition = {
  simulation: "circuit",
  concepto:
    "Si falta el cable de vuelta, la corriente sale pero no tiene por dónde regresar. El círculo queda abierto: la ampolleta no enciende aunque el interruptor esté bien. Completa el retorno y verás la diferencia de un solo cable.",
  objetivo: "Cierra el camino: une el retorno y enciende la ampolleta",
  lectura: [
    {
      type: "h2",
      text: "Ida y vuelta",
    },
    {
      type: "p",
      text: "La corriente no se “gasta” en la ampolleta y desaparece. Recorre el circuito y vuelve a la fuente. Sin el neutro (el −), no hay circuito, por más que la fase esté perfecta.",
    },
    {
      type: "ul",
      items: [
        "Ya tienes la ida: del + al interruptor y a la carga.",
        "Falta el retorno: del otro borne de la carga al −.",
        "Un cable suelto abre todo el círculo.",
      ],
    },
  ],
  pistaInicial:
    "Falta el cable de vuelta. Une el borne libre del portalámparas con el polo −, enciende el interruptor y pulsa Comprobar.",
  componentesDisponibles: PARTES_BASICO,
  reglas: {
    requiereCircuitoCerrado: true,
    componentesObligatorios: ["battery", "switch", "bulb"],
    maxConexionesPorTerminal: 1,
  },
  tableroInicial: {
    piezas: PIEZAS_CIRCUITO,
    cables: [
      ...CABLES_TRABAJO_SIMPLE.slice(0, 2),
      ...CABLES_TIERRA_SIMPLE,
    ],
    interruptorCerrado: true,
  },
  solucion: {
    explicacion:
      "Esta es una solución: el último cable cierra el círculo. La corriente sale del +, pasa por el interruptor y la ampolleta, y vuelve al −. Sin ese retorno no hay luz.",
    piezas: PIEZAS_CIRCUITO,
    cables: CABLES_SERIE_SIMPLE,
    interruptorCerrado: true,
  },
};
