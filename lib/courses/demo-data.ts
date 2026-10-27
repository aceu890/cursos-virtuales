import { CAMINO_CERRADO } from "../simulation/lessons/camino-cerrado";
import { CAMINOS_INDEPENDIENTES } from "../simulation/lessons/caminos-independientes";
import { CIRCUITO_SIMPLE } from "../simulation/lessons/circuito-simple";
import { COLORES_DE_CABLES } from "../simulation/lessons/colores-de-cables";
import { CORRIENTE_SEGURIDAD } from "../simulation/lessons/corriente-seguridad";
import { DE_LA_PILA_A_LA_RED } from "../simulation/lessons/de-la-pila-a-la-red";
import { DOS_AMPOLLETAS } from "../simulation/lessons/dos-ampolletas";
import { EL_INTERRUPTOR } from "../simulation/lessons/el-interruptor";
import { EL_PUENTE } from "../simulation/lessons/el-puente";
import { EL_TOMACORRIENTE } from "../simulation/lessons/el-tomacorriente";
import { EN_PARALELO } from "../simulation/lessons/en-paralelo";
import { INTERRUPTOR_EN_FASE } from "../simulation/lessons/interruptor-en-fase";
import { MEDIR_CORRIENTE } from "../simulation/lessons/medir-corriente";
import { MEDIR_TENSION } from "../simulation/lessons/medir-tension";
import { TENSION_Y_CORRIENTE } from "../simulation/lessons/tension-y-corriente";
import { TIERRA_DE_PROTECCION } from "../simulation/lessons/tierra-de-proteccion";
import { DOMICILIARIA_MODULES } from "../simulation/lessons/domiciliaria";
import type { CircuitLessonDefinition } from "../simulation/flowTypes";
import {
  COURSE_DOMICILIARIA_ID,
  COURSE_DOMICILIARIA_SLUG,
  COURSE_ELECTRICIDAD_ID,
  COURSE_ELECTRICIDAD_SLUG,
  LESSON_CAMINO_CERRADO_ID,
  LESSON_CAMINO_CERRADO_SLUG,
  LESSON_CIRCUITO_SIMPLE_ID,
  LESSON_CIRCUITO_SIMPLE_SLUG,
  LESSON_COLORES_ID,
  LESSON_COLORES_SLUG,
  LESSON_DOS_AMPOLLETAS_ID,
  LESSON_DOS_AMPOLLETAS_SLUG,
  LESSON_INDEPENDIENTES_ID,
  LESSON_INDEPENDIENTES_SLUG,
  LESSON_INTERRUPTOR_FASE_ID,
  LESSON_INTERRUPTOR_FASE_SLUG,
  LESSON_INTERRUPTOR_ID,
  LESSON_INTERRUPTOR_SLUG,
  LESSON_MEDIR_CORRIENTE_ID,
  LESSON_MEDIR_CORRIENTE_SLUG,
  LESSON_MEDIR_TENSION_ID,
  LESSON_MEDIR_TENSION_SLUG,
  LESSON_PARALELO_ID,
  LESSON_PARALELO_SLUG,
  LESSON_PILA_RED_ID,
  LESSON_PILA_RED_SLUG,
  LESSON_PUENTE_ID,
  LESSON_PUENTE_SLUG,
  LESSON_SEGURIDAD_ID,
  LESSON_SEGURIDAD_SLUG,
  LESSON_TENSION_CORRIENTE_ID,
  LESSON_TENSION_CORRIENTE_SLUG,
  LESSON_TIERRA_ID,
  LESSON_TIERRA_SLUG,
  LESSON_TOMACORRIENTE_ID,
  LESSON_TOMACORRIENTE_SLUG,
  MODULE_CIRCUITO_ID,
  MODULE_CORRIENTE_ID,
  MODULE_PRACTICAS_ID,
  MODULE_SERIE_PARALELO_ID,
} from "./ids";
import type {
  CourseDetail,
  CourseSummary,
  Lesson,
  LessonContent,
} from "./types";

function interactive(
  id: string,
  moduleId: string,
  slug: string,
  title: string,
  description: string,
  content: CircuitLessonDefinition,
  sortOrder: number,
): Lesson {
  return catalogLesson(
    id,
    moduleId,
    slug,
    title,
    description,
    "interactive",
    content,
    sortOrder,
  );
}

function catalogLesson(
  id: string,
  moduleId: string,
  slug: string,
  title: string,
  description: string,
  lessonType: Lesson["lessonType"],
  content: LessonContent,
  sortOrder: number,
): Lesson {
  return {
    id,
    moduleId,
    slug,
    title,
    description,
    lessonType,
    content,
    sortOrder,
    published: true,
  };
}

