"use client";

import {
  useBoardSettings,
  type TerminalSize,
} from "@/lib/settings/BoardSettingsProvider";

const TERM_OPTIONS: Array<{
  value: TerminalSize;
  label: string;
  hint: string;
}> = [
  { value: "sm", label: "Pequeño", hint: "Más compacto en el tablero" },
  { value: "md", label: "Mediano", hint: "Tamaño por defecto" },
  { value: "lg", label: "Grande", hint: "Más fácil de pulsar" },
];

export function SettingsView() {
  const {
    connectWithoutDrag,
    setConnectWithoutDrag,
    showLiveBorders,
    setShowLiveBorders,
    manualCables,
    setManualCables,
    terminalSize,
    setTerminalSize,
  } = useBoardSettings();

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="neu rounded-[24px] p-4">
        <legend className="px-1 text-sm font-semibold">Tablero</legend>
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-line accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            checked={connectWithoutDrag}
            onChange={(event) => setConnectWithoutDrag(event.target.checked)}
          />
          <span>
            <span className="font-semibold">Conectar sin arrastrar</span>
            <span className="mt-1 block text-xs text-muted">
              Muestra origen, destino y Unir debajo del tablero. En el tablero
              siempre puedes pulsar dos bornes para conectar, aunque esta opción
              esté apagada.
            </span>
          </span>
        </label>
        <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-line accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            checked={showLiveBorders}
            onChange={(event) => setShowLiveBorders(event.target.checked)}
          />
          <span>
            <span className="font-semibold">Borde de piezas energizadas</span>
            <span className="mt-1 block text-xs text-muted">
              Un recuadro punteado dorado marca las piezas que tienen tensión,
              aunque el circuito esté abierto. Por defecto está apagado.
            </span>
          </span>
        </label>
        <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-line accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            checked={manualCables}
            onChange={(event) => setManualCables(event.target.checked)}
          />
          <span>
            <span className="font-semibold">Ordenar cables a mano</span>
            <span className="mt-1 block text-xs text-muted">
              En el tablero aparecen puntos para mover cada cable en
              horizontal o vertical. Doble toque en un punto para quitarlo.
            </span>
          </span>
        </label>
      </fieldset>
      <fieldset className="neu rounded-[24px] p-4">
        <legend className="px-1 text-sm font-semibold">Tamaño de bornes</legend>
        <p className="mb-3 text-xs text-muted">
          Elige el tamaño de los bornes en el tablero.
        </p>
        <div role="radiogroup" aria-label="Tamaño de bornes" className="flex flex-col gap-2">
          {TERM_OPTIONS.map((option) => {
            const selected = terminalSize === option.value;
            return (
              <label
                key={option.value}
                className={`pressable flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-sm ${
                  selected ? "btn-3d-soft" : "bg-transparent"
                }`}
              >
                <input
                  type="radio"
                  name="terminal-size"
                  className="sr-only"
                  value={option.value}
                  checked={selected}
                  onChange={() => setTerminalSize(option.value)}
                />
                <span
                  aria-hidden
                  className="term-preview shrink-0 rounded-full"
                  data-size={option.value}
                />
                <span>
                  <span className="font-semibold">{option.label}</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {option.hint}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
