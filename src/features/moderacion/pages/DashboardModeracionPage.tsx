import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { useModeracionPanel } from "../ModeracionContext";
import { PageHeader } from "../components/PageHeader";
import { formatearNumero } from "../utils";

function StatIcon({ kind }: { kind: "reportes" | "disputas" | "retiros" }) {
  if (kind === "disputas") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3.5 3 8l9 4.5L21 8l-9-4.5Z" />
        <path d="M3 8v8l9 4.5V12.5L3 8Z" />
        <path d="M21 8v8l-9 4.5V12.5L21 8Z" />
      </svg>
    );
  }

  if (kind === "retiros") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="6" width="18" height="12" rx="2.5" />
        <path d="M3 10h18" />
        <path d="M16 14h2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3.5 4.5 6v6c0 4.2 3.1 7.5 7.5 8.5 4.4-1 7.5-4.3 7.5-8.5V6L12 3.5Z" />
      <path d="M12 8v4.5" />
      <circle cx="12" cy="15.5" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function DashboardModeracionPage() {
  const {
    dashboard,
    cargandoContadores,
    errorContadores,
    noLeidas,
    recargarContadores,
  } = useModeracionPanel();

  const mostrarEsqueleto = cargandoContadores && !dashboard;

  // Al volver al dashboard desde un listado se refrescan los contadores.
  useEffect(() => {
    void recargarContadores();
  }, [recargarContadores]);

  return (
    <div className="mod-page">
      <PageHeader
        eyebrow="Moderación"
        title="Resumen operativo"
        description="Revisa la cola de trabajo y entra directo a los casos que requieren una decisión."
        actions={
          <Button
            variant="secondary"
            onClick={() => void recargarContadores()}
            disabled={cargandoContadores}
          >
            {cargandoContadores ? "Actualizando…" : "Actualizar resumen"}
          </Button>
        }
      />

      {errorContadores && !dashboard ? (
        <div className="mod-alert mod-alert--error" role="alert">
          <span>No pudimos cargar el resumen: {errorContadores}</span>
          <Button variant="secondary" size="sm" onClick={() => void recargarContadores()}>
            Reintentar
          </Button>
        </div>
      ) : null}

      <section className="mod-stats" aria-label="Cola de trabajo">
        {mostrarEsqueleto
          ? [0, 1, 2].map((item) => (
              <div className="mod-stat-card mod-stat-card--skeleton" key={item} aria-hidden="true" />
            ))
          : null}

        {!mostrarEsqueleto && dashboard ? (
          <>
            <Link className="mod-stat-card" to="/moderacion/reportes?estado=pendiente">
              <span className="mod-stat-card__icon mod-stat-card__icon--warning">
                <StatIcon kind="reportes" />
              </span>
              <span className="mod-stat-card__label">Reportes pendientes</span>
              <strong className="mod-stat-card__value">
                {formatearNumero(dashboard.reportesPendientes)}
              </strong>
              <span className="mod-stat-card__hint">Casos por revisar y resolver</span>
              <span className="mod-stat-card__cta">
                Ver reportes <span aria-hidden="true">→</span>
              </span>
            </Link>

            <Link className="mod-stat-card" to="/moderacion/disputas?estado=abierta">
              <span className="mod-stat-card__icon mod-stat-card__icon--blue">
                <StatIcon kind="disputas" />
              </span>
              <span className="mod-stat-card__label">Disputas abiertas</span>
              <strong className="mod-stat-card__value">
                {formatearNumero(dashboard.disputasAbiertas)}
              </strong>
              <span className="mod-stat-card__hint">Contratos con conflicto activo</span>
              <span className="mod-stat-card__cta">
                Ver disputas <span aria-hidden="true">→</span>
              </span>
            </Link>

            <Link className="mod-stat-card" to="/moderacion/liquidaciones?estado=solicitada">
              <span className="mod-stat-card__icon mod-stat-card__icon--green">
                <StatIcon kind="retiros" />
              </span>
              <span className="mod-stat-card__label">Retiros solicitados</span>
              <strong className="mod-stat-card__value">
                {formatearNumero(dashboard.retirosPendientes)}
              </strong>
              <span className="mod-stat-card__hint">Solicitudes de retiro por aprobar</span>
              <span className="mod-stat-card__cta">
                Ver liquidaciones <span aria-hidden="true">→</span>
              </span>
            </Link>
          </>
        ) : null}

        {!mostrarEsqueleto && !dashboard && !errorContadores ? (
          <div className="mod-alert mod-alert--error" role="alert">
            <span>El resumen no está disponible en este momento.</span>
            <Button variant="secondary" size="sm" onClick={() => void recargarContadores()}>
              Reintentar
            </Button>
          </div>
        ) : null}
      </section>

      <div className="mod-dashboard-grid">
        <section className="mod-panel" aria-labelledby="flujo-moderacion">
          <div className="mod-panel__head">
            <div>
              <h2 id="flujo-moderacion">Flujo recomendado</h2>
              <p>Un orden simple para mantener la cola bajo control.</p>
            </div>
          </div>
          <ol className="mod-steps">
            <li>
              <span className="mod-steps__number" aria-hidden="true">1</span>
              <div>
                <strong>Resuelve reportes</strong>
                <p>Revisa el contexto de las partes y deja una resolución escrita.</p>
              </div>
            </li>
            <li>
              <span className="mod-steps__number" aria-hidden="true">2</span>
              <div>
                <strong>Atiende disputas</strong>
                <p>Define el resultado económico y documenta la decisión antes de confirmar.</p>
              </div>
            </li>
            <li>
              <span className="mod-steps__number" aria-hidden="true">3</span>
              <div>
                <strong>Procesa retiros</strong>
                <p>Marca pagos con referencia o rechaza con motivo para devolver el saldo.</p>
              </div>
            </li>
          </ol>
        </section>

        <section className="mod-panel" aria-labelledby="atajos-moderacion">
          <div className="mod-panel__head">
            <div>
              <h2 id="atajos-moderacion">Accesos rápidos</h2>
              <p>Atajos a los listados con sus filtros por defecto.</p>
            </div>
          </div>
          <div className="mod-quick-links">
            <Link className="mod-quick-link" to="/moderacion/reportes">
              <span>Reportes</span>
              <small>Todos los estados</small>
              <span aria-hidden="true">→</span>
            </Link>
            <Link className="mod-quick-link" to="/moderacion/disputas?estado=en_revision">
              <span>Disputas en revisión</span>
              <small>Seguimiento de casos</small>
              <span aria-hidden="true">→</span>
            </Link>
            <Link className="mod-quick-link" to="/moderacion/liquidaciones">
              <span>Liquidaciones</span>
              <small>Todos los estados</small>
              <span aria-hidden="true">→</span>
            </Link>
            <Link className="mod-quick-link" to="/moderacion/notificaciones">
              <span>Notificaciones</span>
              <small>{noLeidas > 0 ? `${noLeidas} sin leer` : "Al día"}</small>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
