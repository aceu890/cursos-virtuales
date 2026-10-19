import { isEarthTerminal } from "./cables";
import {
  isCircuitLoad,
  isPassThrough,
  isVoltmeter,
  isSource,
  isSwitchLike,
  loadAmps,
  MCB_TRIP_AMPS,
  isBipolarBreaker,
  RCD_POLES,
  sourcePoles,
  SUPPLY_VOLTS,
} from "./devices";
import {
  DEFAULT_CIRCUIT_RULES,
  type CircuitComponent,
  type CircuitGraph,
  type ComponentKind,
  type EvaluationResult,
  type FeedbackMessage,
  type ProtectionTrip,
  type TerminalRef,
} from "./types";

function terminalKey(ref: TerminalRef): string {
  return `${ref.componentId}::${ref.terminalId}`;
}

function hasTerminal(
  component: CircuitComponent,
  terminalId: string,
): boolean {
  return component.terminals.some((t) => t.id === terminalId);
}

function kindLabel(kind: ComponentKind): { nombre: string; articulo: string } {
  switch (kind) {
    case "battery":
      return { nombre: "batería", articulo: "La" };
    case "switch":
      return { nombre: "interruptor", articulo: "El" };
    case "bulb":
      return { nombre: "portalámparas", articulo: "El" };
    case "resistor":
      return { nombre: "resistencia", articulo: "La" };
    case "led":
      return { nombre: "LED", articulo: "El" };
    case "ground":
      return { nombre: "tierra", articulo: "La" };
    case "mainSwitch":
      return { nombre: "interruptor general", articulo: "El" };
    case "rcd":
      return { nombre: "interruptor diferencial", articulo: "El" };
    case "mcb":
      return { nombre: "interruptor automático", articulo: "El" };
    case "ammeter":
      return { nombre: "medidor de corriente", articulo: "El" };
    case "voltmeter":
      return { nombre: "medidor de tensión", articulo: "El" };
    case "multimeter":
      return { nombre: "multímetro", articulo: "El" };
    case "voltageDetector":
      return { nombre: "detector de voltaje", articulo: "El" };
    case "lightPole":
      return { nombre: "poste de luz", articulo: "El" };
    case "outlet":
      return { nombre: "tomacorriente", articulo: "El" };
    case "appliance":
      return { nombre: "electrodoméstico", articulo: "El" };
  }
}

function result(
  estado: EvaluationResult["estado"],
  mensajes: FeedbackMessage[],
  energizados: string[] = [],
  corrientes: Record<string, number> = {},
  conTension: string[] = [],
  vivos: string[] = [],
  extras: {
    avisos?: FeedbackMessage[];
    disparos?: ProtectionTrip[];
    tensiones?: Record<string, number | null>;
    detectores?: Record<string, boolean>;
    continuidades?: Record<string, boolean | null>;
  } = {},
): EvaluationResult {
  return {
    estado,
    mensajes,
    energizados,
    corrientes,
    conTension,
    vivos,
    avisos: extras.avisos ?? [],
    disparos: extras.disparos ?? [],
    tensiones: extras.tensiones ?? {},
    detectores: extras.detectores ?? {},
    continuidades: extras.continuidades ?? {},
  };
}

function idsReachedFrom(
  adj: Adj,
  start: string,
): string[] {
  const visited = new Set<string>([start]);
  const queue = [start];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      break;
    }
    for (const { next } of adj.get(current) ?? []) {
      if (visited.has(next)) {
        continue;
      }
      visited.add(next);
      queue.push(next);
    }
  }
  const ids = new Set<string>();
  for (const key of visited) {
    const split = key.indexOf("::");
    if (split <= 0) {
      continue;
    }
    const terminalId = key.slice(split + 2);
    if (
      terminalId === "earth" ||
      terminalId === "plug" ||
      terminalId.startsWith("socket")
    ) {
      continue;
    }
    ids.add(key.slice(0, split));
  }
  return [...ids];
}

function componentIdOf(key: string): string {
  const split = key.indexOf("::");
  return split > 0 ? key.slice(0, split) : key;
}

function terminalIdOf(key: string): string {
  const split = key.indexOf("::");
  return split > 0 ? key.slice(split + 2) : key;
}

function visitsEarth(
  adj: Adj,
  starts: string[],
  skipInternalId?: string,
): boolean {
  const visited = new Set<string>();
  const queue = [...starts];
  for (const start of starts) {
    visited.add(start);
  }
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      break;
    }
    if (terminalIdOf(current) === "earth") {
      return true;
    }
    for (const { next, via } of adj.get(current) ?? []) {
      if (skipInternalId && via.type === "internal" && via.id === skipInternalId) {
        continue;
      }
      if (visited.has(next)) {
        continue;
      }
      visited.add(next);
      queue.push(next);
    }
  }
  return false;
}

