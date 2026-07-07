import { CircleHelp } from "lucide-react";
import { AppTooltip } from "@/components/ui/Tooltip";

interface FieldHintProps {
  content: string;
}

export function FieldHint({ content }: FieldHintProps) {
  return (
    <AppTooltip content={content} placement="top">
      <button
        type="button"
        tabIndex={-1}
        className="inline-flex cursor-help text-text-muted transition-colors hover:text-text"
        aria-label="Más información"
      >
        <CircleHelp className="size-3.5" aria-hidden="true" />
      </button>
    </AppTooltip>
  );
}
