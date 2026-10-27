import type { Metadata } from "next";
import { LaboratorioView } from "@/components/lab/LaboratorioView";

export const metadata: Metadata = {
  title: "Laboratorio",
  description:
    "Tablero libre con artefactos de un circuito y protecciones del tablero.",
};

export default function LaboratorioPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <h1 className="sr-only">Laboratorio</h1>
      <LaboratorioView />
    </div>
  );
}
