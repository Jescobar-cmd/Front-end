import type { OfertasRepositoryPort } from "../../core/application/ports/OfertasRepositoryPort";
import type { Categoria } from "../../core/domain/entities/categoria";
import type { FiltrosOferta, OfertaPaginada } from "../../core/domain/entities/oferta";

// Debe incluir el prefijo /api (ej: http://localhost:5173/api)
const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:5173/api").replace(/\/+$/, "");

interface ErrorDto {
  error?: string;
  message?: string;
}

interface RespuestaDto<T> {
  data: T;
}

async function request<T>(
  method: "GET" | "POST" | "PATCH",
  path: string,
  token?: string,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
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

export class HttpOfertasRepository implements OfertasRepositoryPort {
  async listarCategorias(token: string): Promise<Categoria[]> {
    const data = await request<{ total: number; categorias: Categoria[] }>("GET", "/categorias", token);
    return data.categorias;
  }

  async listarMisOfertas(token: string, filtros: FiltrosOferta): Promise<OfertaPaginada> {
    const params = new URLSearchParams({
      page: String(filtros.page),
      limit: String(filtros.limit),
    });
    if (filtros.estado) params.set("estado", filtros.estado);
    if (filtros.texto) params.set("q", filtros.texto);

    return request<OfertaPaginada>("GET", `/cliente/ofertas?${params.toString()}`, token);
  }
}