export const DEMO_COURSE_DETAIL: CourseDetail = {
  id: COURSE_ELECTRICIDAD_ID,
  slug: COURSE_ELECTRICIDAD_SLUG,
  title: "Fundamentos de electricidad",
  description:
    "Curso de enganche gratis: lo esencial en el tablero. Circuito cerrado, serie y paralelo, medición y buenas prácticas. Corto, práctico y para que pases al Laboratorio con las bases claras.",
  level: "principiante",
  estimatedMinutes: 90,
  coverImage: "/illustrations/banner-electricidad.jpg",
  published: true,
  sortOrder: 1,
  access: "free",
  modules: [
    {
      id: MODULE_CIRCUITO_ID,
      courseId: COURSE_ELECTRICIDAD_ID,
      title: "El circuito eléctrico",
      description: "Fuente, interruptor, carga, el camino cerrado y la tierra.",
      sortOrder: 1,
      lessons: [
        interactive(
          LESSON_CIRCUITO_SIMPLE_ID,
          MODULE_CIRCUITO_ID,
          LESSON_CIRCUITO_SIMPLE_SLUG,
          "Circuito simple",
          "Arma un circuito cerrado y haz que la ampolleta se encienda.",
          CIRCUITO_SIMPLE,
          1,
        ),
        interactive(
          LESSON_INTERRUPTOR_ID,
          MODULE_CIRCUITO_ID,
          LESSON_INTERRUPTOR_SLUG,
          "El interruptor",
          "Enciende y apaga el interruptor en un circuito ya armado y observa la ampolleta.",
          EL_INTERRUPTOR,
          2,
        ),
        interactive(
          LESSON_CAMINO_CERRADO_ID,
          MODULE_CIRCUITO_ID,
          LESSON_CAMINO_CERRADO_SLUG,
          "Camino cerrado",
          "Completa el cable de retorno y cierra el círculo.",
          CAMINO_CERRADO,
          3,
        ),
        interactive(
          LESSON_TIERRA_ID,
          MODULE_CIRCUITO_ID,
          LESSON_TIERRA_SLUG,
          "Tierra de protección",
          "Une el conductor de tierra: no alimenta la luz, protege.",
          TIERRA_DE_PROTECCION,
          4,
        ),
      ],
    },
    {
      id: MODULE_SERIE_PARALELO_ID,
      courseId: COURSE_ELECTRICIDAD_ID,
      title: "Serie y paralelo",
      description: "Un camino o dos: cómo se conectan las cargas.",
      sortOrder: 2,
      lessons: [
        interactive(
          LESSON_DOS_AMPOLLETAS_ID,
          MODULE_SERIE_PARALELO_ID,
          LESSON_DOS_AMPOLLETAS_SLUG,
          "Dos ampolletas",
          "Arma un circuito en serie con dos cargas y evita el atajo entre + y −.",
          DOS_AMPOLLETAS,
          1,
        ),
        interactive(
          LESSON_PARALELO_ID,
          MODULE_SERIE_PARALELO_ID,
          LESSON_PARALELO_SLUG,
          "En paralelo",
          "Alimenta las dos ampolletas a la vez, cada una con su propio camino.",
          EN_PARALELO,
          2,
        ),
        interactive(
          LESSON_PUENTE_ID,
          MODULE_SERIE_PARALELO_ID,
          LESSON_PUENTE_SLUG,
          "El puente",
          "Pon el eslabón que falta para dejar las dos cargas en serie.",
          EL_PUENTE,
          3,
        ),
        interactive(
          LESSON_INDEPENDIENTES_ID,
          MODULE_SERIE_PARALELO_ID,
          LESSON_INDEPENDIENTES_SLUG,
          "Caminos independientes",
          "Dale a la segunda ampolleta su propio ramal, sin depender de la primera.",
          CAMINOS_INDEPENDIENTES,
          4,
        ),
      ],
    },
    {
      id: MODULE_CORRIENTE_ID,
      courseId: COURSE_ELECTRICIDAD_ID,
      title: "Corriente y medición",
      description: "Cortos, tensión y corriente: cómo se miden y cómo no.",
      sortOrder: 3,
      lessons: [
        interactive(
          LESSON_SEGURIDAD_ID,
          MODULE_CORRIENTE_ID,
          LESSON_SEGURIDAD_SLUG,
          "Corriente y seguridad",
          "Quita el atajo entre + y − y arma el camino que pasa por la ampolleta. Sin el enchufe de la casa.",
          CORRIENTE_SEGURIDAD,
          1,
        ),
        interactive(
          LESSON_MEDIR_TENSION_ID,
          MODULE_CORRIENTE_ID,
          LESSON_MEDIR_TENSION_SLUG,
          "Medir tensión",
          "Pon el voltímetro en paralelo y lee 220 V entre + y −.",
          MEDIR_TENSION,
          2,
        ),
        interactive(
          LESSON_MEDIR_CORRIENTE_ID,
          MODULE_CORRIENTE_ID,
          LESSON_MEDIR_CORRIENTE_SLUG,
          "Medir corriente",
          "Inserta el amperímetro en serie, nunca a caballo de la fuente.",
          MEDIR_CORRIENTE,
          3,
        ),
        interactive(
          LESSON_TENSION_CORRIENTE_ID,
          MODULE_CORRIENTE_ID,
          LESSON_TENSION_CORRIENTE_SLUG,
          "Tensión y corriente",
          "Lee las dos a la vez: voltímetro en paralelo, amperímetro en serie.",
          TENSION_Y_CORRIENTE,
          4,
        ),
      ],
    },
    {
      id: MODULE_PRACTICAS_ID,
      courseId: COURSE_ELECTRICIDAD_ID,
      title: "Buenas prácticas",
      description: "Colores, interruptor en la fase, el tomacorriente y el paso a 220 V.",
      sortOrder: 4,
      lessons: [
        interactive(
          LESSON_COLORES_ID,
          MODULE_PRACTICAS_ID,
          LESSON_COLORES_SLUG,
          "Colores de los cables",
          "Fase, neutro y tierra: el color dice qué hace cada conductor.",
          COLORES_DE_CABLES,
          1,
        ),
        interactive(
          LESSON_INTERRUPTOR_FASE_ID,
          MODULE_PRACTICAS_ID,
          LESSON_INTERRUPTOR_FASE_SLUG,
          "Interruptor en la fase",
          "Corrige el cableado: el interruptor unipolar se coloca en la fase, no en el neutro.",
          INTERRUPTOR_EN_FASE,
          2,
        ),
        interactive(
          LESSON_TOMACORRIENTE_ID,
          MODULE_PRACTICAS_ID,
          LESSON_TOMACORRIENTE_SLUG,
          "El tomacorriente",
          "Llega fase, neutro y tierra al tomacorriente y enchufa el equipo.",
          EL_TOMACORRIENTE,
          3,
        ),
        interactive(
          LESSON_PILA_RED_ID,
          MODULE_PRACTICAS_ID,
          LESSON_PILA_RED_SLUG,
          "De la pila a la red",
          "El mismo círculo, ahora con el poste de 220 V. Después, el Laboratorio.",
          DE_LA_PILA_A_LA_RED,
          4,
        ),
      ],
    },
  ],
};

