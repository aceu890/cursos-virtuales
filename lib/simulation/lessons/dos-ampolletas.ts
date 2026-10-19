import type { CircuitLessonDefinition } from "../flowTypes";
import {
  CABLES_SERIE_DOS,
  PARTES_DOS_AMPOLLETAS,
  PIEZAS_DOS_AMPOLLETAS,
} from "./layouts";

export const DOS_AMPOLLETAS: CircuitLessonDefinition = {
  simulation: "circuit",
  concepto:
    "En un circuito en serie la corriente es la misma en todo el camino: sale del polo +, pasa por el interruptor y por cada carga, y vuelve al polo −. Si una ampolleta queda fuera del loop, esa no enciende: la corriente eligió un atajo. Las dos tienen que estar en el mismo círculo, una después de la otra. Las piezas ya están en el tablero: únelas en serie.",
  objetivo: "Haz que las dos ampolletas se enciendan",
  lectura: [
    {
      type: "h2",
      text: "Una fila, una corriente",
    },
    {
      type: "p",
      text: "En serie no hay atajos: si una ampolleta se suelta, las dos se apagan. El puente entre las dos sigue siendo fase hasta que vuelves al −.",
    },
    {
      type: "ul",
      items: [
        "Camino único: + → interruptor → carga 1 → carga 2 → −.",
        "Si una queda fuera del círculo, esa no enciende.",
        "Más adelante verás el paralelo, donde cada una tiene su propio camino.",
      ],
    },
  ],
  pistaInicial:
    "Los dos portalámparas ya están en el tablero. Únelos en un solo camino: + → interruptor → portalámparas 1 → portalámparas 2 → −. Los cables van a los bornes del portalámparas, no a la ampolleta. Enciende el interruptor y pulsa Comprobar.",
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
    cables: [],
    interruptorCerrado: false,
  },
  solucion: {
    explicacion:
      "Esta es una solución: el cable rojo (fase) va del + al interruptor, llega a un borne del primer portalámparas y sigue al segundo. El puente entre los dos es fase, no neutro: aún no volviste al polo −. El cable blanco (neutro) es el retorno del último portalámparas al −. Tierra va a la carcasa, en verde. Los cables se aprietan en los tornillos del portalámparas, no en la ampolleta. El interruptor queda encendido y las dos ampolletas se iluminan.",
    piezas: PIEZAS_DOS_AMPOLLETAS,
    cables: CABLES_SERIE_DOS,
    interruptorCerrado: true,
  },
};
