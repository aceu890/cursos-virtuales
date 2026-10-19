"use client";

import { ErrorState } from "@/components/catalog/ErrorState";

export default function CatalogoError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <ErrorState
        message="El catálogo no cargó. Comprueba la conexión e inténtalo otra vez."
        onRetry={reset}
      />
    </div>
  );
}
