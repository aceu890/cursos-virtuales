import type { CircuitLessonDefinition } from "../flowTypes";
import {
  CABLES_SERIE_DOS,
  PARTES_DOS_AMPOLLETAS,
  PIEZAS_DOS_AMPOLLETAS,
} from "./layouts";

export const EL_PUENTE: CircuitLessonDefinition = {
  simulation: "circuit",
  concepto:
    "En serie las dos cargas se tocan con un puente: la corriente sale de una y entra a la otra antes de volver al −. Aquí ese puente falta. Sin él, una ampolleta queda fuera del círculo.",
  objetivo: "Pon el puente y enciende las dos ampolletas en serie",
  lectura: [
    {
      type: "h2",
      text: "El eslabón que falta",
    },
    {
      type: "p",
      text: "El puente entre las dos cargas sigue siendo fase: todavía no volviste al neutro. Unir mal ese tramo (por ejemplo al − demasiado pronto) deja una ampolleta a oscuras.",
    },
    {
      type: "ul",
      items: [
        "Une el borne libre de la primera carga con un borne de la segunda.",
        "El retorno al − sale solo de la última.",
        "Si una queda fuera, el camino eligió un atajo.",
      ],
    },
  ],
  pistaInicial:
    "Falta el puente entre los dos portalámparas. Únelos en serie, deja el retorno al − en la última carga, enciende el interruptor y pulsa Comprobar.",
  componentesDisponibles: PARTES_DOS_AMPOLLETAS,
  reglas: {
    requiereCircuitoCerrado: true,
    componentesObligatorios: ["battery", "switch", "bulb"],
    maxConexionesPorTerminal: 1,
    minPorTipo: { bulb: 2 },
    requiereSerie: true,
  },
  tableroInicial: {
    piezas: PIEZAS_DOS_AMPOLLETAS,
    cables: [
      {
        from: { kind: "battery", terminalId: "positive" },
        to: { kind: "switch", terminalId: "a" },
      },
      {
        from: { kind: "switch", terminalId: "b" },
        to: { kind: "bulb", terminalId: "a", index: 0 },
      },
      {
        from: { kind: "bulb", terminalId: "b", index: 1 },
        to: { kind: "battery", terminalId: "negative" },
      },
      {
        from: { kind: "bulb", terminalId: "earth", index: 1 },
        to: { kind: "ground", terminalId: "earth" },
      },
    ],
    interruptorCerrado: true,
  },
  solucion: {
    explicacion:
      "Esta es una solución: el puente une las dos cargas en un solo camino. La corriente recorre las dos, una después de la otra, y recién ahí vuelve al −.",
    piezas: PIEZAS_DOS_AMPOLLETAS,
    cables: CABLES_SERIE_DOS,
    interruptorCerrado: true,
  },
};
