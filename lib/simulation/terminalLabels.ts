import type { ComponentKind } from "./types";

export function componentTitle(kind: ComponentKind): string {
  switch (kind) {
    case "battery":
      return "Batería";
    case "switch":
      return "Interruptor";
    case "bulb":
      return "Portalámparas";
    case "resistor":
      return "Resistencia";
    case "led":
      return "LED";
    case "ground":
      return "Tierra";
    case "mainSwitch":
      return "Interruptor general";
    case "rcd":
      return "Interruptor diferencial";
    case "mcb":
      return "Interruptor automático";
    case "ammeter":
      return "Medidor de corriente";
    case "voltmeter":
      return "Medidor de tensión";
    case "multimeter":
      return "Multímetro";
    case "voltageDetector":
      return "Detector de voltaje";
    case "lightPole":
      return "Poste de luz";
    case "outlet":
      return "Tomacorriente";
    case "appliance":
      return "Electrodoméstico";
  }
}

export function terminalLabel(kind: ComponentKind, terminalId: string): string {
  if (kind === "battery" && terminalId === "positive") {
    return "polo +";
  }
  if (kind === "battery" && terminalId === "negative") {
    return "polo −";
  }
  if (terminalId === "earth") {
    return "tierra";
  }
  if (
    (kind === "rcd" || kind === "mainSwitch" || kind === "mcb") &&
    terminalId === "lineL"
  ) {
    return "fase entrada";
  }
  if (
    (kind === "rcd" || kind === "mainSwitch" || kind === "mcb") &&
    terminalId === "lineN"
  ) {
    return "neutro entrada";
  }
  if (
    (kind === "rcd" || kind === "mainSwitch" || kind === "mcb") &&
    terminalId === "loadL"
  ) {
    return "fase salida";
  }
  if (
    (kind === "rcd" || kind === "mainSwitch" || kind === "mcb") &&
    terminalId === "loadN"
  ) {
    return "neutro salida";
  }
  if (kind === "lightPole" && terminalId === "lineL") {
    return "fase";
  }
  if (kind === "lightPole" && terminalId === "lineN") {
    return "neutro";
  }
  if (kind === "outlet" && terminalId === "lineL") {
    return "fase entrada";
  }
  if (kind === "outlet" && terminalId === "lineN") {
    return "neutro entrada";
  }
  if (kind === "outlet" && (terminalId === "socket0" || terminalId === "socket1")) {
    return "enchufe";
  }
  if (
    (kind === "voltmeter" || kind === "multimeter") &&
    terminalId === "a"
  ) {
    return "sonda A";
  }
  if (
    (kind === "voltmeter" || kind === "multimeter") &&
    terminalId === "b"
  ) {
    return "sonda B";
  }
  if (kind === "voltageDetector" && terminalId === "tip") {
    return "punta";
  }
  if (kind === "appliance" && terminalId === "plug") {
    return "enchufe";
  }
  if (terminalId === "a") {
    return "borne A";
  }
  if (terminalId === "b") {
    return "borne B";
  }
  return terminalId;
}
