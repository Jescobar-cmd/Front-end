export type EstadoOferta = "abierto" | "en_progreso" | "completado" | "cancelado";

/**
 * Oferta = el trabajo que publica el CLIENTE (modelo `Proyecto` en la base de datos).
 * Incluye el contador de propuestas recibidas (`totalPropuestas`).
 */
export interface Oferta {
  id: number;
  titulo: string;
  descripcion: string;
  presupuesto: number | null;
  plazoDias: number | null;
  estado: string;
  imagenUrl: string | null;
  fechaPublicacion: string;
  categoria: { id: number; nombre: string } | null;
  habilidades: { id: number; nombre: string }[];
  totalPropuestas: number;
}

export interface NuevaOferta {
  titulo: string;
  descripcion: string;
  presupuesto?: number | null;
  plazoDias?: number | null;
  categoriaId?: number | null;
  imagenUrl?: string | null;
  habilidadIds?: number[];
}

export interface DatosOferta {
  titulo?: string;
  descripcion?: string;
  presupuesto?: number | null;
  plazoDias?: number | null;
  categoriaId?: number | null;
  imagenUrl?: string | null;
  habilidadIds?: number[];
}

export interface FiltrosOferta {
  estado?: string;
  texto?: string;
  page: number;
  limit: number;
}

export interface OfertaPaginada {
  page: number;
  limit: number;
  total: number;
  items: Oferta[];
}
