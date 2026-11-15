import { apiFetch } from "./client";
import type { PerfilPublico } from "./apiPerfiles";
import type {
  DatosProyectoPortafolio,
  FreelancerProfile,
  PortfolioProject,
  ProfesionalProfileData,
  Review,
  ServicePackage,
} from "../../core/domain/entities/perfilProfesional";

/**
 * Forma real que devuelve el backend actual para un ítem del portafolio.
 * Los campos extendidos (cliente, imágenes, reto, solución, resultado y orden)
 * se declaran como opcionales para que la UI los use cuando el backend amplíe
 * el contrato, sin enviarlos todavía en las peticiones.
 */
export interface PortafolioItemApi {
  id: number;
  freelancerId: number;
  titulo: string;
  descripcion: string | null;
  imagenUrl: string | null;
  enlaceUrl: string | null;
  fechaCreacion: string;
  cliente?: string | null;
  imagenes?: string[] | null;
  reto?: string | null;
  solucion?: string | null;
  resultado?: string | null;
  orden?: number | null;
}

export interface CalificacionApi {
  id: number;
  contratoId: number;
  puntuacion: number;
  comentario: string | null;
  fecha: string;
  cargo?: string | null;
  calificador: {
    id: number;
    nombre: string;
    fotoPerfil: string | null;
  };
  calificado: {
    id: number;
    nombre: string;
    fotoPerfil: string | null;
  };
}

export interface ServicioPublicoApi {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  imagenUrl: string | null;
  estado: string;
  fechaCreacion: string;
  categoria: { id: number; nombre: string } | null;
}

/**
 * Contrato del servicio de perfil profesional.
 * La página consume esta interfaz, no las funciones HTTP directamente, para
 * poder sustituir el adaptador cuando el backend incorpore nuevos endpoints.
 */
export interface PerfilProfesionalApi {
  obtenerPerfil(token: string | undefined, id: number): Promise<ProfesionalProfileData>;
  listarPortafolio(token: string | undefined, id: number, propio: boolean): Promise<PortfolioProject[]>;
  crearProyecto(token: string, datos: DatosProyectoPortafolio): Promise<PortfolioProject>;
  actualizarProyecto(token: string, id: number, datos: DatosProyectoPortafolio): Promise<PortfolioProject>;
  eliminarProyecto(token: string, id: number): Promise<void>;
  listarResenas(token: string | undefined, id: number, limite?: number): Promise<Review[]>;
  listarPaquetes(token: string | undefined, id: number): Promise<ServicePackage[]>;
}

function toFreelancerProfile(perfil: PerfilPublico): FreelancerProfile | null {
  if (!perfil.freelancer) return null;
  const freelancer = perfil.freelancer;

  return {
    id: perfil.id,
    nombre: perfil.nombre,
    foto: perfil.fotoPerfil,
    titular: freelancer.tituloProfesional ?? null,
    propuesta: freelancer.propuesta ?? freelancer.tituloProfesional ?? null,
    ubicacion: freelancer.ubicacion ?? null,
    remoto: Boolean(freelancer.remoto),
    disponibilidad: freelancer.disponibilidad ?? null,
    verificado: Boolean(freelancer.verificado),
    descripcion: freelancer.biografia ?? null,
    habilidades: freelancer.habilidades ?? [],
    idiomas: freelancer.idiomas ?? [],
    tarifaHora: freelancer.tarifaHora ?? null,
    enlaces: freelancer.enlaces ?? {},
    calificacion: freelancer.calificacionPromedio ?? 0,
    totalResenas: perfil.totalResenas ?? 0,
    fechaRegistro: perfil.fechaRegistro,
    rolId: perfil.rolId,
    rolNombre: perfil.rolNombre,
  };
}

function toProfesionalProfile(perfil: PerfilPublico): ProfesionalProfileData {
  return {
    id: perfil.id,
    nombre: perfil.nombre,
    foto: perfil.fotoPerfil,
    rolId: perfil.rolId,
    rolNombre: perfil.rolNombre,
    fechaRegistro: perfil.fechaRegistro,
    freelancer: toFreelancerProfile(perfil),
    cliente: perfil.cliente
      ? {
          id: perfil.id,
          nombre: perfil.nombre,
          foto: perfil.fotoPerfil,
          empresa: perfil.cliente.nombreEmpresa,
          tipoCliente: perfil.cliente.tipoCliente,
          descripcion: perfil.cliente.descripcion,
          fechaRegistro: perfil.fechaRegistro,
          rolId: perfil.rolId,
          rolNombre: perfil.rolNombre,
        }
      : null,
  };
}

function toProject(item: PortafolioItemApi, index: number): PortfolioProject {
  const imagenes = Array.isArray(item.imagenes)
    ? item.imagenes.filter((url) => Boolean(url))
    : item.imagenUrl
      ? [item.imagenUrl]
      : [];

  return {
    id: item.id,
    titulo: item.titulo,
    cliente: item.cliente ?? null,
    portada: item.imagenUrl ?? imagenes[0] ?? null,
    imagenes,
    reto: item.reto ?? null,
    solucion: item.solucion ?? null,
    resultado: item.resultado ?? null,
    enlace: item.enlaceUrl ?? null,
    orden: typeof item.orden === "number" ? item.orden : index,
    descripcion: item.descripcion ?? null,
  };
}

