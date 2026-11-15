import { apiFetch } from "./client";
import type { ApiError } from "./client";

/**
 * Cliente del módulo de moderación.
 *
 * El backend real devuelve los recursos envueltos de formas distintas según la
 * operación (`{ reporte }`, `{ disputa }`, `{ liquidacion }`). Estas funciones
 * normalizan esas respuestas para que las páginas trabajen con tipos estables.
 */

export type EstadoReporte = "pendiente" | "resuelto" | "rechazado";
export type EstadoDisputa = "abierta" | "en_revision" | "resuelta" | "rechazada";
export type EstadoLiquidacion = "pendiente" | "solicitada" | "pagada" | "rechazada";
export type ResultadoDisputa = "reembolso_cliente" | "liberar_freelancer";
export type EstadoCuenta = "activo" | "inactivo" | "suspendido";

export interface ModeradorDashboard {
  reportesPendientes: number;
  disputasAbiertas: number;
  retirosPendientes: number;
}

export interface PersonaResumen {
  id: number;
  nombre: string;
  fotoPerfil: string | null;
}

export interface Reporte {
  id: number;
  usuarioReportaId: number;
  usuarioReportadoId: number | null;
  proyectoId: number | null;
  adminId: number | null;
  motivo: string;
  descripcion: string | null;
  estado: EstadoReporte;
  resolucion: string | null;
  fechaResolucion: string | null;
  fecha: string;
}

export interface ReporteDetalle extends Reporte {
  usuarioReporta: PersonaResumen;
  usuarioReportado: PersonaResumen | null;
  proyecto: { id: number; titulo: string } | null;
}

export interface ReportesPaginados {
  total: number;
  reportes: Reporte[];
}

export interface FiltrosReportes {
  estado?: EstadoReporte | "";
  page?: number;
  limit?: number;
}

export interface Disputa {
  id: number;
  contratoId: number;
  abiertaPorId: number;
  motivo: string;
  descripcion: string;
  evidenciaUrl: string | null;
  estado: EstadoDisputa;
  resolucion: string | null;
  resueltaPorId: number | null;
  fechaApertura: string;
  fechaResolucion: string | null;
}

export interface ContratoDetalle {
  id: number;
  propuestaId: number | null;
  proyectoId: number | null;
  servicioId: number | null;
  ofertaChatId: number | null;
  montoAcordado: number;
  fechaInicio: string | null;
  fechaFin: string | null;
  estado: string;
  contexto: {
    tipo: "proyecto" | "servicio" | "ninguno";
    id: number | null;
    titulo: string | null;
  };
  cliente: PersonaResumen;
  freelancer: PersonaResumen;
}

export interface DisputaDetalle extends Disputa {
  contrato: ContratoDetalle | null;
}

export interface DisputasPaginadas {
  total: number;
  disputas: Disputa[];
}

export interface FiltrosDisputas {
  estado?: EstadoDisputa | "";
  page?: number;
  limit?: number;
}

export interface Liquidacion {
  id: number;
  freelancerId: number;
  contratoId: number | null;
  montoBruto: number;
  comision: number;
  montoNeto: number;
  estado: EstadoLiquidacion;
  referencia: string | null;
  motivoRechazo: string | null;
  fechaCreacion: string;
  fechaSolicitud: string | null;
  fechaPago: string | null;
}

export interface LiquidacionesPaginadas {
  total: number;
  liquidaciones: Liquidacion[];
}

export interface FiltrosLiquidaciones {
  estado?: EstadoLiquidacion | "";
  page?: number;
  limit?: number;
}

export interface Notificacion {
  id: number;
  usuarioId: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  enlace: string | null;
  leida: boolean;
  fechaCreacion: string;
}

export interface NotificacionesPaginadas {
  page: number;
  limit: number;
  total: number;
  noLeidas: number;
  items: Notificacion[];
}

export interface FiltrosNotificaciones {
  page?: number;
  limit?: number;
  soloNoLeidas?: boolean;
}

export interface PerfilPublicoModeracion {
  id: number;
  nombre: string;
  fotoPerfil: string | null;
  rolId: number;
  rolNombre: string;
  fechaRegistro: string;
  /** El backend no siempre lo incluye; se usa cuando está disponible. */
  estado?: EstadoCuenta | string;
}

export interface ResultadoSuspension {
  mensaje: string;
  usuario: {
    id: number;
    nombre: string;
    email: string;
    estado: string;
  };
}

const SUSPENSION_EVENT = "fg:cuenta-suspendida";
export const CUENTA_SUSPENDIDA_EVENT = SUSPENSION_EVENT;

function esSuspension(error: unknown): boolean {
  const apiError = error as ApiError | undefined;
  return Boolean(
    apiError &&
      apiError.status === 403 &&
      /suspendid/i.test(apiError.message ?? ""),
  );
}

/** Avisa a la shell del panel para que reemplace la vista por la pantalla de suspensión. */
function notificarSuspension(error: unknown): void {
  if (!esSuspension(error)) return;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SUSPENSION_EVENT));
  }
}

interface OpcionesPeticion {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  token: string;
  path: string;
  body?: unknown;
  mensajeError?: string;
}

