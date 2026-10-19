import type { CircuitBoardLayout } from "./flowTypes";

export interface LabCircuitPreset {
  id: string;
  nombre: string;
  nota?: string;
  layout: CircuitBoardLayout;
}

/** Ancho visual de cada pieza; los bornes de trabajo quedan en un mismo riel. */
const GAP = 120;
const ORIGIN_X = 80;
const RAIL = 280;
const SPLIT = 240;

const SPAN = {
  battery: { w: 230, hy: 12, h: 160 },
  switch: { w: 200, hy: 12, h: 230 },
  ammeter: { w: 200, hy: 12, h: 300 },
  bulb: { w: 170, hy: 12, h: 250 },
  ground: { w: 170, hy: 0, h: 160 },
  outlet: { w: 240, hy: 12, h: 300 },
  appliance: { w: 180, hy: 0, h: 280 },
  lightPole: { w: 200, hy: 12, h: 380 },
  mainSwitch: { w: 200, hy: 12, h: 300 },
  rcd: { w: 200, hy: 12, h: 300 },
  mcb: { w: 200, hy: 12, h: 300 },
  voltmeter: { w: 200, hy: 12, h: 300 },
};

function xAt(column: number, widths: number[]) {
  let x = ORIGIN_X;
  for (let index = 0; index < column; index += 1) {
    x += widths[index] + GAP;
  }
  return x;
}

function yOnRail(kind: keyof typeof SPAN, rail = RAIL) {
  return rail - SPAN[kind].hy;
}

function groundAfter(columnX: number, lampY: number) {
  return {
    x: columnX + SPAN.bulb.w + GAP,
    y: lampY + SPAN.bulb.h + 72,
  };
}

/** Tierra a la derecha, con el borne justo bajo la lámpara superior para un PE corto. */
function groundInGap(columnX: number, topLampY: number) {
  return {
    x: columnX + SPAN.bulb.w + GAP,
    y: topLampY + SPAN.bulb.h + 28,
  };
}

const serieCables: CircuitBoardLayout["cables"] = [
  {
    from: { kind: "battery", terminalId: "positive" },
    to: { kind: "switch", terminalId: "a" },
  },
  {
    from: { kind: "switch", terminalId: "b" },
    to: { kind: "bulb", terminalId: "a" },
  },
  {
    from: { kind: "bulb", terminalId: "b" },
    to: { kind: "battery", terminalId: "negative" },
  },
  {
    from: { kind: "bulb", terminalId: "earth" },
    to: { kind: "ground", terminalId: "earth" },
  },
];

const SERIE_WIDTHS = [SPAN.battery.w, SPAN.switch.w, SPAN.bulb.w];
const serieX = {
  battery: xAt(0, SERIE_WIDTHS),
  switch: xAt(1, SERIE_WIDTHS),
  bulb: xAt(2, SERIE_WIDTHS),
};

const seriePiezas: CircuitBoardLayout["piezas"] = [
  { kind: "battery", position: { x: serieX.battery, y: yOnRail("battery") } },
  { kind: "switch", position: { x: serieX.switch, y: yOnRail("switch") } },
  { kind: "bulb", position: { x: serieX.bulb, y: yOnRail("bulb") } },
  {
    kind: "ground",
    position: groundAfter(serieX.bulb, yOnRail("bulb")),
  },
];

const PAR_WIDTHS = [SPAN.battery.w, SPAN.switch.w, SPAN.bulb.w];
const parX = {
  battery: xAt(0, PAR_WIDTHS),
  switch: xAt(1, PAR_WIDTHS),
  bulbs: xAt(2, PAR_WIDTHS),
};
const PAR_TOP = yOnRail("bulb", RAIL - SPLIT);
const PAR_BOTTOM = yOnRail("bulb", RAIL + SPLIT);

const MIX_WIDTHS = [SPAN.battery.w, SPAN.switch.w, SPAN.bulb.w, SPAN.bulb.w];
const mixX = {
  battery: xAt(0, MIX_WIDTHS),
  switch: xAt(1, MIX_WIDTHS),
  series: xAt(2, MIX_WIDTHS),
  parallel: xAt(3, MIX_WIDTHS),
};
const MIX_TOP = yOnRail("bulb");
const MIX_BOTTOM = MIX_TOP + SPAN.bulb.h + 140;

