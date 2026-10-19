import type { CircuitLessonDefinition } from "../flowTypes";
import {
  CABLES_PARALELO,
  PARTES_DOS_AMPOLLETAS,
  PIEZAS_PARALELO,
} from "./layouts";

export const EN_PARALELO: CircuitLessonDefinition = {
  simulation: "circuit",
  concepto:
    "En paralelo cada ampolleta tiene su propio camino entre + y −. No van una detrás de la otra: las dos se alimentan desde el mismo punto, después del interruptor, y cada una vuelve por su lado.",
  objetivo: "Enciende las dos ampolletas en paralelo",
  lectura: [
    {
      type: "h2",
      text: "Dos caminos, misma fuente",
    },
    {
      type: "p",
      text: "En casa las luces y los enchufes van en paralelo: si se funde una ampolleta, las demás siguen. Aquí vas a armarlo: del interruptor salen dos fases, y cada carga tiene su neutro de vuelta.",
    },
    {
      type: "ul",
      items: [
        "Del interruptor, un cable a cada portalámparas.",
        "De cada portalámparas, su propio retorno al −.",
        "Tierra a cada carcasa, sin pasar por el interruptor.",
      ],
    },
  ],
  pistaInicial:
    "Únelas en paralelo: del + al interruptor, del interruptor a un borne de cada portalámparas, y de cada uno de vuelta al −. Enciende el interruptor y pulsa Comprobar.",
  componentesDisponibles: PARTES_DOS_AMPOLLETAS,
  reglas: {
    requiereCircuitoCerrado: true,
    componentesObligatorios: ["battery", "switch", "bulb"],
    maxConexionesPorTerminal: 2,
    minPorTipo: { bulb: 2 },
  },
  tableroInicial: {
    piezas: PIEZAS_PARALELO,
    cables: [],
    interruptorCerrado: false,
  },
  solucion: {
    explicacion:
      "Esta es una solución: el interruptor alimenta a las dos ampolletas a la vez. Cada una vuelve al − por su propio cable. Si una se suelta, la otra puede seguir encendida.",
    piezas: PIEZAS_PARALELO,
    cables: CABLES_PARALELO,
    interruptorCerrado: true,
  },
};
