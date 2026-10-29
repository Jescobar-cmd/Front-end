import { apiFetch } from "./client";

export interface ContextoContrato {
  tipo: string;
  proyectoId?: number;
  servicioId?: number;
}

export interface Contrato {
  id: number;
  contexto?: ContextoContrato;
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
  montoAcordado: number;
  estado: string;
  fechaInicio?: string;
  fechaFin?: string;
  contraparte?: {
    id: number;
    nombre: string;
    fotoPerfil: string | null;
    rol: string;
  };
}

export interface Calificacion {
  id: number;
  contratoId?: number;
  puntuacion: number;
  comentario?: string;
  fecha?: string;
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
