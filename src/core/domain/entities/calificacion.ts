export interface Calificacion {
  id: number;
  contratoId?: number;
  puntuacion: number;
  comentario?: string;
  fecha?: string;
}

export interface RespuestaCalificacion {
  mensaje: string;
  calificacion: Calificacion;
}

export interface RespuestaListadoCalificaciones {
  total: number;
  calificaciones: Calificacion[];
  miCalificacion: Calificacion | null;
}
