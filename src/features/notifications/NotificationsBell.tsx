import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { Notificacion } from "../../infrastructure/api/apiNotificaciones";
import { NotificacionItem } from "./NotificacionItem";
import { useNotificaciones } from "./NotificationsContext";
import "./notifications.css";

function BellIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.3 9 9 0 0 1-3.8-.8L3 21l1.8-4.1a8 8 0 0 1-1.3-4.4A8.4 8.4 0 0 1 12 4.2a8.4 8.4 0 0 1 9 7.3Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function textoContador(valor: number): string {
  return valor > 99 ? "99+" : String(valor);
}

export function NotificationsBell() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const {
    notificaciones,
    noLeidas,
    mensajesNoLeidos,
    cargando,
    refrescando,
    error,
    refrescar,
    marcarLeida,
    marcarTodasLeidas,
  } = useNotificaciones();
  const [abierto, setAbierto] = useState(false);
  const [filtro, setFiltro] = useState<"todas" | "sinLeer">("todas");
  const contenedorRef = useRef<HTMLDivElement>(null);
  const disparadorRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const rutaAnteriorRef = useRef(pathname);

  const visibles = useMemo(
    () => (filtro === "sinLeer" ? notificaciones.filter((item) => !item.leida) : notificaciones),
    [filtro, notificaciones],
  );

  useEffect(() => {
    if (rutaAnteriorRef.current === pathname) return;
    rutaAnteriorRef.current = pathname;
    setAbierto(false);
    void refrescar();
  }, [pathname, refrescar]);

  useEffect(() => {
    if (!abierto) return;

    const manejarPointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !contenedorRef.current?.contains(event.target)) {
        setAbierto(false);
      }
    };

    const manejarTecla = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAbierto(false);
        disparadorRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", manejarPointer);
    document.addEventListener("keydown", manejarTecla);
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("pointerdown", manejarPointer);
      document.removeEventListener("keydown", manejarTecla);
    };
  }, [abierto]);

  if (!user) return null;

  const alternar = () => {
    if (!abierto) void refrescar();
    setAbierto((actual) => !actual);
  };

  const abrirNotificacion = (notificacion: Notificacion) => {
    setAbierto(false);
    if (!notificacion.leida) void marcarLeida(notificacion.id);
  };

  const marcarTodas = async () => {
    await marcarTodasLeidas();
    setFiltro("todas");
  };

  return (
    <div className="fg-notifications" ref={contenedorRef}>
      <button
        ref={disparadorRef}
        type="button"
        className="app-header__icon-link fg-notifications__trigger"
        onClick={alternar}
        aria-label={
          noLeidas > 0 ? `Notificaciones, ${noLeidas} sin leer` : "Notificaciones"
        }
        aria-haspopup="dialog"
        aria-expanded={abierto}
        aria-controls="fg-notifications-panel"
      >
        <BellIcon />
        {noLeidas > 0 ? (
          <span className="app-header__badge" aria-hidden="true">
            {textoContador(noLeidas)}
          </span>
        ) : null}
      </button>

      {abierto ? (
        <div
          className="fg-notifications__panel"
          id="fg-notifications-panel"
          role="dialog"
          aria-label="Notificaciones"
          ref={panelRef}
          tabIndex={-1}
        >
          <div className="fg-notifications__head">
            <div>
              <strong>Notificaciones</strong>
              <small>{noLeidas > 0 ? `${noLeidas} sin leer` : "Estás al día"}</small>
            </div>
            <div className="fg-notifications__head-actions">
              {noLeidas > 0 ? (
                <button
                  className="fg-notifications__mark-all"
                  type="button"
                  onClick={() => void marcarTodas()}
                >
                  Marcar todas
                </button>
              ) : null}
              <button
                className="fg-notifications__close"
                type="button"
                onClick={() => {
                  setAbierto(false);
                  disparadorRef.current?.focus();
                }}
                aria-label="Cerrar notificaciones"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          <div className="fg-notifications__tabs" role="group" aria-label="Filtrar notificaciones">
            <button
              type="button"
              className={filtro === "todas" ? "is-active" : ""}
              aria-pressed={filtro === "todas"}
              onClick={() => setFiltro("todas")}
            >
              Todas
            </button>
            <button
              type="button"
              className={filtro === "sinLeer" ? "is-active" : ""}
              aria-pressed={filtro === "sinLeer"}
              onClick={() => setFiltro("sinLeer")}
            >
              Sin leer
              {noLeidas > 0 ? <span>{textoContador(noLeidas)}</span> : null}
            </button>
          </div>

          {mensajesNoLeidos > 0 ? (
            <Link className="fg-notifications__messages" to="/chat" onClick={() => setAbierto(false)}>
              <span className="fg-notifications__messages-icon" aria-hidden="true">
                <MessageIcon />
              </span>
              <span>
                <strong>
                  {mensajesNoLeidos === 1
                    ? "Tienes 1 mensaje sin leer"
                    : `Tienes ${mensajesNoLeidos} mensajes sin leer`}
                </strong>
                <small>Revisa tus conversaciones</small>
              </span>
            </Link>
          ) : null}

          <div className="fg-notifications__scroll" aria-busy={refrescando}>
            {error ? (
              <div className="fg-notifications__error" role="alert">
                <span>{error}</span>
                <button type="button" onClick={() => void refrescar()}>
                  Reintentar
                </button>
              </div>
            ) : null}

            {cargando && notificaciones.length === 0 ? (
              <div className="fg-notifications__skeletons" role="status" aria-live="polite">
                <span className="fg-notifications__sr">Cargando notificaciones…</span>
                {[0, 1, 2].map((item) => (
                  <span className="fg-notifications__skeleton" key={item} aria-hidden="true" />
                ))}
              </div>
            ) : !error && visibles.length === 0 ? (
              <div className="fg-notifications__empty" role="status">
                <span className="fg-notifications__empty-icon" aria-hidden="true">
                  <BellIcon />
                </span>
                <strong>
                  {filtro === "sinLeer" ? "No tienes notificaciones sin leer" : "Aún no tienes notificaciones"}
                </strong>
                <p>
                  {filtro === "sinLeer"
                    ? "Cuando recibas un aviso nuevo aparecerá aquí."
                    : "Los avisos de contratos, pagos y entregas aparecerán aquí."}
                </p>
              </div>
            ) : (
              <div className="fg-notifications__list">
                {visibles.map((notificacion) => (
                  <NotificacionItem
                    key={notificacion.id}
                    notificacion={notificacion}
                    rol={user.rol}
                    onOpen={abrirNotificacion}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="fg-notifications__footer">
            <Link to="/notificaciones" onClick={() => setAbierto(false)}>
              Ver todas las notificaciones
            </Link>
            <button type="button" onClick={() => void refrescar()} disabled={refrescando}>
              {refrescando ? "Actualizando…" : "Actualizar"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
