"use client";

interface RemovePartButtonProps {
  label: string;
  onRemove?: () => void;
}

export function RemovePartButton({ label, onRemove }: RemovePartButtonProps) {
  if (!onRemove) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label={`Quitar ${label}`}
      className="node-remove nodrag nopan grid place-items-center text-base leading-none font-bold text-muted hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.stopPropagation();
        onRemove();
      }}
      onDoubleClick={(event) => {
        event.stopPropagation();
      }}
    >
      <span aria-hidden>×</span>
    </button>
  );
}
