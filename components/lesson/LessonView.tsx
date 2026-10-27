"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { demoCourseBySlug } from "@/lib/courses/demo-data";
import { fetchCourseBySlug } from "@/lib/courses/queries";
import { flattenLessons, type CourseDetail, type Lesson } from "@/lib/courses/types";
import { CourseCardSkeleton } from "../catalog/CourseCardSkeleton";
import { ErrorState } from "../catalog/ErrorState";
import { SectionArt } from "../ui/SectionArt";
import { ArticleLesson } from "./ArticleLesson";
import { InteractiveLesson } from "./InteractiveLesson";

export function LessonView({
  slug,
  lessonSlug,
}: {
  slug: string;
  lessonSlug: string;
}) {
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
            : "No se pudo abrir la lección. Inténtalo de nuevo.",
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
              : "No se pudo abrir la lección. Inténtalo de nuevo.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [demo, slug]);

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
    return <ErrorState message="No encontramos este curso." />;
  }

  const lesson: Lesson | undefined = flattenLessons(course).find(
    (item) => item.slug === lessonSlug,
  );

  if (!lesson) {
    return (
      <ErrorState message="No encontramos esta lección. Vuelve al curso y elige otra." />
    );
  }

  return (
    <article>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <nav className="text-sm text-muted">
            <Link
              href={`/cursos/${course.slug}`}
              className="rounded-sm font-medium hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {course.title}
            </Link>
            <span aria-hidden> / </span>
            <span>{lesson.title}</span>
          </nav>
          <h1 className="mt-3 font-display text-4xl tracking-tight">{lesson.title}</h1>
          <p className="mt-2 text-muted">{lesson.description}</p>
        </div>
        <SectionArt
          section="lesson"
          size="sm"
          className="h-16 w-16 shrink-0 sm:h-28 sm:w-28"
        />
      </div>
      <div className="mt-8">
        {lesson.lessonType === "interactive" ? (
          <InteractiveLesson course={course} lesson={lesson} />
        ) : (
          <ArticleLesson course={course} lesson={lesson} />
        )}
      </div>
    </article>
  );
}
