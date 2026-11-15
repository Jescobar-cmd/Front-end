import { useEffect, useId, useRef } from "react";
import type { MouseEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";
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

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
  const cancelRef = useRef<HTMLButtonElement>(null);
  const onCancelRef = useRef(onCancel);
  const loadingRef = useRef(loading);

  onCancelRef.current = onCancel;
  loadingRef.current = loading;

  useEffect(() => {
    if (!open) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      cancelRef.current?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (!loadingRef.current) {
          event.preventDefault();
          onCancelRef.current();
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

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !loading) onCancel();
  };

  return createPortal(
    <div className="fg-dialog-backdrop" onMouseDown={handleBackdropClick}>
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
