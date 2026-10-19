import type { Metadata } from "next";
import { LaboratorioView } from "@/components/lab/LaboratorioView";

export const metadata: Metadata = {
  title: "Laboratorio",
  description:
    "Tablero libre con artefactos de un circuito y protecciones del tablero.",
};

export default function LaboratorioPage() {
  return (
    <div className="py-4">
      <h1 className="font-display text-4xl tracking-tight">Laboratorio</h1>
      <p className="mt-2 max-w-2xl text-muted">
        El tablero empieza vacío y guarda lo que armes en este dispositivo.
        En Testers están el multímetro, el detector de voltaje y los medidores.
      </p>
      <div className="mt-8">
        <LaboratorioView />
      </div>
    </div>
  );
}
