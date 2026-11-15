export type TipoCuentaFeed = "cliente" | "freelancer";

export interface PiezaFeed {
  id: string;
  categoria: string;
  titulo: string;
  descripcion: string;
  detalle: string;
  etiquetas: string[];
  imagenUrl?: string;
  precio?: number | null;
  etiquetaPrecio?: "Precio" | "Presupuesto";
  autorId?: number;
  autorNombre?: string | null;
  autorFoto?: string | null;
  autorTitulo?: string | null;
  calificacion?: number | null;
  href?: string;
  ctaLabel?: string;
}
