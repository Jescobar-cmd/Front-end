import { apiFetch } from "./client";
import type { Contrato } from "./apiContratos";

export interface ConversacionParticipante {
  id: number;
  nombre: string;
  fotoPerfil: string | null;
}

export interface Contraparte extends ConversacionParticipante {
  rol: number;
}

export interface ContextoConversacion {
  tipo: "proyecto" | "servicio" | "ninguno";
  id: number | null;
  titulo: string | null;
}

export interface UltimoMensaje {
  contenido: string;
  fechaEnvio: string;
  emisorId: number;
  tipo: string;
}

/**
 * Conversación tal como la ve un participante.
 * En el listado incluye `ultimoMensaje` y `noLeidos`; en el detalle incluye `participantes`.
 */
export interface Conversacion {
  id: number;
  fechaCreacion: string;
  contexto: ContextoConversacion;
  contraparte: Contraparte;
  participantes?: {
    cliente: ConversacionParticipante;
    freelancer: ConversacionParticipante;
  };
  ultimoMensaje?: UltimoMensaje | null;
  noLeidos?: number;
}

export interface OfertaChatResumen {
  id: number;
  monto: number;
  descripcion: string | null;
  estado: string;
  fechaExpiracion: string | null;
}

export interface Mensaje {
  id: number;
  emisorId: number;
  contenido: string;
  tipo: string;
  fechaEnvio: string;
  leido: boolean;
  /** Si el mensaje es de tipo 'oferta', trae la oferta asociada. */
  oferta: OfertaChatResumen | null;
}

export interface RespuestaAccionChat {
  mensaje: string;
  contrato?: Contrato;
}

export interface DatosConversacion {
  servicioId?: number;
  proyectoId?: number;
  freelancerId?: number;
}

export interface DatosMensaje {
  contenido: string;
}

export interface DatosOfertaChat {
  monto: number;
  descripcion?: string;
  fechaExpiracion?: string;
}

/**
 * Módulo de API — Chat (polling, sin WebSockets).
 * Backend: /api/conversaciones, /api/conversaciones/:id, /api/conversaciones/:id/mensajes,
 *         /api/conversaciones/:id/leido, /api/conversaciones/:id/ofertas,
 *         /api/ofertas-chat/:id/aceptar, /api/ofertas-chat/:id/rechazar,
 *         /api/ofertas-chat/:id/contraoferta
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

export async function sendMessage(token: string, conversacionId: number, datos: DatosMensaje): Promise<Mensaje> {
  const { data } = await apiFetch<Mensaje>({
    method: "POST",
    path: `/conversaciones/${conversacionId}/mensajes`,
    token,
    body: datos,
    mensajeError: "No se pudo enviar el mensaje",
  });
  return data;
}

export async function markRead(token: string, conversacionId: number): Promise<{ mensaje: string; actualizados: number }> {
  const { data } = await apiFetch<{ mensaje: string; actualizados: number }>({
    method: "PATCH",
    path: `/conversaciones/${conversacionId}/leido`,
    token,
    mensajeError: "No se pudo marcar como leído",
  });
  return data;
}

export async function sendChatOffer(
  token: string,
  conversacionId: number,
  datos: DatosOfertaChat,
): Promise<Mensaje> {
  const { data } = await apiFetch<Mensaje>({
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
): Promise<Mensaje> {
  const { data } = await apiFetch<Mensaje>({
    method: "POST",
    path: `/ofertas-chat/${id}/contraoferta`,
    token,
    body: datos,
    mensajeError: "No se pudo crear la contraoferta",
  });
  return data;
}
