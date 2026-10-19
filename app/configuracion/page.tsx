import type { Metadata } from "next";
import { SettingsView } from "@/components/settings/SettingsView";

export const metadata: Metadata = {
  title: "Configuración",
  description: "Ajustes del tablero de práctica.",
};

export default function ConfiguracionPage() {
  return (
    <div className="mx-auto max-w-lg py-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">
        Ajustes
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-tight">
        Configuración
      </h1>
      <p className="mt-3 text-muted">
        Ajusta el tablero: el panel Unir, el borde de piezas energizadas y el
        tamaño de los bornes. Pulsar dos bornes para conectar sigue funcionando
        igual.
      </p>
      <div className="mt-8">
        <SettingsView />
      </div>
    </div>
  );
}
