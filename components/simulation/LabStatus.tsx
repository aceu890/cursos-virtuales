import { formatAmps, formatVolts } from "@/lib/simulation/devices";
import type { EvaluationResult } from "@/lib/simulation/types";

export function LabStatus({
  result,
  empty,
  hold,
}: {
  result: EvaluationResult;
  empty: boolean;
  hold?: string | null;
}) {
  if (empty) {
    return null;
  }

  const trips = result.disparos ?? [];
  const avisos = result.avisos ?? [];
  const lines: string[] = [
    ...(hold ? [hold] : trips.map((trip) => trip.texto)),
    ...avisos.map((aviso) => aviso.texto),
  ];
  if (lines.length === 0) {
    if (result.estado === "correcto") {
      lines.push(
        "Circuito cerrado. Las cargas que tienen camino reciben corriente.",
      );
    } else if (result.mensajes[0]?.texto) {
      lines.push(result.mensajes[0].texto);
    }
  }

  const currents = Object.entries(result.corrientes ?? {}).filter(
    ([, amps]) => amps > 0,
  );
  const voltages = Object.entries(result.tensiones ?? {});

  return (
    <div
      className="neu rounded-2xl px-4 py-3"
      aria-live="polite"
      aria-atomic="true"
      role="status"
    >
      {lines.map((line) => (
        <p key={line} className="text-sm leading-relaxed">
          {line}
        </p>
      ))}
      {currents.length > 0 || voltages.length > 0 ? (
        <p className="mt-2 text-xs font-semibold text-muted">
          {voltages.map(([id, volts], index) => (
            <span key={`v-${id}`}>
              {index > 0 ? " · " : null}
              Tensión {formatVolts(volts)}
            </span>
          ))}
          {voltages.length > 0 && currents.length > 0 ? " · " : null}
          {currents.map(([id, amps], index) => (
            <span key={`a-${id}`}>
              {index > 0 ? " · " : null}
              Corriente {formatAmps(amps)}
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}
