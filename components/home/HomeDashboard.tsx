"use client";

import Link from "next/link";
import { DEMO_COURSE_DETAIL, DEMO_COURSES } from "@/lib/courses/demo-data";
import {
  LEVEL_LABEL,
  coursePercent,
  flattenLessons,
  nextIncompleteLesson,
} from "@/lib/courses/types";
import { useProgress } from "@/lib/progress/ProgressProvider";
import {
  IconBolt,
  IconClock,
  IconLessons,
  IconPlay,
  IconProgress,
} from "../ui/Icons";
import { DonutChart3D, ProgressBar3D } from "../ui/Charts";
import { WelcomeFigure } from "./WelcomeFigure";

const METRIC_TONES = ["neu-mint", "neu-ice", "neu-sky", "neu-lavender"] as const;

export function HomeDashboard() {
  const { completedIds, ready } = useProgress();
  const lessons = flattenLessons(DEMO_COURSE_DETAIL);
  const percent = ready ? coursePercent(DEMO_COURSE_DETAIL, completedIds) : 0;
  const next = ready
    ? nextIncompleteLesson(DEMO_COURSE_DETAIL, completedIds)
    : lessons[0];
  const completedCount = ready
    ? lessons.filter((lesson) => completedIds.has(lesson.id)).length
    : 0;

  const metrics = [
    {
      label: "Cursos",
      value: String(DEMO_COURSES.length),
      note: DEMO_COURSE_DETAIL.title,
      icon: IconBolt,
    },
    {
      label: "Lecciones",
      value: String(lessons.length),
      note: `${DEMO_COURSES[0]?.moduleCount ?? DEMO_COURSE_DETAIL.modules.length} módulos`,
      icon: IconLessons,
    },
    {
      label: "Minutos",
      value: String(DEMO_COURSE_DETAIL.estimatedMinutes),
      note: LEVEL_LABEL[DEMO_COURSE_DETAIL.level],
      icon: IconClock,
    },
    {
      label: "Progreso",
      value: `${percent}%`,
      note: `${completedCount} de ${lessons.length} lecciones`,
      icon: IconProgress,
    },
  ];

  const moduleStats = DEMO_COURSE_DETAIL.modules.map((module) => {
    const total = module.lessons.length;
    const done = ready
      ? module.lessons.filter((lesson) => completedIds.has(lesson.id)).length
      : 0;
    return { id: module.id, title: module.title, total, done };
  });
  const donutTotal = moduleStats.reduce((sum, item) => sum + item.total, 0);
  const donutSlices = moduleStats.map((item) => ({
    id: item.id,
    title: item.title,
    value: item.total,
  }));

  return (
    <div className="space-y-6 pt-2">
      <section className="neu-raised grid items-center gap-6 rounded-[32px] p-6 sm:p-8 lg:grid-cols-[1fr_auto]">
        <div>
          <p className="text-sm font-semibold text-primary">
            Cursos para hacer, no solo ver
          </p>
          <h1 className="mt-2 max-w-2xl font-display text-4xl leading-tight tracking-tight sm:text-5xl">
            Aprende practicando, no solo mirando.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
            Arma circuitos, comete errores y entiende por qué la ampolleta
            enciende. Practica es una plataforma de cursos con simulaciones
            interactivas, pensada para el móvil y para seguir sin conexión.
          </p>
          <div className="mt-6 flex flex-col gap-3 pb-2 sm:flex-row">
            <Link
              href="/catalogo"
              className="btn-3d pressable inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <IconPlay className="h-4 w-4" />
              Explorar el catálogo
            </Link>
            <Link
              href={`/cursos/${DEMO_COURSE_DETAIL.slug}`}
              className="btn-3d-soft pressable inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Ir al curso de electricidad
            </Link>
          </div>
        </div>
        <WelcomeFigure />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <article
              key={metric.label}
              className={`${METRIC_TONES[index]} rounded-[28px] p-5`}
            >
              <div className="flex items-center justify-between">
                <span className="knob grid h-10 w-10 place-items-center rounded-2xl">
                  <Icon />
                </span>
                <p className="text-xs font-medium text-muted">{metric.label}</p>
              </div>
              <p className="mt-4 text-3xl font-semibold tracking-tight">
                {metric.value}
              </p>
              <p className="mt-1 text-xs text-muted">{metric.note}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="neu rounded-[28px] p-5">
          <h2 className="text-lg font-semibold tracking-tight">
            Avance por módulo
          </h2>
          <p className="mt-1 text-xs text-muted">
            Completadas sobre el total de lecciones de cada módulo.
          </p>
          <ul className="mt-6 space-y-4">
            {moduleStats.map((item) => (
              <li key={item.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{item.title}</span>
                  <span className="font-semibold">
                    {`${item.done}/${item.total}`}
                  </span>
                </div>
                <ProgressBar3D
                  value={item.done}
                  max={item.total}
                  now={ready ? item.done : 0}
                  label={`${item.title}: ${item.done} de ${item.total}`}
                />
              </li>
            ))}
          </ul>
        </article>

        <article className="neu rounded-[28px] p-5">
          <h2 className="text-lg font-semibold tracking-tight">
            Lecciones por módulo
          </h2>
          <p className="mt-1 text-xs text-muted">
            Cómo se reparte el curso {DEMO_COURSE_DETAIL.title}.
          </p>
          <div className="mt-5">
            <DonutChart3D slices={donutSlices} center={donutTotal} />
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="neu rounded-[28px] p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight">Lecciones</h2>
            <Link
              href={`/cursos/${DEMO_COURSE_DETAIL.slug}`}
              className="btn-3d-soft pressable inline-flex min-h-9 items-center rounded-full px-3 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Ver el curso
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {lessons.map((lesson) => {
              const done = ready && completedIds.has(lesson.id);
              return (
                <li key={lesson.id}>
                  <Link
                    href={`/cursos/${DEMO_COURSE_DETAIL.slug}/lecciones/${lesson.slug}`}
                    className="neu-inset pressable flex items-center gap-3 rounded-2xl px-3 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <span className="knob grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-primary">
                      {lesson.lessonType === "interactive" ? (
                        <IconBolt />
                      ) : (
                        <IconLessons />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">
                        {lesson.title}
                      </span>
                      <span className="block truncate text-xs text-muted">
                        {done ? "Completada" : lesson.description}
                      </span>
                    </span>
                    <span
                      className="knob grid h-10 w-10 shrink-0 place-items-center rounded-full"
                      aria-hidden
                    >
                      <IconPlay className="h-4 w-4" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </article>

        <article className="neu rounded-[28px] p-5">
          <h2 className="text-lg font-semibold tracking-tight">
            Curso destacado
          </h2>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted">
            {LEVEL_LABEL[DEMO_COURSE_DETAIL.level]} ·{" "}
            {DEMO_COURSE_DETAIL.estimatedMinutes} min
          </p>
          <h3 className="mt-3 font-display text-2xl">
            {DEMO_COURSE_DETAIL.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {DEMO_COURSE_DETAIL.description}
          </p>
          <Link
            href={`/cursos/${DEMO_COURSE_DETAIL.slug}`}
            className="btn-3d pressable mt-5 inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Ver el curso
          </Link>
        </article>
      </section>

      <section className="neu flex flex-col items-start justify-between gap-4 rounded-[28px] p-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold">
            {next
              ? `Siguiente: ${next.title}`
              : "Ya completaste las lecciones del curso"}
          </p>
          <p className="mt-1 text-sm text-muted">
            {next
              ? next.description
              : `Puedes repasarlo cuando quieras en ${DEMO_COURSE_DETAIL.title}.`}
          </p>
        </div>
        <Link
          href={
            next
              ? `/cursos/${DEMO_COURSE_DETAIL.slug}/lecciones/${next.slug}`
              : `/cursos/${DEMO_COURSE_DETAIL.slug}`
          }
          className="btn-3d pressable inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {next ? "Continuar" : "Repasar"}
        </Link>
      </section>
    </div>
  );
}
