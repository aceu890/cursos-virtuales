"use client";

import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { fetchCourseSummaries } from "@/lib/courses/queries";
import { demoCourseBySlug, DEMO_COURSES } from "@/lib/courses/demo-data";
import { coursePercent, type CourseSummary } from "@/lib/courses/types";
import { useProgress } from "@/lib/progress/ProgressProvider";
import { CourseCard } from "./CourseCard";
import { CourseCardSkeleton } from "./CourseCardSkeleton";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";

export function CatalogView() {
  const { completedIds, ready } = useProgress();
  const [courses, setCourses] = useState<CourseSummary[] | null>(() =>
    isSupabaseConfigured() ? null : DEMO_COURSES,
  );
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    return fetchCourseSummaries()
      .then((data) => {
        setError(null);
        setCourses(data);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error
            ? err.message
            : "Algo falló al pedir el catálogo. Revisa tu conexión e inténtalo de nuevo.",
        );
      });
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }
    let cancelled = false;
    fetchCourseSummaries()
      .then((data) => {
        if (!cancelled) {
          setError(null);
          setCourses(data);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Algo falló al pedir el catálogo. Revisa tu conexión e inténtalo de nuevo.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          setError(null);
          setCourses(null);
          void load();
        }}
      />
    );
  }

  if (!courses) {
    return (
      <div className="grid gap-5 sm:grid-cols-2">
        <CourseCardSkeleton />
        <CourseCardSkeleton />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <EmptyState
        title="Todavía no hay cursos"
        body="Cuando se publique el primero, aparecerá aquí. En modo demo deberías ver Fundamentos de electricidad y Electricidad domiciliaria."
      />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {courses.map((course) => {
        const detail = demoCourseBySlug(course.slug);
        const progress =
          ready && detail ? coursePercent(detail, completedIds) : undefined;
        return (
          <CourseCard key={course.id} course={course} progress={progress} />
        );
      })}
    </div>
  );
}
