import type { CircuitLessonDefinition } from "../simulation/flowTypes";
import { COURSE_DOMICILIARIA_SLUG } from "./ids";

export type CourseLevel = "principiante" | "intermedio" | "avanzado";
export type CourseAccess = "free" | "paid";
export type LessonType = "interactive" | "article";

export function courseAccess(slug: string): CourseAccess {
  return slug === COURSE_DOMICILIARIA_SLUG ? "paid" : "free";
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: CourseLevel;
  estimatedMinutes: number;
  coverImage: string | null;
  published: boolean;
  sortOrder: number;
  access: CourseAccess;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  sortOrder: number;
}

export interface ArticleBlock {
  type: "p" | "h2" | "ul";
  text?: string;
  items?: string[];
}

export interface ArticleContent {
  blocks: ArticleBlock[];
}

export type LessonContent = CircuitLessonDefinition | ArticleContent;

export interface Lesson {
  id: string;
  moduleId: string;
  slug: string;
  title: string;
  description: string;
  lessonType: LessonType;
  content: LessonContent;
  sortOrder: number;
  published: boolean;
}

export interface ModuleWithLessons extends CourseModule {
  lessons: Lesson[];
}

export interface CourseDetail extends Course {
  modules: ModuleWithLessons[];
}

export interface CourseSummary extends Course {
  lessonCount: number;
  moduleCount: number;
}

export function isCircuitLesson(
  content: LessonContent,
): content is CircuitLessonDefinition {
  return "simulation" in content && content.simulation === "circuit";
}

export function flattenLessons(course: CourseDetail): Lesson[] {
  return course.modules
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .flatMap((module) =>
      module.lessons.slice().sort((a, b) => a.sortOrder - b.sortOrder),
    );
}

export function coursePercent(
  course: CourseDetail,
  completedIds: ReadonlySet<string>,
): number {
  const lessons = flattenLessons(course);
  if (lessons.length === 0) {
    return 0;
  }
  const done = lessons.filter((lesson) => completedIds.has(lesson.id)).length;
  return Math.round((done / lessons.length) * 100);
}

export function nextIncompleteLesson(
  course: CourseDetail,
  completedIds: ReadonlySet<string>,
): Lesson | null {
  const lessons = flattenLessons(course);
  return lessons.find((lesson) => !completedIds.has(lesson.id)) ?? null;
}

export function lessonNeighbors(
  course: CourseDetail,
  lessonId: string,
): { previous: Lesson | null; next: Lesson | null } {
  const lessons = flattenLessons(course);
  const index = lessons.findIndex((lesson) => lesson.id === lessonId);
  return {
    previous: index > 0 ? lessons[index - 1] : null,
    next: index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : null,
  };
}

export const LEVEL_LABEL: Record<CourseLevel, string> = {
  principiante: "Principiante",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
};
