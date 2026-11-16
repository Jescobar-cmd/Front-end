import { apiFetch } from "./client";

export interface ContextoContrato {
  tipo: "proyecto" | "servicio" | "ninguno";
  id: number | null;
  titulo: string | null;
}

export interface ParticipanteContrato {
  id: number;
  nombre: string;
  fotoPerfil: string | null;
}

export interface Contrato {
  id: number;
  propuestaId: number | null;
  proyectoId: number | null;
  servicioId: number | null;
  ofertaChatId: number | null;
  montoAcordado: number;
  fechaInicio: string | null;
  fechaFin: string | null;
  estado: string;
  contexto: ContextoContrato;
  cliente: ParticipanteContrato;
  freelancer: ParticipanteContrato;
  contraparte: ParticipanteContrato & { rol: number };
}

export interface Calificacion {
  id: number;
  contratoId: number;
  puntuacion: number;
  comentario: string | null;
  fecha: string;
  calificador: ParticipanteContrato;
  calificado: ParticipanteContrato;
}

export interface RespuestaContrato {
  mensaje: string;
  contrato: Contrato;
}

export interface RespuestaCalificacion {
  mensaje: string;
  calificacion: Calificacion;
}

export interface RespuestaListadoCalificaciones {
  total: number;
  calificaciones: Calificacion[];
  miCalificacion: Calificacion | null;
}

export type EstadoEntrega = "enviada" | "aprobada" | "rechazada";

export interface EntregaContrato {
  id: number;
  contratoId: number;
  autorId: number;
  mensaje: string | null;
  archivoUrl: string | null;
  enlaceUrl: string | null;
  estado: EstadoEntrega;
  observacionRevision: string | null;
  fechaEntrega: string;
  fechaRevision: string | null;
  revisadoPorId: number | null;
}

export interface DatosEntrega {
  mensaje?: string;
  archivoUrl?: string;
  enlaceUrl?: string;
}

/**
 * Módulo de API — Contratos y calificaciones.
 * Backend: /api/contratos, /api/contratos/:id, /api/contratos/:id/estado,
 *         /api/contratos/:id/calificaciones
 */

export async function getContracts(token: string): Promise<{ total: number; contratos: Contrato[] }> {
  const { data } = await apiFetch<{ total: number; contratos: Contrato[] }>({
    method: "GET",
    path: "/contratos",
    token,
    mensajeError: "No se pudieron cargar los contratos",
  });
  return data;
}

export async function getContract(token: string, id: number): Promise<Contrato> {
  const { data } = await apiFetch<Contrato>({
    method: "GET",
    path: `/contratos/${id}`,
    token,
    mensajeError: "No se pudo cargar el contrato",
  });
  return data;
}

export async function completeContract(token: string, id: number): Promise<RespuestaContrato> {
  const { data } = await apiFetch<RespuestaContrato>({
    method: "PATCH",
    path: `/contratos/${id}/estado`,
    token,
    body: { estado: "completado" },
    mensajeError: "No se pudo completar el contrato",
  });
  return data;
}

export async function cancelContract(token: string, id: number): Promise<RespuestaContrato> {
  const { data } = await apiFetch<RespuestaContrato>({
    method: "PATCH",
    path: `/contratos/${id}/estado`,
    token,
    body: { estado: "cancelado" },
    mensajeError: "No se pudo cancelar el contrato",
  });
  return data;
}

export async function getContractRatings(token: string, contratoId: number): Promise<RespuestaListadoCalificaciones> {
  const { data } = await apiFetch<RespuestaListadoCalificaciones>({
    method: "GET",
    path: `/contratos/${contratoId}/calificaciones`,
    token,
    mensajeError: "No se pudieron cargar las calificaciones",
  });
  return data;
}

export async function rateContract(token: string, contratoId: number, datos: { puntuacion: number; comentario?: string }): Promise<RespuestaCalificacion> {
  const { data } = await apiFetch<RespuestaCalificacion>({
    method: "POST",
    path: `/contratos/${contratoId}/calificaciones`,
    token,
    body: datos,
    mensajeError: "No se pudo registrar la calificación",
  });
  return data;
}

export async function getContractDeliveries(token: string, contratoId: number): Promise<{ total: number; entregas: EntregaContrato[] }> {
  const { data } = await apiFetch<{ total: number; entregas: EntregaContrato[] }>({
    method: "GET",
    path: `/contratos/${contratoId}/entregas`,
    token,
    mensajeError: "No se pudieron cargar las entregas",
  });
  return data;
}

export async function submitDelivery(token: string, contratoId: number, datos: DatosEntrega): Promise<{ mensaje: string; entrega: EntregaContrato }> {
  const { data } = await apiFetch<{ mensaje: string; entrega: EntregaContrato }>({
    method: "POST",
    path: `/contratos/${contratoId}/entregas`,
    token,
    body: datos,
    mensajeError: "No se pudo registrar la entrega",
  });
  return data;
}

export async function approveDelivery(token: string, contratoId: number): Promise<{ mensaje: string; contrato: Contrato; entrega: EntregaContrato }> {
  const { data } = await apiFetch<{ mensaje: string; contrato: Contrato; entrega: EntregaContrato }>({
    method: "PATCH",
    path: `/contratos/${contratoId}/aprobar-entrega`,
    token,
    mensajeError: "No se pudo aprobar la entrega",
  });
  return data;
}

export async function rejectDelivery(token: string, contratoId: number, observacion: string): Promise<{ mensaje: string; entrega: EntregaContrato }> {
  const { data } = await apiFetch<{ mensaje: string; entrega: EntregaContrato }>({
    method: "PATCH",
    path: `/contratos/${contratoId}/rechazar-entrega`,
    token,
    body: { observacion },
    mensajeError: "No se pudo rechazar la entrega",
  });
  return data;
}
