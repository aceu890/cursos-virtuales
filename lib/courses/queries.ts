import { isSupabaseConfigured } from "../env";
import { createBrowserSupabase } from "../supabase/browser";
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
import { DOMICILIARIA_ARTICLES } from "./articles/domiciliaria";
import { DOMICILIARIA_LESSONS } from "../simulation/lessons/domiciliaria";
import { demoCourseBySlug, DEMO_COURSES } from "./demo-data";
import { courseAccess } from "./types";
import type {
  ArticleContent,
  CourseDetail,
  CourseLevel,
  CourseSummary,
  Lesson,
  LessonContent,
  LessonType,
  ModuleWithLessons,
} from "./types";
import {
  LESSON_CAMINO_CERRADO_SLUG,
  LESSON_CIRCUITO_SIMPLE_SLUG,
  LESSON_COLORES_SLUG,
  LESSON_DOS_AMPOLLETAS_SLUG,
  LESSON_INDEPENDIENTES_SLUG,
  LESSON_INTERRUPTOR_FASE_SLUG,
  LESSON_INTERRUPTOR_SLUG,
  LESSON_MEDIR_CORRIENTE_SLUG,
  LESSON_MEDIR_TENSION_SLUG,
  LESSON_PARALELO_SLUG,
  LESSON_PILA_RED_SLUG,
  LESSON_PUENTE_SLUG,
  LESSON_SEGURIDAD_SLUG,
  LESSON_TENSION_CORRIENTE_SLUG,
  LESSON_TIERRA_SLUG,
  LESSON_TOMACORRIENTE_SLUG,
} from "./ids";
import type { CircuitLessonDefinition } from "../simulation/flowTypes";

const INTERACTIVE_LESSONS: Record<string, CircuitLessonDefinition> = {
  [LESSON_CIRCUITO_SIMPLE_SLUG]: CIRCUITO_SIMPLE,
  [LESSON_INTERRUPTOR_SLUG]: EL_INTERRUPTOR,
  [LESSON_CAMINO_CERRADO_SLUG]: CAMINO_CERRADO,
  [LESSON_TIERRA_SLUG]: TIERRA_DE_PROTECCION,
  [LESSON_DOS_AMPOLLETAS_SLUG]: DOS_AMPOLLETAS,
  [LESSON_PARALELO_SLUG]: EN_PARALELO,
  [LESSON_PUENTE_SLUG]: EL_PUENTE,
  [LESSON_INDEPENDIENTES_SLUG]: CAMINOS_INDEPENDIENTES,
  [LESSON_SEGURIDAD_SLUG]: CORRIENTE_SEGURIDAD,
  [LESSON_MEDIR_TENSION_SLUG]: MEDIR_TENSION,
  [LESSON_MEDIR_CORRIENTE_SLUG]: MEDIR_CORRIENTE,
  [LESSON_TENSION_CORRIENTE_SLUG]: TENSION_Y_CORRIENTE,
  [LESSON_COLORES_SLUG]: COLORES_DE_CABLES,
  [LESSON_INTERRUPTOR_FASE_SLUG]: INTERRUPTOR_EN_FASE,
  [LESSON_TOMACORRIENTE_SLUG]: EL_TOMACORRIENTE,
  [LESSON_PILA_RED_SLUG]: DE_LA_PILA_A_LA_RED,
  ...DOMICILIARIA_LESSONS,
};

interface CourseRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: CourseLevel;
  estimated_minutes: number;
  cover_image: string | null;
  published: boolean;
  sort_order: number;
}

interface ModuleRow {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  sort_order: number;
}

interface LessonRow {
  id: string;
  module_id: string;
  slug: string;
  title: string;
  description: string;
  lesson_type: LessonType;
  content: unknown;
  sort_order: number;
  published: boolean;
}

function parseContent(
  type: LessonType,
  raw: unknown,
  slug?: string,
): LessonContent {
  if (type === "interactive") {
    return INTERACTIVE_LESSONS[slug ?? ""] ?? CIRCUITO_SIMPLE;
  }
  const known = DOMICILIARIA_ARTICLES[slug ?? ""];
  if (known) {
    return known;
  }
  const content = raw as ArticleContent | null;
  if (content && Array.isArray(content.blocks)) {
    return content;
  }
  return { blocks: [] };
}

