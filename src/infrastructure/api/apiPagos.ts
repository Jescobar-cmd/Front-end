import { apiFetch } from "./client";

/**
 * Módulo de API — Pagos escrow del contrato.
 * Backend: POST /api/contratos/:id/pago/preferencia
 *          GET  /api/contratos/:id/pago
 *          POST /api/contratos/:id/pago/simular (solo desarrollo)
 */

export type EstadoPagoEscrow = "pendiente" | "retenido" | "liberado" | "reembolsado";

export interface PagoEscrow {
  id: number;
  contratoId: number;
  /** Total cobrado al cliente, incluye la comisión de servicio. */
  monto: number;
  estado: EstadoPagoEscrow;
  metodoPago: string | null;
  referenciaPasarela: string | null;
  preferenciaId: string | null;
  fechaPago: string;
}

export interface FacturaSandbox {
  id: number;
  numeroFactura: string | null;
  /** Identificador académico. No es un CUFE emitido por DIAN. */
  uuidDemo: string | null;
  cufe: string | null;
  ambiente: "sandbox";
  moneda: string;
  subtotal: number;
  comisionCliente: number;
  total: number;
  descripcion: string | null;
  compradorNombre: string | null;
  compradorDocumento: string | null;
  fechaEmision: string | null;
  estado: string;
  urlPdf: string | null;
}

export interface PagoConFactura extends PagoEscrow {
  montoBase: number;
  comisionCliente: number;
  contrato: { id: number; titulo: string; estado: string };
  factura: FacturaSandbox | null;
}

export interface PreferenciaPago {
  preferenciaId: string;
  /** URL de Mercado Pago Checkout Pro, o de la pasarela simulada en desarrollo. */
  initPoint: string;
  monto: number;
  /** true cuando el backend usa la pasarela simulada (sin MERCADOPAGO_ACCESS_TOKEN). */
  simulado: boolean;
}

export async function iniciarPagoContrato(token: string, contratoId: number): Promise<PreferenciaPago> {
  const { data } = await apiFetch<PreferenciaPago>({
    method: "POST",
    path: `/contratos/${contratoId}/pago/preferencia`,
    token,
    mensajeError: "No se pudo iniciar el pago",
  });
  return data;
}

export async function consultarPagoContrato(token: string, contratoId: number): Promise<PagoEscrow | null> {
  const { data } = await apiFetch<{ pago: PagoEscrow | null }>({
    method: "GET",
    path: `/contratos/${contratoId}/pago`,
    token,
    mensajeError: "No se pudo consultar el pago",
  });
  return data.pago;
}

export async function simularPagoContrato(token: string, contratoId: number): Promise<{ mensaje: string; pago: PagoEscrow }> {
  const { data } = await apiFetch<{ mensaje: string; pago: PagoEscrow }>({
    method: "POST",
    path: `/contratos/${contratoId}/pago/simular`,
    token,
    mensajeError: "No se pudo simular el pago",
  });
  return data;
}

export async function listarPagosConFacturas(
  token: string,
  rol: "cliente" | "freelancer",
): Promise<PagoConFactura[]> {
  const path = rol === "cliente" ? "/cliente/pagos" : "/freelancer/pagos";
  const { data } = await apiFetch<{ total: number; pagos: PagoConFactura[] }>({
    method: "GET",
    path,
    token,
    mensajeError: "No se pudieron cargar los comprobantes",
  });
  return data.pagos;
}
