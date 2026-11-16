import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "../../components/ui/EmptyState";
import { useAuth } from "../../context/AuthContext";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../infrastructure/api/apiNotificaciones";
import type { Notificacion } from "../../infrastructure/api/apiNotificaciones";
import { errorMessage, formatDate } from "../chat-contracts/chatContractsUtils";
import "../chat-contracts/chat-contracts.css";

export function NotificacionesPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Notificacion[]>([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [soloNoLeidas, setSoloNoLeidas] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const rol = user?.rol === "freelancer" ? "freelancer" : "cliente";
  const limit = 20;

  useEffect(() => {
    if (!token || !user) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    getNotifications(token, rol, { page, limit, soloNoLeidas })
      .then((datos) => {
        if (cancelled) return;
        setItems(datos.items);
        setNoLeidas(datos.noLeidas);
        setTotal(datos.total);
      })
      .catch((requestError: unknown) => {
        if (!cancelled) setError(errorMessage(requestError, "No se pudieron cargar las notificaciones."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [token, user, rol, page, soloNoLeidas, refreshKey]);

  const abrir = useCallback(
    async (notificacion: Notificacion) => {
      if (!token || notificacion.leida) {
        if (notificacion.enlace) navigate(notificacion.enlace);
        return;
      }
      setItems((actuales) =>
        actuales.map((item) => (item.id === notificacion.id ? { ...item, leida: true } : item)),
      );
      setNoLeidas((actual) => Math.max(0, actual - 1));
      markNotificationRead(token, rol, notificacion.id).catch(() => undefined);
      if (notificacion.enlace) navigate(notificacion.enlace);
    },
    [token, rol, navigate],
  );

  const marcarTodas = async () => {
    if (!token || busy) return;
    setBusy(true);
    try {
      await markAllNotificationsRead(token, rol);
      setItems((actuales) => actuales.map((item) => ({ ...item, leida: true })));
      setNoLeidas(0);
    } catch (requestError) {
      setError(errorMessage(requestError, "No se pudieron marcar las notificaciones."));
    } finally {
      setBusy(false);
    }
  };

  const paginas = Math.max(1, Math.ceil(total / limit));

  return (
    <main className="cc-page">
      <header className="cc-header">
        <div>
          <p className="cc-eyebrow">ACTIVIDAD</p>
          <h1>Notificaciones</h1>
          <p className="cc-subtitle">Pagos, entregas, disputas y retiros de tu cuenta.</p>
        </div>
        <div className="cc-actions">
          <button
            className="cc-secondary-button"
            type="button"
            disabled={noLeidas === 0 || busy}
            onClick={() => void marcarTodas()}
          >
            Marcar todas como leídas
          </button>
        </div>
      </header>

      <div className="cc-actions">
        <button
          className={`cc-link-button ${soloNoLeidas ? "cc-primary-button" : "cc-secondary-button"}`}
          type="button"
          onClick={() => { setPage(1); setSoloNoLeidas((valor) => !valor); }}
        >
          {soloNoLeidas ? "Mostrando no leídas" : "Solo no leídas"}
        </button>
        {noLeidas > 0 && <span className="cc-muted">{noLeidas} sin leer</span>}
      </div>

      {error && <p className="cc-alert" role="alert">{error}</p>}

      {loading ? (
        <section className="cc-panel"><p className="cc-muted">Cargando notificaciones…</p></section>
      ) : items.length === 0 ? (
        <EmptyState
          title={soloNoLeidas ? "No tienes notificaciones sin leer" : "Sin notificaciones"}
          description="Aquí aparecerán avisos sobre tus pagos, contratos, entregas y retiros."
          actionLabel="Volver al inicio"
          to={user?.rol === "freelancer" ? "/dashboard/freelancer" : "/dashboard/cliente"}
        />
      ) : (
        <section className="cc-panel">
          <ul className="cc-rating-list cc-notification-list">
            {items.map((notificacion) => (
              <li key={notificacion.id} className={notificacion.leida ? "is-read" : "is-unread"}>
                <button type="button" className="cc-notification-item" onClick={() => void abrir(notificacion)}>
                  <span className="cc-notification-dot" aria-hidden="true" />
                  <span className="cc-notification-body">
                    <strong>{notificacion.titulo}</strong>
                    <span>{notificacion.mensaje}</span>
                    <time>{formatDate(notificacion.fechaCreacion)}</time>
                  </span>
                  {notificacion.enlace && <span className="cc-muted" aria-hidden="true">→</span>}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {paginas > 1 && (
        <div className="cc-actions">
          <button className="cc-secondary-button" type="button" disabled={page <= 1} onClick={() => setPage((valor) => valor - 1)}>Anterior</button>
          <span className="cc-muted">Página {page} de {paginas}</span>
          <button className="cc-secondary-button" type="button" disabled={page >= paginas} onClick={() => setPage((valor) => valor + 1)}>Siguiente</button>
        </div>
      )}
    </main>
  );
}
