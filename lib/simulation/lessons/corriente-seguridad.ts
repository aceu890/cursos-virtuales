import type { CircuitLessonDefinition } from "../flowTypes";
import { CABLES_SERIE_SIMPLE, PARTES_BASICO, PIEZAS_CIRCUITO } from "./layouts";

export const CORRIENTE_SEGURIDAD: CircuitLessonDefinition = {
  simulation: "circuit",
  concepto:
    "La corriente sale del polo +, recorre el circuito y vuelve al polo −. Si unes el + con el − sin pasar por el portalámparas, eliges un atajo: la carga no enciende y la batería se esfuerza de más. En la vida real un corto puede calentar cables. Practica aquí con la pila del tablero, nunca con el enchufe de la casa. En este tablero hay un atajo: quítalo con doble clic en el cable o en el borne, y arma el camino que pasa por el interruptor y el portalámparas.",
  objetivo: "Quita el corto y haz que la ampolleta se encienda",
  lectura: [
    {
      type: "h2",
      text: "La corriente elige el camino más fácil",
    },
    {
      type: "p",
      text: "Un corto es un atajo entre fase y neutro (o + y −) sin pasar por la carga. Aquí lo ves con la pila del tablero. En casa, un corto calienta cables y dispara protecciones. Nunca lo practiques en el enchufe de la vivienda.",
    },
    {
      type: "ul",
      items: [
        "Quita el cable que une + con −.",
        "Arma el círculo que pasa por el interruptor y el portalámparas.",
        "La corriente tiene que trabajar en la carga, no en un atajo.",
      ],
    },
  ],
  pistaInicial:
    "Hay un atajo entre el + y el −. Haz doble clic en el cable o en el borne para quitarlo. Después une las piezas por el interruptor y el portalámparas, enciende el interruptor y pulsa Comprobar. No uses el enchufe de la casa.",
  componentesDisponibles: PARTES_BASICO,
  reglas: {
    requiereCircuitoCerrado: true,
    componentesObligatorios: ["battery", "switch", "bulb"],
    maxConexionesPorTerminal: 1,
  },
  tableroInicial: {
    piezas: PIEZAS_CIRCUITO,
    cables: [
      {
        from: { kind: "battery", terminalId: "positive" },
        to: { kind: "battery", terminalId: "negative" },
      },
    ],
    interruptorCerrado: true,
  },
  solucion: {
    explicacion:
      "Esta es una solución: el atajo entre + y − desaparece. El cable rojo va del + al interruptor y de ahí a un borne del portalámparas; el blanco vuelve al −; el verde a tierra. El interruptor queda encendido. La corriente pasa por la carga, no por un corto.",
    piezas: PIEZAS_CIRCUITO,
    cables: CABLES_SERIE_SIMPLE,
    interruptorCerrado: true,
  },
};
