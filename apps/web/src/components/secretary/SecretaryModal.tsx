import type { ReactNode } from "react";
import { Dialog, DialogTrigger, Heading, Modal, ModalOverlay } from "react-aria-components";

interface SecretaryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function SecretaryModal({
  isOpen,
  onOpenChange,
  title,
  children,
  footer,
}: SecretaryModalProps) {
  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalOverlay
        className="fixed inset-0 z-modal flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm entering:animate-in entering:fade-in exiting:animate-out exiting:fade-out"
        isDismissable
      >
        <Modal className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-white shadow-xl entering:animate-in entering:fade-in entering:zoom-in-95 exiting:animate-out exiting:fade-out exiting:zoom-out-95">
          <Dialog className="outline-none">
            {() => (
              <div className="p-6">
                <Heading slot="title" className="text-lg font-semibold text-text">
                  {title}
                </Heading>
                <div className="mt-4">{children}</div>
                {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
              </div>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}
