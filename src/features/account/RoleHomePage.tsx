import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { rolLabel } from "../../core/domain/entities/user";
import { moderacionApi } from "../../infrastructure/api/apiModeracion";
import type { ModeradorDashboard } from "../../infrastructure/api/apiModeracion";
import { dashboardPorRol } from "../../routes/rutasPorRol";
import "./account.css";

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

export function RoleHomePage() {
  const { token, user } = useAuth();
  const [data, setData] = useState<ModeradorDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      setData(await moderacionApi.obtenerDashboard(token));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo cargar el panel.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const rol = user?.rol ?? "moderador";
  const etiqueta = rolLabel(rol);
  const inicio = dashboardPorRol(rol);

  return (
    <div className="account-page role-home">
      <header className="account-page__head">
        <p className="ui-eyebrow">Panel de {etiqueta.toLowerCase()}</p>
        <h1>Resumen operativo</h1>
        <p>Estado actual de los reportes, disputas y retiros que requieren revisión.</p>
      </header>

      {loading ? (
        <div className="role-home__stats" role="status" aria-live="polite" aria-label="Cargando resumen">
          {[0, 1, 2].map((item) => (
            <div className="role-home__stat role-home__stat--skeleton" key={item} aria-hidden="true" />
          ))}
        </div>
      ) : error || !data ? (
        <EmptyState
          title="No pudimos cargar el panel"
          description={error || "El resumen no está disponible en este momento."}
          actionLabel="Reintentar"
          onAction={() => void cargar()}
          secondary={<Link to={inicio}>Volver a mi panel</Link>}
        />
      ) : (
        <>
          <div className="role-home__stats">
            <article className="role-home__stat">
              <span className="role-home__stat-icon" aria-hidden="true">
                <StatIcon kind="reportes" />
              </span>
              <span className="role-home__stat-label">Reportes pendientes</span>
              <strong>{data.reportesPendientes}</strong>
            </article>
            <article className="role-home__stat">
              <span className="role-home__stat-icon" aria-hidden="true">
                <StatIcon kind="disputas" />
              </span>
              <span className="role-home__stat-label">Disputas abiertas</span>
              <strong>{data.disputasAbiertas}</strong>
            </article>
            <article className="role-home__stat">
              <span className="role-home__stat-icon" aria-hidden="true">
                <StatIcon kind="retiros" />
              </span>
              <span className="role-home__stat-label">Retiros pendientes</span>
              <strong>{data.retirosPendientes}</strong>
            </article>
          </div>

          <div className="role-home__actions">
            <Button variant="secondary" onClick={() => void cargar()}>
              Actualizar resumen
            </Button>
            <Link className="ui-button ui-button--secondary" to={inicio}>
              Ir a mi panel
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
