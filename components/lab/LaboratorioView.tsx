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
      <div className="neu h-[380px] animate-pulse rounded-3xl" />
    ),
  },
);

export function LaboratorioView() {
  return <CircuitWorkspace definition={LABORATORIO} sandbox />;
}
