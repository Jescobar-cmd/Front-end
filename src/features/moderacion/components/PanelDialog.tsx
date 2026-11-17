import { useId, useRef } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "../../../components/ui/Button";
import { useBackdropDismiss } from "../../../hooks/useBackdropDismiss";
import { useDialogBehavior } from "../../../hooks/useDialogBehavior";

interface PanelDialogProps {
  open: boolean;
  title: string;
  description?: string;
  busy?: boolean;
  children: ReactNode;
  footer: ReactNode;
  onClose: () => void;
}

export function PanelDialog({
  open,
  title,
  description,
  busy = false,
  children,
  footer,
  onClose,
}: PanelDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useBackdropDismiss(backdropRef, open, busy, onClose);
  useDialogBehavior({ open, busy, onClose, containerRef: dialogRef });

  if (!open) return null;

  return createPortal(
    <div className="fg-dialog-backdrop" ref={backdropRef}>
      <div
        ref={dialogRef}
        className="fg-dialog mod-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        aria-busy={busy || undefined}
      >
        <div className="fg-dialog__body mod-dialog__body">
          <h2 className="fg-dialog__title" id={titleId}>
            {title}
          </h2>
          {description ? (
            <p className="fg-dialog__description" id={descriptionId}>
              {description}
            </p>
          ) : null}
          <div className="fg-dialog__content mod-dialog__content">{children}</div>
        </div>

        <div className="fg-dialog__actions mod-dialog__actions">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          {footer}
        </div>
      </div>
    </div>,
    document.body,
  );
}
