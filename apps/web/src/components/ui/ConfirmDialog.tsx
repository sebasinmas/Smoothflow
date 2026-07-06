import type { ReactNode } from "react";
import {
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
  Heading,
} from "react-aria-components";
import { Button } from "@/components/ui/Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  loading,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalOverlay
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm entering:animate-in entering:fade-in exiting:animate-out exiting:fade-out"
        isDismissable
      >
        <Modal className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-white shadow-xl entering:animate-in entering:fade-in entering:zoom-in-95 exiting:animate-out exiting:fade-out exiting:zoom-out-95">
          <Dialog className="outline-none">
            {({ close }) => (
              <div className="p-6">
                <Heading slot="title" className="text-lg font-semibold text-text">
                  {title}
                </Heading>
                <div className="mt-2 text-sm text-text-muted">{description}</div>
                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="secondary" onClick={close} disabled={loading}>
                    {cancelLabel}
                  </Button>
                  <Button
                    variant="danger"
                    loading={loading}
                    onClick={() => {
                      onConfirm();
                    }}
                  >
                    {confirmLabel}
                  </Button>
                </div>
              </div>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}
