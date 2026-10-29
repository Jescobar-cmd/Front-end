import { apiFetch } from "./client";

export interface Servicio {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  categoriaId?: number | null;
  imagenUrl?: string | null;
  estado?: string;
  freelancer?: {
    nombre?: string;
    fotoPerfil?: string | null;
    calificacionPromedio?: number;
  } | null;
}

export interface DatosServicio {
  titulo: string;
  descripcion: string;
  precio: number;
  categoriaId?: number | null;
  imagenUrl?: string | null;
}

export interface DatosActualizacionServicio {
  titulo?: string;
  descripcion?: string;
  precio?: number;
  categoriaId?: number | null;
  imagenUrl?: string | null;
}

export type EstadoServicio = "activo" | "pausado" | "eliminado";

export interface RespuestaServicio {
  mensaje: string;
  servicio: Servicio;
}

interface FiltrosListadoServicio {
  page?: number;
  limit?: number;
  categoriaId?: number;
  q?: string;
}

interface FiltrosMisServicio extends Omit<FiltrosListadoServicio, "categoriaId"> {
  estado?: string;
  q?: string;
}

function aQuery(filtros: Record<string, number | string | undefined>): string {
  const params = new URLSearchParams();
  for (const [campo, valor] of Object.entries(filtros)) {
    if (valor !== undefined && valor !== null && valor !== "") {
      params.set(campo, String(valor));
    }
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

/**
 * Módulo de API — Servicios.
 * Backend: GET /api/servicios, GET /api/servicios/:id, POST /api/servicios,
 *         PATCH /api/servicios/:id, PATCH /api/servicios/:id/estado,
 *         GET /api/freelancer/servicios
 */

export async function listServices(token: string, filtros: FiltrosListadoServicio = {}): Promise<{
  page: number;
  limit: number;
  total: number;
  items: Servicio[];
}> {
  const { data } = await apiFetch<{
    page: number;
    limit: number;
    total: number;
    items: Servicio[];
  }>({
    method: "GET",
    path: `/servicios${aQuery({
      page: filtros.page ?? 1,
      limit: filtros.limit ?? 50,
      ...(filtros.categoriaId !== undefined ? { categoriaId: filtros.categoriaId } : {}),
      ...(filtros.q !== undefined ? { q: filtros.q } : {}),
    })}`,
    token,
    mensajeError: "No se pudo cargar los servicios",
  });
  return data;
}

export async function getService(token: string, id: number): Promise<Servicio> {
  const { data } = await apiFetch<Servicio>({
    method: "GET",
    path: `/servicios/${id}`,
    token,
    mensajeError: "No se pudo cargar el servicio",
  });
  return data;
}

export async function createService(token: string, datos: DatosServicio): Promise<RespuestaServicio> {
  const { data } = await apiFetch<RespuestaServicio>({
    method: "POST",
    path: "/servicios",
    token,
    body: datos,
    mensajeError: "No se pudo crear el servicio",
  });
  return data;
}

export async function updateService(token: string, id: number, datos: DatosActualizacionServicio): Promise<RespuestaServicio> {
  const { data } = await apiFetch<RespuestaServicio>({
    method: "PATCH",
    path: `/servicios/${id}`,
    token,
    body: datos,
    mensajeError: "No se pudo actualizar el servicio",
  });
  return data;
}

export async function changeServiceStatus(token: string, id: number, estado: EstadoServicio): Promise<RespuestaServicio> {
  const { data } = await apiFetch<RespuestaServicio>({
    method: "PATCH",
    path: `/servicios/${id}/estado`,
    token,
    body: { estado },
    mensajeError: "No se pudo actualizar el estado del servicio",
  });
  return data;
}

export async function getMyServices(
  token: string,
  filtros: FiltrosMisServicio = {},
): Promise<{ page: number; limit: number; total: number; items: Servicio[] }> {
  const { data } = await apiFetch<{
    page: number;
    limit: number;
    total: number;
    items: Servicio[];
  }>({
    method: "GET",
    path: `/freelancer/servicios${aQuery({
      page: filtros.page ?? 1,
      limit: filtros.limit ?? 50,
      ...(filtros.estado !== undefined ? { estado: filtros.estado } : {}),
      ...(filtros.q !== undefined ? { q: filtros.q } : {}),
    })}`,
    token,
    mensajeError: "No se pudo cargar los servicios",
  });
  return data;
}
