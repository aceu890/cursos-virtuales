"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CourseDetail, Lesson } from "@/lib/courses/types";
import { playCelebrateChime } from "@/lib/lesson/celebrateSound";
import { CelebrateFrost } from "./CelebrateFrost";
import { SparkMascot } from "./SparkMascot";

const CHEERS = [
  "El circuito quedó bien armado. Esa idea ya es tuya.",
  "Trabajo limpio: camino cerrado y sin atajos.",
  "Así se aprende el oficio: haciendo, no solo leyendo.",
];

function cheerFor(id: string) {
  let sum = 0;
  for (const char of id) {
    sum += char.charCodeAt(0);
  }
  return CHEERS[sum % CHEERS.length] ?? CHEERS[0];
}

function CompleteActions({
  course,
  next,
}: {
  course: CourseDetail;
  next: Lesson | null;
}) {
  if (next) {
    return (
      <Link
        href={`/cursos/${course.slug}/lecciones/${next.slug}`}
        className="btn-3d pressable mt-4 inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Siguiente lección
      </Link>
    );
  }
  return (
    <div className="mt-4 flex flex-wrap gap-3">
      <Link
        href="/laboratorio"
        className="btn-3d pressable inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold"
      >
        Probar el Laboratorio
      </Link>
      <Link
        href={`/cursos/${course.slug}`}
        className="btn-3d-soft pressable inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold"
      >
        Volver al curso
      </Link>
    </div>
  );
}

export function LessonCelebrate({
  course,
  lessonId,
  next,
  demoMode,
  userId,
  celebrate,
}: {
  course: CourseDetail;
  lessonId: string;
  next: Lesson | null;
  demoMode: boolean;
  userId: string | null;
  celebrate: boolean;
}) {
  const titleId = useId();
  const acceptRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(celebrate);
  const [mounted, setMounted] = useState(false);
  const cheer = cheerFor(lessonId);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!celebrate) {
      return;
    }
    setOpen(true);
    playCelebrateChime();
  }, [celebrate]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    acceptRef.current?.focus();

    const pinToScreen = () => {
      const overlay = overlayRef.current;
      const view = window.visualViewport;
      if (!overlay) {
        return;
      }
      if (!view) {
        overlay.style.top = "0px";
        overlay.style.left = "0px";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        return;
      }
      overlay.style.top = `${view.offsetTop}px`;
      overlay.style.left = `${view.offsetLeft}px`;
      overlay.style.width = `${view.width}px`;
      overlay.style.height = `${view.height}px`;
    };

    pinToScreen();
    const view = window.visualViewport;
    view?.addEventListener("resize", pinToScreen);
    view?.addEventListener("scroll", pinToScreen);
    window.addEventListener("resize", pinToScreen);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      view?.removeEventListener("resize", pinToScreen);
      view?.removeEventListener("scroll", pinToScreen);
      window.removeEventListener("resize", pinToScreen);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, mounted]);

  const note =
    !demoMode && !userId ? (
      <p className="mt-2 text-sm text-sidebar-muted">
        El avance quedó en este dispositivo. Inicia sesión para guardarlo en tu
        cuenta.
      </p>
    ) : null;

  const overlay =
    celebrate && open && mounted
      ? createPortal(
          <div
            ref={overlayRef}
            className="lesson-celebrate-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            {window.matchMedia("(prefers-reduced-motion: reduce)").matches ? null : (
              <CelebrateFrost />
            )}
            <div className="lesson-celebrate-card">
              <SparkMascot className="spark-mascot mx-auto h-28 w-28" />
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                Lección completada
              </p>
              <h2
                id={titleId}
                className="font-display mt-2 text-3xl tracking-tight text-white"
              >
                ¡Felicitaciones!
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-sidebar-muted">
                {cheer}
              </p>
              {note}
              <button
                ref={acceptRef}
                type="button"
                className="btn-3d pressable mt-6 inline-flex min-h-11 min-w-36 items-center justify-center rounded-full px-8 text-sm font-semibold"
                onClick={() => setOpen(false)}
              >
                Aceptar
              </button>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      {overlay}
      {!open ? (
        <div className="neu-mint rounded-[28px] p-5" role="status">
          <p className="font-semibold text-success">Lección completada</p>
          {!demoMode && !userId ? (
            <p className="mt-1 text-sm text-muted">
              El avance quedó en este dispositivo. Inicia sesión para guardarlo
              en tu cuenta.
            </p>
          ) : null}
          <CompleteActions course={course} next={next} />
        </div>
      ) : null}
    </>
  );
}
