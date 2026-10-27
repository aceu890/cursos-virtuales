import Link from "next/link";
import type { CourseSummary } from "@/lib/courses/types";
import { LEVEL_LABEL } from "@/lib/courses/types";
import { ProgressBar3D } from "../ui/Charts";
import { SectionArt } from "../ui/SectionArt";

interface CourseCardProps {
  course: CourseSummary;
  progress?: number;
}

export function CourseCard({ course, progress }: CourseCardProps) {
  return (
    <article className="neu pressable flex h-full flex-col rounded-[28px] p-5">
      <div className="relative mb-4 h-32">
        <Link
          href={`/cursos/${course.slug}`}
          aria-label={course.title}
          className="absolute inset-0 overflow-hidden rounded-[22px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {course.coverImage ? (
            <img
              src={course.coverImage}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="neu-mint flex h-full items-end justify-end px-4 pb-4 pt-2">
              <SectionArt
                section="course"
                size="sm"
                className="-mb-3 h-22 w-22 shrink-0"
              />
            </div>
          )}
        </Link>
        <span
          className={`chip-3d pointer-events-none absolute top-3 left-3 z-10 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
            course.access === "paid"
              ? "bg-foreground text-background"
              : "bg-success text-white"
          }`}
        >
          {course.access === "paid" ? "De pago" : "Gratis"}
        </span>
        <span className="chip-3d pointer-events-none absolute top-3 right-3 left-auto z-10 whitespace-nowrap rounded-full bg-surface px-3 py-1 text-xs font-semibold text-primary">
          {LEVEL_LABEL[course.level]}
        </span>
      </div>
      <h2 className="font-display text-2xl leading-tight tracking-tight">
        <Link
          href={`/cursos/${course.slug}`}
          className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {course.title}
        </Link>
      </h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
        {course.description}
      </p>
      <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <div>
          <dt className="inline">Duración: </dt>
          <dd className="inline font-medium text-foreground">
            {course.estimatedMinutes} min
          </dd>
        </div>
        <div>
          <dt className="inline">Lecciones: </dt>
          <dd className="inline font-medium text-foreground">
            {course.lessonCount}
          </dd>
        </div>
      </dl>
      {typeof progress === "number" ? (
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs">
            <span>Tu progreso</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <ProgressBar3D
            value={progress}
            max={100}
            now={progress}
            label={`Progreso del curso: ${progress} por ciento`}
          />
        </div>
      ) : null}
    </article>
  );
}
