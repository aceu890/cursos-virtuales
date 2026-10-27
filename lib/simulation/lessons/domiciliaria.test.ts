import { describe, expect, it } from "vitest";
import type { Edge, Node } from "@xyflow/react";
import { applianceById } from "../appliances";
import { isSwitchLike } from "../devices";
import { evaluateCircuit } from "../evaluateCircuit";
import { graphFromFlow } from "../fromFlow";
import type {
  CircuitBoardLayout,
  CircuitLessonDefinition,
  CircuitNodeData,
  PlaceableKind,
} from "../flowTypes";
import type { Terminal, ValidationRules } from "../types";
import {
  DOMICILIARIA_MODULES,
  type DomiciliariaLessonMeta,
} from "./domiciliaria";

function terminalsFor(kind: PlaceableKind): Terminal[] {
  if (kind === "lightPole") {
    return [
      { id: "lineL", polarity: "positive" },
      { id: "lineN", polarity: "negative" },
    ];
  }
  if (kind === "bulb") {
    return [
      { id: "a", polarity: "a" },
      { id: "b", polarity: "b" },
      { id: "earth", polarity: "earth" },
    ];
  }
  if (kind === "ground") {
    return [{ id: "earth", polarity: "earth" }];
  }
  if (kind === "rcd" || kind === "mainSwitch" || kind === "mcb") {
    return [
      { id: "lineL", polarity: "a" },
      { id: "lineN", polarity: "b" },
      { id: "loadL", polarity: "a" },
      { id: "loadN", polarity: "b" },
    ];
  }
  if (kind === "outlet") {
    return [
      { id: "lineL", polarity: "a" },
      { id: "lineN", polarity: "b" },
      { id: "earth", polarity: "earth" },
      { id: "socket0", polarity: "a" },
    ];
  }
  if (kind === "appliance") {
    return [{ id: "plug", polarity: "a" }];
  }
  if (kind === "voltmeter") {
    return [
      { id: "a", polarity: "a" },
      { id: "b", polarity: "b" },
    ];
  }
  return [
    { id: "a", polarity: "a" },
    { id: "b", polarity: "b" },
  ];
}

function layoutGraph(layout: CircuitBoardLayout, reglas: ValidationRules) {
  const counts: Record<string, number> = {};
  const nodes: Node<CircuitNodeData>[] = layout.piezas.map((pieza) => {
    const spec = pieza.applianceId
      ? applianceById(pieza.applianceId)
      : undefined;
    counts[pieza.kind] = (counts[pieza.kind] ?? 0) + 1;
    const index = counts[pieza.kind] - 1;
    return {
      id: `${pieza.kind}-${index}`,
      position: pieza.position,
      data: {
        kind: pieza.kind,
        label: `${pieza.kind}-${index}`,
        terminals: terminalsFor(pieza.kind),
        switchClosed:
          pieza.kind === "appliance"
            ? Boolean(pieza.encendido)
            : isSwitchLike(pieza.kind)
              ? pieza.kind === "switch"
                ? layout.interruptorCerrado
                : true
              : undefined,
        watts: spec?.watts,
        applianceId: spec?.id,
      },
    };
  });
  const ofKind = (kind: PlaceableKind, index = 0) =>
    nodes.filter((node) => node.data.kind === kind)[index];
  const edges: Edge[] = layout.cables.map((cable, index) => {
    const from = ofKind(cable.from.kind, cable.from.index ?? 0);
    const to = ofKind(cable.to.kind, cable.to.index ?? 0);
    if (!from || !to) {
      throw new Error(`Falta una pieza para el cable ${index}`);
    }
    return {
      id: `e-${index}`,
      source: from.id,
      target: to.id,
      sourceHandle: cable.from.terminalId,
      targetHandle: cable.to.terminalId,
    };
  });
  return graphFromFlow(nodes, edges, reglas);
}

function solved(content: CircuitLessonDefinition, layout: CircuitBoardLayout) {
  const result = evaluateCircuit(
    layoutGraph(layout, content.reglas as ValidationRules),
  );
  return {
    estado: result.estado,
    tipo: result.mensajes[0]?.tipo,
    texto: result.mensajes[0]?.texto,
  };
}

function isBoard(
  lesson: DomiciliariaLessonMeta,
): lesson is DomiciliariaLessonMeta & { content: CircuitLessonDefinition } {
  return lesson.lessonType === "interactive" && "simulation" in lesson.content;
}

const lessons = DOMICILIARIA_MODULES.flatMap((module) => module.lessons);
const boards = lessons.filter(isBoard);
const articles = lessons.filter((lesson) => lesson.lessonType === "article");

describe("curso Electricidad domiciliaria", () => {
  it("junta la teoría con 13 lecciones de tablero", () => {
    expect(DOMICILIARIA_MODULES).toHaveLength(5);
    expect(boards).toHaveLength(13);
    expect(articles.length).toBeGreaterThanOrEqual(10);
    expect(new Set(lessons.map((lesson) => lesson.slug)).size).toBe(
      lessons.length,
    );
    for (const lesson of articles) {
      expect("blocks" in lesson.content).toBe(true);
      if ("blocks" in lesson.content) {
        expect(lesson.content.blocks.length).toBeGreaterThan(3);
      }
    }
  });

  it.each(boards.map((lesson) => [lesson.slug, lesson] as const))(
    "%s se resuelve en el tablero y no empieza ya aprobada",
    (_slug, lesson) => {
      const initialLayout = lesson.content.tableroInicial;
      const solutionLayout = lesson.content.solucion;
      expect(initialLayout).toBeDefined();
      expect(solutionLayout).toBeDefined();
      if (!initialLayout || !solutionLayout) {
        return;
      }
      const initial = solved(lesson.content, initialLayout);
      const solution = solved(lesson.content, solutionLayout);
      expect(initial.estado === "correcto" && initial.tipo === "exito").toBe(
        false,
      );
      expect(solution, solution.texto).toEqual(
        expect.objectContaining({ estado: "correcto", tipo: "exito" }),
      );
    },
  );
});
