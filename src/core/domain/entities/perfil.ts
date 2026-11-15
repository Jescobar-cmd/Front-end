export type TipoCliente = "natural" | "empresa";

export const NIVELES_HABILIDAD = ["basico", "intermedio", "avanzado", "experto"] as const;
export type NivelHabilidad = (typeof NIVELES_HABILIDAD)[number];

export interface HabilidadSeleccionada {
  id: number;
  nivel?: NivelHabilidad | null;
}

export interface ClientePerfil {
  nombreEmpresa: string | null;
  tipoCliente: string;
  descripcion: string | null;
}

export interface HabilidadPerfil {
  id: number;
  nombre: string;
  nivel: NivelHabilidad | null;
}

export interface FreelancerPerfil {
  tituloProfesional: string | null;
  biografia: string | null;
  calificacionPromedio: number;
  habilidades?: HabilidadPerfil[];
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

/** Perfil propio del freelancer (GET /api/freelancer/perfil): incluye email y teléfono. */
export interface PerfilFreelancer {
  id: number;
  nombre: string;
  email: string;
  telefono: string | null;
  fotoPerfil: string | null;
  rolId: number;
  rolNombre: string;
  estado: string;
  fechaRegistro: string;
  freelancer: {
    tituloProfesional: string | null;
    biografia: string | null;
    calificacionPromedio: number;
    habilidades: HabilidadPerfil[];
  };
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

/**
 * Campos editables del perfil del freelancer (PATCH /api/freelancer/perfil).
 * `undefined` = no tocar. `null` o "" = borrar el valor (solo opcionales).
 */
export interface DatosPerfilFreelancer {
  nombre?: string;
  telefono?: string | null;
  fotoPerfil?: string | null;
  tituloProfesional?: string | null;
  biografia?: string | null;
  habilidades?: HabilidadSeleccionada[];
}