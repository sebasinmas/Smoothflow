export function LoadingState({ message = "Cargando…" }: { message?: string }) {
  return (
    <div className="flex items-center justify-center gap-2.5 py-8 text-text-muted" role="status">
      <span className="btn-spinner text-brand" aria-hidden="true" />
      <span className="text-sm">{message}</span>
    </div>
  );
}
