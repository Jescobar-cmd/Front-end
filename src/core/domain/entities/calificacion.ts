export interface CalificadorCalificacion {
  id: number;
  nombre: string;
  fotoPerfil: string | null;
}

export interface Calificacion {
  id: number;
  contratoId: number;
  puntuacion: number;
  comentario: string | null;
  fecha: string;
  calificador: CalificadorCalificacion;
  calificado: CalificadorCalificacion;
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