const TRES_WIDTHS = [
  SPAN.battery.w,
  SPAN.switch.w,
  SPAN.bulb.w,
  SPAN.bulb.w,
  SPAN.bulb.w,
];
const tresX = {
  battery: xAt(0, TRES_WIDTHS),
  switch: xAt(1, TRES_WIDTHS),
  b0: xAt(2, TRES_WIDTHS),
  b1: xAt(3, TRES_WIDTHS),
  b2: xAt(4, TRES_WIDTHS),
};

const METER_WIDTHS = [
  SPAN.battery.w,
  SPAN.switch.w,
  SPAN.ammeter.w,
  SPAN.bulb.w,
];
const meterX = {
  battery: xAt(0, METER_WIDTHS),
  switch: xAt(1, METER_WIDTHS),
  meter: xAt(2, METER_WIDTHS),
  bulb: xAt(3, METER_WIDTHS),
};

const OUTLET_METER_WIDTHS = [
  SPAN.lightPole.w,
  SPAN.ammeter.w,
  SPAN.outlet.w,
];
const outletMeterX = {
  pole: xAt(0, OUTLET_METER_WIDTHS),
  meter: xAt(1, OUTLET_METER_WIDTHS),
  outlet: xAt(2, OUTLET_METER_WIDTHS),
  fridge: xAt(2, OUTLET_METER_WIDTHS) + SPAN.outlet.w + GAP,
};

/** Fila única: mismo techo visual y hueco amplio para los puentes L/N. */
const ROW = 96;
const GUTTER = 196;
const SHELF = ROW + 316;

function along(kinds: Array<keyof typeof SPAN>, gutter = GUTTER) {
  const xs: number[] = [];
  let x = ORIGIN_X;
  for (const kind of kinds) {
    xs.push(x);
    x += SPAN[kind].w + gutter;
  }
  return xs;
}

const houseX = along([
  "lightPole",
  "mainSwitch",
  "rcd",
  "mcb",
  "outlet",
  "bulb",
]);

const HOUSE = {
  pole: { x: houseX[0], y: ROW },
  general: { x: houseX[1], y: ROW },
  rcd: { x: houseX[2], y: ROW },
  mcb: { x: houseX[3], y: ROW },
  outlet: { x: houseX[4], y: ROW },
  bulb: { x: houseX[5], y: ROW },
  fridge: { x: houseX[4] + 24, y: SHELF },
  ground: { x: houseX[5] + SPAN.bulb.w + 40, y: SHELF },
};

const overX = along(["lightPole", "ammeter", "mcb", "outlet", "outlet"]);

const OVER = {
  pole: { x: overX[0], y: ROW },
  meter: { x: overX[1], y: ROW },
  mcb: { x: overX[2], y: ROW },
  out0: { x: overX[3], y: ROW },
  out1: { x: overX[4], y: ROW },
  fridge: { x: overX[3] + 24, y: SHELF },
  kettle: { x: overX[4] + 24, y: SHELF },
  ground: { x: overX[4] + SPAN.outlet.w + 40, y: SHELF },
};

const fugaX = along(["lightPole", "rcd", "bulb"]);

const FUGA = {
  pole: { x: fugaX[0], y: ROW },
  rcd: { x: fugaX[1], y: ROW },
  bulb: { x: fugaX[2], y: ROW },
  ground: { x: fugaX[2] + SPAN.bulb.w - 34, y: ROW + 256 },
};

const peX = along(["lightPole", "outlet", "voltmeter"]);

const PE = {
  pole: { x: peX[0], y: ROW },
  outlet: { x: peX[1], y: ROW },
  volt: { x: peX[2], y: ROW },
  fridge: { x: peX[1] + 28, y: SHELF },
};

const POSTE_VOLT = {
  pole: { x: ORIGIN_X, y: ROW },
  volt: { x: ORIGIN_X + SPAN.lightPole.w + GUTTER, y: ROW },
};

const outletVoltX = along(["lightPole", "outlet", "voltmeter"]);

const OUTLET_VOLT = {
  pole: { x: outletVoltX[0], y: ROW },
  outlet: { x: outletVoltX[1], y: ROW },
  volt: { x: outletVoltX[2], y: ROW },
  fridge: { x: outletVoltX[1] + 28, y: SHELF },
  ground: { x: outletVoltX[2] + 12, y: SHELF },
};