function reachesGround(
  adj: Adj,
  start: string,
  byId: Map<string, CircuitComponent>,
): boolean {
  const visited = new Set<string>([start]);
  const queue = [start];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      break;
    }
    if (byId.get(componentIdOf(current))?.kind === "ground") {
      return true;
    }
    for (const { next } of adj.get(current) ?? []) {
      if (visited.has(next)) {
        continue;
      }
      visited.add(next);
      queue.push(next);
    }
  }
  return false;
}

function rcdTrips(graph: CircuitGraph, adj: Adj): ProtectionTrip[] {
  const trips: ProtectionTrip[] = [];
  for (const rcd of graph.components.filter(
    (component) =>
      component.kind === "rcd" && component.state?.switchClosed === true,
  )) {
    const leak = visitsEarth(
      adj,
      [
        terminalKey({ componentId: rcd.id, terminalId: "loadL" }),
        terminalKey({ componentId: rcd.id, terminalId: "loadN" }),
      ],
      rcd.id,
    );
    if (leak) {
      trips.push({
        id: rcd.id,
        tipo: "fuga",
        texto:
            "El diferencial disparó por una fuga a tierra: un conductor de trabajo toca el PE. Así protege a las personas. Esa unión no es un cableado válido; quítala y reármalo.",
      });
    }
  }
  return trips;
}

function earthWarnings(
  graph: CircuitGraph,
  adj: Adj,
  liveIds: string[],
  byId: Map<string, CircuitComponent>,
): FeedbackMessage[] {
  const avisos: FeedbackMessage[] = [];
  for (const outlet of graph.components.filter(
    (component) => component.kind === "outlet",
  )) {
    const plugged = outlet.state?.pluggedIds ?? [];
    const atRisk = plugged.filter((id) => {
      const appliance = byId.get(id);
      return (
        appliance?.state?.switchClosed === true && liveIds.includes(id)
      );
    });
    if (atRisk.length === 0) {
      continue;
    }
    const earthKey = terminalKey({
      componentId: outlet.id,
      terminalId: "earth",
    });
    if (reachesGround(adj, earthKey, byId)) {
      continue;
    }
    avisos.push({
      tipo: "pista",
      codigo: `sin_tierra_${outlet.id}`,
      texto:
        "El electrodoméstico funciona, pero el tomacorriente no tiene conductor de protección. En una vivienda eso no es seguro: une el borne de tierra del tomacorriente al conector de tierra, y no lo hagas pasar por interruptores.",
    });
  }
  return avisos;
}

function workEarthFaults(
  graph: CircuitGraph,
  byId: Map<string, CircuitComponent>,
): FeedbackMessage[] {
  const avisos: FeedbackMessage[] = [];
  for (const item of graph.wires) {
    const fromComponent = byId.get(item.from.componentId);
    const toComponent = byId.get(item.to.componentId);
    if (!fromComponent || !toComponent) {
      continue;
    }
    const fromEarth = isEarthTerminal(
      fromComponent.kind,
      item.from.terminalId,
    );
    const toEarth = isEarthTerminal(toComponent.kind, item.to.terminalId);
    if (fromEarth === toEarth) {
      continue;
    }
    avisos.push({
      tipo: "error",
      codigo: `fuga_cable_${item.id}`,
      texto:
        "Hay un cable que une fase o neutro con la tierra. Eso es un fallo, no una instalación: en una vivienda el diferencial debe cortar y hay que reparar la fuga. Quita esa unión.",
    });
  }
  return avisos;
}

function switchedNeutralWarnings(
  graph: CircuitGraph,
  conductors: Adj,
  start: string,
  goal: string,
): FeedbackMessage[] {
  const avisos: FeedbackMessage[] = [];
  for (const item of graph.components.filter(
    (component) => component.kind === "switch",
  )) {
    const a = terminalKey({ componentId: item.id, terminalId: "a" });
    const b = terminalKey({ componentId: item.id, terminalId: "b" });
    const onLive =
      Boolean(bfsPath(conductors, start, a)) ||
      Boolean(bfsPath(conductors, start, b));
    const onNeutral =
      Boolean(bfsPath(conductors, goal, a)) ||
      Boolean(bfsPath(conductors, goal, b));
    if (onNeutral && !onLive) {
      avisos.push({
        tipo: "error",
        codigo: `neutro_conmutado_${item.id}`,
        texto:
          "El interruptor está cortando solo el neutro. La fase sigue llegando a la carga: eso es peligroso. El interruptor unipolar se coloca en la fase.",
      });
    }
  }
  return avisos;
}

