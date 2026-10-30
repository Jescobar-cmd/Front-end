export interface OfertaChatResumen {
  id: number;
  monto: number;
  descripcion: string | null;
  estado: string;
  fechaExpiracion: string | null;
}

export interface Mensaje {
  id: number;
  emisorId: number;
  contenido: string;
  tipo: string;
  fechaEnvio: string;
  leido: boolean;
  /** Si el mensaje es de tipo 'oferta', trae la oferta asociada. */
  oferta: OfertaChatResumen | null;
}

export interface DatosMensaje {
  contenido: string;
}