function mapLesson(row: LessonRow): Lesson {
  return {
    id: row.id,
    moduleId: row.module_id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    lessonType: row.lesson_type,
    content: parseContent(row.lesson_type, row.content, row.slug),
    sortOrder: row.sort_order,
    published: row.published,
  };
}

export async function fetchCourseSummaries(): Promise<CourseSummary[]> {
  if (!isSupabaseConfigured()) {
    return DEMO_COURSES;
  }

  const supabase = createBrowserSupabase();
  if (!supabase) {
    return DEMO_COURSES;
  }

  const { data: courses, error } = await supabase
    .from("courses")
    .select(
      "id, slug, title, description, level, estimated_minutes, cover_image, published, sort_order",
    )
    .eq("published", true)
    .order("sort_order", { ascending: true });

  if (error || !courses) {
    throw new Error(error?.message ?? "No se pudieron cargar los cursos.");
  }

  if (courses.length === 0) {
    return [];
  }

  const ids = courses.map((course) => course.id);
  const { data: modules } = await supabase
    .from("modules")
    .select("id, course_id")
    .in("course_id", ids);

  const moduleIds = (modules ?? []).map((module) => module.id);
  const { data: lessons } = moduleIds.length
    ? await supabase
        .from("lessons")
        .select("id, module_id")
        .eq("published", true)
        .in("module_id", moduleIds)
    : { data: [] as { id: string; module_id: string }[] };

  return (courses as CourseRow[]).map((course) => {
    const courseModules = (modules ?? []).filter((m) => m.course_id === course.id);
    const courseModuleIds = new Set(courseModules.map((m) => m.id));
    const lessonCount = (lessons ?? []).filter((l) =>
      courseModuleIds.has(l.module_id),
    ).length;
    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description,
      level: course.level,
      estimatedMinutes: course.estimated_minutes,
      coverImage: course.cover_image,
      published: course.published,
      sortOrder: course.sort_order,
      access: courseAccess(course.slug),
      moduleCount: courseModules.length,
      lessonCount,
    };
  });
}

export async function fetchCourseBySlug(
  slug: string,
): Promise<CourseDetail | null> {
  if (!isSupabaseConfigured()) {
    return demoCourseBySlug(slug);
  }

  const supabase = createBrowserSupabase();
  if (!supabase) {
    return demoCourseBySlug(slug);
  }

  const { data: course, error } = await supabase
    .from("courses")
    .select(
      "id, slug, title, description, level, estimated_minutes, cover_image, published, sort_order",
    )
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!course) {
    return null;
  }

  const { data: modules, error: moduleError } = await supabase
    .from("modules")
    .select("id, course_id, title, description, sort_order")
    .eq("course_id", course.id)
    .order("sort_order", { ascending: true });

  if (moduleError) {
    throw new Error(moduleError.message);
  }

  const moduleRows = (modules ?? []) as ModuleRow[];
  const moduleIds = moduleRows.map((module) => module.id);
  const { data: lessons, error: lessonError } = moduleIds.length
    ? await supabase
        .from("lessons")
        .select(
          "id, module_id, slug, title, description, lesson_type, content, sort_order, published",
        )
        .eq("published", true)
        .in("module_id", moduleIds)
        .order("sort_order", { ascending: true })
    : { data: [] as LessonRow[], error: null };

  if (lessonError) {
    throw new Error(lessonError.message);
  }

  const lessonRows = (lessons ?? []) as LessonRow[];
  const courseRow = course as CourseRow;

  const withLessons: ModuleWithLessons[] = moduleRows.map((module) => ({
    id: module.id,
    courseId: module.course_id,
    title: module.title,
    description: module.description,
    sortOrder: module.sort_order,
    lessons: lessonRows.filter((l) => l.module_id === module.id).map(mapLesson),
  }));

  return {
    id: courseRow.id,
    slug: courseRow.slug,
    title: courseRow.title,
    description: courseRow.description,
    level: courseRow.level,
    estimatedMinutes: courseRow.estimated_minutes,
    coverImage: courseRow.cover_image,
    published: courseRow.published,
    sortOrder: courseRow.sort_order,
    access: courseAccess(courseRow.slug),
    modules: withLessons,
  };
}
