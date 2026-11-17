import { useId, useRef } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";
import { useBackdropDismiss } from "../../hooks/useBackdropDismiss";
import { useDialogBehavior } from "../../hooks/useDialogBehavior";
import "./ConfirmDialog.css";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "primary" | "danger";
  loading?: boolean;
  children?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

function DialogIcon({ tone }: { tone: "primary" | "danger" }) {
  if (tone === "danger") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3.5 2.8 19.5h18.4L12 3.5Z" />
        <path d="M12 9v4.5" />
        <circle cx="12" cy="16.6" r="0.7" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10.5v6" />
      <circle cx="12" cy="7.4" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "primary",
  loading = false,
  children,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useBackdropDismiss(backdropRef, open, loading, onCancel);
  useDialogBehavior({
    open,
    busy: loading,
    onClose: onCancel,
    containerRef: dialogRef,
    initialFocusRef: cancelRef,
  });

  if (!open) return null;

  return createPortal(
    <div className="fg-dialog-backdrop" ref={backdropRef}>
      <div
        className={`fg-dialog fg-dialog--${tone}`}
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        aria-busy={loading || undefined}
      >
        <div className="fg-dialog__icon" aria-hidden="true">
          <DialogIcon tone={tone} />
        </div>

        <div className="fg-dialog__body">
          <h2 className="fg-dialog__title" id={titleId}>
            {title}
          </h2>
          <p className="fg-dialog__description" id={descriptionId}>
            {description}
          </p>
          {children ? <div className="fg-dialog__content">{children}</div> : null}
        </div>

        <div className="fg-dialog__actions">
          <Button ref={cancelRef} variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Procesando…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
