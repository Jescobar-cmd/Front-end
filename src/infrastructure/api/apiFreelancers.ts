import { apiFetch } from "./client";

export interface HabilidadDirectorio {
  id: number;
  nombre: string;
  nivel: string | null;
}

/** Tarjeta pública que devuelve `GET /api/freelancers`. */
export interface FreelancerDirectorioItem {
  id: number;
  nombre: string;
  fotoPerfil: string | null;
  tituloProfesional: string | null;
  biografia: string | null;
  calificacionPromedio: number;
  habilidades: HabilidadDirectorio[];
}

export interface DirectorioFreelancersPaginado {
  page: number;
  limit: number;
  total: number;
  items: FreelancerDirectorioItem[];
}

export interface FiltrosDirectorioFreelancers {
  page?: number;
  limit?: number;
  q?: string;
  habilidadId?: number;
  categoriaId?: number;
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
 * Módulo de API — Directorio de freelancers.
 * Backend: GET /api/freelancers?page=&limit=&q=&habilidadId=&categoriaId=
 */
export async function listFreelancers(
  token: string,
  filtros: FiltrosDirectorioFreelancers = {},
): Promise<DirectorioFreelancersPaginado> {
  const { data } = await apiFetch<DirectorioFreelancersPaginado>({
    method: "GET",
    path: `/freelancers${aQuery({
      page: filtros.page ?? 1,
      limit: filtros.limit ?? 12,
      q: filtros.q,
      habilidadId: filtros.habilidadId,
      categoriaId: filtros.categoriaId,
    })}`,
    token,
    mensajeError: "No se pudo cargar el directorio de freelancers",
  });
  return data;
}