"use client";

import { isSupabaseConfigured } from "@/lib/env";

export function DemoBanner() {
  if (isSupabaseConfigured()) {
    return null;
  }

  return (
    <p className="chip-3d bg-[var(--demo-banner)] px-4 py-2 text-center text-xs text-foreground sm:text-sm">
      Modo demo: el catálogo usa datos de ejemplo y tu progreso se guarda en este
      dispositivo.
    </p>
  );
}
