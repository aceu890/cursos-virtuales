import type { EvaluationResult } from "@/lib/simulation/types";

export function FeedbackPanel({
  evaluation,
  interacted,
  solutionText,
  startHint,
}: {
  evaluation: EvaluationResult;
  interacted: boolean;
  solutionText?: string | null;
  startHint?: string;
}) {
  const tone =
    evaluation.estado === "correcto"
      ? "neu-mint"
      : interacted
        ? "neu-mint"
        : "neu";

  const messages = solutionText
    ? [{ tipo: "pista" as const, codigo: "solucion", texto: solutionText }]
    : interacted
      ? evaluation.mensajes
      : [
          {
            tipo: "pista" as const,
            codigo: "inicio",
            texto:
              startHint ??
              "Las piezas ya están en el tablero. Únelas con cables en un círculo y enciende el interruptor. Pulsa Comprobar cuando quieras una pista. Si te trabas, usa Solución.",
          },
        ];

  return (
    <div
      className={`rounded-2xl px-4 py-3 ${tone}`}
      aria-live="polite"
      aria-atomic="true"
      role="status"
    >
      {messages.map((message) => (
        <p key={message.codigo} className="text-sm leading-relaxed">
          {message.texto}
        </p>
      ))}
    </div>
  );
}