function probeReadings(
  graph: CircuitGraph,
  conductors: Adj,
  start: string,
  goal: string,
): {
  tensiones: Record<string, number | null>;
  detectores: Record<string, boolean>;
  continuidades: Record<string, boolean | null>;
} {
  const tensiones: Record<string, number | null> = {};
  const detectores: Record<string, boolean> = {};
  const continuidades: Record<string, boolean | null> = {};
  const sideOf = (key: string): "fase" | "neutro" | null => {
    if (bfsPath(conductors, start, key)) {
      return "fase";
    }
    if (bfsPath(conductors, goal, key)) {
      return "neutro";
    }
    return null;
  };
  for (const meter of graph.components) {
    if (isVoltmeter(meter.kind, meter.state?.meterMode)) {
      const a = sideOf(terminalKey({ componentId: meter.id, terminalId: "a" }));
      const b = sideOf(terminalKey({ componentId: meter.id, terminalId: "b" }));
      if (!a || !b) {
        tensiones[meter.id] = null;
      } else if (a !== b) {
        tensiones[meter.id] = SUPPLY_VOLTS;
      } else {
        tensiones[meter.id] = 0;
      }
    }
    if (meter.kind === "voltageDetector") {
      const tip = terminalKey({ componentId: meter.id, terminalId: "tip" });
      detectores[meter.id] = Boolean(bfsPath(conductors, start, tip));
    }
    if (meter.kind === "multimeter" && meter.state?.meterMode === "continuidad") {
      const a = terminalKey({ componentId: meter.id, terminalId: "a" });
      const b = terminalKey({ componentId: meter.id, terminalId: "b" });
      const wired = (terminalId: string) =>
        graph.wires.some(
          (wire) =>
            (wire.from.componentId === meter.id &&
              wire.from.terminalId === terminalId) ||
            (wire.to.componentId === meter.id && wire.to.terminalId === terminalId),
        );
      if (!wired("a") || !wired("b")) {
        continuidades[meter.id] = null;
      } else {
        continuidades[meter.id] = Boolean(bfsPath(conductors, a, b));
      }
    }
  }
  return { tensiones, detectores, continuidades };
}

function appliancesWithSupply(
  graph: CircuitGraph,
  adj: Adj,
  start: string,
  goal: string,
): string[] {
  const ids: string[] = [];
  for (const outlet of graph.components.filter(
    (component) => component.kind === "outlet",
  )) {
    const live = terminalKey({
      componentId: outlet.id,
      terminalId: "lineL",
    });
    const ret = terminalKey({
      componentId: outlet.id,
      terminalId: "lineN",
    });
    const hasVoltage =
      (Boolean(bfsPath(adj, start, live)) &&
        Boolean(bfsPath(adj, ret, goal))) ||
      (Boolean(bfsPath(adj, start, ret)) &&
        Boolean(bfsPath(adj, live, goal)));
    if (!hasVoltage) {
      continue;
    }
    ids.push(...(outlet.state?.pluggedIds ?? []));
  }
  return ids;
}

function isPowerWiringTerminal(terminal: { id: string; polarity?: string }): boolean {
  return (
    terminal.id !== "earth" &&
    terminal.polarity !== "earth" &&
    terminal.id !== "plug" &&
    terminal.id !== "socket0" &&
    terminal.id !== "socket1"
  );
}

function workTerminals(component: CircuitComponent): TerminalRef[] {
  return component.terminals
    .filter(isPowerWiringTerminal)
    .map((terminal) => ({
      componentId: component.id,
      terminalId: terminal.id,
    }));
}

function linkPoles(
  adj: Adj,
  component: CircuitComponent,
  fromId: string,
  toId: string,
) {
  const a = terminalKey({ componentId: component.id, terminalId: fromId });
  const b = terminalKey({ componentId: component.id, terminalId: toId });
  adj.get(a)?.push({ next: b, via: { type: "internal", id: component.id } });
  adj.get(b)?.push({ next: a, via: { type: "internal", id: component.id } });
}

function addInternalLinks(
  adj: Adj,
  component: CircuitComponent,
  skipPassThrough = false,
) {
  if (isCircuitLoad(component)) {
    const work = workTerminals(component);
    const from = work[0];
    const to = work[1];
    if (!from || !to) {
      return;
    }
    linkPoles(adj, component, from.terminalId, to.terminalId);
    return;
  }
  if (isBipolarBreaker(component.kind)) {
    if (component.state?.switchClosed === true) {
      for (const pole of RCD_POLES) {
        linkPoles(adj, component, pole.line, pole.load);
      }
    }
    return;
  }
  if (
    (isSwitchLike(component.kind) &&
      component.state?.switchClosed === true) ||
    (!skipPassThrough &&
      isPassThrough(component.kind, component.state?.meterMode))
  ) {
    const work = workTerminals(component);
    const from = work[0];
    const to = work[1];
    if (!from || !to) {
      return;
    }
    linkPoles(adj, component, from.terminalId, to.terminalId);
  }
}

