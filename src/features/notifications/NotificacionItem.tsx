import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import type { Rol } from "../../core/domain/entities/user";
import type { Notificacion } from "../../infrastructure/api/apiNotificaciones";
import {
  fechaCompletaNotificacion,
  formatearFechaNotificacion,
  resolverEnlaceNotificacion,
} from "./notificationUtils";
import "./notifications.css";

type TipoVisual = "mensaje" | "contrato" | "pago" | "disputa" | "reporte" | "cuenta" | "otro";

function tipoVisual(tipo: string): TipoVisual {
  const valor = tipo.toLocaleLowerCase();
  if (valor.includes("mensaje") || valor.includes("message")) return "mensaje";
  if (valor.includes("disputa")) return "disputa";
  if (valor.includes("reporte")) return "reporte";
  if (valor.includes("cuenta") || valor.includes("usuario")) return "cuenta";
  if (valor.includes("pago") || valor.includes("retiro") || valor.includes("liquidacion")) return "pago";
  if (valor.includes("contrato") || valor.includes("entrega")) return "contrato";
  return "otro";
}

const ICONOS: Record<TipoVisual, ReactNode> = {
  mensaje: (
    <>
      <path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.3 9 9 0 0 1-3.8-.8L3 21l1.8-4.1a8 8 0 0 1-1.3-4.4A8.4 8.4 0 0 1 12 4.2a8.4 8.4 0 0 1 9 7.3Z" />
      <path d="M8.5 12h.01M12 12h.01M15.5 12h.01" />
    </>
  ),
  contrato: (
    <>
      <path d="M7 3.5h7l4 4v13H7z" />
      <path d="M14 3.5v4h4" />
      <path d="M10 12h5M10 15.5h5" />
    </>
  ),
  pago: (
    <>
      <rect x="3.5" y="6" width="17" height="12" rx="2" />
      <path d="M3.5 10h17" />
      <path d="M7 15h3" />
    </>
  ),
  disputa: (
    <>
      <path d="M12 3.5 5 6.2v5.4c0 4 2.9 7.2 7 8.4 4.1-1.2 7-4.4 7-8.4V6.2L12 3.5Z" />
      <path d="M12 8v4.5M12 15.5h.01" />
    </>
  ),
  reporte: (
    <>
      <path d="M5 21V4" />
      <path d="M5 4h10l-1.5 3L15 10H5" />
    </>
  ),
  cuenta: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
  otro: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </>
  ),
};

function NotificacionIcono({ tipo }: { tipo: string }) {
  return (
    <span
      className={`fg-notification__icon fg-notification__icon--${tipoVisual(tipo)}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {ICONOS[tipoVisual(tipo)]}
      </svg>
    </span>
  );
}

export function NotificacionItem({
  notificacion,
  rol,
  onOpen,
}: {
  notificacion: Notificacion;
  rol: Rol;
  onOpen: (notificacion: Notificacion) => void;
}) {
  const enlace = resolverEnlaceNotificacion(notificacion.enlace, rol);
  const fecha = formatearFechaNotificacion(notificacion.fechaCreacion);

  return (
    <Link
      className={`fg-notification${notificacion.leida ? "" : " is-unread"}`}
      to={enlace}
      data-notification-item
      onClick={() => onOpen(notificacion)}
    >
      <NotificacionIcono tipo={notificacion.tipo} />
      <span className="fg-notification__body">
        <span className="fg-notification__title-row">
          <strong className="fg-notification__title">{notificacion.titulo}</strong>
          {!notificacion.leida ? (
            <span className="fg-notification__unread" aria-label="Sin leer" />
          ) : null}
        </span>
        <span className="fg-notification__message">{notificacion.mensaje}</span>
        <time
          className="fg-notification__time"
          dateTime={notificacion.fechaCreacion}
          title={fechaCompletaNotificacion(notificacion.fechaCreacion)}
        >
          {fecha}
        </time>
      </span>
    </Link>
  );
}
