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
}
