import type {
  AvailablePart,
  CircuitBoardLayout,
  CircuitLessonDefinition,
  CircuitSolutionWire,
  PlaceableKind,
} from "../flowTypes";
import {
  ARTICULO_ALTERNA,
  ARTICULO_CORRIENTE,
  ARTICULO_FASE_NEUTRO,
  ARTICULO_MEDIR,
  ARTICULO_OHM,
  ARTICULO_POTENCIA,
  ARTICULO_PROTECCIONES,
  ARTICULO_SEGURIDAD,
  ARTICULO_SERIE_PARALELO,
  ARTICULO_TENSION,
} from "../../courses/articles/domiciliaria";
import {
  LESSON_ACOMETIDA_ID,
  LESSON_ALTERNA_ID,
  LESSON_AUTOMATICO_ID,
  LESSON_COMO_SE_MIDE_ID,
  LESSON_CORRIENTE_CASA_ID,
  LESSON_CORRIENTE_TEORIA_ID,
  LESSON_CORTAR_FASE_ID,
  LESSON_DIFERENCIAL_ID,
  LESSON_ENCHUFE_CASA_ID,
  LESSON_FASE_NEUTRO_ID,
  LESSON_FUGA_ID,
  LESSON_GENERAL_ID,
  LESSON_LUZ_ENCHUFE_ID,
  LESSON_OHM_ID,
  LESSON_POTENCIA_ID,
  LESSON_PROTECCIONES_ID,
  LESSON_PUNTO_LUZ_ID,
  LESSON_SEGURIDAD_CASA_ID,
  LESSON_SERIE_PARALELO_CASA_ID,
  LESSON_TABLERO_VIVIENDA_ID,
  LESSON_TENSION_ENCHUFE_ID,
  LESSON_TENSION_TEORIA_ID,
  LESSON_TIERRA_FALTA_ID,
  MODULE_ACOMETIDA_ID,
  MODULE_MAGNITUDES_ID,
  MODULE_MEDICION_CASA_ID,
  MODULE_OBRA_ID,
  MODULE_VIVIENDA_ID,
} from "../../courses/ids";
import type { ArticleContent, LessonType } from "../../courses/types";

type Piece = CircuitBoardLayout["piezas"][number];

function pieza(
  kind: PlaceableKind,
  x: number,
  y: number,
  extra?: { applianceId?: string; encendido?: boolean },
): Piece {
  return { kind, position: { x, y }, ...extra };
}

function cable(
  fromKind: CircuitSolutionWire["from"]["kind"],
  fromTerm: string,
  toKind: CircuitSolutionWire["to"]["kind"],
  toTerm: string,
): CircuitSolutionWire {
  return {
    from: { kind: fromKind, terminalId: fromTerm },
    to: { kind: toKind, terminalId: toTerm },
  };
}

const poste = { kind: "lightPole" as const, label: "Poste de luz", count: 1 };
const palanca = { kind: "switch" as const, label: "Interruptor", count: 1 };
const lampara = { kind: "bulb" as const, label: "Portalámparas", count: 1 };
const tierra = { kind: "ground" as const, label: "Tierra", count: 1 };
const general = {
  kind: "mainSwitch" as const,
  label: "Interruptor general",
  count: 1,
};
const diferencial = {
  kind: "rcd" as const,
  label: "Interruptor diferencial",
  count: 1,
};
const automatico = {
  kind: "mcb" as const,
  label: "Interruptor automático",
  count: 1,
};
const toma = { kind: "outlet" as const, label: "Tomacorriente", count: 1 };
const equipo = {
  kind: "appliance" as const,
  label: "Electrodoméstico",
  count: 1,
};
const tension = {
  kind: "voltmeter" as const,
  label: "Medidor de tensión",
  count: 1,
};
const corriente = {
  kind: "ammeter" as const,
  label: "Medidor de corriente",
  count: 1,
};

function partes(...items: AvailablePart[]): AvailablePart[] {
  return items;
}

function tablero(
  piezas: Piece[],
  cables: CircuitSolutionWire[],
  interruptorCerrado: boolean,
): CircuitBoardLayout {
  return { piezas, cables, interruptorCerrado };
}

const POLE = pieza("lightPole", 40, 80);
const SWITCH = pieza("switch", 280, 80);
const BULB = pieza("bulb", 520, 80);
const GROUND = pieza("ground", 760, 200);
const MAIN = pieza("mainSwitch", 280, 40);
const RCD = pieza("rcd", 520, 40);
const MCB = pieza("mcb", 760, 40);
const OUTLET = pieza("outlet", 520, 280);
const PC = pieza("appliance", 760, 280, {
  applianceId: "computador",
  encendido: true,
});
const VOLT = pieza("voltmeter", 980, 80);
const AMP = pieza("ammeter", 280, 80);

const RED = [
  cable("lightPole", "lineL", "mainSwitch", "lineL"),
  cable("lightPole", "lineN", "mainSwitch", "lineN"),
];
const GENERAL_A_DIFERENCIAL = [
  cable("mainSwitch", "loadL", "rcd", "lineL"),
  cable("mainSwitch", "loadN", "rcd", "lineN"),
];
const DIFERENCIAL_A_AUTOMATICO = [
  cable("rcd", "loadL", "mcb", "lineL"),
  cable("rcd", "loadN", "mcb", "lineN"),
];
const POSTE_A_AUTOMATICO = [
  cable("lightPole", "lineL", "mcb", "lineL"),
  cable("lightPole", "lineN", "mcb", "lineN"),
];
const TIERRA_LAMPARA = cable("bulb", "earth", "ground", "earth");
const TIERRA_TOMA = cable("outlet", "earth", "ground", "earth");
const ENCHUFE = cable("appliance", "plug", "outlet", "socket0");

