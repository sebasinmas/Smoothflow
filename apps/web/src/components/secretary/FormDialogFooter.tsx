import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

type SubmitVariant = "primary" | "danger";

interface FormDialogFooterProps {
  cancelLabel?: string;
  submitLabel: string;
  onCancel: () => void;
  onSubmit?: () => void;
  submitType?: "button" | "submit";
  submitVariant?: SubmitVariant;
  form?: string;
  loading?: boolean;
  submitDisabled?: boolean;
  children?: ReactNode;
}

export function FormDialogFooter({
  cancelLabel = "Cancelar",
  submitLabel,
  onCancel,
  onSubmit,
  submitType = "button",
  submitVariant = "primary",
  form,
  loading,
  submitDisabled,
  children,
}: FormDialogFooterProps) {
  return (
    <div className="flex gap-3">
      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="flex-1 sm:flex-none"
        onClick={onCancel}
        disabled={loading}
      >
        {cancelLabel}
      </Button>
      {children ?? (
        <Button
          type={submitType}
          variant={submitVariant}
          size="lg"
          className="flex-1 sm:flex-none"
          form={form}
          loading={loading}
          disabled={submitDisabled}
          onClick={onSubmit}
        >
          {submitLabel}
        </Button>
      )}
    </div>
  );
}
