import type { NivelHabilidad } from "./perfil";

/** Enlaces sociales que el freelancer puede mostrar en su portafolio. */
export interface EnlacesProfesionales {
  linkedin?: string | null;
  behance?: string | null;
  github?: string | null;
  instagram?: string | null;
  sitioWeb?: string | null;
}

export interface HabilidadProfesional {
  id: number;
  nombre: string;
  nivel: NivelHabilidad | null;
}

/**
 * Modelo de presentación del perfil profesional.
 * El backend actual expone solo una parte de estos campos; los opcionales se
 * mantienen aquí para que la interfaz quede lista cuando la API los incorpore.
 */
export interface FreelancerProfile {
  id: number;
  nombre: string;
  foto: string | null;
  titular: string | null;
  propuesta: string | null;
  ubicacion: string | null;
  remoto: boolean;
  disponibilidad: string | null;
  verificado: boolean;
  descripcion: string | null;
  habilidades: HabilidadProfesional[];
  idiomas: string[];
  tarifaHora: number | null;
  enlaces: EnlacesProfesionales;
  calificacion: number;
  totalResenas: number;
  fechaRegistro: string;
  rolId: number;
  rolNombre: string;
}

export interface ClienteProfile {
  id: number;
  nombre: string;
  foto: string | null;
  empresa: string | null;
  tipoCliente: string | null;
  descripcion: string | null;
  fechaRegistro: string;
  rolId: number;
  rolNombre: string;
}

/** Resultado normalizado de GET /api/usuarios/:id. */
export interface ProfesionalProfileData {
  id: number;
  nombre: string;
  foto: string | null;
  rolId: number;
  rolNombre: string;
  fechaRegistro: string;
  freelancer: FreelancerProfile | null;
  cliente: ClienteProfile | null;
}

export interface PortfolioProject {
  id: number;
  titulo: string;
  cliente: string | null;
  portada: string | null;
  imagenes: string[];
  reto: string | null;
  solucion: string | null;
  resultado: string | null;
  enlace: string | null;
  orden: number;
  descripcion: string | null;
}

/**
 * Paquete de servicio.
 * El backend actual solo maneja un precio único por servicio; `nivel`,
 * `entrega` y `revisiones` se muestran cuando la API de paquetes exista.
 */
export interface ServicePackage {
  id: number;
  servicioId: number;
  nivel: "basico" | "estandar" | "premium" | null;
  nombre: string;
  descripcion: string;
  precio: number;
  entrega: string | null;
  revisiones: number | null;
  imagenUrl: string | null;
  categoria: string | null;
  estado: string;
}

export interface Review {
  id: number;
  contratoId: number | null;
  texto: string;
  autor: string;
  cargo: string | null;
  calificacion: number;
  fecha: string;
  fotoAutor: string | null;
}

export interface DatosProyectoPortafolio {
  titulo: string;
  descripcion?: string | null;
  imagenUrl?: string | null;
  enlaceUrl?: string | null;
}

export type ProfileSectionId = "portafolio" | "servicios" | "resenas" | "sobre-mi";