function toReview(calificacion: CalificacionApi): Review {
  return {
    id: calificacion.id,
    contratoId: calificacion.contratoId ?? null,
    texto: calificacion.comentario?.trim() ?? "",
    autor: calificacion.calificador?.nombre ?? "Cliente",
    cargo: calificacion.cargo ?? null,
    calificacion: calificacion.puntuacion,
    fecha: calificacion.fecha,
    fotoAutor: calificacion.calificador?.fotoPerfil ?? null,
  };
}

function toPackage(servicio: ServicioPublicoApi): ServicePackage {
  return {
    id: servicio.id,
    servicioId: servicio.id,
    nivel: null,
    nombre: servicio.titulo,
    descripcion: servicio.descripcion,
    precio: servicio.precio,
    entrega: null,
    revisiones: null,
    imagenUrl: servicio.imagenUrl,
    categoria: servicio.categoria?.nombre ?? null,
    estado: servicio.estado,
  };
}

async function obtenerPerfil(token: string | undefined, id: number): Promise<ProfesionalProfileData> {
  const { data } = await apiFetch<PerfilPublico>({
    method: "GET",
    path: `/usuarios/${id}`,
    token,
    mensajeError: "No se pudo cargar el perfil",
  });
  return toProfesionalProfile(data);
}

async function listarPortafolio(
  token: string | undefined,
  id: number,
  propio: boolean,
): Promise<PortfolioProject[]> {
  const { data } = await apiFetch<{ total: number; items: PortafolioItemApi[] }>({
    method: "GET",
    path: propio ? "/freelancer/portafolio" : `/usuarios/${id}/portafolio`,
    token,
    mensajeError: "No se pudo cargar el portafolio",
  });

  return [...(data.items ?? [])]
    .map(toProject)
    .sort((a, b) => a.orden - b.orden);
}

async function crearProyecto(
  token: string,
  datos: DatosProyectoPortafolio,
): Promise<PortfolioProject> {
  const { data } = await apiFetch<{ mensaje: string; item: PortafolioItemApi }>({
    method: "POST",
    path: "/freelancer/portafolio",
    token,
    body: aPayload(datos),
    mensajeError: "No se pudo agregar el proyecto",
  });
  return toProject(data.item, 0);
}

async function actualizarProyecto(
  token: string,
  id: number,
  datos: DatosProyectoPortafolio,
): Promise<PortfolioProject> {
  const { data } = await apiFetch<{ mensaje: string; item: PortafolioItemApi }>({
    method: "PATCH",
    path: `/freelancer/portafolio/${id}`,
    token,
    body: aPayload(datos),
    mensajeError: "No se pudo actualizar el proyecto",
  });
  return toProject(data.item, 0);
}

async function eliminarProyecto(token: string, id: number): Promise<void> {
  await apiFetch<{ mensaje: string }>({
    method: "DELETE",
    path: `/freelancer/portafolio/${id}`,
    token,
    mensajeError: "No se pudo eliminar el proyecto",
  });
}

async function listarResenas(
  token: string | undefined,
  id: number,
  limite = 20,
): Promise<Review[]> {
  const { data } = await apiFetch<{ total: number; calificaciones: CalificacionApi[] }>({
    method: "GET",
    path: `/usuarios/${id}/calificaciones?limit=${limite}`,
    token,
    mensajeError: "No se pudieron cargar las reseñas",
  });
  return (data.calificaciones ?? []).map(toReview);
}

async function listarPaquetes(
  token: string | undefined,
  id: number,
): Promise<ServicePackage[]> {
  // El backend actual no tiene paquetes: se presentan los servicios activos
  // como la mejor aproximación disponible. Cuando exista /paquetes, solo hay
  // que cambiar esta implementación sin tocar la página.
  const { data } = await apiFetch<{ page: number; limit: number; total: number; items: ServicioPublicoApi[] }>({
    method: "GET",
    path: `/usuarios/${id}/servicios?page=1&limit=50`,
    token,
    mensajeError: "No se pudieron cargar los servicios",
  });
  return (data.items ?? [])
    .filter((servicio) => servicio.estado?.toLowerCase() === "activo")
    .slice(0, 3)
    .map(toPackage);
}

function aPayload(datos: DatosProyectoPortafolio): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const [campo, valor] of Object.entries(datos)) {
    if (valor !== undefined) payload[campo] = valor;
  }
  return payload;
}

export const perfilProfesionalApi: PerfilProfesionalApi = {
  obtenerPerfil,
  listarPortafolio,
  crearProyecto,
  actualizarProyecto,
  eliminarProyecto,
  listarResenas,
  listarPaquetes,
};

export { toProject };
