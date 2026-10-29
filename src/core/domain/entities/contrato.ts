export interface ContextoContrato {
  tipo: string;
  proyectoId?: number;
  servicioId?: number;
}

export interface Contrato {
  id: number;
  contexto?: ContextoContrato;
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
  montoAcordado: number;
  estado: string;
  fechaInicio?: string;
  fechaFin?: string;
  contraparte?: {
    id: number;
    nombre: string;
    fotoPerfil: string | null;
    rol: string;
  };
}

export interface ContratoListado {
  total: number;
  contratos: Contrato[];
}
