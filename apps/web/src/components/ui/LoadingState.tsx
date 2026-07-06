import { LoaderCircle } from "lucide-react";

export function LoadingState({ message = "Cargando…" }: { message?: string }) {
  return (
    <div className="flex items-center gap-2 py-8 text-text-muted" role="status">
      <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      <span className="text-sm">{message}</span>
    </div>
  );
}
