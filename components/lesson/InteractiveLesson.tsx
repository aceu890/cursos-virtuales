"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import type { CourseDetail, Lesson } from "@/lib/courses/types";
import { isCircuitLesson, lessonNeighbors } from "@/lib/courses/types";
import { useProgress } from "@/lib/progress/ProgressProvider";
import { LessonCelebrate } from "./LessonCelebrate";
import { LessonReading } from "./LessonReading";

const CircuitWorkspace = dynamic(
  () =>
    import("../simulation/CircuitWorkspace").then(
      (mod) => mod.CircuitWorkspace,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="neu h-[380px] animate-pulse rounded-3xl" />
    ),
  },
);

export function InteractiveLesson({
  course,
  lesson,
}: {
  course: CourseDetail;
  lesson: Lesson;
}) {
  const { markComplete, isCompleted, demoMode, userId } = useProgress();
  const [justCompleted, setJustCompleted] = useState(false);
  const { next } = lessonNeighbors(course, lesson.id);
  const definition = isCircuitLesson(lesson.content) ? lesson.content : null;

  const onSolved = useCallback(() => {
    void markComplete(lesson.id);
    setJustCompleted(true);
  }, [lesson.id, markComplete]);

  if (!definition) {
    return <p>Esta lección interactiva no tiene una simulación válida.</p>;
  }

  const done = isCompleted(lesson.id) || justCompleted;

  return (
    <div className="space-y-6">
      <p className="text-lg leading-relaxed text-muted">{definition.concepto}</p>
      {definition.lectura && definition.lectura.length > 0 ? (
        <LessonReading blocks={definition.lectura} />
      ) : null}
      <p className="neu rounded-[24px] px-4 py-3 font-semibold">
        Meta: {definition.objetivo}
      </p>
      <CircuitWorkspace
        key={lesson.id}
        definition={definition}
        onSolved={onSolved}
      />
      {done ? (
        <LessonCelebrate
          course={course}
          lessonId={lesson.id}
          next={next}
          demoMode={demoMode}
          userId={userId}
          celebrate={justCompleted}
        />
      ) : null}
      <p className="text-xs text-muted">
        Tip: arrastra un cable o pulsa dos bornes del mismo color para unirlos.
        Doble clic en un cable o en un borne para desconectarlo. Ctrl+Z
        restaura lo último que borraste. En Configuración puedes mostrar el
        panel Unir.
      </p>
    </div>
  );
}
