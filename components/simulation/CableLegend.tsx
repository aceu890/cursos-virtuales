import { CABLE_COLORS } from "@/lib/simulation/cables";

export function CableLegend() {
  return (
    <div className="space-y-1">
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
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
    <p className="text-xs text-muted">
      El blanco solo vuelve al −. Entre dos ampolletas en serie el puente es
      rojo.
    </p>
    </div>
  );
}