const CABLES_ACOMETIDA = [
  cable("lightPole", "lineL", "switch", "a"),
  cable("switch", "b", "bulb", "a"),
  cable("bulb", "b", "lightPole", "lineN"),
  TIERRA_LAMPARA,
];

const CABLES_GENERAL = [
  ...RED,
  cable("mainSwitch", "loadL", "bulb", "a"),
  cable("mainSwitch", "loadN", "bulb", "b"),
  TIERRA_LAMPARA,
];

const CABLES_DIFERENCIAL = [
  ...RED,
  ...GENERAL_A_DIFERENCIAL,
  cable("rcd", "loadL", "bulb", "a"),
  cable("rcd", "loadN", "bulb", "b"),
  TIERRA_LAMPARA,
];

const CABLES_AUTOMATICO = [
  ...RED,
  ...GENERAL_A_DIFERENCIAL,
  ...DIFERENCIAL_A_AUTOMATICO,
  cable("mcb", "loadL", "bulb", "a"),
  cable("mcb", "loadN", "bulb", "b"),
  TIERRA_LAMPARA,
];

const CABLES_PUNTO_LUZ = [
  ...POSTE_A_AUTOMATICO,
  cable("mcb", "loadL", "switch", "a"),
  cable("switch", "b", "bulb", "a"),
  cable("bulb", "b", "mcb", "loadN"),
  TIERRA_LAMPARA,
];

const CABLES_ENCHUFE = [
  ...POSTE_A_AUTOMATICO,
  cable("mcb", "loadL", "outlet", "lineL"),
  cable("mcb", "loadN", "outlet", "lineN"),
  TIERRA_TOMA,
  ENCHUFE,
];

const CABLES_LUZ_Y_ENCHUFE = [
  ...POSTE_A_AUTOMATICO,
  cable("mcb", "loadL", "switch", "a"),
  cable("switch", "b", "bulb", "a"),
  cable("bulb", "b", "mcb", "loadN"),
  cable("mcb", "loadL", "outlet", "lineL"),
  cable("mcb", "loadN", "outlet", "lineN"),
  TIERRA_LAMPARA,
  TIERRA_TOMA,
  ENCHUFE,
];

const CABLES_TENSION = [
  ...CABLES_ENCHUFE,
  cable("voltmeter", "a", "outlet", "lineL"),
  cable("voltmeter", "b", "outlet", "lineN"),
];

const CABLES_CORRIENTE = [
  cable("lightPole", "lineL", "ammeter", "a"),
  cable("ammeter", "b", "mcb", "lineL"),
  cable("lightPole", "lineN", "mcb", "lineN"),
  cable("mcb", "loadL", "bulb", "a"),
  cable("mcb", "loadN", "bulb", "b"),
  TIERRA_LAMPARA,
];

const CABLES_SIN_TIERRA = [
  ...POSTE_A_AUTOMATICO,
  cable("mcb", "loadL", "outlet", "lineL"),
  cable("mcb", "loadN", "outlet", "lineN"),
  ENCHUFE,
];

const CABLES_NEUTRO = [
  ...POSTE_A_AUTOMATICO,
  cable("mcb", "loadL", "bulb", "a"),
  cable("bulb", "b", "switch", "a"),
  cable("switch", "b", "mcb", "loadN"),
  TIERRA_LAMPARA,
];

const CABLES_FUGA_SANA = [
  cable("lightPole", "lineL", "rcd", "lineL"),
  cable("lightPole", "lineN", "rcd", "lineN"),
  ...DIFERENCIAL_A_AUTOMATICO,
  cable("mcb", "loadL", "bulb", "a"),
  cable("mcb", "loadN", "bulb", "b"),
  TIERRA_LAMPARA,
];
const CABLE_FUGA = cable("mcb", "loadL", "ground", "earth");

const CABLES_VIVIENDA = [
  ...RED,
  ...GENERAL_A_DIFERENCIAL,
  ...DIFERENCIAL_A_AUTOMATICO,
  cable("mcb", "loadL", "switch", "a"),
  cable("switch", "b", "bulb", "a"),
  cable("bulb", "b", "mcb", "loadN"),
  cable("mcb", "loadL", "outlet", "lineL"),
  cable("mcb", "loadN", "outlet", "lineN"),
  TIERRA_LAMPARA,
  TIERRA_TOMA,
  ENCHUFE,
];

const PIEZAS_ACOMETIDA = [POLE, SWITCH, BULB, GROUND];
const PIEZAS_GENERAL = [POLE, MAIN, BULB, GROUND];
const PIEZAS_DIFERENCIAL = [POLE, MAIN, RCD, BULB, GROUND];
const PIEZAS_AUTOMATICO = [POLE, MAIN, RCD, MCB, BULB, GROUND];
const PIEZAS_PUNTO = [POLE, MCB, SWITCH, BULB, GROUND];
const PIEZAS_ENCHUFE = [POLE, MCB, OUTLET, PC, GROUND];
const PIEZAS_LUZ_ENCHUFE = [POLE, MCB, SWITCH, BULB, OUTLET, PC, GROUND];
const PIEZAS_TENSION = [POLE, MCB, OUTLET, PC, VOLT, GROUND];
const PIEZAS_CORRIENTE = [POLE, AMP, MCB, BULB, GROUND];
const PIEZAS_FALLA_TOMA = [POLE, MCB, OUTLET, PC, GROUND];
const PIEZAS_FALLA_LUZ = [POLE, MCB, SWITCH, BULB, GROUND];
const PIEZAS_FUGA = [POLE, RCD, MCB, BULB, GROUND];
const PIEZAS_VIVIENDA = [POLE, MAIN, RCD, MCB, SWITCH, BULB, OUTLET, PC, GROUND];

