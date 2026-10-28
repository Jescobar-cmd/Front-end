import { apiFetch } from "./client";

export interface ClientePerfil {
  nombreEmpresa: string | null;
  tipoCliente: string;
  descripcion: string | null;
}

export interface FreelancerPerfil {
  tituloProfesional: string | null;
  biografia: string | null;
  calificacionPromedio: number;
  habilidades: Array<{ id: number; nombre: string }>;
}

export interface PerfilCliente {
  id: number;
  nombre: string;
  email: string;
  telefono: string | null;
  fotoPerfil: string | null;
  rolId: number;
  rolNombre: string;
  estado: string;
  fechaRegistro: string;
  cliente: ClientePerfil;
}

export interface PerfilPublico {
  id: number;
  nombre: string;
  fotoPerfil: string | null;
  rolId: number;
  rolNombre: string;
  fechaRegistro: string;
  cliente: ClientePerfil | null;
  freelancer: FreelancerPerfil | null;
}

export interface PerfilFreelancer {
  id: number;
  nombre: string;
  email: string;
  telefono: string | null;
  fotoPerfil: string | null;
  estado: string;
  fechaRegistro: string;
  freelancer: FreelancerPerfil;
}

export interface DatosPerfilCliente {
  nombre?: string;
  telefono?: string | null;
  fotoPerfil?: string | null;
  descripcion?: string | null;
  nombreEmpresa?: string | null;
  tipoCliente?: "natural" | "empresa";
}

export interface DatosPerfilFreelancer {
  nombre?: string;
  telefono?: string | null;
  fotoPerfil?: string | null;
  tituloProfesional?: string | null;
  biografia?: string | null;
  habilidadIds?: number[];
}

export interface RespuestaPerfil {
  mensaje: string;
  perfil: PerfilCliente | PerfilFreelancer;
}

function aPayload(datos: Record<string, unknown>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const [campo, valor] of Object.entries(datos)) {
    if (valor !== undefined) {
      payload[campo] = valor;
    }
  }
  return payload;
}

/**
 * Módulo de API — Perfiles.
 * Backend: GET /api/cliente/perfil, PATCH /api/cliente/perfil,
 *         GET /api/freelancer/perfil, PATCH /api/freelancer/perfil,
 *         GET /api/usuarios/:id
 */

export async function getClientProfile(token: string): Promise<PerfilCliente> {
  const { data } = await apiFetch<PerfilCliente>({
    method: "GET",
    path: "/cliente/perfil",
    token,
    mensajeError: "No se pudo cargar el perfil",
  });
  return data;
}

export async function updateClientProfile(token: string, datos: DatosPerfilCliente): Promise<RespuestaPerfil> {
  const { data } = await apiFetch<RespuestaPerfil>({
    method: "PATCH",
    path: "/cliente/perfil",
    token,
    body: aPayload(datos as Record<string, unknown>),
    mensajeError: "No se pudo actualizar el perfil",
  });
  return data;
}

export async function getFreelancerProfile(token: string): Promise<PerfilFreelancer> {
  const { data } = await apiFetch<PerfilFreelancer>({
    method: "GET",
    path: "/freelancer/perfil",
    token,
    mensajeError: "No se pudo cargar el perfil",
  });
  return data;
}

export async function updateFreelancerProfile(token: string, datos: DatosPerfilFreelancer): Promise<RespuestaPerfil> {
  const { data } = await apiFetch<RespuestaPerfil>({
    method: "PATCH",
    path: "/freelancer/perfil",
    token,
    body: aPayload(datos as Record<string, unknown>),
    mensajeError: "No se pudo actualizar el perfil",
  });
  return data;
}

export async function getPublicProfile(token: string, id: number): Promise<PerfilPublico> {
  const { data } = await apiFetch<PerfilPublico>({
    method: "GET",
    path: `/usuarios/${id}`,
    token,
    mensajeError: "No se pudo cargar el perfil",
  });
  return data;
}
