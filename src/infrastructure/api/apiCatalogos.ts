import { apiFetch } from "./client";
import type { Categoria } from "../../core/domain/entities/categoria";

interface Habilidad {
  id: number;
  nombre: string;
  categoriaId?: number;
}

/**
 * Módulo de API — Catálogos.
 * Backend: GET /api/categorias, GET /api/habilidades
 */

export async function getCategories(token: string): Promise<Categoria[]> {
  const { data } = await apiFetch<{ total: number; categorias: Categoria[] }>({
    method: "GET",
    path: "/categorias",
    token,
    mensajeError: "No se pudo cargar las categorías",
  });
  return data.categorias;
}

export async function getSkills(token: string): Promise<Habilidad[]> {
  const { data } = await apiFetch<{ total: number; habilidades: Habilidad[] }>({
    method: "GET",
    path: "/habilidades",
    token,
    mensajeError: "No se pudo cargar las habilidades",
  });
  return data.habilidades;
}
