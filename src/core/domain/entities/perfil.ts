export type TipoCliente = "natural" | "empresa";

export interface ClientePerfil {
  nombreEmpresa: string | null;
  tipoCliente: string;
  descripcion: string | null;
}

export interface FreelancerPerfil {
  tituloProfesional: string | null;
  biografia: string | null;
  calificacionPromedio: number;
}

/** Perfil propio del cliente (GET /api/cliente/perfil): incluye email y teléfono. */
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

/** Perfil público de cualquier usuario (GET /api/usuarios/:id): sin email ni teléfono. */
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

/**
 * Campos editables del perfil del cliente.
 * `undefined` = no tocar. `null` o "" = borrar el valor (solo opcionales).
 */
export interface DatosPerfilCliente {
  nombre?: string;
  telefono?: string | null;
  fotoPerfil?: string | null;
  descripcion?: string | null;
  nombreEmpresa?: string | null;
  tipoCliente?: TipoCliente;
}