import { apiFetch } from "./client";

export interface ResumenLiquidaciones {
  saldoDisponible: number;
  saldoEnValidacion: number;
  saldoEnProceso: number;
  totalPagado: number;
  comisionTotal: number;
  totalLiquidaciones: number;
}

export type EstadoLiquidacion = "pendiente" | "solicitada" | "pagada" | "rechazada";

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

export interface LiquidacionesFreelancer {
  resumen: ResumenLiquidaciones;
  liquidaciones: Liquidacion[];
  diasValidacion: number;
}

export interface RespuestaRetiro {
  mensaje: string;
  cantidad: number;
  total: number;
  enValidacion?: number;
}

/**
 * Módulo de API — Liquidaciones y retiros del freelancer.
 * Backend: GET /api/freelancer/liquidaciones,
 *          POST /api/freelancer/liquidaciones/solicitar
 */

export async function getFreelancerLiquidaciones(token: string): Promise<LiquidacionesFreelancer> {
  const { data } = await apiFetch<LiquidacionesFreelancer>({
    method: "GET",
    path: "/freelancer/liquidaciones",
    token,
    mensajeError: "No se pudieron cargar tus ganancias",
  });
  return data;
}

export async function solicitarRetiro(token: string): Promise<RespuestaRetiro> {
  const { data } = await apiFetch<RespuestaRetiro>({
    method: "POST",
    path: "/freelancer/liquidaciones/solicitar",
    token,
    mensajeError: "No se pudo solicitar el retiro",
  });
  return data;
}
