import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { useAuth } from "../../context/AuthContext";
import {
  listarNotificaciones,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,
} from "../../infrastructure/api/apiNotificaciones";
import type { Notificacion, NotificacionPaginada } from "../../infrastructure/api/apiNotificaciones";
import { NotificacionItem } from "./NotificacionItem";
import { useNotificaciones } from "./NotificationsContext";
import "./notifications.css";

const PAGE_SIZE = 20;

function mensajeDeError(reason: unknown, fallback: string): string {
  return reason instanceof Error ? reason.message : fallback;
}

export function NotificationsPage() {
  const { token, user } = useAuth();
  const { mensajesNoLeidos, refrescar } = useNotificaciones();
  const rol = user?.rol;

  const [filtro, setFiltro] = useState<"todas" | "sinLeer">("todas");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<NotificacionPaginada | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [marcandoTodas, setMarcandoTodas] = useState(false);
  const solicitudRef = useRef(0);

  const cargar = useCallback(async () => {
    if (!token || !rol) {
      setCargando(false);
      return;
    }

    const solicitud = ++solicitudRef.current;
    setCargando(true);
    setError("");

    try {
      const resultado = await listarNotificaciones(token, rol, {
        page,
        limit: PAGE_SIZE,
        soloNoLeidas: filtro === "sinLeer",
      });
      if (solicitud !== solicitudRef.current) return;
      setData(resultado);
    } catch (reason) {
      if (solicitud !== solicitudRef.current) return;
      setError(mensajeDeError(reason, "No se pudieron cargar las notificaciones."));
    } finally {
      if (solicitud === solicitudRef.current) setCargando(false);
    }
  }, [filtro, page, rol, token]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const abrirNotificacion = (notificacion: Notificacion) => {
    if (notificacion.leida || !token || !rol) return;

    setData((actual) => {
      if (!actual) return actual;
      const items = actual.items.map((item) =>
        item.id === notificacion.id ? { ...item, leida: true } : item,
      );
      const quitarDelFiltro = filtro === "sinLeer";
      return {
        ...actual,
        noLeidas: Math.max(0, actual.noLeidas - 1),
        total: quitarDelFiltro ? Math.max(0, actual.total - 1) : actual.total,
        items: quitarDelFiltro
          ? items.filter((item) => item.id !== notificacion.id)
          : items,
      };
    });

    void marcarNotificacionLeida(token, rol, notificacion.id)
      .then(() => refrescar())
      .catch((reason: unknown) => {
        setError(mensajeDeError(reason, "No se pudo marcar la notificación como leída."));
        void cargar();
      });
  };

  const marcarTodas = async () => {
    if (!token || !rol) return;

    setMarcandoTodas(true);
    setError("");
    try {
      await marcarTodasNotificacionesLeidas(token, rol);
      await refrescar();
      if (filtro === "todas" && page === 1) {
        await cargar();
      } else {
        setFiltro("todas");
        setPage(1);
      }
    } catch (reason) {
      setError(mensajeDeError(reason, "No se pudieron marcar las notificaciones como leídas."));
    } finally {
      setMarcandoTodas(false);
    }
  };

  const totalPaginas = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;
  const hayFiltroSinLeer = filtro === "sinLeer";

  return (
    <div className="fg-notifications-page">
      <header className="fg-notifications-page__head">
        <p className="ui-eyebrow">Centro de actividad</p>
        <h1>Notificaciones</h1>
        <p>
          Revisa los avisos de contratos, pagos, entregas y reportes. Los mensajes nuevos también
          aparecen en tu bandeja de conversaciones.
        </p>
      </header>

      {mensajesNoLeidos > 0 ? (
        <Link className="fg-notifications__messages fg-notifications-page__messages" to="/chat">
          <span className="fg-notifications__messages-icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.3 9 9 0 0 1-3.8-.8L3 21l1.8-4.1a8 8 0 0 1-1.3-4.4A8.4 8.4 0 0 1 12 4.2a8.4 8.4 0 0 1 9 7.3Z" />
            </svg>
          </span>
          <span>
            <strong>
              {mensajesNoLeidos === 1
                ? "Tienes 1 mensaje sin leer"
                : `Tienes ${mensajesNoLeidos} mensajes sin leer`}
            </strong>
            <small>Revisa tus conversaciones</small>
          </span>
          <span className="fg-notifications-page__messages-arrow" aria-hidden="true">
            →
          </span>
        </Link>
      ) : null}

      <div className="fg-notifications-page__toolbar">
        <div className="fg-notifications__tabs" role="group" aria-label="Filtrar notificaciones">
          <button
            type="button"
            className={filtro === "todas" ? "is-active" : ""}
            aria-pressed={filtro === "todas"}
            onClick={() => {
              setFiltro("todas");
              setPage(1);
            }}
          >
            Todas
          </button>
          <button
            type="button"
            className={filtro === "sinLeer" ? "is-active" : ""}
            aria-pressed={filtro === "sinLeer"}
            onClick={() => {
              setFiltro("sinLeer");
              setPage(1);
            }}
          >
            Sin leer
            {data && data.noLeidas > 0 ? <span>{data.noLeidas > 99 ? "99+" : data.noLeidas}</span> : null}
          </button>
        </div>

        <div className="fg-notifications-page__actions">
          {data && data.noLeidas > 0 ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void marcarTodas()}
              disabled={marcandoTodas}
            >
              {marcandoTodas ? "Marcando…" : "Marcar todas como leídas"}
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" onClick={() => void cargar()} disabled={cargando}>
            {cargando ? "Actualizando…" : "Actualizar"}
          </Button>
        </div>
      </div>

      {error && data ? (
        <div className="fg-notifications-page__alert" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => void cargar()}>
            Reintentar
          </button>
        </div>
      ) : null}

      {cargando && !data ? (
        <div className="fg-notifications-page__skeletons" role="status" aria-live="polite">
          <span className="fg-notifications__sr">Cargando notificaciones…</span>
          {[0, 1, 2, 3].map((item) => (
            <span className="fg-notifications-page__skeleton" key={item} aria-hidden="true" />
          ))}
        </div>
      ) : error && !data ? (
        <EmptyState
          title="No pudimos cargar tus notificaciones"
          description={error}
          actionLabel="Reintentar"
          onAction={() => void cargar()}
        />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title={hayFiltroSinLeer ? "No tienes notificaciones sin leer" : "Aún no tienes notificaciones"}
          description={
            hayFiltroSinLeer
              ? "Cuando recibas un aviso nuevo aparecerá aquí."
              : "Los avisos de contratos, pagos, entregas y reportes aparecerán aquí."
          }
          actionLabel={hayFiltroSinLeer ? "Ver todas" : page > 1 ? "Volver a la primera página" : undefined}
          onAction={
            hayFiltroSinLeer
              ? () => {
                  setFiltro("todas");
                  setPage(1);
                }
              : page > 1
                ? () => setPage(1)
                : undefined
          }
        />
      ) : (
        <>
          <div className="fg-notifications-page__list" role="list">
            {data.items.map((notificacion) => (
              <div role="listitem" key={notificacion.id}>
                <NotificacionItem
                  notificacion={notificacion}
                  rol={rol ?? "cliente"}
                  onOpen={abrirNotificacion}
                />
              </div>
            ))}
          </div>

          {totalPaginas > 1 ? (
            <nav className="fg-notifications-page__pagination" aria-label="Paginación de notificaciones">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((actual) => Math.max(1, actual - 1))}
                disabled={page <= 1 || cargando}
              >
                Anterior
              </Button>
              <span>
                Página {page} de {totalPaginas}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((actual) => Math.min(totalPaginas, actual + 1))}
                disabled={page >= totalPaginas || cargando}
              >
                Siguiente
              </Button>
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
}
