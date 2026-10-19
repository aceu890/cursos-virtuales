import { describe, expect, it } from "vitest";
import { evaluateCircuit } from "./evaluateCircuit";
import {
  battery,
  bulb,
  correctSeries,
  correctTwoBulbs,
  graph,
  sw,
  wire,
} from "./fixtures";
import type { CircuitGraph } from "./types";

describe("evaluateCircuit", () => {
  it("pide las piezas cuando el tablero está vacío", () => {
    const result = evaluateCircuit(graph([], []));
    expect(result.estado).toBe("incompleto");
    expect(result.mensajes[0]?.codigo).toBe("faltan_componentes");
    expect(result.energizados).toEqual([]);
  });

  it("pide las piezas si falta la ampolleta", () => {
    const result = evaluateCircuit(
      graph(
        [battery(), sw()],
        [
          wire(
            "w1",
            { componentId: "bat", terminalId: "positive" },
            { componentId: "sw", terminalId: "a" },
          ),
        ],
      ),
    );
    expect(result.estado).toBe("incompleto");
  });

  it("detecta un componente con un terminal suelto", () => {
    const result = evaluateCircuit(
      graph(
        [battery(), sw(), bulb()],
        [
          wire(
            "w1",
            { componentId: "bat", terminalId: "positive" },
            { componentId: "sw", terminalId: "a" },
          ),
          wire(
            "w2",
            { componentId: "sw", terminalId: "b" },
            { componentId: "bulb", terminalId: "a" },
          ),
        ],
      ),
    );
    expect(result.estado).toBe("componente_sin_conectar");
    expect(result.mensajes[0]?.texto).toMatch(/terminal/i);
  });

  it("rechaza un cable unido al mismo terminal", () => {
    const result = evaluateCircuit(
      graph(
        [battery(), sw(), bulb()],
        [
          wire(
            "loop",
            { componentId: "bat", terminalId: "positive" },
            { componentId: "bat", terminalId: "positive" },
          ),
        ],
      ),
    );
    expect(result.estado).toBe("conexion_invalida");
    expect(result.mensajes[0]?.codigo).toBe("auto_conexion");
  });

  it("rechaza un terminal con dos cables", () => {
    const result = evaluateCircuit(
      graph(
        [battery(), sw(), bulb()],
        [
          wire(
            "w1",
            { componentId: "bat", terminalId: "positive" },
            { componentId: "sw", terminalId: "a" },
          ),
          wire(
            "w2",
            { componentId: "bat", terminalId: "positive" },
            { componentId: "bulb", terminalId: "a" },
          ),
          wire(
            "w3",
            { componentId: "sw", terminalId: "b" },
            { componentId: "bat", terminalId: "negative" },
          ),
          wire(
            "w4",
            { componentId: "bulb", terminalId: "b" },
            { componentId: "sw", terminalId: "a" },
          ),
        ],
      ),
    );
    expect(result.estado).toBe("conexion_invalida");
    expect(result.mensajes[0]?.codigo).toBe("terminal_duplicado");
  });

  it("explica el circuito abierto si el interruptor está apagado", () => {
    const closed = correctSeries();
    const open = graph(
      closed.components.map((c) =>
        c.kind === "switch" ? { ...c, state: { switchClosed: false } } : c,
      ),
      closed.wires,
    );
    const result = evaluateCircuit(open);
    expect(result.estado).toBe("circuito_abierto");
    expect(result.mensajes[0]?.codigo).toBe("interruptor_abierto");
    expect(result.energizados).toEqual([]);
  });

  it("señala el terminal suelto si falta un cable del loop", () => {
    const closed = correctSeries();
    const result = evaluateCircuit(
      graph(closed.components, closed.wires.slice(0, 2)),
    );
    expect(result.estado).toBe("componente_sin_conectar");
    expect(result.mensajes[0]?.texto).toMatch(/cable/i);
  });

  it("detecta un corto directo entre + y − aunque falten otros cables", () => {
    const result = evaluateCircuit(
      graph(
        [battery(), sw(), bulb()],
        [
          wire(
            "short",
            { componentId: "bat", terminalId: "positive" },
            { componentId: "bat", terminalId: "negative" },
          ),
        ],
      ),
    );
    expect(result.estado).toBe("conexion_invalida");
    expect(result.mensajes[0]?.codigo).toBe("corto");
  });

  it("detecta un corto que no pasa por la ampolleta", () => {
    const result = evaluateCircuit(
      graph(
        [battery(), sw(), bulb()],
        [
          wire(
            "short",
            { componentId: "bat", terminalId: "positive" },
            { componentId: "bat", terminalId: "negative" },
          ),
          wire(
            "loop1",
            { componentId: "sw", terminalId: "a" },
            { componentId: "bulb", terminalId: "a" },
          ),
          wire(
            "loop2",
            { componentId: "sw", terminalId: "b" },
            { componentId: "bulb", terminalId: "b" },
          ),
        ],
      ),
    );
    expect(result.estado).toBe("conexion_invalida");
    expect(result.mensajes[0]?.codigo).toBe("corto");
  });

  it("enciende la ampolleta en un circuito en serie cerrado", () => {
    const result = evaluateCircuit(correctSeries());
    expect(result.estado).toBe("correcto");
    expect(result.energizados).toEqual(["bulb"]);
    expect(result.mensajes[0]?.tipo).toBe("exito");
    expect(result.mensajes[0]?.texto).toMatch(/enciende/i);
  });

  it("exige las dos ampolletas cuando la lección lo pide", () => {
    const oneBulb: CircuitGraph = {
      ...correctSeries(),
      reglas: {
        requiereCircuitoCerrado: true,
        componentesObligatorios: ["battery", "switch", "bulb"],
        maxConexionesPorTerminal: 1,
        minPorTipo: { bulb: 2 },
      },
    };
    const result = evaluateCircuit(oneBulb);
    expect(result.estado).toBe("incompleto");
    expect(result.mensajes[0]?.codigo).toBe("faltan_componentes");
    expect(result.mensajes[0]?.texto).toMatch(/dos portalámparas/i);
  });

  it("enciende las dos ampolletas en serie", () => {
    const closed = correctTwoBulbs();
    const result = evaluateCircuit({
      ...closed,
      reglas: {
        requiereCircuitoCerrado: true,
        componentesObligatorios: ["battery", "switch", "bulb"],
        maxConexionesPorTerminal: 1,
        minPorTipo: { bulb: 2 },
        requiereSerie: true,
      },
    });
    expect(result.estado).toBe("correcto");
    expect(result.energizados).toEqual(["bulb-1", "bulb-2"]);
    expect(result.mensajes[0]?.texto).toMatch(/dos ampolletas/i);
  });

  it("rechaza el atajo que deja una ampolleta fuera del camino", () => {
    const result = evaluateCircuit({
      components: [battery(), sw("sw", true), bulb("bulb-1"), bulb("bulb-2")],
      wires: [
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
          { componentId: "bat", terminalId: "negative" },
        ),
        wire(
          "w4",
          { componentId: "bulb-2", terminalId: "a" },
          { componentId: "bulb-2", terminalId: "b" },
        ),
      ],
      reglas: {
        requiereCircuitoCerrado: true,
        componentesObligatorios: ["battery", "switch", "bulb"],
        maxConexionesPorTerminal: 1,
        minPorTipo: { bulb: 2 },
      },
    });
    expect(result.estado).toBe("conexion_invalida");
    expect(result.mensajes[0]?.codigo).toBe("no_pasa_por_todas_las_cargas");
  });

  it("el medidor en serie no abre el circuito y muestra la corriente de la carga", () => {
    const meter: CircuitGraph["components"][number] = {
      id: "meter",
      kind: "ammeter",
      terminals: [
        { id: "a", polarity: "a" },
        { id: "b", polarity: "b" },
      ],
    };
    const result = evaluateCircuit(
      graph(
        [battery(), sw("sw", true), meter, bulb()],
        [
          wire(
            "w1",
            { componentId: "bat", terminalId: "positive" },
            { componentId: "sw", terminalId: "a" },
          ),
          wire(
            "w2",
            { componentId: "sw", terminalId: "b" },
            { componentId: "meter", terminalId: "a" },
          ),
          wire(
            "w3",
            { componentId: "meter", terminalId: "b" },
            { componentId: "bulb", terminalId: "a" },
          ),
          wire(
            "w4",
            { componentId: "bulb", terminalId: "b" },
            { componentId: "bat", terminalId: "negative" },
          ),
        ],
      ),
    );
    expect(result.estado).toBe("correcto");
    expect(result.energizados).toEqual(["bulb"]);
    expect(result.corrientes?.meter).toBeCloseTo(0.27);
  });

  it("rechaza el medidor de corriente en paralelo porque provoca un corto", () => {
    const meter: CircuitGraph["components"][number] = {
      id: "meter",
      kind: "ammeter",
      terminals: [
        { id: "a", polarity: "a" },
        { id: "b", polarity: "b" },
      ],
    };
    const circuit = graph(
      [battery(), meter],
      [
        wire(
          "w1",
          { componentId: "bat", terminalId: "positive" },
          { componentId: "meter", terminalId: "a" },
        ),
        wire(
          "w2",
          { componentId: "meter", terminalId: "b" },
          { componentId: "bat", terminalId: "negative" },
        ),
      ],
    );
    circuit.reglas = {
      requiereCircuitoCerrado: true,
      componentesObligatorios: [],
      maxConexionesPorTerminal: 4,
    };
    const result = evaluateCircuit(circuit);
    expect(result.estado).toBe("conexion_invalida");
    expect(result.mensajes[0]?.codigo).toBe("corto");
    expect(result.mensajes[0]?.texto).toMatch(/paralelo/i);
  });

  it("un electrodoméstico solo carga el circuito si está enchufado al tomacorriente", () => {
    const outlet: CircuitGraph["components"][number] = {
      id: "out",
      kind: "outlet",
      terminals: [
        { id: "lineL", polarity: "a" },
        { id: "lineN", polarity: "b" },
        { id: "earth", polarity: "earth" },
        { id: "socket0", polarity: "a" },
      ],
      state: { watts: 2200, pluggedIds: ["kettle"] },
    };
    const kettle: CircuitGraph["components"][number] = {
      id: "kettle",
      kind: "appliance",
      terminals: [{ id: "plug", polarity: "a" }],
      state: { watts: 2200 },
    };
    const meter: CircuitGraph["components"][number] = {
      id: "meter",
      kind: "ammeter",
      terminals: [
        { id: "a", polarity: "a" },
        { id: "b", polarity: "b" },
      ],
    };
    const circuit = graph(
      [battery(), sw("sw", true), meter, outlet, kettle],
      [
        wire(
          "w1",
          { componentId: "bat", terminalId: "positive" },
          { componentId: "sw", terminalId: "a" },
        ),
        wire(
          "w2",
          { componentId: "sw", terminalId: "b" },
          { componentId: "meter", terminalId: "a" },
        ),
        wire(
          "w3",
          { componentId: "meter", terminalId: "b" },
          { componentId: "out", terminalId: "lineL" },
        ),
        wire(
          "w4",
          { componentId: "out", terminalId: "lineN" },
          { componentId: "bat", terminalId: "negative" },
        ),
      ],
    );
    circuit.reglas = {
      requiereCircuitoCerrado: true,
      componentesObligatorios: [],
      maxConexionesPorTerminal: 4,
    };
    const result = evaluateCircuit(circuit);
    expect(result.estado).toBe("correcto");
    expect(result.energizados).toEqual(["out", "kettle"]);
    expect(result.conTension).toEqual(["kettle"]);
    expect(result.corrientes?.meter).toBeCloseTo(10);
  });

  it("sin tensión en el tomacorriente el electrodoméstico no puede encender", () => {
    const outlet: CircuitGraph["components"][number] = {
      id: "out",
      kind: "outlet",
      terminals: [
        { id: "lineL", polarity: "a" },
        { id: "lineN", polarity: "b" },
        { id: "socket0", polarity: "a" },
      ],
      state: { watts: 0, pluggedIds: ["kettle"] },
    };
    const kettle: CircuitGraph["components"][number] = {
      id: "kettle",
      kind: "appliance",
      terminals: [{ id: "plug", polarity: "a" }],
      state: { watts: 2200, switchClosed: false },
    };
    const circuit = graph(
      [battery(), sw("sw", true), outlet, kettle],
      [
        wire(
          "w1",
          { componentId: "bat", terminalId: "positive" },
          { componentId: "sw", terminalId: "a" },
        ),
        wire(
          "w2",
          { componentId: "sw", terminalId: "b" },
          { componentId: "out", terminalId: "lineL" },
        ),
        wire(
          "w3",
          { componentId: "out", terminalId: "lineN" },
          { componentId: "bat", terminalId: "negative" },
        ),
      ],
    );
    circuit.reglas = {
      requiereCircuitoCerrado: true,
      componentesObligatorios: [],
      maxConexionesPorTerminal: 4,
    };
    const withSupply = evaluateCircuit(circuit);
    expect(withSupply.conTension).toEqual(["kettle"]);
    expect(withSupply.energizados).toEqual([]);

    const open = evaluateCircuit({
      ...circuit,
      components: circuit.components.map((component) =>
        component.id === "sw"
          ? { ...component, state: { switchClosed: false } }
          : component,
      ),
    });
    expect(open.conTension).toEqual([]);
  });

  it("el interruptor general abierto deja el circuito sin corriente", () => {
    const general: CircuitGraph["components"][number] = {
      id: "ig",
      kind: "mainSwitch",
      terminals: [
        { id: "lineL", polarity: "a" },
        { id: "lineN", polarity: "b" },
        { id: "loadL", polarity: "a" },
        { id: "loadN", polarity: "b" },
      ],
      state: { switchClosed: false },
    };
    const result = evaluateCircuit(
      graph(
        [battery(), general, sw("sw", true), bulb()],
        [
          wire(
            "w1",
            { componentId: "bat", terminalId: "positive" },
            { componentId: "ig", terminalId: "lineL" },
          ),
          wire(
            "w2",
            { componentId: "ig", terminalId: "loadL" },
            { componentId: "sw", terminalId: "a" },
          ),
          wire(
            "w3",
            { componentId: "sw", terminalId: "b" },
            { componentId: "bulb", terminalId: "a" },
          ),
          wire(
            "w4",
            { componentId: "bulb", terminalId: "b" },
            { componentId: "ig", terminalId: "loadN" },
          ),
          wire(
            "w5",
            { componentId: "ig", terminalId: "lineN" },
            { componentId: "bat", terminalId: "negative" },
          ),
        ],
      ),
    );
    expect(result.estado).toBe("circuito_abierto");
    expect(result.mensajes[0]?.texto).toMatch(/general|diferencial|automático/i);
  });

  it("el diferencial bipolar deja pasar fase y neutro por polos separados", () => {
    const diferencial: CircuitGraph["components"][number] = {
      id: "id",
      kind: "rcd",
      terminals: [
        { id: "lineL", polarity: "a" },
        { id: "lineN", polarity: "b" },
        { id: "loadL", polarity: "a" },
        { id: "loadN", polarity: "b" },
      ],
      state: { switchClosed: true },
    };
    const result = evaluateCircuit(
      graph(
        [battery(), diferencial, sw("sw", true), bulb()],
        [
          wire(
            "w1",
            { componentId: "bat", terminalId: "positive" },
            { componentId: "id", terminalId: "lineL" },
          ),
          wire(
            "w2",
            { componentId: "id", terminalId: "loadL" },
            { componentId: "sw", terminalId: "a" },
          ),
          wire(
            "w3",
            { componentId: "sw", terminalId: "b" },
            { componentId: "bulb", terminalId: "a" },
          ),
          wire(
            "w4",
            { componentId: "bulb", terminalId: "b" },
            { componentId: "id", terminalId: "loadN" },
          ),
          wire(
            "w5",
            { componentId: "id", terminalId: "lineN" },
            { componentId: "bat", terminalId: "negative" },
          ),
        ],
      ),
    );
    expect(result.estado).toBe("correcto");
    expect(result.energizados).toEqual(["bulb"]);
  });

  it("el poste de luz alimenta el circuito como fuente de la red", () => {
    const poste: CircuitGraph["components"][number] = {
      id: "poste",
      kind: "lightPole",
      terminals: [
        { id: "lineL", polarity: "positive" },
        { id: "lineN", polarity: "negative" },
      ],
    };
    const result = evaluateCircuit({
      components: [poste, sw("sw", true), bulb()],
      wires: [
        wire(
          "w1",
          { componentId: "poste", terminalId: "lineL" },
          { componentId: "sw", terminalId: "a" },
        ),
        wire(
          "w2",
          { componentId: "sw", terminalId: "b" },
          { componentId: "bulb", terminalId: "a" },
        ),
        wire(
          "w3",
          { componentId: "bulb", terminalId: "b" },
          { componentId: "poste", terminalId: "lineN" },
        ),
      ],
      reglas: {
        requiereCircuitoCerrado: true,
        componentesObligatorios: [],
        maxConexionesPorTerminal: 4,
      },
    });
    expect(result.estado).toBe("correcto");
    expect(result.energizados).toEqual(["bulb"]);
  });

  it("el poste sigue con tensión si se abre la fase al tomacorriente", () => {
    const poste: CircuitGraph["components"][number] = {
      id: "poste",
      kind: "lightPole",
      terminals: [
        { id: "lineL", polarity: "positive" },
        { id: "lineN", polarity: "negative" },
      ],
    };
    const meter: CircuitGraph["components"][number] = {
      id: "meter",
      kind: "ammeter",
      terminals: [
        { id: "a", polarity: "a" },
        { id: "b", polarity: "b" },
      ],
    };
    const outlet: CircuitGraph["components"][number] = {
      id: "out",
      kind: "outlet",
      terminals: [
        { id: "lineL", polarity: "a" },
        { id: "lineN", polarity: "b" },
        { id: "earth", polarity: "earth" },
        { id: "socket0", polarity: "a" },
      ],
      state: { watts: 150, pluggedIds: ["fridge"] },
    };
    const fridge: CircuitGraph["components"][number] = {
      id: "fridge",
      kind: "appliance",
      terminals: [{ id: "plug", polarity: "a" }],
      state: { watts: 150, switchClosed: true },
    };
    const ground: CircuitGraph["components"][number] = {
      id: "gnd",
      kind: "ground",
      terminals: [{ id: "earth", polarity: "earth" }],
    };
    const reglas = {
      requiereCircuitoCerrado: true,
      componentesObligatorios: [] as const,
      maxConexionesPorTerminal: 4,
    };
    const closed = graph(
      [poste, meter, outlet, fridge, ground],
      [
        wire(
          "w1",
          { componentId: "poste", terminalId: "lineL" },
          { componentId: "meter", terminalId: "a" },
        ),
        wire(
          "w2",
          { componentId: "meter", terminalId: "b" },
          { componentId: "out", terminalId: "lineL" },
        ),
        wire(
          "w3",
          { componentId: "out", terminalId: "lineN" },
          { componentId: "poste", terminalId: "lineN" },
        ),
        wire(
          "pe",
          { componentId: "out", terminalId: "earth" },
          { componentId: "gnd", terminalId: "earth" },
        ),
      ],
    );
    closed.reglas = { ...reglas, componentesObligatorios: [] };
    const ok = evaluateCircuit(closed);
    expect(ok.estado).toBe("correcto");
    expect(ok.vivos).toEqual(
      expect.arrayContaining(["poste", "meter", "out", "fridge"]),
    );

    const open = graph(
      [poste, meter, outlet, fridge, ground],
      [
        wire(
          "w1",
          { componentId: "poste", terminalId: "lineL" },
          { componentId: "meter", terminalId: "a" },
        ),
        wire(
          "w3",
          { componentId: "out", terminalId: "lineN" },
          { componentId: "poste", terminalId: "lineN" },
        ),
        wire(
          "pe",
          { componentId: "out", terminalId: "earth" },
          { componentId: "gnd", terminalId: "earth" },
        ),
      ],
    );
    open.reglas = { ...reglas, componentesObligatorios: [] };
    const result = evaluateCircuit(open);
    expect(result.vivos).toEqual(expect.arrayContaining(["poste", "meter"]));
    expect(result.vivos).not.toContain("out");
    expect(result.vivos).not.toContain("fridge");
  });

  it("el automático dispara si la corriente supera 10 A", () => {
    const mcb: CircuitGraph["components"][number] = {
      id: "mcb",
      kind: "mcb",
      terminals: [
        { id: "lineL", polarity: "a" },
        { id: "lineN", polarity: "b" },
        { id: "loadL", polarity: "a" },
        { id: "loadN", polarity: "b" },
      ],
      state: { switchClosed: true },
    };
    const outlet: CircuitGraph["components"][number] = {
      id: "out",
      kind: "outlet",
      terminals: [
        { id: "lineL", polarity: "a" },
        { id: "lineN", polarity: "b" },
      ],
      state: { watts: 2350, pluggedIds: ["kettle"] },
    };
    const circuit = graph(
      [battery(), mcb, outlet],
      [
        wire(
          "w1",
          { componentId: "bat", terminalId: "positive" },
          { componentId: "mcb", terminalId: "lineL" },
        ),
        wire(
          "w2",
          { componentId: "mcb", terminalId: "loadL" },
          { componentId: "out", terminalId: "lineL" },
        ),
        wire(
          "w3",
          { componentId: "out", terminalId: "lineN" },
          { componentId: "mcb", terminalId: "loadN" },
        ),
        wire(
          "w4",
          { componentId: "mcb", terminalId: "lineN" },
          { componentId: "bat", terminalId: "negative" },
        ),
      ],
    );
    circuit.reglas = {
      requiereCircuitoCerrado: true,
      componentesObligatorios: [],
      maxConexionesPorTerminal: 4,
    };
    const result = evaluateCircuit(circuit);
    expect(result.disparos?.some((trip) => trip.tipo === "sobrecarga")).toBe(
      true,
    );
  });

  it("el diferencial dispara si la fase de carga se une a tierra", () => {
    const poste: CircuitGraph["components"][number] = {
      id: "poste",
      kind: "lightPole",
      terminals: [
        { id: "lineL", polarity: "positive" },
        { id: "lineN", polarity: "negative" },
      ],
    };
    const rcd: CircuitGraph["components"][number] = {
      id: "rcd",
      kind: "rcd",
      terminals: [
        { id: "lineL", polarity: "a" },
        { id: "lineN", polarity: "b" },
        { id: "loadL", polarity: "a" },
        { id: "loadN", polarity: "b" },
      ],
      state: { switchClosed: true },
    };
    const bulbPart = bulb();
    const gnd: CircuitGraph["components"][number] = {
      id: "gnd",
      kind: "ground",
      terminals: [{ id: "earth", polarity: "earth" }],
    };
    const circuit = graph(
      [poste, rcd, bulbPart, gnd],
      [
        wire(
          "w1",
          { componentId: "poste", terminalId: "lineL" },
          { componentId: "rcd", terminalId: "lineL" },
        ),
        wire(
          "w2",
          { componentId: "poste", terminalId: "lineN" },
          { componentId: "rcd", terminalId: "lineN" },
        ),
        wire(
          "w3",
          { componentId: "rcd", terminalId: "loadL" },
          { componentId: "bulb", terminalId: "a" },
        ),
        wire(
          "w4",
          { componentId: "rcd", terminalId: "loadN" },
          { componentId: "bulb", terminalId: "b" },
        ),
        wire(
          "fuga",
          { componentId: "bulb", terminalId: "a" },
          { componentId: "gnd", terminalId: "earth" },
        ),
      ],
    );
    circuit.reglas = {
      requiereCircuitoCerrado: true,
      componentesObligatorios: [],
      maxConexionesPorTerminal: 4,
    };
    const result = evaluateCircuit(circuit);
    expect(result.disparos?.some((trip) => trip.tipo === "fuga")).toBe(true);
    expect(
      result.avisos?.some((aviso) => aviso.codigo.startsWith("fuga_cable_")),
    ).toBe(true);
    expect(result.mensajes[0]?.codigo).toBe("instalacion_insegura");
    expect(result.energizados).toEqual([]);
  });

  it("avisa si el electrodoméstico funciona sin tierra", () => {
    const outlet: CircuitGraph["components"][number] = {
      id: "out",
      kind: "outlet",
      terminals: [
        { id: "lineL", polarity: "a" },
        { id: "lineN", polarity: "b" },
        { id: "earth", polarity: "earth" },
      ],
      state: { watts: 150, pluggedIds: ["fridge"] },
    };
    const fridge: CircuitGraph["components"][number] = {
      id: "fridge",
      kind: "appliance",
      terminals: [{ id: "plug", polarity: "a" }],
      state: { watts: 150, switchClosed: true },
    };
    const circuit = graph(
      [battery(), sw("sw", true), outlet, fridge],
      [
        wire(
          "w1",
          { componentId: "bat", terminalId: "positive" },
          { componentId: "sw", terminalId: "a" },
        ),
        wire(
          "w2",
          { componentId: "sw", terminalId: "b" },
          { componentId: "out", terminalId: "lineL" },
        ),
        wire(
          "w3",
          { componentId: "out", terminalId: "lineN" },
          { componentId: "bat", terminalId: "negative" },
        ),
      ],
    );
    circuit.reglas = {
      requiereCircuitoCerrado: true,
      componentesObligatorios: [],
      maxConexionesPorTerminal: 4,
    };
    const result = evaluateCircuit(circuit);
    expect(result.avisos?.some((aviso) => aviso.codigo.startsWith("sin_tierra"))).toBe(
      true,
    );
  });

  it("el voltímetro lee 220 V entre fase y neutro del poste", () => {
    const poste: CircuitGraph["components"][number] = {
      id: "poste",
      kind: "lightPole",
      terminals: [
        { id: "lineL", polarity: "positive" },
        { id: "lineN", polarity: "negative" },
      ],
    };
    const meter: CircuitGraph["components"][number] = {
      id: "volt",
      kind: "voltmeter",
      terminals: [
        { id: "a", polarity: "a" },
        { id: "b", polarity: "b" },
      ],
    };
    const circuit = graph(
      [poste, meter],
      [
        wire(
          "w1",
          { componentId: "poste", terminalId: "lineL" },
          { componentId: "volt", terminalId: "a" },
        ),
        wire(
          "w2",
          { componentId: "poste", terminalId: "lineN" },
          { componentId: "volt", terminalId: "b" },
        ),
      ],
    );
    circuit.reglas = {
      requiereCircuitoCerrado: true,
      componentesObligatorios: [],
      maxConexionesPorTerminal: 4,
    };
    const result = evaluateCircuit(circuit);
    expect(result.tensiones?.volt).toBe(220);
    expect(result.estado).toBe("correcto");
    expect(result.mensajes[0]?.codigo).toBe("medicion");
  });

  it("el detector de voltaje enciende solo si la punta toca la fase", () => {
    const poste: CircuitGraph["components"][number] = {
      id: "poste",
      kind: "lightPole",
      terminals: [
        { id: "lineL", polarity: "positive" },
        { id: "lineN", polarity: "negative" },
      ],
    };
    const onLive: CircuitGraph["components"][number] = {
      id: "pen-live",
      kind: "voltageDetector",
      terminals: [{ id: "tip", polarity: "a" }],
    };
    const onNeutral: CircuitGraph["components"][number] = {
      id: "pen-neutral",
      kind: "voltageDetector",
      terminals: [{ id: "tip", polarity: "a" }],
    };
    const circuit = graph(
      [poste, onLive, onNeutral],
      [
        wire(
          "w1",
          { componentId: "poste", terminalId: "lineL" },
          { componentId: "pen-live", terminalId: "tip" },
        ),
        wire(
          "w2",
          { componentId: "poste", terminalId: "lineN" },
          { componentId: "pen-neutral", terminalId: "tip" },
        ),
      ],
    );
    circuit.reglas = {
      requiereCircuitoCerrado: true,
      componentesObligatorios: [],
      maxConexionesPorTerminal: 4,
    };
    const result = evaluateCircuit(circuit);
    expect(result.detectores?.["pen-live"]).toBe(true);
    expect(result.detectores?.["pen-neutral"]).toBe(false);
  });

  it("el multímetro en continuidad avisa si las sondas se tocan", () => {
    const poste: CircuitGraph["components"][number] = {
      id: "poste",
      kind: "lightPole",
      terminals: [
        { id: "lineL", polarity: "positive" },
        { id: "lineN", polarity: "negative" },
      ],
    };
    const meter: CircuitGraph["components"][number] = {
      id: "multi",
      kind: "multimeter",
      terminals: [
        { id: "a", polarity: "a" },
        { id: "b", polarity: "b" },
      ],
      state: { meterMode: "continuidad" },
    };
    const closed = graph(
      [poste, meter],
      [
        wire(
          "w1",
          { componentId: "multi", terminalId: "a" },
          { componentId: "multi", terminalId: "b" },
        ),
      ],
    );
    closed.reglas = {
      requiereCircuitoCerrado: true,
      componentesObligatorios: [],
      maxConexionesPorTerminal: 4,
    };
    expect(evaluateCircuit(closed).continuidades?.multi).toBe(true);
  });

  it("enciende dos ampolletas en paralelo", () => {
    const result = evaluateCircuit({
      components: [battery(), sw("sw", true), bulb("bulb-1"), bulb("bulb-2")],
      wires: [
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
          { componentId: "sw", terminalId: "b" },
          { componentId: "bulb-2", terminalId: "a" },
        ),
        wire(
          "w4",
          { componentId: "bulb-1", terminalId: "b" },
          { componentId: "bat", terminalId: "negative" },
        ),
        wire(
          "w5",
          { componentId: "bulb-2", terminalId: "b" },
          { componentId: "bat", terminalId: "negative" },
        ),
      ],
      reglas: {
        requiereCircuitoCerrado: true,
        componentesObligatorios: ["battery", "switch", "bulb"],
        maxConexionesPorTerminal: 2,
        minPorTipo: { bulb: 2 },
      },
    });
    expect(result.estado).toBe("correcto");
    expect(result.mensajes[0]?.tipo).toBe("exito");
    expect(result.energizados).toEqual(
      expect.arrayContaining(["bulb-1", "bulb-2"]),
    );
    expect(result.mensajes[0]?.texto).toMatch(/propio camino/i);
  });

  it("exige el conductor de tierra cuando la lección lo pide", () => {
    const lamp = {
      ...bulb(),
      terminals: [
        ...bulb().terminals,
        { id: "earth" as const, polarity: "earth" as const },
      ],
    };
    const gnd = {
      id: "gnd",
      kind: "ground" as const,
      terminals: [{ id: "earth", polarity: "earth" as const }],
    };
    const work = correctSeries();
    work.components = [battery(), sw("sw", true), lamp, gnd];
    work.reglas = {
      requiereCircuitoCerrado: true,
      componentesObligatorios: ["battery", "switch", "bulb"],
      maxConexionesPorTerminal: 1,
      requiereTierra: true,
    };
    const withoutPe = evaluateCircuit(work);
    expect(withoutPe.estado).toBe("correcto");
    expect(withoutPe.energizados).toEqual(["bulb"]);
    expect(withoutPe.mensajes[0]?.tipo).toBe("error");
    expect(withoutPe.avisos?.some((aviso) => aviso.codigo === "falta_tierra")).toBe(
      true,
    );

    work.wires = [
      ...work.wires,
      wire(
        "pe",
        { componentId: "bulb", terminalId: "earth" },
        { componentId: "gnd", terminalId: "earth" },
      ),
    ];
    const withPe = evaluateCircuit(work);
    expect(withPe.estado).toBe("correcto");
    expect(withPe.mensajes[0]?.tipo).toBe("exito");
  });

  it("no celebra si el interruptor corta solo el neutro", () => {
    const result = evaluateCircuit(
      graph(
        [battery(), sw("sw", true), bulb()],
        [
          wire(
            "w1",
            { componentId: "bat", terminalId: "positive" },
            { componentId: "bulb", terminalId: "a" },
          ),
          wire(
            "w2",
            { componentId: "bulb", terminalId: "b" },
            { componentId: "sw", terminalId: "a" },
          ),
          wire(
            "w3",
            { componentId: "sw", terminalId: "b" },
            { componentId: "bat", terminalId: "negative" },
          ),
        ],
      ),
    );
    expect(result.estado).toBe("correcto");
    expect(result.mensajes[0]?.tipo).toBe("error");
    expect(
      result.avisos?.some((aviso) => aviso.codigo.startsWith("neutro_conmutado")),
    ).toBe(true);
  });

  it("pide el voltímetro en paralelo cuando la lección exige medición", () => {
    const closed = correctSeries();
    closed.components = [
      ...closed.components,
      {
        id: "volt",
        kind: "voltmeter",
        terminals: [
          { id: "a", polarity: "a" },
          { id: "b", polarity: "b" },
        ],
      },
    ];
    closed.reglas = {
      requiereCircuitoCerrado: true,
      componentesObligatorios: ["battery", "switch", "bulb", "voltmeter"],
      maxConexionesPorTerminal: 2,
      requiereMedicion: true,
    };
    const pending = evaluateCircuit(closed);
    expect(pending.estado).toBe("componente_sin_conectar");
    expect(pending.mensajes[0]?.codigo).toBe("medidor_sin_usar");

    closed.wires = [
      ...closed.wires,
      wire(
        "va",
        { componentId: "volt", terminalId: "a" },
        { componentId: "bat", terminalId: "positive" },
      ),
      wire(
        "vb",
        { componentId: "volt", terminalId: "b" },
        { componentId: "bat", terminalId: "negative" },
      ),
    ];
    const measured = evaluateCircuit(closed);
    expect(measured.estado).toBe("correcto");
    expect(measured.tensiones?.volt).toBe(220);
    expect(measured.mensajes[0]?.tipo).toBe("exito");
  });
});
