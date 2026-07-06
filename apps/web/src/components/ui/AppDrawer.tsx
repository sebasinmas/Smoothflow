import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Dialog, DialogTrigger, Heading, Modal, ModalOverlay } from "react-aria-components";

interface AppDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AppDrawer({
  isOpen,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: AppDrawerProps) {
  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalOverlay
        className="fixed inset-0 z-modal flex justify-end bg-black/40 backdrop-blur-sm entering:animate-in entering:fade-in exiting:animate-out exiting:fade-out"
        isDismissable
      >
        <Modal className="flex h-full w-full max-w-md flex-col border-l border-border bg-white shadow-2xl entering:animate-in entering:slide-in-from-right exiting:animate-out exiting:fade-out outline-none">
          <Dialog className="flex h-full min-h-0 flex-col outline-none">
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
                  <button
                    type="button"
                    onClick={close}
                    className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border text-text-muted transition-colors hover:border-brand/30 hover:bg-surface-muted hover:text-text"
                    aria-label="Cerrar"
                  >
                    <X className="size-[18px]" aria-hidden="true" />
                  </button>
                </header>

                <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

                {footer && (
                  <footer className="shrink-0 border-t border-border bg-white px-6 py-4">
                    {footer}
                  </footer>
                )}
              </>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}
