import type { Oferta } from "../../core/domain/entities/oferta";
import { perfilesClienteDemo, oportunidadesFreelancerDemo } from "./datosDemoFeed";

export type TipoCuentaFeed = "cliente" | "freelancer";

export interface PiezaFeed {
  id: string;
  categoria: string;
  titulo: string;
  descripcion: string;
  detalle: string;
  etiquetas: string[];
  imagenUrl?: string;
  /** Número de postulaciones recibidas (solo para proyectos propios del cliente). */
  postulaciones?: number;
}

export type ProyectoDisponible = Omit<PiezaFeed, "postulaciones">;
export type ProyectoCliente = PiezaFeed & { postulaciones: number };

export const MOSTRAR_EJEMPLOS = import.meta.env.VITE_MOSTRAR_EJEMPLOS === "true";

/**
 * Convierte una oferta del backend (Proyecto) al formato de pieza del feed.
 */
export function ofertaAPieza(oferta: Oferta): ProyectoCliente {
  return {
    id: String(oferta.id),
    categoria: oferta.categoria?.nombre ?? "General",
    titulo: oferta.titulo,
    descripcion: oferta.descripcion,
    detalle: `Proyecto · ${oferta.estado}`,
    etiquetas: oferta.habilidades.map((habilidad) => habilidad.nombre),
    imagenUrl: oferta.imagenUrl ?? undefined,
    postulaciones: oferta.totalPropuestas,
  };
}

/**
 * Proyectos / oportunidades para el freelancer.
 * TODO(endpoint): reemplazar por el endpoint de listado de oportunidades para freelancers.
 */
export function obtenerProyectosParaFreelancer(incluirEjemplos = MOSTRAR_EJEMPLOS): PiezaFeed[] {
  if (!incluirEjemplos) return [];
  return oportunidadesFreelancerDemo;
}

/**
 * Talento / perfiles para que el cliente explora.
 * TODO(endpoint): reemplazar por el endpoint de perfiles públicos / talento.
 */
export function obtenerTalentoParaExplorar(incluirEjemplos = MOSTRAR_EJEMPLOS): PiezaFeed[] {
  if (!incluirEjemplos) return [];
  return perfilesClienteDemo;
}