async function pedir<T>({ method = "GET", token, path, body, mensajeError }: OpcionesPeticion): Promise<T> {
  try {
    const { data } = await apiFetch<T>({ method, token, path, body, mensajeError });
    return data;
  } catch (error) {
    notificarSuspension(error);
    throw error;
  }
}

function query(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "" || value === false) return;
    search.set(key, String(value));
  });
  const serialized = search.toString();
  return serialized ? `?${serialized}` : "";
}

export const moderacionApi = {
  obtenerDashboard(token: string): Promise<ModeradorDashboard> {
    return pedir<ModeradorDashboard>({ token, path: "/moderador/dashboard" });
  },

  listarReportes(token: string, filtros: FiltrosReportes = {}): Promise<ReportesPaginados> {
    return pedir<ReportesPaginados>({
      token,
      path: `/moderador/reportes${query({
        estado: filtros.estado,
        page: filtros.page,
        limit: filtros.limit,
      })}`,
    });
  },

  obtenerReporte(token: string, id: number): Promise<ReporteDetalle> {
    return pedir<ReporteDetalle>({ token, path: `/moderador/reportes/${id}` });
  },

  async resolverReporte(
    token: string,
    id: number,
    datos: { estado: Exclude<EstadoReporte, "pendiente">; resolucion: string },
  ): Promise<Reporte> {
    const respuesta = await pedir<{ reporte: Reporte }>({
      method: "PATCH",
      token,
      path: `/moderador/reportes/${id}/resolver`,
      body: datos,
    });
    return respuesta.reporte;
  },

  listarDisputas(token: string, filtros: FiltrosDisputas = {}): Promise<DisputasPaginadas> {
    return pedir<DisputasPaginadas>({
      token,
      path: `/moderador/disputas${query({
        estado: filtros.estado,
        page: filtros.page,
        limit: filtros.limit,
      })}`,
    });
  },

  obtenerDisputa(token: string, id: number): Promise<DisputaDetalle> {
    return pedir<DisputaDetalle>({ token, path: `/moderador/disputas/${id}` });
  },

  async marcarDisputaEnRevision(token: string, id: number): Promise<Disputa> {
    const respuesta = await pedir<{ disputa: Disputa }>({
      method: "PATCH",
      token,
      path: `/moderador/disputas/${id}/revision`,
    });
    return respuesta.disputa;
  },

  async resolverDisputa(
    token: string,
    id: number,
    datos: {
      estado: "resuelta" | "rechazada";
      resultado?: ResultadoDisputa;
      resolucion: string;
    },
  ): Promise<Disputa> {
    const respuesta = await pedir<{ disputa: Disputa }>({
      method: "PATCH",
      token,
      path: `/moderador/disputas/${id}/resolver`,
      body: datos,
    });
    return respuesta.disputa;
  },

  listarLiquidaciones(
    token: string,
    filtros: FiltrosLiquidaciones = {},
  ): Promise<LiquidacionesPaginadas> {
    return pedir<LiquidacionesPaginadas>({
      token,
      path: `/moderador/liquidaciones${query({
        estado: filtros.estado,
        page: filtros.page,
        limit: filtros.limit,
      })}`,
    });
  },

  async resolverRetiro(
    token: string,
    id: number,
    datos: {
      estado: "pagada" | "rechazada";
      referencia?: string;
      motivoRechazo?: string;
    },
  ): Promise<Liquidacion> {
    const respuesta = await pedir<{ liquidacion: Liquidacion }>({
      method: "PATCH",
      token,
      path: `/moderador/liquidaciones/${id}/pagar`,
      body: datos,
    });
    return respuesta.liquidacion;
  },

  suspenderUsuario(token: string, id: number, motivo: string): Promise<ResultadoSuspension> {
    return pedir<ResultadoSuspension>({
      method: "PATCH",
      token,
      path: `/moderador/usuarios/${id}/suspender`,
      body: { motivo },
    });
  },

  reactivarUsuario(token: string, id: number): Promise<ResultadoSuspension> {
    return pedir<ResultadoSuspension>({
      method: "PATCH",
      token,
      path: `/moderador/usuarios/${id}/reactivar`,
    });
  },

  listarNotificaciones(
    token: string,
    filtros: FiltrosNotificaciones = {},
  ): Promise<NotificacionesPaginadas> {
    return pedir<NotificacionesPaginadas>({
      token,
      path: `/moderador/notificaciones${query({
        page: filtros.page,
        limit: filtros.limit,
        soloNoLeidas: filtros.soloNoLeidas,
      })}`,
    });
  },

  async marcarNotificacionLeida(token: string, id: number): Promise<Notificacion> {
    const respuesta = await pedir<{ notificacion: Notificacion }>({
      method: "PATCH",
      token,
      path: `/moderador/notificaciones/${id}/leida`,
    });
    return respuesta.notificacion;
  },

  marcarTodasNotificacionesLeidas(
    token: string,
  ): Promise<{ mensaje: string; actualizadas: number }> {
    return pedir<{ mensaje: string; actualizadas: number }>({
      method: "PATCH",
      token,
      path: "/moderador/notificaciones/leidas",
    });
  },

  obtenerPerfilPublico(token: string, id: number): Promise<PerfilPublicoModeracion> {
    return pedir<PerfilPublicoModeracion>({ token, path: `/usuarios/${id}` });
  },
};
