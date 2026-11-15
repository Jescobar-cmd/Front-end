import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  backTo?: string;
  backLabel?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  backTo,
  backLabel = "Volver",
}: PageHeaderProps) {
  return (
    <header className="mod-page-head">
      {backTo ? (
        <Link className="mod-back" to={backTo}>
          <span aria-hidden="true">←</span> {backLabel}
        </Link>
      ) : null}
      <p className="mod-eyebrow">{eyebrow}</p>
      <div className="mod-page-head__row">
        <div className="mod-page-head__text">
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
        </div>
        {actions ? <div className="mod-page-head__actions">{actions}</div> : null}
      </div>
    </header>
  );
}
