"use client";

interface AppliancePowerButtonProps {
  label: string;
  on: boolean;
  hasSupply: boolean;
  onToggle?: () => void;
}

export function AppliancePowerButton({
  label,
  on,
  hasSupply,
  onToggle,
}: AppliancePowerButtonProps) {
  if (!onToggle) {
    return null;
  }

  const canTurnOn = hasSupply;
  const disabled = !on && !canTurnOn;

  return (
    <button
      type="button"
      aria-label={
        on
          ? `Apagar ${label}`
          : disabled
            ? `Sin corriente: no se puede encender ${label}`
            : `Encender ${label}`
      }
      aria-pressed={on}
      aria-disabled={disabled}
      disabled={disabled}
      className={`node-remove node-power nodrag nopan !top-0 !left-0 !right-auto grid place-items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
        disabled ? "cursor-not-allowed" : ""
      }`}
      style={{
        background: on ? "var(--success)" : "var(--danger)",
        borderColor: on ? "var(--success)" : "var(--danger)",
        color: "#fff",
      }}
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.stopPropagation();
        if (disabled) {
          return;
        }
        onToggle();
      }}
      onDoubleClick={(event) => {
        event.stopPropagation();
      }}
    >
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
        <path
          d="M8 2.2v5.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M5.05 4.35a4.55 4.55 0 1 0 5.9 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
