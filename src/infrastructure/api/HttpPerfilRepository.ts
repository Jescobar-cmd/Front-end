import type { PerfilRepositoryPort } from "../../core/application/ports/PerfilRepositoryPort";
import type { DatosPerfilCliente, PerfilCliente, PerfilPublico } from "../../core/domain/entities/perfil";

// Debe incluir el prefijo /api (ej: http://localhost:4000/api)
const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:4000/api").replace(/\/+$/, "");

interface ErrorDto {
  error?: string;
  message?: string;
}

async function request<T>(method: "GET" | "PATCH", path: string, token?: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor. Verifica que el backend esté encendido.");
  }

  const texto = await res.text();
  let data: T & ErrorDto;
  try {
    data = (texto ? JSON.parse(texto) : {}) as T & ErrorDto;
  } catch {
    throw new Error("El servidor respondió con un formato inesperado.");
  }

  if (!res.ok) {
    throw new Error(data.error ?? data.message ?? "No se pudo completar la solicitud.");
  }

  return data as T;
}

export class HttpPerfilRepository implements PerfilRepositoryPort {
  async obtenerMiPerfil(token: string): Promise<PerfilCliente> {
    return request<PerfilCliente>("GET", "/cliente/perfil", token);
  }

  async actualizarMiPerfil(token: string, datos: DatosPerfilCliente): Promise<{ mensaje: string; perfil: PerfilCliente }> {
    const { mensaje, perfil } = await request<{ mensaje: string; perfil: PerfilCliente }>(
      "PATCH",
      "/cliente/perfil",
      token,
      datos,
    );
    return { mensaje, perfil };
  }

  async obtenerPerfilPublico(token: string, id: number | string): Promise<PerfilPublico> {
    return request<PerfilPublico>("GET", `/usuarios/${id}`, token);
  }
}
