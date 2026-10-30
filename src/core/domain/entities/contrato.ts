export interface ParticipanteContrato {
  id: number;
  nombre: string;
  fotoPerfil: string | null;
}

export interface ContextoContrato {
  tipo: "proyecto" | "servicio" | "ninguno";
  id: number | null;
  titulo: string | null;
}

export interface Contrato {
  id: number;
  propuestaId: number | null;
  proyectoId: number | null;
  servicioId: number | null;
  ofertaChatId: number | null;
  montoAcordado: number;
  fechaInicio: string | null;
  fechaFin: string | null;
  estado: string;
  contexto: ContextoContrato;
  cliente: ParticipanteContrato;
  freelancer: ParticipanteContrato;
  contraparte: ParticipanteContrato & { rol: number };
}

export interface ContratoListado {
  total: number;
  contratos: Contrato[];
}

export interface RespuestaContrato {
  mensaje: string;
  contrato: Contrato;
}
