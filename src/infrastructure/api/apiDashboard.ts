import { apiFetch } from "./client";
import type { Contrato } from "./apiContratos";

export interface DashboardCliente {
  contratosActivos: number;
  contratosCompletados: number;
  contratosCancelados: number;
  entregasPendientes: number;
  disputasAbiertas: number;
  pagosPendientes: number;
  totalPagado: number;
  notificacionesSinLeer: number;
  contratosRecientes: Contrato[];
}

export interface DashboardFreelancer {
  contratosActivos: number;
  contratosCompletados: number;
  propuestasPendientes: number;
  serviciosActivos: number;
  entregasPendientes: number;
  pagosPendientes: number;
  disputasAbiertas: number;
  notificacionesSinLeer: number;
  calificacionPromedio: number;
  visitasPerfil: number;
  visualizacionesPropuesta: number;
  saldoDisponible: number;
}

/**
 * Módulo de API — resúmenes de los paneles de cliente y freelancer.
 * Backend: GET /api/cliente/dashboard y GET /api/freelancer/dashboard.
 */
export async function getDashboardCliente(token: string): Promise<DashboardCliente> {
  const { data } = await apiFetch<DashboardCliente>({
    method: "GET",
    path: "/cliente/dashboard",
    token,
    mensajeError: "No se pudo cargar el panel del cliente",
  });
  return data;
}

export async function getDashboardFreelancer(token: string): Promise<DashboardFreelancer> {
  const { data } = await apiFetch<DashboardFreelancer>({
    method: "GET",
    path: "/freelancer/dashboard",
    token,
    mensajeError: "No se pudo cargar el panel del freelancer",
  });
  return data;
}
