import type { CircuitLessonDefinition } from "../flowTypes";

export const LABORATORIO: CircuitLessonDefinition = {
  simulation: "circuit",
  concepto: "",
  objetivo: "",
  componentesDisponibles: [
    { kind: "battery", label: "Batería", count: 12 },
    { kind: "switch", label: "Interruptor", count: 12 },
    { kind: "outlet", label: "Tomacorriente", count: 12 },
    { kind: "bulb", label: "Portalámparas", count: 12 },
    { kind: "ground", label: "Tierra", count: 12 },
    { kind: "mainSwitch", label: "Interruptor general", count: 12 },
    { kind: "rcd", label: "Interruptor diferencial", count: 12 },
    { kind: "mcb", label: "Interruptor automático", count: 12 },
    { kind: "ammeter", label: "Medidor de corriente", count: 12 },
    { kind: "voltmeter", label: "Medidor de tensión", count: 12 },
    { kind: "multimeter", label: "Multímetro", count: 12 },
    { kind: "voltageDetector", label: "Detector de voltaje", count: 12 },
    { kind: "lightPole", label: "Poste de luz", count: 12 },
    { kind: "appliance", label: "Electrodoméstico", count: 12 },
  ],
  reglas: {
    requiereCircuitoCerrado: true,
    componentesObligatorios: [],
    maxConexionesPorTerminal: 4,
  },
  tableroInicial: {
    piezas: [],
    cables: [],
    interruptorCerrado: false,
  },
};