export const LAB_CIRCUITS: LabCircuitPreset[] = [
  {
    id: "tablero-casa",
    nombre: "Tablero de casa",
    nota: "Orden seguro: general, diferencial y automático. La tierra no se corta.",
    layout: {
      piezas: [
        { kind: "lightPole", position: HOUSE.pole },
        { kind: "mainSwitch", position: HOUSE.general },
        { kind: "rcd", position: HOUSE.rcd },
        { kind: "mcb", position: HOUSE.mcb },
        { kind: "bulb", position: HOUSE.bulb },
        { kind: "outlet", position: HOUSE.outlet },
        {
          kind: "appliance",
          applianceId: "refrigerador",
          encendido: true,
          position: HOUSE.fridge,
        },
        { kind: "ground", position: HOUSE.ground },
      ],
      cables: [
        {
          from: { kind: "lightPole", terminalId: "lineL" },
          to: { kind: "mainSwitch", terminalId: "lineL" },
        },
        {
          from: { kind: "lightPole", terminalId: "lineN" },
          to: { kind: "mainSwitch", terminalId: "lineN" },
        },
        {
          from: { kind: "mainSwitch", terminalId: "loadL" },
          to: { kind: "rcd", terminalId: "lineL" },
        },
        {
          from: { kind: "mainSwitch", terminalId: "loadN" },
          to: { kind: "rcd", terminalId: "lineN" },
        },
        {
          from: { kind: "rcd", terminalId: "loadL" },
          to: { kind: "mcb", terminalId: "lineL" },
        },
        {
          from: { kind: "rcd", terminalId: "loadN" },
          to: { kind: "mcb", terminalId: "lineN" },
        },
        {
          from: { kind: "mcb", terminalId: "loadL" },
          to: { kind: "bulb", terminalId: "a" },
        },
        {
          from: { kind: "mcb", terminalId: "loadL" },
          to: { kind: "outlet", terminalId: "lineL" },
        },
        {
          from: { kind: "mcb", terminalId: "loadN" },
          to: { kind: "bulb", terminalId: "b" },
        },
        {
          from: { kind: "mcb", terminalId: "loadN" },
          to: { kind: "outlet", terminalId: "lineN" },
        },
        {
          from: { kind: "outlet", terminalId: "earth" },
          to: { kind: "ground", terminalId: "earth" },
        },
        {
          from: { kind: "bulb", terminalId: "earth" },
          to: { kind: "ground", terminalId: "earth" },
        },
        {
          from: { kind: "appliance", terminalId: "plug" },
          to: { kind: "outlet", terminalId: "socket0" },
        },
      ],
      interruptorCerrado: true,
    },
  },
  {
    id: "sobrecarga-automatico",
    nombre: "Sobrecarga del automático",
    nota: "El automático abre si la corriente supera 10 A. No es un fallo de cableado.",
    layout: {
      piezas: [
        { kind: "lightPole", position: OVER.pole },
        { kind: "ammeter", position: OVER.meter },
        { kind: "mcb", position: OVER.mcb },
        { kind: "outlet", position: OVER.out0 },
        {
          kind: "appliance",
          applianceId: "refrigerador",
          encendido: true,
          position: OVER.fridge,
        },
        { kind: "outlet", position: OVER.out1 },
        {
          kind: "appliance",
          applianceId: "hervidor",
          encendido: true,
          position: OVER.kettle,
        },
        { kind: "ground", position: OVER.ground },
      ],
      cables: [
        {
          from: { kind: "lightPole", terminalId: "lineL" },
          to: { kind: "ammeter", terminalId: "a" },
        },
        {
          from: { kind: "ammeter", terminalId: "b" },
          to: { kind: "mcb", terminalId: "lineL" },
        },
        {
          from: { kind: "lightPole", terminalId: "lineN" },
          to: { kind: "mcb", terminalId: "lineN" },
        },
        {
          from: { kind: "mcb", terminalId: "loadL" },
          to: { kind: "outlet", terminalId: "lineL", index: 0 },
        },
        {
          from: { kind: "mcb", terminalId: "loadL" },
          to: { kind: "outlet", terminalId: "lineL", index: 1 },
        },
        {
          from: { kind: "mcb", terminalId: "loadN" },
          to: { kind: "outlet", terminalId: "lineN", index: 0 },
        },
        {
          from: { kind: "mcb", terminalId: "loadN" },
          to: { kind: "outlet", terminalId: "lineN", index: 1 },
        },
        {
          from: { kind: "outlet", terminalId: "earth", index: 0 },
          to: { kind: "ground", terminalId: "earth" },
        },
        {
          from: { kind: "outlet", terminalId: "earth", index: 1 },
          to: { kind: "ground", terminalId: "earth" },
        },
        {
          from: { kind: "appliance", terminalId: "plug", index: 0 },
          to: { kind: "outlet", terminalId: "socket0", index: 0 },
        },
        {
          from: { kind: "appliance", terminalId: "plug", index: 1 },
          to: { kind: "outlet", terminalId: "socket0", index: 1 },
        },
      ],
      interruptorCerrado: true,
    },
  },
  {
    id: "fuga-tierra",
    nombre: "Fuga a tierra",
    nota: "Demostración de un fallo: la fase toca tierra y el diferencial dispara. No lo copies en una casa.",
    layout: {
      piezas: [
        { kind: "lightPole", position: FUGA.pole },
        { kind: "rcd", position: FUGA.rcd },
        { kind: "bulb", position: FUGA.bulb },
        { kind: "ground", position: FUGA.ground },
      ],
      cables: [
        {
          from: { kind: "lightPole", terminalId: "lineL" },
          to: { kind: "rcd", terminalId: "lineL" },
        },
        {
          from: { kind: "lightPole", terminalId: "lineN" },
          to: { kind: "rcd", terminalId: "lineN" },
        },
        {
          from: { kind: "rcd", terminalId: "loadL" },
          to: { kind: "bulb", terminalId: "a" },
        },
        {
          from: { kind: "rcd", terminalId: "loadN" },
          to: { kind: "bulb", terminalId: "b" },
        },
        {
          from: { kind: "bulb", terminalId: "a" },
          to: { kind: "ground", terminalId: "earth" },
        },
      ],
      interruptorCerrado: true,
    },
  },
  {
    id: "tomacorriente-sin-tierra",
    nombre: "Tomacorriente sin tierra",
    nota: "Ejemplo incompleto: el aparato enciende, pero falta el conductor de protección.",
    layout: {
      piezas: [
        { kind: "lightPole", position: PE.pole },
        { kind: "voltmeter", position: PE.volt },
        { kind: "outlet", position: PE.outlet },
        {
          kind: "appliance",
          applianceId: "refrigerador",
          encendido: true,
          position: PE.fridge,
        },
      ],
      cables: [
        {
          from: { kind: "lightPole", terminalId: "lineL" },
          to: { kind: "outlet", terminalId: "lineL" },
        },
        {
          from: { kind: "outlet", terminalId: "lineN" },
          to: { kind: "lightPole", terminalId: "lineN" },
        },
        {
          from: { kind: "voltmeter", terminalId: "a" },
          to: { kind: "outlet", terminalId: "lineL" },
        },
        {
          from: { kind: "voltmeter", terminalId: "b" },
          to: { kind: "outlet", terminalId: "lineN" },
        },
        {
          from: { kind: "appliance", terminalId: "plug" },
          to: { kind: "outlet", terminalId: "socket0" },
        },
      ],
      interruptorCerrado: true,
    },
  },
  {
    id: "tension-poste",
    nombre: "Tensión en el poste",
    layout: {
      piezas: [
        { kind: "lightPole", position: POSTE_VOLT.pole },
        { kind: "voltmeter", position: POSTE_VOLT.volt },
      ],
      cables: [
        {
          from: { kind: "lightPole", terminalId: "lineL" },
          to: { kind: "voltmeter", terminalId: "a" },
        },
        {
          from: { kind: "lightPole", terminalId: "lineN" },
          to: { kind: "voltmeter", terminalId: "b" },
        },
      ],
      interruptorCerrado: true,
    },
  },
  {
    id: "tension-tomacorriente",
    nombre: "Medición de tensión en tomacorriente",
    layout: {
      piezas: [
        { kind: "lightPole", position: OUTLET_VOLT.pole },
        { kind: "voltmeter", position: OUTLET_VOLT.volt },
        { kind: "outlet", position: OUTLET_VOLT.outlet },
        {
          kind: "appliance",
          applianceId: "refrigerador",
          encendido: true,
          position: OUTLET_VOLT.fridge,
        },
        { kind: "ground", position: OUTLET_VOLT.ground },
      ],
      cables: [
        {
          from: { kind: "lightPole", terminalId: "lineL" },
          to: { kind: "outlet", terminalId: "lineL" },
        },
        {
          from: { kind: "outlet", terminalId: "lineN" },
          to: { kind: "lightPole", terminalId: "lineN" },
        },
        {
          from: { kind: "voltmeter", terminalId: "a" },
          to: { kind: "outlet", terminalId: "lineL" },
        },
        {
          from: { kind: "voltmeter", terminalId: "b" },
          to: { kind: "outlet", terminalId: "lineN" },
        },
        {
          from: { kind: "outlet", terminalId: "earth" },
          to: { kind: "ground", terminalId: "earth" },
        },
        {
          from: { kind: "appliance", terminalId: "plug" },
          to: { kind: "outlet", terminalId: "socket0" },
        },
      ],
      interruptorCerrado: true,
    },
  },
  {
    id: "serie",
    nombre: "Circuito serie",
    layout: {
      piezas: seriePiezas,
      cables: serieCables,
      interruptorCerrado: true,
    },
  },
  {
    id: "paralelo",
    nombre: "Circuito paralelo",
    layout: {
      piezas: [
        {
          kind: "battery",
          position: { x: parX.battery, y: yOnRail("battery") },
        },
        {
          kind: "switch",
          position: { x: parX.switch, y: yOnRail("switch") },
        },
        { kind: "bulb", position: { x: parX.bulbs, y: PAR_TOP } },
        { kind: "bulb", position: { x: parX.bulbs, y: PAR_BOTTOM } },
        {
          kind: "ground",
          position: groundInGap(parX.bulbs, PAR_TOP),
        },
      ],
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
          from: { kind: "switch", terminalId: "b" },
          to: { kind: "bulb", terminalId: "a", index: 1 },
        },
        {
          from: { kind: "bulb", terminalId: "b", index: 0 },
          to: { kind: "battery", terminalId: "negative" },
        },
        {
          from: { kind: "bulb", terminalId: "b", index: 1 },
          to: { kind: "battery", terminalId: "negative" },
        },
        {
          from: { kind: "bulb", terminalId: "earth", index: 0 },
          to: { kind: "ground", terminalId: "earth" },
        },
        {
          from: { kind: "bulb", terminalId: "earth", index: 1 },
          to: { kind: "ground", terminalId: "earth" },
        },
      ],
      interruptorCerrado: true,
    },
  },
  {
    id: "mixto",
    nombre: "Circuito mixto serie-paralelo",
    layout: {
      piezas: [
        { kind: "battery", position: { x: mixX.battery, y: yOnRail("battery") } },
        { kind: "switch", position: { x: mixX.switch, y: yOnRail("switch") } },
        { kind: "bulb", position: { x: mixX.series, y: MIX_TOP } },
        { kind: "bulb", position: { x: mixX.parallel, y: MIX_TOP } },
        { kind: "bulb", position: { x: mixX.parallel, y: MIX_BOTTOM } },
        {
          kind: "ground",
          position: groundInGap(mixX.parallel, MIX_TOP),
        },
      ],
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
          to: { kind: "bulb", terminalId: "a", index: 1 },
        },
        {
          from: { kind: "bulb", terminalId: "b", index: 0 },
          to: { kind: "bulb", terminalId: "a", index: 2 },
        },
        {
          from: { kind: "bulb", terminalId: "b", index: 1 },
          to: { kind: "battery", terminalId: "negative" },
        },
        {
          from: { kind: "bulb", terminalId: "b", index: 2 },
          to: { kind: "battery", terminalId: "negative" },
        },
        {
          from: { kind: "bulb", terminalId: "earth", index: 1 },
          to: { kind: "ground", terminalId: "earth" },
        },
        {
          from: { kind: "bulb", terminalId: "earth", index: 2 },
          to: { kind: "ground", terminalId: "earth" },
        },
      ],
      interruptorCerrado: true,
    },
  },
  {
    id: "abierto",
    nombre: "Circuito abierto",
    layout: {
      piezas: seriePiezas,
      cables: serieCables,
      interruptorCerrado: false,
    },
  },
  {
    id: "serie-tres",
    nombre: "Circuito serie de tres cargas",
    layout: {
      piezas: [
        { kind: "battery", position: { x: tresX.battery, y: yOnRail("battery") } },
        { kind: "switch", position: { x: tresX.switch, y: yOnRail("switch") } },
        { kind: "bulb", position: { x: tresX.b0, y: yOnRail("bulb") } },
        { kind: "bulb", position: { x: tresX.b1, y: yOnRail("bulb") } },
        { kind: "bulb", position: { x: tresX.b2, y: yOnRail("bulb") } },
        {
          kind: "ground",
          position: groundAfter(tresX.b2, yOnRail("bulb")),
        },
      ],
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
          to: { kind: "bulb", terminalId: "a", index: 1 },
        },
        {
          from: { kind: "bulb", terminalId: "b", index: 1 },
          to: { kind: "bulb", terminalId: "a", index: 2 },
        },
        {
          from: { kind: "bulb", terminalId: "b", index: 2 },
          to: { kind: "battery", terminalId: "negative" },
        },
        {
          from: { kind: "bulb", terminalId: "earth", index: 0 },
          to: { kind: "ground", terminalId: "earth" },
        },
        {
          from: { kind: "bulb", terminalId: "earth", index: 1 },
          to: { kind: "ground", terminalId: "earth" },
        },
        {
          from: { kind: "bulb", terminalId: "earth", index: 2 },
          to: { kind: "ground", terminalId: "earth" },
        },
      ],
      interruptorCerrado: true,
    },
  },
  {
    id: "amperimetro-serie",
    nombre: "Medición de corriente en serie",
    layout: {
      piezas: [
        {
          kind: "battery",
          position: { x: meterX.battery, y: yOnRail("battery") },
        },
        {
          kind: "switch",
          position: { x: meterX.switch, y: yOnRail("switch") },
        },
        {
          kind: "ammeter",
          position: { x: meterX.meter, y: yOnRail("ammeter") },
        },
        { kind: "bulb", position: { x: meterX.bulb, y: yOnRail("bulb") } },
        {
          kind: "ground",
          position: groundAfter(meterX.bulb, yOnRail("bulb")),
        },
      ],
      cables: [
        {
          from: { kind: "battery", terminalId: "positive" },
          to: { kind: "switch", terminalId: "a" },
        },
        {
          from: { kind: "switch", terminalId: "b" },
          to: { kind: "ammeter", terminalId: "a" },
        },
        {
          from: { kind: "ammeter", terminalId: "b" },
          to: { kind: "bulb", terminalId: "a" },
        },
        {
          from: { kind: "bulb", terminalId: "b" },
          to: { kind: "battery", terminalId: "negative" },
        },
        {
          from: { kind: "bulb", terminalId: "earth" },
          to: { kind: "ground", terminalId: "earth" },
        },
      ],
      interruptorCerrado: true,
    },
  },
  {
    id: "tomacorriente-refrigerador",
    nombre: "Medición de corriente en tomacorriente",
    layout: {
      piezas: [
        {
          kind: "lightPole",
          position: { x: outletMeterX.pole, y: yOnRail("lightPole") },
        },
        {
          kind: "ammeter",
          position: { x: outletMeterX.meter, y: yOnRail("ammeter") },
        },
        {
          kind: "outlet",
          position: { x: outletMeterX.outlet, y: yOnRail("outlet") },
        },
        {
          kind: "appliance",
          applianceId: "refrigerador",
          encendido: true,
          position: {
            x: outletMeterX.fridge,
            y: yOnRail("outlet") + 36,
          },
        },
        {
          kind: "ground",
          position: {
            x: outletMeterX.outlet + 36,
            y: yOnRail("outlet") + SPAN.outlet.h + 56,
          },
        },
      ],
      cables: [
        {
          from: { kind: "lightPole", terminalId: "lineL" },
          to: { kind: "ammeter", terminalId: "a" },
        },
        {
          from: { kind: "ammeter", terminalId: "b" },
          to: { kind: "outlet", terminalId: "lineL" },
        },
        {
          from: { kind: "outlet", terminalId: "lineN" },
          to: { kind: "lightPole", terminalId: "lineN" },
        },
        {
          from: { kind: "outlet", terminalId: "earth" },
          to: { kind: "ground", terminalId: "earth" },
        },
        {
          from: { kind: "appliance", terminalId: "plug" },
          to: { kind: "outlet", terminalId: "socket0" },
        },
      ],
      interruptorCerrado: true,
    },
  },
];
