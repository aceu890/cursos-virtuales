import { CABLE_COLORS } from "@/lib/simulation/cables";

export function CableLegend() {
  return (
    <div className="space-y-1">
    <ul className="flex flex-nowrap gap-x-3 gap-y-1 overflow-x-auto text-xs text-muted md:flex-wrap md:gap-x-4">
      <li className="inline-flex items-center gap-1.5">
        <span
          className="chip-3d h-2.5 w-6 rounded-full"
          style={{ background: CABLE_COLORS.fase }}
          aria-hidden
        />
        Rojo: fase
      </li>
      <li className="inline-flex items-center gap-1.5">
        <span
          className="chip-3d h-2.5 w-6 rounded-full"
          style={{ background: CABLE_COLORS.neutro }}
          aria-hidden
        />
        Blanco: neutro
      </li>
      <li className="inline-flex items-center gap-1.5">
        <span
          className="chip-3d h-2.5 w-6 rounded-full"
          style={{ background: CABLE_COLORS.tierra }}
          aria-hidden
        />
        Verde: tierra
      </li>
      <li className="inline-flex items-center gap-1.5">
        <span
          className="chip-3d h-2.5 w-6 rounded-full"
          style={{ background: CABLE_COLORS.enchufe }}
          aria-hidden
        />
        Gris: enchufe
      </li>
    </ul>
    <p className="hidden text-xs text-muted lg:block">
      El blanco solo vuelve al −. Entre dos ampolletas en serie el puente es
      rojo.
    </p>
    </div>
  );
}
