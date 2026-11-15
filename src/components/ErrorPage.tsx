import { Link } from "react-router-dom";
import { Button } from "./ui/Button";

interface ErrorPageProps {
  title?: string;
  description?: string;
  onRetry: () => void;
}

function ErrorMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5" />
      <circle cx="12" cy="16.2" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ErrorPage({
  title = "Algo salió mal",
  description = "No pudimos mostrar esta pantalla. Vuelve a intentarlo; si el problema continúa, recarga la página.",
  onRetry,
}: ErrorPageProps) {
  return (
    <main className="fg-error-page" aria-labelledby="fg-error-title">
      <section className="fg-error-card" role="alert">
        <span className="fg-error-card__icon" aria-hidden="true">
          <ErrorMark />
        </span>
        <p className="ui-eyebrow">First Gig</p>
        <h1 id="fg-error-title">{title}</h1>
        <p>{description}</p>
        <div className="fg-error-card__actions">
          <Button variant="action" onClick={onRetry}>
            Reintentar
          </Button>
          <Link className="ui-button ui-button--secondary" to="/">
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
