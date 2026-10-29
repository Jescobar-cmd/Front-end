import { apiFetch } from "./client";
import type { OfertaMarketplace } from "./apiOfertas";
import type { Servicio } from "./apiServicios";

export interface AutorPublicacion {
  id: number;
  nombre: string;
  fotoPerfil: string | null;
}

export interface Publicacion {
  id: number;
  autor: AutorPublicacion;
  titulo?: string | null;
  contenido: string;
  imagenUrl?: string | null;
  likes?: {
    totalLikes: number;
    meGusta: boolean;
  };
}

export interface Feed {
  rol: string;
  publicaciones: Publicacion[];
  ofertas: OfertaMarketplace[];
  servicios: Servicio[];
}

export interface DatosPublicacion {
  titulo?: string;
  contenido: string;
  imagenUrl?: string | null;
}

/**
 * Módulo de API — Feed y blog.
 * Backend: GET /api/feed, GET /api/publicaciones, POST /api/publicaciones,
 *         GET /api/publicaciones/:id, DELETE /api/publicaciones/:id,
 *         POST /api/publicaciones/:id/like
 */

export async function getFeed(token: string, limit = 10): Promise<Feed> {
  const { data } = await apiFetch<Feed>({
    method: "GET",
    path: `/feed?limit=${limit}`,
    token,
    mensajeError: "No se pudo cargar el feed",
  });
  return data;
}

export async function getPosts(token: string, autorId?: number, page = 1, limit = 30): Promise<{
  page: number;
  limit: number;
  total: number;
  items: Publicacion[];
}> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (autorId) params.set("autorId", String(autorId));

  const { data } = await apiFetch<{
    page: number;
    limit: number;
    total: number;
    items: Publicacion[];
  }>({
    method: "GET",
    path: `/publicaciones?${params.toString()}`,
    token,
    mensajeError: "No se pudo cargar las publicaciones",
  });
  return data;
}

export async function createPost(token: string, datos: DatosPublicacion): Promise<{ mensaje: string; publicacion: Publicacion }> {
  const { data } = await apiFetch<{ mensaje: string; publicacion: Publicacion }>({
    method: "POST",
    path: "/publicaciones",
    token,
    body: datos,
    mensajeError: "No se pudo crear la publicación",
  });
  return data;
}

export async function getPost(token: string, id: number): Promise<Publicacion> {
  const { data } = await apiFetch<Publicacion>({
    method: "GET",
    path: `/publicaciones/${id}`,
    token,
    mensajeError: "No se pudo cargar la publicación",
  });
  return data;
}

export async function deletePost(token: string, id: number): Promise<{ mensaje: string }> {
  const { data } = await apiFetch<{ mensaje: string }>({
    method: "DELETE",
    path: `/publicaciones/${id}`,
    token,
    mensajeError: "No se pudo eliminar la publicación",
  });
  return data;
}

export async function toggleLike(token: string, id: number): Promise<{ mensaje: string; meGusta: boolean; totalLikes: number }> {
  const { data } = await apiFetch<{
    mensaje: string;
    meGusta: boolean;
    totalLikes: number;
  }>({
    method: "POST",
    path: `/publicaciones/${id}/like`,
    token,
    mensajeError: "No se pudo actualizar el like",
  });
  return data;
}