export interface DomiciliariaLessonMeta {
  id: string;
  slug: string;
  title: string;
  description: string;
  lessonType: LessonType;
  content: CircuitLessonDefinition | ArticleContent;
}

export interface DomiciliariaModuleMeta {
  id: string;
  title: string;
  description: string;
  sortOrder: number;
  lessons: DomiciliariaLessonMeta[];
}

function leccion(
  id: string,
  slug: string,
  title: string,
  description: string,
  content: CircuitLessonDefinition,
): DomiciliariaLessonMeta {
  return {
    id,
    slug,
    title,
    description,
    lessonType: "interactive",
    content,
  };
}

function teoria(
  id: string,
  slug: string,
  title: string,
  description: string,
  content: ArticleContent,
): DomiciliariaLessonMeta {
  return {
    id,
    slug,
    title,
    description,
    lessonType: "article",
    content,
  };
}

export const DOMICILIARIA_MODULES: DomiciliariaModuleMeta[] = [
  {
    id: MODULE_MAGNITUDES_ID,
    title: "Las magnitudes",
    description:
      "Tensión, corriente, resistencia, potencia y la red alterna de la vivienda.",
    sortOrder: 1,
    lessons: [
      teoria(
        LESSON_TENSION_TEORIA_ID,
        "que-es-la-tension",
        "Qué es la tensión",
        "El voltaje es una diferencia entre dos puntos. En casa, 220 V entre fase y neutro.",
        ARTICULO_TENSION,
      ),
      teoria(
        LESSON_CORRIENTE_TEORIA_ID,
        "que-es-la-corriente",
        "Qué es la corriente",
        "El ampere mide cuánta carga pasa por el circuito. Sin camino cerrado, no hay corriente.",
        ARTICULO_CORRIENTE,
      ),
      teoria(
        LESSON_OHM_ID,
        "resistencia-y-ohm",
        "Resistencia y la ley de Ohm",
        "V = I × R. La red pone la tensión; la carga pone la resistencia; de ahí sale la corriente.",
        ARTICULO_OHM,
      ),
      teoria(
        LESSON_POTENCIA_ID,
        "potencia-y-energia",
        "Potencia y energía",
        "Los watts son el ritmo. Los kilowatts-hora son lo que cuenta el medidor de la compañía.",
        ARTICULO_POTENCIA,
      ),
      teoria(
        LESSON_ALTERNA_ID,
        "la-corriente-alterna",
        "La corriente alterna",
        "La red no es una pila: 220 V eficaces y 50 ciclos por segundo, entre fase y neutro.",
        ARTICULO_ALTERNA,
      ),
    ],
  },
  {
    id: MODULE_ACOMETIDA_ID,
    title: "La acometida y el tablero",
    description:
      "Fase, neutro y tierra, y el orden en que la energía entra a la casa.",
    sortOrder: 2,
    lessons: [
      teoria(
        LESSON_FASE_NEUTRO_ID,
        "fase-neutro-y-tierra",
        "Fase, neutro y tierra",
        "Tres conductores, tres oficios. Solo dos llevan la corriente de las cargas.",
        ARTICULO_FASE_NEUTRO,
      ),
      teoria(
        LESSON_SEGURIDAD_CASA_ID,
        "seguridad-en-la-vivienda",
        "Seguridad en la vivienda",
        "220 V alcanzan para ser graves. En la casa real se corta y se comprueba; aquí se practica el orden.",
        ARTICULO_SEGURIDAD,
      ),
      leccion(
        LESSON_ACOMETIDA_ID,
        "la-acometida",
        "La acometida",
        "Trae la fase y el neutro del poste hasta una lámpara, con el interruptor en la fase.",
        {
          simulation: "circuit",
          concepto:
            "La acometida es el punto donde la red llega a la vivienda. En el tablero el poste es esa red: fase y neutro de 220 V. El interruptor va en la fase, la lámpara es la carga y la tierra protege la carcasa. Todavía no hay tablero: primero el círculo de la casa.",
          objetivo: "Enciende la lámpara desde el poste de la acometida",
          lectura: [
            {
              type: "h2",
              text: "Por dónde entra la energía",
            },
            {
              type: "p",
              text: "Fase del poste al interruptor, del interruptor al portalámparas, neutro de vuelta al poste y tierra a la carcasa. Ese es el alumbrado mínimo de una vivienda. Enciende el interruptor y pulsa Comprobar.",
            },
            {
              type: "ul",
              items: [
                "Poste de luz · fase → Interruptor · borne A.",
                "Interruptor · borne B → Portalámparas · borne A.",
                "Portalámparas · borne B → Poste de luz · neutro.",
                "Portalámparas · tierra → Tierra · tierra. Ese cable no alimenta la luz.",
              ],
            },
          ],
          pistaInicial:
            "La fase pasa por el interruptor. El neutro vuelve directo del portalámparas al poste. La tierra va a la carcasa. Enciende y comprueba.",
          componentesDisponibles: partes(poste, palanca, lampara, tierra),
          reglas: {
            requiereCircuitoCerrado: true,
            componentesObligatorios: ["lightPole", "switch", "bulb"],
            maxConexionesPorTerminal: 1,
            requiereTierra: true,
          },
          tableroInicial: tablero(PIEZAS_ACOMETIDA, [], false),
          solucion: {
            explicacion:
              "La fase del poste pasa por el interruptor y llega al portalámparas. El neutro vuelve al poste. La tierra queda en la carcasa. Así empieza una instalación domiciliaria.",
            ...tablero(PIEZAS_ACOMETIDA, CABLES_ACOMETIDA, true),
          },
        },
      ),
      leccion(
        LESSON_GENERAL_ID,
        "el-interruptor-general",
        "El interruptor general",
        "Corta fase y neutro juntos: es el primer aparato del tablero.",
        {
          simulation: "circuit",
          concepto:
            "El interruptor general corta la vivienda entera. Fase y neutro entran por arriba y salen por abajo. La tierra no se corta: sigue directa a la carcasa. Si el general está abierto, la casa queda sin energía.",
          objetivo: "Pasa fase y neutro por el interruptor general",
          lectura: [
            {
              type: "h2",
              text: "El corte de toda la casa",
            },
            {
              type: "p",
              text: "En un tablero real el general es lo primero después de la acometida. En este tablero une los cuatro bornes de trabajo: fase entrada, neutro entrada, fase salida y neutro salida. La tierra del portalámparas va al conector de tierra, sin pasar por el general.",
            },
            {
              type: "ul",
              items: [
                "Poste · fase → General · fase entrada. Poste · neutro → General · neutro entrada.",
                "General · fase salida → Portalámparas · borne A.",
                "General · neutro salida → Portalámparas · borne B.",
                "La tierra no entra al general.",
              ],
            },
          ],
          pistaInicial:
            "Fase y neutro entran al general y salen hacia la lámpara. La tierra va aparte, del portalámparas al conector de tierra.",
          componentesDisponibles: partes(poste, general, lampara, tierra),
          reglas: {
            requiereCircuitoCerrado: true,
            componentesObligatorios: ["lightPole", "mainSwitch", "bulb"],
            maxConexionesPorTerminal: 1,
            requiereTierra: true,
          },
          tableroInicial: tablero(PIEZAS_GENERAL, [], true),
          solucion: {
            explicacion:
              "El general quedó en serie con la acometida: corta fase y neutro a la vez. La lámpara cuelga de sus salidas y la tierra no se interrumpe.",
            ...tablero(PIEZAS_GENERAL, CABLES_GENERAL, true),
          },
        },
      ),
      leccion(
        LESSON_DIFERENCIAL_ID,
        "el-diferencial",
        "El diferencial",
        "Después del general va el diferencial: vigila que la corriente que sale vuelva.",
        {
          simulation: "circuit",
          concepto:
            "El interruptor diferencial compara la corriente de la fase con la del neutro. Si una parte se escapa a tierra, dispara. Va después del general y antes de los circuitos. La tierra de la lámpara no pasa por él: es el camino que él vigila.",
          objetivo: "Instala el diferencial entre el general y la lámpara",
          lectura: [
            {
              type: "h2",
              text: "El que cuida a las personas",
            },
            {
              type: "p",
              text: "El orden del tablero es fijo: poste, general, diferencial, carga. Cada protección lleva fase y neutro de entrada y de salida. La tierra sigue directa.",
            },
            {
              type: "ul",
              items: [
                "Poste → general, como en la lección anterior.",
                "General · salidas → Diferencial · entradas.",
                "Diferencial · salidas → portalámparas.",
                "Tierra del portalámparas al conector de tierra.",
              ],
            },
          ],
          pistaInicial:
            "Cadena: poste, general, diferencial, lámpara. Fase con fase y neutro con neutro. La tierra no entra a ninguna protección.",
          componentesDisponibles: partes(poste, general, diferencial, lampara, tierra),
          reglas: {
            requiereCircuitoCerrado: true,
            componentesObligatorios: ["lightPole", "mainSwitch", "rcd", "bulb"],
            maxConexionesPorTerminal: 1,
            requiereTierra: true,
          },
          tableroInicial: tablero(PIEZAS_DIFERENCIAL, [], true),
          solucion: {
            explicacion:
              "El diferencial quedó aguas abajo del general y aguas arriba de la lámpara. Fase y neutro lo atraviesan. La tierra llega a la carcasa por su propio cable.",
            ...tablero(PIEZAS_DIFERENCIAL, CABLES_DIFERENCIAL, true),
          },
        },
      ),
      leccion(
        LESSON_AUTOMATICO_ID,
        "el-automatico",
        "El automático",
        "El automático protege el cable del circuito: si hay demasiada corriente, abre.",
        {
          simulation: "circuit",
          concepto:
            "El interruptor automático protege el conductor de un circuito contra sobrecarga y cortocircuito. Va después del diferencial. Cada circuito de la casa tiene el suyo. Aquí el circuito es una sola lámpara.",
          objetivo: "Cierra el tablero: general, diferencial y automático",
          lectura: [
            {
              type: "h2",
              text: "Un automático por circuito",
            },
            {
              type: "p",
              text: "Suma el automático al final de la cadena. La lámpara sale de sus bornes de salida, no del diferencial. Así, si este circuito falla, el automático puede abrir sin dejar a ciegas el resto de la casa.",
            },
            {
              type: "ul",
              items: [
                "Poste → general → diferencial → automático.",
                "Automático · fase salida → Portalámparas · borne A.",
                "Automático · neutro salida → Portalámparas · borne B.",
                "Tierra directa a la carcasa.",
              ],
            },
          ],
          pistaInicial:
            "El automático es el último de la fila. La lámpara cuelga de sus salidas. No saltes ninguna protección.",
          componentesDisponibles: partes(
            poste,
            general,
            diferencial,
            automatico,
            lampara,
            tierra,
          ),
          reglas: {
            requiereCircuitoCerrado: true,
            componentesObligatorios: [
              "lightPole",
              "mainSwitch",
              "rcd",
              "mcb",
              "bulb",
            ],
            maxConexionesPorTerminal: 1,
            requiereTierra: true,
          },
          tableroInicial: tablero(PIEZAS_AUTOMATICO, [], true),
          solucion: {
            explicacion:
              "El tablero ya tiene el orden de una vivienda: general, diferencial y automático. La lámpara es el primer circuito, protegida y con tierra.",
            ...tablero(PIEZAS_AUTOMATICO, CABLES_AUTOMATICO, true),
          },
        },
      ),
    ],
  },
  {
    id: MODULE_VIVIENDA_ID,
    title: "Circuitos de la vivienda",
    description:
      "Serie y paralelo en la casa, el punto de luz y el enchufe.",
    sortOrder: 3,
    lessons: [
      teoria(
        LESSON_SERIE_PARALELO_CASA_ID,
        "serie-y-paralelo-en-casa",
        "Serie y paralelo en la casa",
        "Las protecciones van en serie. La luz y el enchufe del mismo circuito van en paralelo.",
        ARTICULO_SERIE_PARALELO,
      ),
      leccion(
        LESSON_PUNTO_LUZ_ID,
        "punto-de-luz",
        "Punto de luz",
        "Un automático alimenta una lámpara, y el interruptor de pared corta solo la fase.",
        {
          simulation: "circuit",
          concepto:
            "Un punto de luz domiciliario sale de un automático. El interruptor de la pared corta la fase; el neutro va directo del automático a la lámpara. La tierra también va directa. Apagar la luz no debe dejar el neutro interrumpido ni la fase presente en el portalámparas.",
          objetivo: "Arma un punto de luz con el interruptor en la fase",
          lectura: [
            {
              type: "h2",
              text: "La llave de la habitación",
            },
            {
              type: "p",
              text: "El automático ya representa el circuito de alumbrado. De su fase salida sales al interruptor, y del interruptor al portalámparas. El neutro no pasa por la llave. Enciende el interruptor para cerrar el punto.",
            },
            {
              type: "ul",
              items: [
                "Poste → automático, fase con fase y neutro con neutro.",
                "Automático · fase salida → Interruptor · borne A → Portalámparas · borne A.",
                "Portalámparas · borne B → Automático · neutro salida.",
                "Tierra del portalámparas al conector de tierra.",
              ],
            },
          ],
          pistaInicial:
            "El interruptor solo está en la fase. El neutro va directo del automático a la lámpara. Enciende la llave y comprueba.",
          componentesDisponibles: partes(poste, automatico, palanca, lampara, tierra),
          reglas: {
            requiereCircuitoCerrado: true,
            componentesObligatorios: ["lightPole", "mcb", "switch", "bulb"],
            maxConexionesPorTerminal: 1,
            requiereTierra: true,
          },
          tableroInicial: tablero(PIEZAS_PUNTO, [], false),
          solucion: {
            explicacion:
              "El punto de luz quedó bien: el automático lo protege, el interruptor corta la fase y el neutro vuelve directo. La tierra está en la carcasa.",
            ...tablero(PIEZAS_PUNTO, CABLES_PUNTO_LUZ, true),
          },
        },
      ),
      leccion(
        LESSON_ENCHUFE_CASA_ID,
        "el-enchufe-de-la-vivienda",
        "El enchufe",
        "Lleva fase, neutro y tierra a un tomacorriente y enchufa el equipo.",
        {
          simulation: "circuit",
          concepto:
            "Un tomacorriente de vivienda recibe tres conductores: fase, neutro y tierra. El equipo se enchufa al frente. La tierra no alimenta: da un camino seguro si la carcasa se pone en tensión. El automático de este circuito es el de tomas.",
          objetivo: "Alimenta el tomacorriente y enchufa el equipo",
          lectura: [
            {
              type: "h2",
              text: "Tres cables al enchufe",
            },
            {
              type: "p",
              text: "Del automático salen fase y neutro a las entradas del tomacorriente. La tierra va de su borne de tierra al conector. El enchufe del electrodoméstico entra al frente del tomacorriente. El equipo de esta lección es un computador, una carga chica que el automático soporta.",
            },
            {
              type: "ul",
              items: [
                "Poste → automático.",
                "Automático · salidas → Tomacorriente · fase entrada y neutro entrada.",
                "Tomacorriente · tierra → Tierra.",
                "Electrodoméstico · enchufe → Tomacorriente · enchufe.",
              ],
            },
          ],
          pistaInicial:
            "Fase, neutro y tierra llegan al tomacorriente. El computador se enchufa al frente. La tierra no pasa por el automático.",
          componentesDisponibles: partes(poste, automatico, toma, equipo, tierra),
          reglas: {
            requiereCircuitoCerrado: true,
            componentesObligatorios: ["lightPole", "mcb", "outlet", "appliance"],
            maxConexionesPorTerminal: 1,
            requiereTierra: true,
          },
          tableroInicial: tablero(PIEZAS_ENCHUFE, [], true),
          solucion: {
            explicacion:
              "El tomacorriente recibe fase y neutro desde el automático, tierra directa, y el computador está enchufado. Así se alimenta un punto de toma.",
            ...tablero(PIEZAS_ENCHUFE, CABLES_ENCHUFE, true),
          },
        },
      ),
      leccion(
        LESSON_LUZ_ENCHUFE_ID,
        "luz-y-enchufe",
        "Luz y enchufe",
        "Un mismo automático alimenta la lámpara conmutada y el tomacorriente siempre vivo.",
        {
          simulation: "circuit",
          concepto:
            "En una habitación el mismo circuito puede alimentar la luz y un enchufe. La luz pasa por el interruptor. El tomacorriente sale directo del automático, así sigue con energía aunque apagues la lámpara. En el tablero eso se ve como dos cables en la salida del automático.",
          objetivo: "Alimenta la luz y el enchufe desde un solo automático",
          lectura: [
            {
              type: "h2",
              text: "Dos salidas, un circuito",
            },
            {
              type: "p",
              text: "La fase salida del automático se reparte: un cable al interruptor de la luz y otro a la fase del tomacorriente. El neutro salida también se reparte, a la lámpara y al tomacorriente. Cada carcasa lleva su tierra. Enciende el interruptor para que la lámpara entre en el circuito.",
            },
            {
              type: "ul",
              items: [
                "Luz: fase salida → interruptor → portalámparas, y neutro de vuelta al automático.",
                "Toma: fase salida y neutro salida del automático a las entradas del tomacorriente.",
                "Dos tierras: portalámparas y tomacorriente al mismo conector.",
                "Enchufa el computador.",
              ],
            },
          ],
          pistaInicial:
            "El automático acepta dos cables en cada salida. Uno va a la luz, con interruptor en la fase. El otro va directo al tomacorriente.",
          componentesDisponibles: partes(
            poste,
            automatico,
            palanca,
            lampara,
            toma,
            equipo,
            tierra,
          ),
          reglas: {
            requiereCircuitoCerrado: true,
            componentesObligatorios: [
              "lightPole",
              "mcb",
              "switch",
              "bulb",
              "outlet",
              "appliance",
            ],
            maxConexionesPorTerminal: 2,
            requiereTierra: true,
          },
          tableroInicial: tablero(PIEZAS_LUZ_ENCHUFE, [], false),
          solucion: {
            explicacion:
              "Un solo automático alimenta los dos puntos. La luz se apaga con el interruptor de la fase. El tomacorriente queda directo, con tierra y con el equipo enchufado.",
            ...tablero(PIEZAS_LUZ_ENCHUFE, CABLES_LUZ_Y_ENCHUFE, true),
          },
        },
      ),
    ],
  },
  {
    id: MODULE_MEDICION_CASA_ID,
    title: "Medir en casa",
    description:
      "Cómo se mide, y después la tensión del enchufe y la corriente de la fase.",
    sortOrder: 4,
    lessons: [
      teoria(
        LESSON_COMO_SE_MIDE_ID,
        "como-se-mide",
        "Cómo se mide",
        "El voltímetro va en paralelo. El amperímetro va en serie. Cambiarlos de lugar es un corto.",
        ARTICULO_MEDIR,
      ),
      leccion(
        LESSON_TENSION_ENCHUFE_ID,
        "tension-en-el-enchufe",
        "Tensión en el enchufe",
        "Mide 220 V entre fase y neutro del tomacorriente, en paralelo.",
        {
          simulation: "circuit",
          concepto:
            "En una vivienda la tensión se mide en paralelo, entre fase y neutro, sin abrir el circuito. En un tomacorriente las sondas van a las mismas entradas que ya alimentan el enchufe. El medidor no sustituye a la carga: el equipo sigue enchufado.",
          objetivo: "Lee la tensión entre fase y neutro del tomacorriente",
          lectura: [
            {
              type: "h2",
              text: "Las sondas, al lado de la carga",
            },
            {
              type: "p",
              text: "Arma el tomacorriente como en la lección del enchufe. Después apoya el medidor de tensión en paralelo: sonda A en la fase entrada y sonda B en el neutro entrada. Esas entradas ya tienen el cable del automático: aquí pueden llevar dos.",
            },
            {
              type: "ul",
              items: [
                "Primero el circuito: poste, automático, tomacorriente, tierra y computador enchufado.",
                "Medidor · sonda A → Tomacorriente · fase entrada.",
                "Medidor · sonda B → Tomacorriente · neutro entrada.",
                "No pongas el medidor de tensión en serie: no es el camino de la corriente.",
              ],
            },
          ],
          pistaInicial:
            "El tomacorriente tiene que estar alimentado y con tierra. El medidor se conecta en paralelo, entre fase y neutro de ese mismo enchufe.",
          componentesDisponibles: partes(
            poste,
            automatico,
            toma,
            equipo,
            tension,
            tierra,
          ),
          reglas: {
            requiereCircuitoCerrado: true,
            componentesObligatorios: [
              "lightPole",
              "mcb",
              "outlet",
              "appliance",
              "voltmeter",
            ],
            maxConexionesPorTerminal: 2,
            requiereTierra: true,
            requiereMedicion: true,
          },
          tableroInicial: tablero(PIEZAS_TENSION, [], true),
          solucion: {
            explicacion:
              "El medidor quedó en paralelo con el tomacorriente, entre fase y neutro. Así se lee la tensión de la vivienda sin abrir el circuito. El computador sigue siendo la carga.",
            ...tablero(PIEZAS_TENSION, CABLES_TENSION, true),
          },
        },
      ),
      leccion(
        LESSON_CORRIENTE_CASA_ID,
        "corriente-del-circuito",
        "Corriente del circuito",
        "Inserta el medidor de corriente en la fase, en serie, antes del automático.",
        {
          simulation: "circuit",
          concepto:
            "La corriente de un circuito se mide en serie: el medidor se intercala en el conductor, casi siempre en la fase. Si lo pones entre fase y neutro, haces un corto. Aquí el medidor va entre el poste y la fase entrada del automático, y la lámpara es la carga.",
          objetivo: "Mide la corriente del circuito en serie sobre la fase",
          lectura: [
            {
              type: "h2",
              text: "Abrir la fase e insertar el medidor",
            },
            {
              type: "p",
              text: "La corriente que entra al automático es la del circuito. Por eso el medidor de corriente va en ese tramo, no a caballo del poste. El neutro sigue directo. La lámpara cierra el círculo y la tierra protege la carcasa.",
            },
            {
              type: "ul",
              items: [
                "Poste · fase → Medidor · borne A.",
                "Medidor · borne B → Automático · fase entrada.",
                "Poste · neutro → Automático · neutro entrada.",
                "Salidas del automático al portalámparas, y tierra a la carcasa.",
              ],
            },
          ],
          pistaInicial:
            "El medidor de corriente es un eslabón de la fase. No lo unas entre fase y neutro. La lámpara tiene que seguir en el camino.",
          componentesDisponibles: partes(poste, corriente, automatico, lampara, tierra),
          reglas: {
            requiereCircuitoCerrado: true,
            componentesObligatorios: ["lightPole", "ammeter", "mcb", "bulb"],
            maxConexionesPorTerminal: 1,
            requiereTierra: true,
          },
          tableroInicial: tablero(PIEZAS_CORRIENTE, [], true),
          solucion: {
            explicacion:
              "El medidor quedó en serie en la fase, entre el poste y el automático. Toda la corriente de la lámpara pasa por él. El neutro no se abrió.",
            ...tablero(PIEZAS_CORRIENTE, CABLES_CORRIENTE, true),
          },
        },
      ),
    ],
  },
  {
    id: MODULE_OBRA_ID,
    title: "Fallos y obra terminada",
    description:
      "Qué hace cada protección, y después los fallos y el tablero completo.",
    sortOrder: 5,
    lessons: [
      teoria(
        LESSON_PROTECCIONES_ID,
        "las-protecciones",
        "Las protecciones",
        "El general aísla, el diferencial vigila fugas y el automático cuida el cable.",
        ARTICULO_PROTECCIONES,
      ),
      leccion(
        LESSON_TIERRA_FALTA_ID,
        "la-tierra-que-falta",
        "La tierra que falta",
        "El enchufe funciona, pero no tiene protección. Agrega el conductor de tierra.",
        {
          simulation: "circuit",
          concepto:
            "Un tomacorriente puede alimentar un equipo aunque le falte la tierra, y eso es justo el peligro: parece que está listo. El conductor de protección no enciende nada. Une el borne de tierra del tomacorriente al conector de tierra. No lo pases por el automático.",
          objetivo: "Agrega la tierra que le falta al tomacorriente",
          lectura: [
            {
              type: "h2",
              text: "Funciona, y no está protegido",
            },
            {
              type: "p",
              text: "Fase, neutro y el computador ya están. Falta el verde. Sin ese cable, Comprobar no acepta la instalación. No desarme lo que ya alimenta el enchufe: suma la tierra.",
            },
            {
              type: "ul",
              items: [
                "Deja fase y neutro como están.",
                "Deja el computador enchufado.",
                "Agrega Tomacorriente · tierra → Tierra · tierra.",
              ],
            },
          ],
          pistaInicial:
            "El circuito ya enciende. Falta un solo cable: el de tierra del tomacorriente al conector de tierra.",
          componentesDisponibles: partes(poste, automatico, toma, equipo, tierra),
          reglas: {
            requiereCircuitoCerrado: true,
            componentesObligatorios: ["lightPole", "mcb", "outlet", "appliance"],
            maxConexionesPorTerminal: 1,
            requiereTierra: true,
          },
          tableroInicial: tablero(PIEZAS_FALLA_TOMA, CABLES_SIN_TIERRA, true),
          solucion: {
            explicacion:
              "La tierra ya llega al tomacorriente. El equipo sigue alimentado por fase y neutro, y la carcasa tiene por dónde descargar una falla.",
            ...tablero(PIEZAS_FALLA_TOMA, CABLES_ENCHUFE, true),
          },
        },
      ),
      leccion(
        LESSON_CORTAR_FASE_ID,
        "cortar-la-fase",
        "Cortar la fase",
        "La luz se apaga, pero el interruptor está en el neutro. Pásalo a la fase.",
        {
          simulation: "circuit",
          concepto:
            "Si el interruptor corta solo el neutro, la lámpara se apaga y la fase sigue en el portalámparas. En una vivienda eso es un punto de luz inseguro. El interruptor unipolar se coloca en la fase, entre la salida del automático y la lámpara. El neutro vuelve directo.",
          objetivo: "Mueve el interruptor del neutro a la fase",
          lectura: [
            {
              type: "h2",
              text: "Apagar de verdad",
            },
            {
              type: "p",
              text: "Este punto enciende, pero la llave está del lado del neutro. Quita los cables de trabajo con doble clic y vuelve a armar el punto: el interruptor entre la fase salida del automático y el portalámparas. La tierra se queda.",
            },
            {
              type: "ul",
              items: [
                "Quita el interruptor del tramo del neutro.",
                "Automático · fase salida → Interruptor → Portalámparas · borne A.",
                "Portalámparas · borne B → Automático · neutro salida.",
                "No muevas la tierra.",
              ],
            },
          ],
          pistaInicial:
            "El interruptor está cortando el neutro. Desarma ese tramo y colócalo en la fase, entre el automático y la lámpara.",
          componentesDisponibles: partes(poste, automatico, palanca, lampara, tierra),
          reglas: {
            requiereCircuitoCerrado: true,
            componentesObligatorios: ["lightPole", "mcb", "switch", "bulb"],
            maxConexionesPorTerminal: 1,
            requiereTierra: true,
          },
          tableroInicial: tablero(PIEZAS_FALLA_LUZ, CABLES_NEUTRO, true),
          solucion: {
            explicacion:
              "El interruptor quedó en la fase. Al abrirlo, el portalámparas deja de recibir la tensión de trabajo. El neutro vuelve directo al automático.",
            ...tablero(PIEZAS_FALLA_LUZ, CABLES_PUNTO_LUZ, true),
          },
        },
      ),
      leccion(
        LESSON_FUGA_ID,
        "la-fuga",
        "La fuga",
        "Un cable une la fase con la tierra. El diferencial lo acusa: quita esa unión.",
        {
          simulation: "circuit",
          concepto:
            "Una fuga es un conductor de trabajo que toca la tierra. El diferencial existe para eso: ve que la corriente que salió por la fase no volvió toda por el neutro, y abre. En el tablero hay un cable de más, de la fase salida del automático al conector de tierra. No es una instalación. Hay que quitarlo.",
          objetivo: "Quita el cable que une la fase con la tierra",
          lectura: [
            {
              type: "h2",
              text: "El cable que no debería estar",
            },
            {
              type: "p",
              text: "La lámpara está bien cableada y tiene su tierra. Además hay un atajo de la fase a tierra. El diferencial dispara por esa fuga. Haz doble clic en ese cable y déjalo fuera. La tierra de la carcasa se queda.",
            },
            {
              type: "ul",
              items: [
                "Busca el cable que sale de la fase del automático hacia Tierra.",
                "Quítalo. No es el cable verde de la carcasa.",
                "Fase, neutro y la tierra del portalámparas siguen como están.",
              ],
            },
          ],
          pistaInicial:
            "Hay una unión de fase a tierra. El diferencial la trata como fuga. Quita solo ese cable y vuelve a comprobar.",
          componentesDisponibles: partes(poste, diferencial, automatico, lampara, tierra),
          reglas: {
            requiereCircuitoCerrado: true,
            componentesObligatorios: ["lightPole", "rcd", "mcb", "bulb"],
            maxConexionesPorTerminal: 2,
            requiereTierra: true,
          },
          tableroInicial: tablero(
            PIEZAS_FUGA,
            [...CABLES_FUGA_SANA, CABLE_FUGA],
            true,
          ),
          solucion: {
            explicacion:
              "La fuga ya no está. La fase solo alimenta la lámpara, el neutro vuelve, y la tierra de la carcasa sigue unida. El diferencial puede permanecer cerrado.",
            ...tablero(PIEZAS_FUGA, CABLES_FUGA_SANA, true),
          },
        },
      ),
      leccion(
        LESSON_TABLERO_VIVIENDA_ID,
        "tablero-de-la-vivienda",
        "Tablero de la vivienda",
        "Arma la casa completa: protecciones, punto de luz y enchufe con tierra.",
        {
          simulation: "circuit",
          concepto:
            "Una vivienda mínima junta todo lo anterior. La acometida entra al general, sigue al diferencial y de ahí a un automático. Ese automático alimenta un punto de luz, con el interruptor en la fase, y un tomacorriente directo. Las tierras van al conector, sin pasar por las protecciones. El computador queda enchufado.",
          objetivo: "Arma el tablero completo de la vivienda",
          lectura: [
            {
              type: "h2",
              text: "La obra, de punta a punta",
            },
            {
              type: "p",
              text: "Empieza por la fila de protecciones y no saltes ninguna. Después reparte la salida del automático: la luz pasa por el interruptor y el tomacorriente sale directo. Enciende la llave de la luz al final.",
            },
            {
              type: "ul",
              items: [
                "Poste → general → diferencial → automático. Fase con fase, neutro con neutro.",
                "Luz: fase salida → interruptor → portalámparas, neutro de vuelta al automático.",
                "Toma: fase y neutro del automático al tomacorriente, y el computador enchufado.",
                "Dos tierras al conector: portalámparas y tomacorriente.",
              ],
            },
          ],
          pistaInicial:
            "Orden: poste, general, diferencial, automático. Del automático salen la luz conmutada y el enchufe directo. Las tierras no se cortan. Enciende el interruptor.",
          componentesDisponibles: partes(
            poste,
            general,
            diferencial,
            automatico,
            palanca,
            lampara,
            toma,
            equipo,
            tierra,
          ),
          reglas: {
            requiereCircuitoCerrado: true,
            componentesObligatorios: [
              "lightPole",
              "mainSwitch",
              "rcd",
              "mcb",
              "switch",
              "bulb",
              "outlet",
              "appliance",
            ],
            maxConexionesPorTerminal: 2,
            requiereTierra: true,
          },
          tableroInicial: tablero(PIEZAS_VIVIENDA, [], false),
          solucion: {
            explicacion:
              "La vivienda quedó armada: la energía entra por el general, el diferencial vigila, el automático protege el circuito, la luz se corta en la fase y el enchufe tiene fase, neutro y tierra.",
            ...tablero(PIEZAS_VIVIENDA, CABLES_VIVIENDA, true),
          },
        },
      ),
    ],
  },
];

export const DOMICILIARIA_LESSONS: Record<string, CircuitLessonDefinition> =
  Object.fromEntries(
    DOMICILIARIA_MODULES.flatMap((module) =>
      module.lessons.flatMap((lesson) =>
        lesson.lessonType === "interactive" && "simulation" in lesson.content
          ? [[lesson.slug, lesson.content] as const]
          : [],
      ),
    ),
  );
