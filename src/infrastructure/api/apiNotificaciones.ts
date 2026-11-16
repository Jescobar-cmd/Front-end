import { apiFetch } from "./client";

export type RolNotificaciones = "cliente" | "freelancer";

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

export interface NotificacionesPaginadas {
  page: number;
  limit: number;
  total: number;
  noLeidas: number;
  items: Notificacion[];
}

function rutaNotificaciones(rol: RolNotificaciones): string {
  return rol === "freelancer" ? "/freelancer/notificaciones" : "/cliente/notificaciones";
}

/**
 * Módulo de API — Notificaciones del usuario autenticado.
 * Backend: GET /api/{cliente|freelancer}/notificaciones,
 *          PATCH .../notificaciones/leidas,
 *          PATCH .../notificaciones/:id/leida
 */

export async function getNotifications(
  token: string,
  rol: RolNotificaciones,
  filtros: { page?: number; limit?: number; soloNoLeidas?: boolean } = {},
): Promise<NotificacionesPaginadas> {
  const params = new URLSearchParams();
  if (filtros.page) params.set("page", String(filtros.page));
  if (filtros.limit) params.set("limit", String(filtros.limit));
  if (filtros.soloNoLeidas) params.set("soloNoLeidas", "true");
  const query = params.toString();
  const { data } = await apiFetch<NotificacionesPaginadas>({
    method: "GET",
    path: `${rutaNotificaciones(rol)}${query ? `?${query}` : ""}`,
    token,
    mensajeError: "No se pudieron cargar las notificaciones",
  });
  return data;
}

export async function markAllNotificationsRead(token: string, rol: RolNotificaciones): Promise<void> {
  await apiFetch({
    method: "PATCH",
    path: `${rutaNotificaciones(rol)}/leidas`,
    token,
    mensajeError: "No se pudieron marcar las notificaciones",
  });
}

export async function markNotificationRead(token: string, rol: RolNotificaciones, id: number): Promise<void> {
  await apiFetch({
    method: "PATCH",
    path: `${rutaNotificaciones(rol)}/${id}/leida`,
    token,
    mensajeError: "No se pudo marcar la notificación",
  });
}
