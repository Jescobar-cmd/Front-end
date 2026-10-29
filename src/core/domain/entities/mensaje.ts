export interface UltimoMensaje {
  id: number;
  contenido: string;
  fecha: string;
}

export interface Mensaje {
  id: number;
  conversacionId?: number;
  contenido: string;
  fecha: string;
  oferta?: {
    id: number;
    monto: number;
    descripcion?: string;
    fechaExpiracion?: string;
    estado: string;
    padreId?: number;
  };
}

export interface DatosMensaje {
  contenido: string;
}