export const DEMO_DOMICILIARIA_DETAIL: CourseDetail = {
  id: COURSE_DOMICILIARIA_ID,
  slug: COURSE_DOMICILIARIA_SLUG,
  title: "Electricidad domiciliaria",
  description:
    "Curso de pago. Primero la teoría: tensión, corriente, resistencia, potencia y la red alterna. Después, en el tablero, la acometida, las protecciones, la luz, el enchufe, la medición y los fallos de una vivienda. En esta práctica puedes recorrerlo entero.",
  level: "intermedio",
  estimatedMinutes: 240,
  coverImage: "/illustrations/curso-electricidad.png",
  published: true,
  sortOrder: 2,
  access: "paid",
  modules: DOMICILIARIA_MODULES.map((module) => ({
    id: module.id,
    courseId: COURSE_DOMICILIARIA_ID,
    title: module.title,
    description: module.description,
    sortOrder: module.sortOrder,
    lessons: module.lessons.map((lesson, index) =>
      catalogLesson(
        lesson.id,
        module.id,
        lesson.slug,
        lesson.title,
        lesson.description,
        lesson.lessonType,
        lesson.content,
        index + 1,
      ),
    ),
  })),
};

const DEMO_DETAILS = [DEMO_COURSE_DETAIL, DEMO_DOMICILIARIA_DETAIL];

export function demoCourseBySlug(slug: string): CourseDetail | null {
  return DEMO_DETAILS.find((course) => course.slug === slug) ?? null;
}

function toSummary(detail: CourseDetail): CourseSummary {
  return {
    id: detail.id,
    slug: detail.slug,
    title: detail.title,
    description: detail.description,
    level: detail.level,
    estimatedMinutes: detail.estimatedMinutes,
    coverImage: detail.coverImage,
    published: detail.published,
    sortOrder: detail.sortOrder,
    access: detail.access,
    lessonCount: detail.modules.reduce(
      (count, module) => count + module.lessons.length,
      0,
    ),
    moduleCount: detail.modules.length,
  };
}

export const DEMO_COURSES: CourseSummary[] = DEMO_DETAILS.map(toSummary);
