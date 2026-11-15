import { apiFetch } from "./client";
import type { Rol } from "../../core/domain/entities/user";

export interface Notificacion {
  id: number;
  usuarioId: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  enlace: string | null;
  leida: boolean;
  fechaCreacion: string;
}

export interface NotificacionPaginada {
  page: number;
  limit: number;
  total: number;
  noLeidas: number;
  items: Notificacion[];
}

export interface RespuestaNotificacionLeida {
  mensaje: string;
  notificacion: Notificacion;
}

export interface RespuestaNotificacionesLeidas {
  mensaje: string;
  actualizadas: number;
}

export interface FiltrosNotificaciones {
  page?: number;
  limit?: number;
  soloNoLeidas?: boolean;
}

/**
 * El backend expone las notificaciones en la ruta del rol autenticado.
 * Administrador y moderador comparten el panel de moderación.
 */
const RUTA_POR_ROL: Record<Rol, string> = {
  administrador: "/moderador/notificaciones",
  moderador: "/moderador/notificaciones",
  cliente: "/cliente/notificaciones",
  freelancer: "/freelancer/notificaciones",
};

function rutaNotificaciones(rol: Rol): string {
  const ruta = RUTA_POR_ROL[rol];
  if (!ruta) {
    throw new Error("El rol actual no tiene una bandeja de notificaciones disponible.");
  }
  return ruta;
}

export async function listarNotificaciones(
  token: string,
  rol: Rol,
  filtros: FiltrosNotificaciones = {},
): Promise<NotificacionPaginada> {
  const params = new URLSearchParams();
  params.set("page", String(filtros.page ?? 1));
  params.set("limit", String(filtros.limit ?? 20));
  if (filtros.soloNoLeidas) params.set("soloNoLeidas", "true");

  const { data } = await apiFetch<NotificacionPaginada>({
    method: "GET",
    path: `${rutaNotificaciones(rol)}?${params.toString()}`,
    token,
    mensajeError: "No se pudieron cargar las notificaciones",
  });
  return data;
}

export async function marcarNotificacionLeida(
  token: string,
  rol: Rol,
  notificacionId: number,
): Promise<RespuestaNotificacionLeida> {
  const { data } = await apiFetch<RespuestaNotificacionLeida>({
    method: "PATCH",
    path: `${rutaNotificaciones(rol)}/${notificacionId}/leida`,
    token,
    mensajeError: "No se pudo marcar la notificación como leída",
  });
  return data;
}

export async function marcarTodasNotificacionesLeidas(
  token: string,
  rol: Rol,
): Promise<RespuestaNotificacionesLeidas> {
  const { data } = await apiFetch<RespuestaNotificacionesLeidas>({
    method: "PATCH",
    path: `${rutaNotificaciones(rol)}/leidas`,
    token,
    mensajeError: "No se pudieron marcar las notificaciones como leídas",
  });
  return data;
}
