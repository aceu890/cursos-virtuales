import { Button } from "../ui/Button";

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="neu rounded-[28px] px-6 py-12 text-center"
    >
      <h2 className="font-display text-2xl">No se pudo cargar</h2>
      <p className="mx-auto mt-2 max-w-md text-muted">{message}</p>
      {onRetry ? (
        <Button className="mt-6" onClick={onRetry}>
          Reintentar
        </Button>
      ) : null}
    </div>
  );
}
