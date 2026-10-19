import type { CircuitLessonDefinition } from "../flowTypes";
import { PIEZAS_VOLTIMETRO } from "./layouts";

export const MEDIR_TENSION: CircuitLessonDefinition = {
  simulation: "circuit",
  concepto:
    "La tensión se mide en paralelo: un borne del voltímetro a un lado de la fuente y el otro al lado contrario. El medidor no se mete en el camino de la corriente; se “acota” a caballo de fase y neutro (o + y −) y lee 220 V.",
  objetivo: "Mide 220 V: pon el voltímetro en paralelo con la fuente",
  lectura: [
    {
      type: "h2",
      text: "Entre dos puntos, no en el camino",
    },
    {
      type: "p",
      text: "El voltímetro quiere ver la diferencia entre fase y neutro. Si unes los dos bornes al mismo lado, lee 0 V. Si lo pones en serie como si fuera un interruptor, no estás midiendo tensión.",
    },
    {
      type: "ul",
      items: [
        "Un cable al polo + (fase).",
        "El otro al polo − (neutro).",
        "Así se mide en un tomacorriente: entre L y N, nunca entre L y L.",
      ],
    },
  ],
  pistaInicial:
    "Une un borne del voltímetro al + y el otro al −. Pulsa Comprobar: debe leer 220 V. No lo pongas en serie.",
  componentesDisponibles: [
    { kind: "battery", label: "Batería", count: 1 },
    { kind: "voltmeter", label: "Medidor de tensión", count: 1 },
  ],
  reglas: {
    requiereCircuitoCerrado: true,
    componentesObligatorios: ["battery", "voltmeter"],
    maxConexionesPorTerminal: 1,
    requiereMedicion: true,
  },
  tableroInicial: {
    piezas: PIEZAS_VOLTIMETRO,
    cables: [],
    interruptorCerrado: true,
  },
  solucion: {
    explicacion:
      "Esta es una solución: el voltímetro queda en paralelo con la fuente, un borne al + y el otro al −, y lee 220 V. Así se mide tensión: entre fase y neutro, nunca en serie.",
    piezas: PIEZAS_VOLTIMETRO,
    cables: [
      {
        from: { kind: "voltmeter", terminalId: "a" },
        to: { kind: "battery", terminalId: "positive" },
      },
      {
        from: { kind: "voltmeter", terminalId: "b" },
        to: { kind: "battery", terminalId: "negative" },
      },
    ],
    interruptorCerrado: true,
  },
};
