import type { CircuitLessonDefinition } from "../flowTypes";
import { CABLES_SERIE_SIMPLE, PARTES_BASICO, PIEZAS_CIRCUITO } from "./layouts";

export const EL_INTERRUPTOR: CircuitLessonDefinition = {
  simulation: "circuit",
  concepto:
    "El interruptor no crea electricidad: solo abre o cierra el camino. Encendido (cerrado), las patas se tocan y la corriente puede pasar. Apagado (abierto), hay un hueco: da igual que los cables estén bien, el circuito queda cortado. En casa pasa igual con el interruptor de la luz. En este tablero el circuito ya está armado; tú decides si dejas pasar la corriente.",
  objetivo: "Enciende el interruptor y observa que la ampolleta se ilumina",
  lectura: [
    {
      type: "h2",
      text: "Abrir y cerrar el paso",
    },
    {
      type: "p",
      text: "Un interruptor unipolar se pone en la fase, no en el neutro. Así, al apagar, la carga queda sin tensión de trabajo. Aquí solo tienes que sentirlo: un clic enciende, otro clic apaga.",
    },
    {
      type: "ul",
      items: [
        "Encendido = camino cerrado = hay luz.",
        "Apagado = hueco = la ampolleta se apaga aunque los cables sigan ahí.",
        "Más adelante verás por qué nunca se corta solo el neutro.",
      ],
    },
  ],
  pistaInicial:
    "El circuito ya está cableado, pero el interruptor está apagado. Enciéndelo y pulsa Comprobar. Si lo apagas otra vez, la ampolleta se apaga aunque los cables sigan ahí.",
  componentesDisponibles: PARTES_BASICO,
  reglas: {
    requiereCircuitoCerrado: true,
    componentesObligatorios: ["battery", "switch", "bulb"],
    maxConexionesPorTerminal: 1,
  },
  tableroInicial: {
    piezas: PIEZAS_CIRCUITO,
    cables: CABLES_SERIE_SIMPLE,
    interruptorCerrado: false,
  },
  solucion: {
    explicacion:
      "Los cables ya unían las piezas. Solo faltaba cerrar el interruptor: al encenderlo el camino se completa y la ampolleta se ilumina. Si lo apagas, el hueco vuelve y la luz se corta.",
    piezas: PIEZAS_CIRCUITO,
    cables: CABLES_SERIE_SIMPLE,
    interruptorCerrado: true,
  },
};
