"use client";

import { ErrorState } from "@/components/catalog/ErrorState";

export default function CourseError({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <ErrorState
        message="Este curso no se pudo abrir. Inténtalo de nuevo."
        onRetry={reset}
      />
    </div>
  );
}
