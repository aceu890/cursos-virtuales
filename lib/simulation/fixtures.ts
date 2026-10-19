import type { CircuitComponent, CircuitGraph, Wire } from "./types";
import { DEFAULT_CIRCUIT_RULES } from "./types";

export function battery(id = "bat"): CircuitComponent {
  return {
    id,
    kind: "battery",
    terminals: [
      { id: "positive", polarity: "positive" },
      { id: "negative", polarity: "negative" },
    ],
  };
}

export function sw(id = "sw", closed = true): CircuitComponent {
  return {
    id,
    kind: "switch",
    terminals: [
      { id: "a", polarity: "a" },
      { id: "b", polarity: "b" },
    ],
    state: { switchClosed: closed },
  };
}

export function bulb(id = "bulb"): CircuitComponent {
  return {
    id,
    kind: "bulb",
    terminals: [
      { id: "a", polarity: "a" },
      { id: "b", polarity: "b" },
    ],
  };
}

export function wire(
  id: string,
  from: Wire["from"],
  to: Wire["to"],
): Wire {
  return { id, from, to };
}

export function graph(
  components: CircuitComponent[],
  wires: Wire[],
): CircuitGraph {
  return { components, wires, reglas: DEFAULT_CIRCUIT_RULES };
}

/** Circuito en serie con dos ampolletas: batería → interruptor → carga 1 → carga 2 → batería. */
export function correctTwoBulbs(): CircuitGraph {
  return graph(
    [battery(), sw("sw", true), bulb("bulb-1"), bulb("bulb-2")],
    [
      wire(
        "w1",
        { componentId: "bat", terminalId: "positive" },
        { componentId: "sw", terminalId: "a" },
      ),
      wire(
        "w2",
        { componentId: "sw", terminalId: "b" },
        { componentId: "bulb-1", terminalId: "a" },
      ),
      wire(
        "w3",
        { componentId: "bulb-1", terminalId: "b" },
        { componentId: "bulb-2", terminalId: "a" },
      ),
      wire(
        "w4",
        { componentId: "bulb-2", terminalId: "b" },
        { componentId: "bat", terminalId: "negative" },
      ),
    ],
  );
}

/** Circuito en serie cerrado: batería → interruptor → ampolleta → batería. */
export function correctSeries(): CircuitGraph {
  return graph(
    [battery(), sw("sw", true), bulb()],
    [
      wire("w1", { componentId: "bat", terminalId: "positive" }, { componentId: "sw", terminalId: "a" }),
      wire("w2", { componentId: "sw", terminalId: "b" }, { componentId: "bulb", terminalId: "a" }),
      wire("w3", { componentId: "bulb", terminalId: "b" }, { componentId: "bat", terminalId: "negative" }),
    ],
  );
}
