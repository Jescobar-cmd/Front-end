import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button, buttonClassName } from "./Button";

function EmptyMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
      <path d="M8 11h6" />
    </svg>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  to?: string;
  onAction?: () => void;
  secondary?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, description, actionLabel, to, onAction, secondary, icon }: EmptyStateProps) {
  return (
    <section className="ui-empty" role="status" aria-live="polite">
      <span className="ui-empty__icon" aria-hidden="true">
        {icon ?? <EmptyMark />}
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {(actionLabel || secondary) && (
        <div className="ui-empty__actions">
          {actionLabel && to ? (
            <Link className={buttonClassName({ variant: "action", size: "sm" })} to={to}>
              {actionLabel}
            </Link>
          ) : null}
          {actionLabel && onAction ? (
            <Button variant="action" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          ) : null}
          {secondary}
        </div>
      )}
    </section>
  );
}
