import type { Metadata } from "next";
import { LaboratorioView } from "@/components/lab/LaboratorioView";

export const metadata: Metadata = {
  title: "Laboratorio",
  description:
    "Tablero libre con artefactos de un circuito y protecciones del tablero.",
};

export default function LaboratorioPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col py-3 lg:py-4">
      <div className="hidden shrink-0 lg:block">
        <h1 className="font-display text-3xl tracking-tight">Laboratorio</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          El tablero empieza vacío y guarda lo que armes en este dispositivo.
          En Testers están el multímetro, el detector de voltaje y los medidores.
        </p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col lg:mt-4">
        <LaboratorioView />
      </div>
    </div>
  );
}
