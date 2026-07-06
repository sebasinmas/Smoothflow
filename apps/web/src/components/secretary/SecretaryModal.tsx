import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Dialog, DialogTrigger, Heading, Modal, ModalOverlay } from "react-aria-components";
import { AppTooltip } from "@/components/ui/Tooltip";
import { TOOLTIPS } from "@/lib/tooltips";

interface SecretaryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function SecretaryModal({
  isOpen,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: SecretaryModalProps) {
  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalOverlay
        className="fixed inset-0 z-modal flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm entering:animate-in entering:fade-in exiting:animate-out exiting:fade-out"
        isDismissable
      >
        <Modal className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-white shadow-xl entering:animate-in entering:fade-in entering:zoom-in-95 exiting:animate-out exiting:fade-out exiting:zoom-out-95">
          <Dialog className="flex min-h-0 flex-col outline-none">
            {({ close }) => (
              <>
                <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-6 py-5">
                  <div className="min-w-0">
                    <Heading slot="title" className="text-lg font-semibold text-text">
                      {title}
                    </Heading>
                    {description && (
                      <p className="mt-1 text-sm text-text-muted">{description}</p>
                    )}
                  </div>
                  <AppTooltip content={TOOLTIPS.layout.closeDrawer}>
                    <button
                      type="button"
                      onClick={close}
                      className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border text-text-muted transition-colors hover:border-brand/30 hover:bg-surface-muted hover:text-text"
                      aria-label={TOOLTIPS.layout.closeDrawer}
                    >
                      <X className="size-[18px]" aria-hidden="true" />
                    </button>
                  </AppTooltip>
                </header>

                <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

                {footer && (
                  <footer className="shrink-0 border-t border-border px-6 py-4">{footer}</footer>
                )}
              </>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}