function buildAdj(
  graph: CircuitGraph,
  includeLoads: boolean,
  skipPassThrough = false,
): Adj {
  const adj: Adj = new Map();
  const ensure = (key: string) => {
    if (!adj.has(key)) {
      adj.set(key, []);
    }
  };

  for (const component of graph.components) {
    for (const terminal of component.terminals) {
      ensure(terminalKey({ componentId: component.id, terminalId: terminal.id }));
    }
  }

  for (const wire of graph.wires) {
    const a = terminalKey(wire.from);
    const b = terminalKey(wire.to);
    adj.get(a)?.push({ next: b, via: { type: "wire", id: wire.id } });
    adj.get(b)?.push({ next: a, via: { type: "wire", id: wire.id } });
  }

  for (const component of graph.components) {
    if (!includeLoads && isCircuitLoad(component)) {
      continue;
    }
    addInternalLinks(adj, component, skipPassThrough);
  }

  return adj;
}

type Via = { type: "wire" | "internal"; id: string };
type Adj = Map<string, { next: string; via: Via }[]>;

function bfsPath(
  adj: Adj,
  start: string,
  goal: string,
): { nodes: string[]; vias: Via[] } | null {
  if (start === goal) {
    return { nodes: [start], vias: [] };
  }

  const visited = new Set<string>([start]);
  const queue: string[] = [start];
  const parent = new Map<string, { prev: string; via: Via }>();

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      break;
    }
    const neighbors = adj.get(current) ?? [];
    for (const { next, via } of neighbors) {
      if (visited.has(next)) {
        continue;
      }
      visited.add(next);
      parent.set(next, { prev: current, via });
      if (next === goal) {
        const nodes: string[] = [goal];
        const vias: Via[] = [];
        let cursor = goal;
        while (cursor !== start) {
          const step = parent.get(cursor);
          if (!step) {
            return null;
          }
          vias.unshift(step.via);
          cursor = step.prev;
          nodes.unshift(cursor);
        }
        return { nodes, vias };
      }
      queue.push(next);
    }
  }

  return null;
}

/**
 * Evalúa un grafo de circuito de forma pura (sin React).
 * Prioridad: conexión inválida → incompleto → sin conectar → abierto → correcto.
 */
