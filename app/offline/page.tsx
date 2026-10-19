import type { Metadata } from "next";
import Link from "next/link";
import { SectionArt } from "@/components/ui/SectionArt";

export const metadata: Metadata = { title: "Sin conexión" };

export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <SectionArt section="offline" size="md" className="mx-auto" />
      <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-primary">
        Sin conexión
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-tight">
        Estás desconectado
      </h1>
      <p className="mt-4 text-muted">
        Puedes seguir con las lecciones que ya visitaste: quedan en la caché de
        la app. Cuando vuelva internet, el resto del catálogo se actualizará
        solo.
      </p>
      <Link
        href="/"
        className="btn-3d pressable mt-8 inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold"
      >
        Ir al inicio
      </Link>
    </div>
  );
}
