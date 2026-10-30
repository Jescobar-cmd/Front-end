import type { Mensaje } from "./mensaje";
import type { Contrato } from "./contrato";

export interface ConversacionParticipante {
  id: number;
  nombre: string;
  fotoPerfil: string | null;
}

export interface ContextoConversacion {
  tipo: "proyecto" | "servicio" | "ninguno";
  id: number | null;
  titulo: string | null;
}

export interface Contraparte extends ConversacionParticipante {
  rol: number;
}

export interface UltimoMensaje {
  contenido: string;
  fechaEnvio: string;
  emisorId: number;
  tipo: string;
}

export interface Conversacion {
  id: number;
  fechaCreacion: string;
  contexto: ContextoConversacion;
  contraparte: Contraparte;
  participantes?: {
    cliente: ConversacionParticipante;
    freelancer: ConversacionParticipante;
  };
  ultimoMensaje?: UltimoMensaje | null;
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

export interface RespuestaAccionChat {
  mensaje: string;
  contrato?: Contrato;
}
