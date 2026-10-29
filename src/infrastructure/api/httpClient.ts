import { apiFetch } from "./client";
import type { RespuestaApi } from "./client";

export interface ResultadoApi<T> {
  status: number;
  data: T;
}

async function ejecutar<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  token: string,
  body?: unknown,
  mensajeError?: string,
): Promise<RespuestaApi<T>> {
  const respuesta = await apiFetch<T>({ method, path, token, body, mensajeError });
  return respuesta;
}

/**
 * Cliente HTTP compartido de First Gig.
 * Delega el transporte (JSON, Bearer token, errores 422 con details, 401) a `apiFetch`.
 */
export const httpClient = {
  obtener: async <T>(path: string, token: string, mensajeError?: string): Promise<T> => {
    const respuesta = await ejecutar<T>("GET", path, token, undefined, mensajeError);
    return respuesta.data;
  },

  enviar: async <T>(path: string, token: string, body?: unknown, mensajeError?: string): Promise<T> => {
    const respuesta = await ejecutar<T>("POST", path, token, body, mensajeError);
    return respuesta.data;
  },

  actualizar: async <T>(path: string, token: string, body?: unknown, mensajeError?: string): Promise<T> => {
    const respuesta = await ejecutar<T>("PATCH", path, token, body, mensajeError);
    return respuesta.data;
  },

  eliminar: async <T>(path: string, token: string, mensajeError?: string): Promise<T> => {
    const respuesta = await ejecutar<T>("DELETE", path, token, undefined, mensajeError);
    return respuesta.data;
  },
};
