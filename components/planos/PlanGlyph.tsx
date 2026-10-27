import type { SymbolKind } from "@/lib/planos/casa";

export function PlanGlyph({ kind }: { kind: SymbolKind }) {
  if (kind === "luz") {
    return (
      <g fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle r="13" />
        <path d="M-8 -8 L8 8 M8 -8 L-8 8" />
      </g>
    );
  }
  if (kind === "interruptor") {
    return (
      <g fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle r="7" />
        <path d="M7 0 H16" strokeLinecap="round" />
        <path d="M16 0 L10 -8" strokeLinecap="round" />
      </g>
    );
  }
  if (kind === "toma") {
    return (
      <g fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle r="13" />
        <path d="M-4 -6 V6 M4 -6 V6" strokeLinecap="round" />
      </g>
    );
  }
  if (kind === "aplique") {
    return (
      <g fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M-12 8 H12" strokeLinecap="round" />
        <path d="M-8 8 V2 A8 8 0 0 1 8 2 V8" />
      </g>
    );
  }
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="-16" y="-12" width="32" height="24" rx="2" />
      <text
        x="0"
        y="4"
        textAnchor="middle"
        fill="currentColor"
        stroke="none"
        fontSize="11"
        fontWeight="700"
      >
        TG
      </text>
    </g>
  );
}
