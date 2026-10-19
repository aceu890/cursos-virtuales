import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog/CatalogView";
import { SectionArt } from "@/components/ui/SectionArt";

export const metadata: Metadata = {
  title: "Cursos",
  description: "Cursos interactivos para aprender practicando.",
};

export default function CatalogoPage() {
  return (
    <div className="py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-4xl tracking-tight">Cursos</h1>
          <p className="mt-2 max-w-2xl text-muted">
            Empieza por electricidad: un circuito simple que puedes armar, romper y
            volver a cerrar.
          </p>
        </div>
        <SectionArt
          section="catalog"
          size="sm"
          className="h-20 w-20 shrink-0 sm:h-36 sm:w-36"
        />
      </div>
      <div className="mt-8">
        <CatalogView />
      </div>
    </div>
  );
}
