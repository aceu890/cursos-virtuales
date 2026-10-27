"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { demoCourseBySlug } from "@/lib/courses/demo-data";
import { fetchCourseBySlug } from "@/lib/courses/queries";
import {
  LEVEL_LABEL,
  coursePercent,
  flattenLessons,
  nextIncompleteLesson,
  type CourseDetail,
} from "@/lib/courses/types";
import { useProgress } from "@/lib/progress/ProgressProvider";
import { ErrorState } from "../catalog/ErrorState";
import { CourseCardSkeleton } from "../catalog/CourseCardSkeleton";
import { ProgressBar3D } from "../ui/Charts";

export function CourseView({ slug }: { slug: string }) {
  const { completedIds, ready } = useProgress();
  const demo = !isSupabaseConfigured();
  const [remote, setRemote] = useState<CourseDetail | null | undefined>(
    undefined,
  );
  const [error, setError] = useState<string | null>(null);
  const course = demo ? demoCourseBySlug(slug) : remote;

  const load = useCallback(() => {
    return fetchCourseBySlug(slug)
      .then((data) => {
        setError(null);
        setRemote(data);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo abrir el curso. Inténtalo de nuevo.",
        );
      });
  }, [slug]);

  useEffect(() => {
    if (demo) {
      return;
    }
    let cancelled = false;
    fetchCourseBySlug(slug)
      .then((data) => {
        if (!cancelled) {
          setError(null);
          setRemote(data);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo abrir el curso. Inténtalo de nuevo.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [demo, slug]);

  const percent = useMemo(
    () => (course ? coursePercent(course, completedIds) : 0),
    [course, completedIds],
  );
  const lessons = course ? flattenLessons(course) : [];
  const next = course ? nextIncompleteLesson(course, completedIds) : null;
  const first = lessons[0];
  const ctaHref = next
    ? `/cursos/${slug}/lecciones/${next.slug}`
    : first
      ? `/cursos/${slug}/lecciones/${first.slug}`
      : "/catalogo";
  const ctaLabel = !ready
    ? "Comenzar"
    : percent === 0
      ? "Comenzar"
      : percent === 100
        ? "Repasar"
        : "Continuar";

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          setError(null);
          setRemote(undefined);
          void load();
        }}
      />
    );
  }

  if (course === undefined) {
    return <CourseCardSkeleton />;
  }

  if (!course) {
    return (
      <ErrorState message="No encontramos este curso. Puede que el enlace esté mal o que aún no esté publicado." />
    );
  }

  return (
    <article>
      {course.coverImage ? (
        <div className="relative mb-6 overflow-hidden rounded-[28px]">
          <img
            src={course.coverImage}
            alt=""
            className="h-44 w-full object-cover sm:h-60"
          />
          <span
            className={`chip-3d absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
              course.access === "paid"
                ? "bg-foreground text-background"
                : "bg-success text-white"
            }`}
          >
            {course.access === "paid" ? "De pago" : "Gratis"}
          </span>
        </div>
      ) : null}
      <div className="min-w-0">
        <p className="text-sm font-semibold text-primary">
          {LEVEL_LABEL[course.level]} · {course.estimatedMinutes} min
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">
          {course.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          {course.description}
        </p>
      </div>

      <div className="mt-6 max-w-md">
        <div className="mb-1 flex justify-between text-sm">
          <span>Progreso del curso</span>
          <span className="font-semibold">{`${percent}%`}</span>
        </div>
        <ProgressBar3D
          value={percent}
          max={100}
          now={percent}
          label="Progreso del curso"
        />
      </div>

      <div className="mt-8">
        <Link
          href={ctaHref}
          className="btn-3d pressable inline-flex min-h-11 items-center rounded-full px-8 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {ctaLabel}
        </Link>
      </div>

      <ol className="mt-12 space-y-8">
        {course.modules.map((module, index) => (
          <li key={module.id}>
            <h2 className="font-display text-2xl tracking-tight">
              Módulo {index + 1}: {module.title}
            </h2>
            {module.description ? (
              <p className="mt-1 text-muted">{module.description}</p>
            ) : null}
            <ul className="neu mt-4 divide-y divide-line overflow-hidden rounded-[24px]">
              {module.lessons.map((lesson) => {
                const done = completedIds.has(lesson.id);
                return (
                  <li key={lesson.id}>
                    <Link
                      href={`/cursos/${course.slug}/lecciones/${lesson.slug}`}
                      className="flex items-start gap-3 px-4 py-4 hover:bg-cream/60 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
                    >
                      <span
                        className={`chip-3d mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${
                          done
                            ? "bg-success text-white"
                            : "knob text-muted"
                        }`}
                        aria-hidden
                      >
                        {done ? "✓" : lesson.sortOrder}
                      </span>
                      <span>
                        <span className="block font-semibold">
                          {lesson.title}
                          {lesson.lessonType === "interactive" ? (
                            <span className="chip-3d ml-2 rounded-full bg-card-sky px-2 py-0.5 text-xs font-medium text-foreground">
                              Interactiva
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-1 block text-sm text-muted">
                          {lesson.description}
                        </span>
                        {done ? (
                          <span className="mt-1 block text-xs font-medium text-success">
                            Completada
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
    </article>
  );
}
