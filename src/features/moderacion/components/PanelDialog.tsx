import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "../../../components/ui/Button";
import { useBackdropDismiss } from "../../../hooks/useBackdropDismiss";

interface PanelDialogProps {
  open: boolean;
  title: string;
  description?: string;
  busy?: boolean;
  children: ReactNode;
  footer: ReactNode;
  onClose: () => void;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
  const onCloseRef = useRef(onClose);
  const busyRef = useRef(busy);

  onCloseRef.current = onClose;
  busyRef.current = busy;

  useBackdropDismiss(backdropRef, open, busy, onClose);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      const first = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      first?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (!busyRef.current) {
          event.preventDefault();
          onCloseRef.current();
        }
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
      ).filter((element) => element.offsetParent !== null);

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [open]);

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
