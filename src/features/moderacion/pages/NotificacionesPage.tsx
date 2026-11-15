import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { EmptyState } from "../../../components/ui/EmptyState";
import { useAuth } from "../../../context/AuthContext";
import { moderacionApi } from "../../../infrastructure/api/apiModeracion";
import type { Notificacion } from "../../../infrastructure/api/apiModeracion";
import { ListToolbar } from "../components/ListToolbar";
import { PageHeader } from "../components/PageHeader";
import { Pagination } from "../components/Pagination";
import { useToast } from "../components/Toast";
import { useTemporaryLock } from "../hooks/useTemporaryLock";
import { useModeracionPanel } from "../ModeracionContext";
import { formatearFechaHora, mensajeError } from "../utils";

const LIMITE = 20;

export function NotificacionesPage() {
  const { token } = useAuth();
  const { mostrarToast } = useToast();
  const { recargarNoLeidas, recargarContadores } = useModeracionPanel();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<Notificacion[]>([]);
  const [total, setTotal] = useState(0);
  const [noLeidas, setNoLeidas] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);
  const [marcandoId, setMarcandoId] = useState<number | null>(null);
  const [marcandoTodas, setMarcandoTodas] = useState(false);
  const { bloqueado, bloquear } = useTemporaryLock();

  const soloNoLeidas = searchParams.get("solo") === "1";
  const pageParam = Number(searchParams.get("page"));
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  useEffect(() => {
    if (!token) return;
    let activo = true;
    setCargando(true);
    setError("");
    moderacionApi
      .listarNotificaciones(token, { page, limit: LIMITE, soloNoLeidas })
      .then((resultado) => {
        if (!activo) return;
        setItems(resultado.items ?? []);
        setTotal(resultado.total ?? 0);
        setNoLeidas(resultado.noLeidas ?? 0);
      })
      .catch((reason: unknown) => {
        if (!activo) return;
        setError(mensajeError(reason));
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [token, page, soloNoLeidas, recarga]);

  const cambiarSoloNoLeidas = (activar: boolean) => {
    const params = new URLSearchParams(searchParams);
    if (activar) params.set("solo", "1");
    else params.delete("solo");
    params.delete("page");
    setSearchParams(params, { replace: true });
  };

  const cambiarPagina = (nuevaPagina: number) => {
    const params = new URLSearchParams(searchParams);
    if (nuevaPagina > 1) params.set("page", String(nuevaPagina));
    else params.delete("page");
    setSearchParams(params);
  };

  const manejarError = (reason: unknown) => {
    if (typeof reason === "object" && reason !== null && "status" in reason) {
      const status = (reason as { status?: number }).status;
      if (status === 429) {
        mostrarToast("Demasiados intentos. Espera unos segundos antes de reintentar.", "warning");
        bloquear();
        return;
      }
    }
    mostrarToast(mensajeError(reason), "error");
  };

  const marcarUna = async (notificacion: Notificacion) => {
    if (!token || notificacion.leida) return;
    setMarcandoId(notificacion.id);
    try {
      const actualizada = await moderacionApi.marcarNotificacionLeida(token, notificacion.id);
      setItems((actuales) =>
        soloNoLeidas
          ? actuales.filter((item) => item.id !== actualizada.id)
          : actuales.map((item) => (item.id === actualizada.id ? actualizada : item)),
      );
      if (soloNoLeidas) setTotal((actual) => Math.max(0, actual - 1));
      setNoLeidas((actual) => Math.max(0, actual - 1));
      void recargarNoLeidas();
      mostrarToast("Notificación marcada como leída.", "success");
    } catch (reason) {
      manejarError(reason);
    } finally {
      setMarcandoId(null);
    }
  };

  const marcarTodas = async () => {
    if (!token || noLeidas === 0) return;
    setMarcandoTodas(true);
    try {
      await moderacionApi.marcarTodasNotificacionesLeidas(token);
      if (soloNoLeidas) {
        setItems([]);
        setTotal(0);
      } else {
        setItems((actuales) => actuales.map((item) => ({ ...item, leida: true })));
      }
      setNoLeidas(0);
      void recargarNoLeidas();
      void recargarContadores();
      mostrarToast("Todas las notificaciones quedaron como leídas.", "success");
    } catch (reason) {
      manejarError(reason);
    } finally {
      setMarcandoTodas(false);
    }
  };

  return (
    <div className="mod-page">
      <PageHeader
        eyebrow="Moderación · Notificaciones"
        title="Bandeja de notificaciones"
        description="Avisos del sistema sobre reportes, disputas, retiros y estado de las cuentas."
        actions={
          <Button
            variant="secondary"
            onClick={() => void marcarTodas()}
            disabled={noLeidas === 0 || marcandoTodas || bloqueado}
          >
            {marcandoTodas ? "Marcando…" : "Marcar todas como leídas"}
          </Button>
        }
      />

      <ListToolbar
        summary={
          cargando
            ? "Cargando notificaciones…"
            : `${total} ${total === 1 ? "notificación" : "notificaciones"} · ${noLeidas} sin leer`
        }
        onRefresh={() => setRecarga((valor) => valor + 1)}
        refreshing={cargando}
      >
        <label className="mod-check">
          <input
            type="checkbox"
            checked={soloNoLeidas}
            onChange={(event) => cambiarSoloNoLeidas(event.target.checked)}
          />
          <span>Solo no leídas</span>
        </label>
      </ListToolbar>

      {error ? (
        <div className="mod-alert mod-alert--error" role="alert">
          <span>No pudimos cargar las notificaciones: {error}</span>
          <Button variant="secondary" size="sm" onClick={() => setRecarga((valor) => valor + 1)}>
            Reintentar
          </Button>
        </div>
      ) : cargando ? (
        <div className="mod-notification-list" aria-hidden="true">
          {[0, 1, 2, 3].map((item) => (
            <div className="mod-notification mod-notification--skeleton" key={item}>
              <span className="mod-skeleton mod-skeleton--line mod-skeleton--short" />
              <span className="mod-skeleton mod-skeleton--line" />
              <span className="mod-skeleton mod-skeleton--line mod-skeleton--tiny" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title={soloNoLeidas ? "No tienes notificaciones sin leer" : "No hay notificaciones"}
          description={
            soloNoLeidas
              ? "Desactiva el filtro para revisar el historial completo."
              : "Cuando ocurra un evento de moderación aparecerá aquí."
          }
          actionLabel={soloNoLeidas ? "Ver todas" : "Actualizar"}
          onAction={
            soloNoLeidas
              ? () => cambiarSoloNoLeidas(false)
              : () => setRecarga((valor) => valor + 1)
          }
        />
      ) : (
        <ul className="mod-notification-list" aria-label="Notificaciones">
          {items.map((notificacion) => {
            const enlaceSeguro =
              notificacion.enlace && /^\/(?!\/|api\/)/.test(notificacion.enlace)
                ? notificacion.enlace
                : null;
            return (
              <li
                key={notificacion.id}
                className={`mod-notification${notificacion.leida ? "" : " is-unread"}`}
              >
                <div className="mod-notification__head">
                  <div>
                    <p className="mod-notification__type">
                      {notificacion.leida ? "Leída" : "No leída"} · {notificacion.tipo.replace(/_/g, " ")}
                    </p>
                    <h2>{notificacion.titulo}</h2>
                  </div>
                  <time dateTime={notificacion.fechaCreacion}>
                    {formatearFechaHora(notificacion.fechaCreacion)}
                  </time>
                </div>

                <p className="mod-notification__message">{notificacion.mensaje}</p>

                <div className="mod-notification__actions">
                  {enlaceSeguro ? (
                    <Link className="mod-link" to={enlaceSeguro}>
                      Abrir referencia <span aria-hidden="true">→</span>
                    </Link>
                  ) : (
                    <span className="mod-muted">Sin enlace asociado</span>
                  )}
                  {!notificacion.leida ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void marcarUna(notificacion)}
                      disabled={marcandoId === notificacion.id || bloqueado}
                    >
                      {marcandoId === notificacion.id ? "Marcando…" : "Marcar como leída"}
                    </Button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Pagination page={page} total={total} limit={LIMITE} onChange={cambiarPagina} />
    </div>
  );
}
