import type { CircuitLessonDefinition } from "../flowTypes";
import {
  CABLES_PARALELO,
  PARTES_DOS_AMPOLLETAS,
  PIEZAS_PARALELO,
} from "./layouts";

export const CAMINOS_INDEPENDIENTES: CircuitLessonDefinition = {
  simulation: "circuit",
  concepto:
    "Una sola ampolleta ya enciende. La otra espera su propio camino. En paralelo no las pones en fila: le das a la segunda su fase y su neutro. Así, si una se apaga, la otra no depende de ella.",
  objetivo: "Dale a la segunda ampolleta su propio camino",
  lectura: [
    {
      type: "h2",
      text: "Independencia",
    },
    {
      type: "p",
      text: "Esta es la idea que se lleva a una vivienda: cada carga tiene su ramal. El interruptor común corta las dos, pero entre ellas no se apagan juntas si una falla.",
    },
    {
      type: "ul",
      items: [
        "Del mismo borne del interruptor, un segundo cable a la otra carga.",
        "Esa carga también vuelve al − por su cuenta.",
        "No las pongas en serie: si lo haces, una depende de la otra.",
      ],
    },
  ],
  pistaInicial:
    "Una ampolleta ya está en el circuito. Une la segunda en paralelo: fase desde el interruptor y neutro de vuelta al −. Enciende y pulsa Comprobar.",
  componentesDisponibles: PARTES_DOS_AMPOLLETAS,
  reglas: {
    requiereCircuitoCerrado: true,
    componentesObligatorios: ["battery", "switch", "bulb"],
    maxConexionesPorTerminal: 2,
    minPorTipo: { bulb: 2 },
  },
  tableroInicial: {
    piezas: PIEZAS_PARALELO,
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
        from: { kind: "bulb", terminalId: "b", index: 0 },
        to: { kind: "battery", terminalId: "negative" },
      },
      {
        from: { kind: "bulb", terminalId: "earth", index: 0 },
        to: { kind: "ground", terminalId: "earth" },
      },
    ],
    interruptorCerrado: true,
  },
  solucion: {
    explicacion:
      "Esta es una solución: cada ampolleta tiene fase y neutro propios. El interruptor las alimenta a las dos, pero una no necesita a la otra para encender.",
    piezas: PIEZAS_PARALELO,
    cables: CABLES_PARALELO,
    interruptorCerrado: true,
  },
};
