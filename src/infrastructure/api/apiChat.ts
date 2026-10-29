import { apiFetch } from "./client";

export interface UltimoMensaje {
  id: number;
  contenido: string;
  fecha: string;
}

export interface Contraparte {
  id: number;
  nombre: string;
  fotoPerfil: string | null;
  rol: string;
}

export interface ContextoConversacion {
  tipo: string;
  proyectoId?: number;
  servicioId?: number;
}

export interface Conversacion {
  id: number;
  contexto?: ContextoConversacion;
  cliente?: {
    id: number;
    nombre: string;
    fotoPerfil: string | null;
  };
  freelancer?: {
    id: number;
    nombre: string;
    fotoPerfil: string | null;
  };
  contraparte: Contraparte;
  ultimoMensaje?: UltimoMensaje;
  noLeidos?: number;
}

export interface Mensaje {
  id: number;
  conversacionId?: number;
  contenido: string;
  fecha: string;
  oferta?: {
    id: number;
    monto: number;
    descripcion?: string;
    fechaExpiracion?: string;
    estado: string;
    padreId?: number;
  };
}

export interface RespuestaAccionChat {
  mensaje: string;
  contrato?: unknown;
}

export interface DatosConversacion {
  servicioId?: number;
  proyectoId?: number;
  freelancerId?: number;
}

export interface DatosMensaje {
  contenido: string;
}

export interface DatosMarcarLeido {
  mensaje: number;
  actualizados: number;
}

export interface DatosOfertaChat {
  monto: number;
  descripcion?: string;
  fechaExpiracion?: string;
}

/**
 * Módulo de API — Chat (polling, sin WebSockets).
 * Backend: /api/conversaciones, /api/conversaciones/:id, /api/conversaciones/:id/mensajes,
 *         /api/conversaciones/:id/mensajes, /api/conversaciones/:id/leido,
 *         /api/conversaciones/:id/ofertas, /api/ofertas-chat/:id/aceptar,
 *         /api/ofertas-chat/:id/rechazar, /api/ofertas-chat/:id/contraoferta
 */

export async function createConversation(token: string, datos: DatosConversacion): Promise<{ mensaje: string; conversacion: Conversacion }> {
  const { data } = await apiFetch<{ mensaje: string; conversacion: Conversacion }>({
    method: "POST",
    path: "/conversaciones",
    token,
    body: datos,
    mensajeError: "No se pudo crear la conversación",
  });
  return data;
}

export async function getConversations(token: string): Promise<{ total: number; conversaciones: Conversacion[] }> {
  const { data } = await apiFetch<{ total: number; conversaciones: Conversacion[] }>({
    method: "GET",
    path: "/conversaciones",
    token,
    mensajeError: "No se pudieron cargar las conversaciones",
  });
  return data;
}

export async function getConversation(token: string, id: number): Promise<Conversacion> {
  const { data } = await apiFetch<Conversacion>({
    method: "GET",
    path: `/conversaciones/${id}`,
    token,
    mensajeError: "No se pudo cargar la conversación",
  });
  return data;
}

export async function getMessages(
  token: string,
  conversacionId: number,
  afterId?: number,
  limit = 50,
): Promise<{ mensajes: Mensaje[]; ultimoId: number | null }> {
  const params = new URLSearchParams();
  if (afterId !== undefined) params.set("afterId", String(afterId));
  params.set("limit", String(limit));

  const { data } = await apiFetch<{ mensajes: Mensaje[]; ultimoId: number | null }>({
    method: "GET",
    path: `/conversaciones/${conversacionId}/mensajes?${params.toString()}`,
    token,
    mensajeError: "No se pudieron cargar los mensajes",
  });
  return data;
}

export async function sendMessage(token: string, conversacionId: number, datos: DatosMensaje): Promise<{ mensaje: string }> {
  const { data } = await apiFetch<{ mensaje: string }>({
    method: "POST",
    path: `/conversaciones/${conversacionId}/mensajes`,
    token,
    body: datos,
    mensajeError: "No se pudo enviar el mensaje",
  });
  return data;
}

export async function markRead(token: string, conversacionId: number, datos: DatosMarcarLeido): Promise<{ mensaje: string; actualizados: number }> {
  const { data } = await apiFetch<{ mensaje: string; actualizados: number }>({
    method: "PATCH",
    path: `/conversaciones/${conversacionId}/leido`,
    token,
    body: datos,
    mensajeError: "No se pudo marcar como leído",
  });
  return data;
}

export async function sendChatOffer(
  token: string,
  conversacionId: number,
  datos: DatosOfertaChat,
): Promise<{ mensaje: string; oferta?: Mensaje["oferta"] }> {
  const { data } = await apiFetch<{ mensaje: string; oferta?: Mensaje["oferta"] }>({
    method: "POST",
    path: `/conversaciones/${conversacionId}/ofertas`,
    token,
    body: datos,
    mensajeError: "No se pudo enviar la oferta",
  });
  return data;
}

export async function acceptChatOffer(token: string, id: number): Promise<RespuestaAccionChat> {
  const { data } = await apiFetch<RespuestaAccionChat>({
    method: "POST",
    path: `/ofertas-chat/${id}/aceptar`,
    token,
    mensajeError: "No se pudo aceptar la oferta",
  });
  return data;
}

export async function rejectChatOffer(token: string, id: number): Promise<{ mensaje: string }> {
  const { data } = await apiFetch<{ mensaje: string }>({
    method: "POST",
    path: `/ofertas-chat/${id}/rechazar`,
    token,
    mensajeError: "No se pudo rechazar la oferta",
  });
  return data;
}

export async function counterChatOffer(
  token: string,
  id: number,
  datos: DatosOfertaChat,
): Promise<{ mensaje: string; oferta?: Mensaje["oferta"] }> {
  const { data } = await apiFetch<{ mensaje: string; oferta?: Mensaje["oferta"] }>({
    method: "POST",
    path: `/ofertas-chat/${id}/contraoferta`,
    token,
    body: datos,
    mensajeError: "No se pudo crear la contraoferta",
  });
  return data;
}
