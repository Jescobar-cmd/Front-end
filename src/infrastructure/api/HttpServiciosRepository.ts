import { apiFetch } from "./client";
import type { ServiciosRepositoryPort } from "../../core/application/ports/ServiciosRepositoryPort";
import type { EstadoServicio, FiltrosListadoServicio, FiltrosMisServicio, Paginado, RespuestaServicio, Servicio } from "../../core/domain/entities/servicio";
import type { DatosServicio, DatosActualizacionServicio } from "../../core/domain/entities/servicio";

// Debe incluir el prefijo /api (ej: http://localhost:4000/api)
const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:4000/api").replace(/\/+$/, "");

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

export class HttpServiciosRepository implements ServiciosRepositoryPort {
  async listarServicios(token: string, filtros: FiltrosListadoServicio = {}): Promise<Paginado<Servicio>> {
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

  async obtenerServicio(token: string, id: number): Promise<Servicio> {
    const { data } = await apiFetch<Servicio>({
      method: "GET",
      path: `/servicios/${id}`,
      token,
      mensajeError: "No se pudo cargar el servicio",
    });
    return data;
  }

  async crearServicio(token: string, datos: DatosServicio): Promise<RespuestaServicio> {
    const { data } = await apiFetch<RespuestaServicio>({
      method: "POST",
      path: "/servicios",
      token,
      body: datos,
      mensajeError: "No se pudo crear el servicio",
    });
    return data;
  }

  async actualizarServicio(token: string, id: number, datos: DatosActualizacionServicio): Promise<RespuestaServicio> {
    const { data } = await apiFetch<RespuestaServicio>({
      method: "PATCH",
      path: `/servicios/${id}`,
      token,
      body: datos,
      mensajeError: "No se pudo actualizar el servicio",
    });
    return data;
  }

  async cambiarEstadoServicio(token: string, id: number, estado: EstadoServicio): Promise<RespuestaServicio> {
    const { data } = await apiFetch<RespuestaServicio>({
      method: "PATCH",
      path: `/servicios/${id}/estado`,
      token,
      body: { estado },
      mensajeError: "No se pudo actualizar el estado del servicio",
    });
    return data;
  }

  async listarMisServicios(token: string, filtros: FiltrosMisServicio = {}): Promise<Paginado<Servicio>> {
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
}
