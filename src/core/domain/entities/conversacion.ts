import type { Mensaje } from "./mensaje";

export interface ContextoConversacion {
  tipo: string;
  proyectoId?: number;
  servicioId?: number;
}

export interface Contraparte {
  id: number;
  nombre: string;
  fotoPerfil: string | null;
  rol: string;
}

export interface Conversacion {
  id: number;
  contexto?: ContextoConversacion;
  cliente?: {
    id: number;
    nombre: string;
    fotoPerfil: string | null;
  };
  freelancer?: {
    id: number;
    nombre: string;
    fotoPerfil: string | null;
  };
  contraparte: Contraparte;
  ultimoMensaje?: {
    id: number;
    contenido: string;
    fecha: string;
  };
  noLeidos?: number;
}

export interface DatosConversacion {
  servicioId?: number;
  proyectoId?: number;
  freelancerId?: number;
}

export interface RespuestaConversacion {
  mensaje: string;
  conversacion: Conversacion;
}

export interface RespuestaListadoConversaciones {
  total: number;
  conversaciones: Conversacion[];
}

export interface RespuestaMensajes {
  mensajes: Mensaje[];
  ultimoId: number | null;
}
