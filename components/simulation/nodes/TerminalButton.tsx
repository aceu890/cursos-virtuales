"use client";

type TerminalTone = "fase" | "neutro" | "tierra" | "default";

const tones: Record<TerminalTone, string> = {
  fase: "border-red-800 bg-[#C62828]",
  neutro: "border-zinc-500 bg-[#F4F1EA]",
  tierra: "border-green-900 bg-[#2E7D32]",
  default: "border-foreground/70 bg-surface",
};

interface TerminalButtonProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
  className?: string;
  tone?: TerminalTone;
}

export function TerminalButton({
  label,
  selected,
  onSelect,
  className = "",
  tone = "default",
}: TerminalButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={selected}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      className={`term-3d nodrag nopan absolute z-10 rounded-full border-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
        tones[tone]
      } ${selected ? "ring-4 ring-primary/40" : ""} ${className}`}
    />
  );
}
