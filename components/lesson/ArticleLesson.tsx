"use client";

import type { ArticleContent, CourseDetail, Lesson } from "@/lib/courses/types";
import { lessonNeighbors } from "@/lib/courses/types";
import { useState } from "react";
import { useProgress } from "@/lib/progress/ProgressProvider";
import { Button } from "../ui/Button";
import { LessonCelebrate } from "./LessonCelebrate";

export function ArticleLesson({
  course,
  lesson,
}: {
  course: CourseDetail;
  lesson: Lesson;
}) {
  const { markComplete, isCompleted, demoMode, userId } = useProgress();
  const { next } = lessonNeighbors(course, lesson.id);
  const content = lesson.content as ArticleContent;
  const [justCompleted, setJustCompleted] = useState(false);
  const done = isCompleted(lesson.id) || justCompleted;

  return (
    <div className="space-y-6">
      <div className="neu max-w-2xl space-y-4 rounded-[28px] p-6 text-lg leading-relaxed">
        {content.blocks.map((block, index) => {
          if (block.type === "h2") {
            return (
              <h2
                key={index}
                className="font-display pt-4 text-2xl tracking-tight"
              >
                {block.text}
              </h2>
            );
          }
          if (block.type === "ul") {
            return (
              <ul key={index} className="list-disc space-y-2 pl-5 text-base">
                {(block.items ?? []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          }
          return <p key={index}>{block.text}</p>;
        })}
      </div>
      {done ? (
        <LessonCelebrate
          course={course}
          lessonId={lesson.id}
          next={next}
          demoMode={demoMode}
          userId={userId}
          celebrate={justCompleted}
        />
      ) : (
        <Button
          onClick={() => {
            void markComplete(lesson.id);
            setJustCompleted(true);
          }}
        >
          Marcar como completada
        </Button>
      )}
    </div>
  );
}
