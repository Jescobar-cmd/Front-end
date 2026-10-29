export type EstadoPropuesta = "pendiente" | "aceptada" | "rechazada";

export interface Propuesta {
  id: number;
  ofertaId?: number;
  proyecto?: {
    id: number;
    titulo: string;
    estado: string;
  };
  freelancer: {
    id: number;
    nombre: string;
    fotoPerfil: string | null;
    calificacionPromedio?: number;
  };
  monto: number;
  mensaje?: string;
  estado: string;
  fecha: string;
}

export interface DatosPropuesta {
  montoPropuesto: number;
  mensaje?: string;
}

export interface RespuestaAccionPropuesta {
  mensaje: string;
  contrato?: unknown;
}