export function evaluateCircuit(graph: CircuitGraph): EvaluationResult {
  const reglas = graph.reglas ?? DEFAULT_CIRCUIT_RULES;
  const byId = new Map(
    graph.components.map((component) => [component.id, component]),
  );

  const usage = new Map<string, number>();

  for (const wire of graph.wires) {
    const fromComponent = byId.get(wire.from.componentId);
    const toComponent = byId.get(wire.to.componentId);

    if (
      !fromComponent ||
      !toComponent ||
      !hasTerminal(fromComponent, wire.from.terminalId) ||
      !hasTerminal(toComponent, wire.to.terminalId)
    ) {
      return result("conexion_invalida", [
        {
          tipo: "error",
          codigo: "terminal_inexistente",
          texto:
            "Hay un cable unido a un terminal que ya no existe. Quita ese cable y vuelve a conectar solo las piezas que ves en el tablero.",
        },
      ]);
    }

    if (
      wire.from.componentId === wire.to.componentId &&
      wire.from.terminalId === wire.to.terminalId
    ) {
      return result("conexion_invalida", [
        {
          tipo: "error",
          codigo: "auto_conexion",
          texto:
            "Un cable está conectado al mismo terminal en los dos extremos. Elige dos terminales distintos, por ejemplo el + de la batería y un lado del interruptor.",
        },
      ]);
    }

    const fromKey = terminalKey(wire.from);
    const toKey = terminalKey(wire.to);
    usage.set(fromKey, (usage.get(fromKey) ?? 0) + 1);
    usage.set(toKey, (usage.get(toKey) ?? 0) + 1);
  }

  for (const count of usage.values()) {
    if (count > reglas.maxConexionesPorTerminal) {
      return result("conexion_invalida", [
        {
          tipo: "error",
          codigo: "terminal_duplicado",
          texto:
            "Un terminal tiene más de un cable. En un circuito en serie cada extremo lleva un solo cable. Quita el extra y deja una conexión por terminal.",
        },
      ]);
    }
  }

  const present = new Set(graph.components.map((c) => c.kind));
  const missing = reglas.componentesObligatorios.filter(
    (kind) => !present.has(kind),
  );
  const countOf = (kind: ComponentKind) =>
    graph.components.filter((component) => component.kind === kind).length;
  const shortCounts = Object.entries(reglas.minPorTipo ?? {}).filter(
    ([kind, min]) => countOf(kind as ComponentKind) < (min ?? 0),
  );

  if (
    graph.components.length === 0 ||
    missing.length > 0 ||
    shortCounts.length > 0
  ) {
    const twoBulbs = (reglas.minPorTipo?.bulb ?? 0) >= 2;
    return result("incompleto", [
      {
        tipo: "pista",
        codigo: "faltan_componentes",
        texto: twoBulbs
          ? "Aún faltan piezas en el tablero. Agrega una batería, un interruptor y dos portalámparas; después únelos en un solo camino cerrado que pase por las dos cargas."
          : "Aún faltan piezas en el tablero. Agrega una batería, un interruptor y un portalámparas; después únelos con cables hasta formar un círculo cerrado.",
      },
    ]);
  }

  for (const sourceForShort of graph.components.filter((component) =>
    isSource(component.kind),
  )) {
    const shortPoles = sourcePoles(sourceForShort);
    if (!shortPoles) {
      continue;
    }
    const isPole = (ref: TerminalRef, which: "live" | "return") =>
      ref.componentId === sourceForShort.id &&
      ref.terminalId ===
        (which === "live" ? shortPoles.liveId : shortPoles.returnId);
    const hasShort = graph.wires.some(
      (item) =>
        (isPole(item.from, "live") && isPole(item.to, "return")) ||
        (isPole(item.from, "return") && isPole(item.to, "live")),
    );
    if (hasShort) {
      return result("conexion_invalida", [
        {
          tipo: "error",
          codigo: "corto",
          texto:
            sourceForShort.kind === "lightPole"
              ? "Hay un corto: uniste la fase con el neutro del poste sin pasar por la carga. Quita ese atajo. La corriente debe recorrer el portalámparas antes de volver al neutro."
              : "Hay un corto: uniste el polo + con el polo − sin pasar por el portalámparas. Quita ese atajo. La corriente debe recorrer la carga antes de volver al −. En la vida real un corto puede calentar los cables; aquí solo lo practicamos en el tablero.",
        },
      ]);
    }
  }

  const unconnected = graph.components.find((component) => {
    if (
      component.kind === "voltmeter" ||
      component.kind === "voltageDetector" ||
      (component.kind === "multimeter" &&
        component.state?.meterMode !== "corriente")
    ) {
      return false;
    }
    const work = workTerminals(component);
    if (work.length === 0) {
      return false;
    }
    const counts = work.map(
      (ref) => usage.get(terminalKey(ref)) ?? 0,
    );
    return counts.some((count) => count > 0) && counts.some((count) => count === 0);
  });

  const conductors = buildAdj(graph, false);
  const adj = buildAdj(graph, true);

  const source =
    graph.components.find((component) => component.kind === "battery") ??
    graph.components.find((component) => component.kind === "lightPole");
  if (!source) {
    return result("incompleto", [
      {
        tipo: "pista",
        codigo: "sin_bateria",
        texto:
          "Falta una fuente. Sin batería ni poste de luz no hay corriente: agrega una y conéctala al resto del circuito.",
      },
    ]);
  }

  const poles = sourcePoles(source);
  if (!poles) {
    return result("conexion_invalida", [
      {
        tipo: "error",
        codigo: "bateria_sin_polos",
        texto:
          source.kind === "lightPole"
            ? "El poste de luz no tiene fase y neutro. Reinicia la simulación y vuelve a colocarlo."
            : "La batería no tiene polo + y polo −. Reinicia la simulación y vuelve a colocarla.",
      },
    ]);
  }

  const start = terminalKey({
    componentId: source.id,
    terminalId: poles.liveId,
  });
  const goal = terminalKey({
    componentId: source.id,
    terminalId: poles.returnId,
  });
  const liveIds = appliancesWithSupply(graph, conductors, start, goal);
  const vivoSet = new Set(idsReachedFrom(conductors, start));
  vivoSet.add(source.id);
  for (const outlet of graph.components.filter(
    (component) => component.kind === "outlet",
  )) {
    if (!vivoSet.has(outlet.id)) {
      continue;
    }
    for (const pluggedId of outlet.state?.pluggedIds ?? []) {
      const appliance = byId.get(pluggedId);
      if (appliance?.state?.switchClosed === true) {
        vivoSet.add(pluggedId);
      }
    }
  }
  const vivoIds = [...vivoSet];
  const { tensiones, detectores, continuidades } = probeReadings(
    graph,
    conductors,
    start,
    goal,
  );
  const avisos = [
    ...workEarthFaults(graph, byId),
    ...earthWarnings(graph, adj, liveIds, byId),
    ...switchedNeutralWarnings(graph, conductors, start, goal),
  ];
  const fugaTrips = rcdTrips(graph, adj);
  const judged = (
    estado: EvaluationResult["estado"],
    mensajes: FeedbackMessage[],
    energizados: string[] = [],
    corrientes: Record<string, number> = {},
    extraTrips: ProtectionTrip[] = [],
  ) =>
    result(estado, mensajes, energizados, corrientes, liveIds, vivoIds, {
      avisos,
      disparos: [...fugaTrips, ...extraTrips],
      tensiones,
      detectores,
      continuidades,
    });

  if (unconnected) {
    const { nombre, articulo } = kindLabel(unconnected.kind);
    const verbo =
      articulo === "El" ? "no está conectado" : "no está conectada";
    return judged("componente_sin_conectar", [
      {
        tipo: "error",
        codigo: "sin_conectar",
        texto: `${articulo} ${nombre} ${verbo} del todo: le falta un cable en al menos un terminal. Une los dos extremos para que la corriente pueda entrar y salir.`,
      },
    ]);
  }

  const unusedMeter = graph.components.find((component) => {
    if (component.kind !== "ammeter" && component.kind !== "voltmeter") {
      return false;
    }
    if (!reglas.componentesObligatorios.includes(component.kind)) {
      return false;
    }
    const work = workTerminals(component);
    return work.every((ref) => (usage.get(terminalKey(ref)) ?? 0) === 0);
  });
  if (unusedMeter) {
    return judged("componente_sin_conectar", [
      {
        tipo: "error",
        codigo: "medidor_sin_usar",
        texto:
          unusedMeter.kind === "ammeter"
            ? "El medidor de corriente todavía no está en el circuito. Insértalo en serie, en el camino de la corriente, nunca a caballo de la fuente."
            : "El voltímetro todavía no está conectado. Únelo en paralelo: un borne a la fase y el otro al neutro.",
      },
    ]);
  }
  if (bfsPath(conductors, start, goal)) {
    const meters = graph.components.some((component) =>
      isPassThrough(component.kind, component.state?.meterMode),
    );
    const withoutMeter = buildAdj(graph, false, true);
    const meterShort =
      meters && !bfsPath(withoutMeter, start, goal);
    const mainsShort = source.kind === "lightPole";
    return judged("conexion_invalida", [
      {
        tipo: "error",
        codigo: "corto",
        texto: meterShort
          ? "Hay un corto: el medidor de corriente está en paralelo entre fase y neutro. Colócalo en serie, en el camino de la corriente, nunca a caballo de la fuente."
          : mainsShort
            ? "Hay un corto: uniste la fase con el neutro sin pasar por la carga. Quita ese atajo. La corriente debe recorrer el portalámparas o el tomacorriente antes de volver al neutro."
            : "Hay un corto: uniste el polo + con el polo − sin pasar por el portalámparas. Quita ese atajo. La corriente debe recorrer la carga antes de volver al −. En la vida real un corto puede calentar los cables; aquí solo lo practicamos en el tablero.",
      },
    ]);
  }

  const path = bfsPath(adj, start, goal);
  const openGuards = graph.components.filter(
    (c) => isSwitchLike(c.kind) && c.state?.switchClosed !== true,
  );
  const switchOpen = openGuards.length > 0;
  const onlyWallSwitch = openGuards.every((item) => item.kind === "switch");

  if (!path) {
    const measuringOnly =
      graph.components.every(
        (component) =>
          isVoltmeter(component.kind, component.state?.meterMode) ||
          isSource(component.kind),
      ) && Object.values(tensiones).some((value) => value !== null);
    if (measuringOnly) {
      const volts = Object.values(tensiones).find((value) => value !== null);
      const meterName = graph.components.some(
        (component) => component.kind === "multimeter",
      )
        ? "multímetro"
        : "voltímetro";
      return judged("correcto", [
        {
          tipo: volts === 0 ? "pista" : "exito",
          codigo: "medicion",
          texto:
            volts === 0
              ? `El ${meterName} está conectado, pero ambos bornes están del mismo lado. Para leer 220 V únelo entre fase y neutro, en paralelo.`
              : `El ${meterName} está en paralelo y lee la tensión de la fuente. Así se mide: entre fase y neutro, nunca en serie.`,
        },
      ]);
    }
    if (switchOpen && onlyWallSwitch) {
      return judged("circuito_abierto", [
        {
          tipo: "error",
          codigo: "interruptor_abierto",
          texto:
            "El circuito está abierto porque el interruptor está apagado. Enciéndelo para cerrar el paso de la corriente y observa la ampolleta.",
        },
      ]);
    }
    if (switchOpen) {
      return judged("circuito_abierto", [
        {
          tipo: "error",
          codigo: "interruptor_abierto",
          texto:
            "El circuito está abierto porque un interruptor general, diferencial o automático está apagado o disparado. Enciéndelo o reármalo para cerrar el paso de la corriente.",
        },
      ]);
    }
    return judged("circuito_abierto", [
      {
        tipo: "error",
        codigo: "falta_cable",
        texto:
          "El circuito está abierto: falta un camino continuo entre el polo + y el polo −. Revisa que cada cable una dos terminales distintos y que no falte ninguno.",
      },
    ]);
  }

  const loads = graph.components.filter((c) => isCircuitLoad(c));
  const bulbs = loads.filter((c) => c.kind === "bulb");
  const withoutLoad = (skipId: string) => {
    const clone: CircuitGraph = {
      ...graph,
      components: graph.components.map((component) =>
        component.id === skipId
          ? { ...component, kind: "ground", terminals: component.terminals }
          : component,
      ),
    };
    return buildAdj(clone, true);
  };

  const loadOnPath = loads.filter((load) => {
    const work = workTerminals(load);
    const first = work[0];
    const second = work[1];
    if (!first || !second) {
      return false;
    }
    const open = withoutLoad(load.id);
    const a = terminalKey(first);
    const b = terminalKey(second);
    const forward =
      Boolean(bfsPath(open, start, a)) && Boolean(bfsPath(open, b, goal));
    const reverse =
      Boolean(bfsPath(open, start, b)) && Boolean(bfsPath(open, a, goal));
    return forward || reverse;
  });
  const bulbOnPath = loadOnPath.filter((item) => item.kind === "bulb");

  const involved = bulbs.filter((bulb) =>
    workTerminals(bulb).some(
      (ref) => (usage.get(terminalKey(ref)) ?? 0) > 0,
    ),
  );

  if (loadOnPath.length === 0) {
    return judged("conexion_invalida", [
      {
        tipo: "error",
        codigo: "no_pasa_por_ampolleta",
        texto:
          "Hay un camino entre + y −, pero la corriente no pasa por una carga. Conéctala en serie: un cable a cada borne, en el mismo loop que la fuente y el interruptor.",
      },
    ]);
  }

  const leftover = involved.filter(
    (bulb) => !bulbOnPath.some((item) => item.id === bulb.id),
  );
  const minBulbs = reglas.minPorTipo?.bulb ?? 0;
  if (leftover.length > 0 || bulbOnPath.length < minBulbs) {
    return judged("conexion_invalida", [
      {
        tipo: "error",
        codigo: "no_pasa_por_todas_las_cargas",
        texto:
          "Hay un camino entre + y −, pero no pasa por las dos ampolletas. Evita el atajo: la corriente debe recorrer las dos cargas, una después de la otra, antes de volver al polo −.",
      },
    ]);
  }

  if (reglas.requiereSerie) {
    const bypass = bulbs.some((bulb) =>
      Boolean(bfsPath(withoutLoad(bulb.id), start, goal)),
    );
    if (bypass) {
      return judged("conexion_invalida", [
        {
          tipo: "error",
          codigo: "no_pasa_por_todas_las_cargas",
          texto:
            "Hay un camino entre + y −, pero no pasa por las dos ampolletas. Evita el atajo: la corriente debe recorrer las dos cargas, una después de la otra, antes de volver al polo −.",
        },
      ]);
    }
  }

  if (reglas.requiereTierra) {
    const protectedLoads = graph.components.filter(
      (component) => component.kind === "bulb" || component.kind === "outlet",
    );
    const missingEarth = protectedLoads.some((load) => {
      const earth = load.terminals.find(
        (terminal) => terminal.id === "earth" || terminal.polarity === "earth",
      );
      if (!earth) {
        return true;
      }
      return !reachesGround(
        adj,
        terminalKey({ componentId: load.id, terminalId: earth.id }),
        byId,
      );
    });
    if (missingEarth) {
      avisos.push({
        tipo: "error",
        codigo: "falta_tierra",
        texto:
          "La carga enciende, pero falta el conductor de protección. Une el borne de tierra al conector de tierra, en verde. Ese cable no alimenta la luz y no pasa por el interruptor.",
      });
    }
  }

  if (reglas.requiereMedicion) {
    const reading = Object.values(tensiones).some(
      (value) => value !== null && value !== 0,
    );
    if (!reading) {
      return judged("componente_sin_conectar", [
        {
          tipo: "pista",
          codigo: "falta_medicion",
          texto:
            "Aún no hay una lectura de tensión. Pon el voltímetro en paralelo: un borne a la fase (o al +) y el otro al neutro (o al −).",
        },
      ]);
    }
  }

  const several = bulbs.length > 1;
  const corrientes: Record<string, number> = {};
  for (const meter of graph.components.filter((component) =>
    isPassThrough(component.kind, component.state?.meterMode),
  )) {
    const withoutMeter = withoutLoad(meter.id);
    const seriesLoads = loadOnPath.filter((load) => {
      const work = workTerminals(load);
      const first = work[0];
      const second = work[1];
      if (!first || !second) {
        return false;
      }
      const a = terminalKey(first);
      const b = terminalKey(second);
      const forward =
        Boolean(bfsPath(withoutMeter, start, a)) &&
        Boolean(bfsPath(withoutMeter, b, goal));
      const reverse =
        Boolean(bfsPath(withoutMeter, start, b)) &&
        Boolean(bfsPath(withoutMeter, a, goal));
      return !(forward || reverse);
    });
    corrientes[meter.id] = seriesLoads.reduce(
      (sum, load) => sum + loadAmps(load.kind, load.state?.watts),
      0,
    );
  }

  const sobrecargaTrips: ProtectionTrip[] = [];
  for (const breaker of graph.components.filter(
    (component) =>
      component.kind === "mcb" && component.state?.switchClosed === true,
  )) {
    const withoutBreaker = withoutLoad(breaker.id);
    const seriesLoads = loadOnPath.filter((load) => {
      const work = workTerminals(load);
      const first = work[0];
      const second = work[1];
      if (!first || !second) {
        return false;
      }
      const a = terminalKey(first);
      const b = terminalKey(second);
      const forward =
        Boolean(bfsPath(withoutBreaker, start, a)) &&
        Boolean(bfsPath(withoutBreaker, b, goal));
      const reverse =
        Boolean(bfsPath(withoutBreaker, start, b)) &&
        Boolean(bfsPath(withoutBreaker, a, goal));
      return !(forward || reverse);
    });
    const amps = seriesLoads.reduce(
      (sum, load) => sum + loadAmps(load.kind, load.state?.watts),
      0,
    );
    corrientes[breaker.id] = amps;
    const rating = breaker.state?.tripAmps ?? MCB_TRIP_AMPS;
    if (amps > rating) {
      sobrecargaTrips.push({
        id: breaker.id,
        tipo: "sobrecarga",
        texto: `El automático disparó porque la corriente superó ${rating} A. Baja la carga o usa menos electrodomésticos y reármalo.`,
      });
    }
  }

  const energizados = loadOnPath.flatMap((item) => {
    if (item.kind !== "outlet") {
      return [item.id];
    }
    const drawing = (item.state?.pluggedIds ?? []).filter((id) => {
      const appliance = byId.get(id);
      return appliance?.state?.switchClosed !== false;
    });
    return [item.id, ...drawing];
  });
  const outletLoad = loadOnPath.some((item) => item.kind === "outlet");
  const mains = source.kind === "lightPole";
  const unsafeAviso = avisos.find((aviso) => aviso.tipo === "error");
  const unsafe = fugaTrips.length > 0 || Boolean(unsafeAviso);
  const success = unsafe
    ? (unsafeAviso?.texto ??
      "Este cableado no es una instalación segura. Úsalo solo para estudiar el fallo, y después deja fase, neutro y tierra en bornes distintos.")
    : several
      ? reglas.requiereSerie
        ? "¡Muy bien! El circuito está cerrado y las dos ampolletas se encienden. La corriente recorre las dos cargas en serie, sin atajos, y vuelve al polo −."
        : "¡Muy bien! El circuito está cerrado y las dos ampolletas se encienden. Cada una tiene su propio camino: si una se apaga, la otra puede seguir."
      : outletLoad && bulbs.length === 0
        ? mains
          ? "¡Muy bien! El circuito está cerrado: fase y neutro llegan al tomacorriente y el electrodoméstico recibe corriente. La tierra de protección no se corta con los interruptores."
          : "¡Muy bien! El circuito está cerrado y el electrodoméstico recibe corriente desde el tomacorriente."
        : mains
          ? "¡Muy bien! El circuito está cerrado: la corriente sale por la fase, pasa por las protecciones y la carga, y vuelve por el neutro."
          : "¡Muy bien! El circuito está cerrado y la ampolleta se enciende. La corriente sale del polo +, pasa por el interruptor y la ampolleta, y vuelve al polo −.";

  return judged(
    "correcto",
    [
      {
        tipo: unsafe ? "error" : "exito",
        codigo: unsafe ? "instalacion_insegura" : "encendida",
        texto: success,
      },
    ],
    sobrecargaTrips.length > 0 || fugaTrips.length > 0 ? [] : energizados,
    corrientes,
    sobrecargaTrips,
  );
}
