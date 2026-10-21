"use client";

import dynamic from "next/dynamic";
import { LABORATORIO } from "@/lib/simulation/lessons/laboratorio";

const CircuitWorkspace = dynamic(
  () =>
    import("../simulation/CircuitWorkspace").then(
      (mod) => mod.CircuitWorkspace,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="neu min-h-[280px] flex-1 animate-pulse rounded-3xl" />
    ),
  },
);

export function LaboratorioView() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <CircuitWorkspace definition={LABORATORIO} sandbox />
    </div>
  );
}
