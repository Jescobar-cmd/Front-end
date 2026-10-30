import { apiFetch } from "./client";
import type { DatosOferta, EstadoOferta, FiltrosOferta, Oferta, OfertaPaginada } from "../../core/domain/entities/oferta";
import type { Contrato } from "./apiContratos";

export interface ClienteOferta {
  id: number;
  nombre: string;
  fotoPerfil: string | null;
  nombreEmpresa: string | null;
}

export interface OfertaMarketplace extends Oferta {
  cliente: ClienteOferta;
}

export interface OfertaMarketplacePaginada {
  page: number;
  limit: number;
  total: number;
  items: OfertaMarketplace[];
}

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

export interface RespuestaAccionPropuesta {
  mensaje: string;
  contrato?: Contrato;
}

export interface DatosPropuesta {
  montoPropuesto: number;
  mensaje?: string;
}

function aPayload(datos: Record<string, unknown>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const [campo, valor] of Object.entries(datos)) {
    if (valor !== undefined) {
      payload[campo] = valor;
    }
  }
  return payload;
}

interface FiltrosMarketOferta {
  page?: number;
  limit?: number;
  categoriaId?: number;
  q?: string;
}

/**
 * Módulo de API — Ofertas y propuestas.
 * Backend: /api/cliente/ofertas*, /api/ofertas*, /api/ofertas/:id/propuestas,
 *         /api/cliente/ofertas/:id/propuestas*
 */

export async function createOffer(token: string, datos: DatosOferta): Promise<{ mensaje: string; oferta: Oferta }> {
  const { data } = await apiFetch<{ mensaje: string; oferta: Oferta }>({
    method: "POST",
    path: "/cliente/ofertas",
    token,
    body: aPayload(datos as Record<string, unknown>),
    mensajeError: "No se pudo crear la oferta",
  });
  return data;
}

export async function getMyOffers(
  token: string,
  filtros: FiltrosOferta = { page: 1, limit: 20 },
): Promise<OfertaPaginada> {
  const params = new URLSearchParams({
    page: String(filtros.page),
    limit: String(filtros.limit),
  });
  if (filtros.estado) params.set("estado", filtros.estado);
  if (filtros.texto) params.set("q", filtros.texto);

  const { data } = await apiFetch<OfertaPaginada>({
    method: "GET",
    path: `/cliente/ofertas?${params.toString()}`,
    token,
    mensajeError: "No se pudo cargar las ofertas",
  });
  return data;
}

export async function getMyOffer(token: string, id: number): Promise<Oferta> {
  const { data } = await apiFetch<Oferta>({
    method: "GET",
    path: `/cliente/ofertas/${id}`,
    token,
    mensajeError: "No se pudo cargar la oferta",
  });
  return data;
}

export async function updateOffer(token: string, id: number, datos: DatosOferta): Promise<{ mensaje: string; oferta: Oferta }> {
  const { data } = await apiFetch<{ mensaje: string; oferta: Oferta }>({
    method: "PATCH",
    path: `/cliente/ofertas/${id}`,
    token,
    body: aPayload(datos as Record<string, unknown>),
    mensajeError: "No se pudo actualizar la oferta",
  });
  return data;
}

export async function changeOfferStatus(token: string, id: number, estado: EstadoOferta): Promise<{ mensaje: string; oferta: Oferta }> {
  const { data } = await apiFetch<{ mensaje: string; oferta: Oferta }>({
    method: "PATCH",
    path: `/cliente/ofertas/${id}/estado`,
    token,
    body: { estado },
    mensajeError: "No se pudo actualizar el estado de la oferta",
  });
  return data;
}

export async function getOfferProposals(token: string, ofertaId: number): Promise<{ total: number; propuestas: Propuesta[] }> {
  const { data } = await apiFetch<{ total: number; propuestas: Propuesta[] }>({
    method: "GET",
    path: `/cliente/ofertas/${ofertaId}/propuestas`,
    token,
    mensajeError: "No se pudieron cargar las propuestas",
  });
  return data;
}

export async function acceptProposal(token: string, ofertaId: number, propuestaId: number): Promise<RespuestaAccionPropuesta> {
  const { data } = await apiFetch<RespuestaAccionPropuesta>({
    method: "POST",
    path: `/cliente/ofertas/${ofertaId}/propuestas/${propuestaId}/aceptar`,
    token,
    mensajeError: "No se pudo aceptar la propuesta",
  });
  return data;
}

export async function rejectProposal(token: string, ofertaId: number, propuestaId: number): Promise<{ mensaje: string }> {
  const { data } = await apiFetch<{ mensaje: string }>({
    method: "POST",
    path: `/cliente/ofertas/${ofertaId}/propuestas/${propuestaId}/rechazar`,
    token,
    mensajeError: "No se pudo rechazar la propuesta",
  });
  return data;
}

export async function getMyProposals(token: string): Promise<{ total: number; propuestas: Propuesta[] }> {
  const { data } = await apiFetch<{ total: number; propuestas: Propuesta[] }>({
    method: "GET",
    path: "/freelancer/propuestas",
    token,
    mensajeError: "No se pudieron cargar las propuestas",
  });
  return data;
}

export async function getMarketOffers(
  token: string,
  filtros: FiltrosMarketOferta = {},
): Promise<OfertaMarketplacePaginada> {
  const params = new URLSearchParams({
    page: String(filtros.page ?? 1),
    limit: String(filtros.limit ?? 30),
  });
  if (filtros.categoriaId) params.set("categoriaId", String(filtros.categoriaId));
  if (filtros.q) params.set("q", filtros.q);

  const { data } = await apiFetch<OfertaMarketplacePaginada>({
    method: "GET",
    path: `/ofertas?${params.toString()}`,
    token,
    mensajeError: "No se pudo cargar las ofertas",
  });
  return data;
}

export async function getMarketOffer(token: string, id: number): Promise<OfertaMarketplace> {
  const { data } = await apiFetch<OfertaMarketplace>({
    method: "GET",
    path: `/ofertas/${id}`,
    token,
    mensajeError: "No se pudo cargar la oferta",
  });
  return data;
}

export async function sendProposal(token: string, ofertaId: number, datos: DatosPropuesta): Promise<{ mensaje: string; propuesta: Propuesta }> {
  const { data } = await apiFetch<{ mensaje: string; propuesta: Propuesta }>({
    method: "POST",
    path: `/ofertas/${ofertaId}/propuestas`,
    token,
    body: datos,
    mensajeError: "No se pudo enviar la propuesta",
  });
  return data;
}
