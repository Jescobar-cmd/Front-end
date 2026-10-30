export interface Servicio {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  imagenUrl: string | null;
  estado: string;
  fechaCreacion: string;
  categoria: { id: number; nombre: string } | null;
  freelancer: {
    id: number;
    nombre: string;
    fotoPerfil: string | null;
    tituloProfesional: string | null;
    calificacionPromedio: number;
  };
}

export interface DatosServicio {
  titulo: string;
  descripcion: string;
  precio: number;
  categoriaId?: number | null;
  imagenUrl?: string | null;
}

export interface DatosActualizacionServicio {
  titulo?: string;
  descripcion?: string;
  precio?: number;
  categoriaId?: number | null;
  imagenUrl?: string | null;
}

export type EstadoServicio = "activo" | "pausado" | "eliminado";

export interface RespuestaServicio {
  mensaje: string;
  servicio: Servicio;
}

export interface Paginado<T> {
  page: number;
  limit: number;
  total: number;
  items: T[];
}

export interface FiltrosListadoServicio {
  page?: number;
  limit?: number;
  categoriaId?: number;
  q?: string;
}

export interface FiltrosMisServicio extends Omit<FiltrosListadoServicio, "categoriaId"> {
  estado?: string;
  q?: string;
}
