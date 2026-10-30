export type EstadoPropuesta = "pendiente" | "aceptada" | "rechazada";

/** Resumen de una propuesta enviada por un freelancer a una oferta del cliente. */
export interface Propuesta {
  id: number;
  mensaje: string | null;
  montoPropuesto: number;
  estado: string;
  fechaEnvio: string;
  freelancer: {
    id: number;
    nombre: string;
    fotoPerfil: string | null;
    calificacionPromedio: number;
  };
  /** Presente en el panel del freelancer ("mis propuestas"). */
  proyecto?: {
    id: number;
    titulo: string;
    estado: string;
  };
}

export interface DatosPropuesta {
  montoPropuesto: number;
  mensaje?: string;
}

export interface RespuestaAccionPropuesta {
  mensaje: string;
  contrato?: unknown;
}
