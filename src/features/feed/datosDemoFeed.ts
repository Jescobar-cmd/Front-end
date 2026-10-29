import type { Categoria } from "../../core/domain/entities/categoria";
import type { PiezaFeed } from "./datosFeed";

/** Catálogo de categorías real (GET /api/categorias) cuando no hay token disponible (preview). */
export const categoriasDemo: Categoria[] = [
  { id: 1, nombre: "Desarrollo web", descripcion: "Web apps, tiendas y APIs a medida." },
  { id: 2, nombre: "Diseño", descripcion: "Branding, UI/UX y diseño editorial." },
  { id: 3, nombre: "Contenido", descripcion: "Redacción, estrategia y contenido digital." },
];

/** Proyectos / oportunidades para el freelancer (se reemplazan con GET /api/... cuando exista el endpoint). */
export const oportunidadesFreelancerDemo: PiezaFeed[] = [
  {
    id: "sitio-tienda",
    categoria: "Desarrollo web",
    titulo: "Sitio web para una tienda independiente",
    descripcion:
      "Buscamos a alguien que convierta nuestro catálogo artesanal en una experiencia de compra clara y rápida.",
    detalle: "Proyecto · Presupuesto por definir",
    etiquetas: ["React", "Diseño responsive", "E-commerce"],
  },
  {
    id: "identidad-cafe",
    categoria: "Diseño",
    titulo: "Identidad visual para una cafetería de barrio",
    descripcion:
      "Queremos una identidad cálida y fácil de aplicar en el local, el empaque y nuestras redes.",
    detalle: "Proyecto · Identidad de marca",
    etiquetas: ["Branding", "Illustrator", "Redes sociales"],
  },
  {
    id: "contenido-lanzamiento",
    categoria: "Contenido",
    titulo: "Contenido para el lanzamiento de una marca",
    descripcion:
      "Ayúdanos a preparar textos y piezas breves para presentar una nueva línea de productos.",
    detalle: "Colaboración · Remota",
    etiquetas: ["Redacción", "Contenido digital", "Lanzamiento"],
  },
];

/** Talento / perfiles para que el cliente explora (se reemplazan con el endpoint de perfiles cuando exista). */
export const perfilesClienteDemo: PiezaFeed[] = [
  {
    id: "ana-diseno",
    categoria: "Diseño",
    titulo: "Ana · Diseño de marca",
    descripcion:
      "Diseñadora enfocada en identidades visuales simples, memorables y listas para crecer con cada negocio.",
    detalle: "Disponible para nuevos proyectos",
    etiquetas: ["Branding", "Diseño editorial", "Figma"],
  },
  {
    id: "mateo-desarrollo",
    categoria: "Desarrollo web",
    titulo: "Mateo · Desarrollo frontend",
    descripcion:
      "Construye interfaces accesibles y responsive con React, cuidando el rendimiento y los detalles.",
    detalle: "Disponible · Trabajo remoto",
    etiquetas: ["React", "TypeScript", "Accesibilidad"],
  },
  {
    id: "lucia-contenido",
    categoria: "Contenido",
    titulo: "Lucía · Estrategia de contenido",
    descripcion:
      "Acompaña a equipos pequeños a encontrar su voz y convertir sus ideas en contenido útil.",
    detalle: "Disponible para colaboraciones",
    etiquetas: ["Redacción", "Estrategia", "Redes sociales"],
  },
];

/* ------------------------------------------------------------------ */
/* Secciones sin endpoint (resumen, avisos, mensajes, publicaciones,  */
/* servicios, trabajos en curso). TODO(endpoint) para reemplazarlas    */
/* cuando exista el endpoint correspondiente.                        */
/* ------------------------------------------------------------------ */

export interface EstadisticaDemo {
  id: string;
  label: string;
  valor: number;
  icono: string;
}

/** TODO(endpoint): falta el endpoint del resumen de actividad (stats del mes) por usuario. */
export const resumenDemo: EstadisticaDemo[] = [
  { id: "proyectos-nuevos", label: "Proyectos nuevos", valor: 2, icono: "▤" },
  { id: "postulaciones", label: "Postulaciones", valor: 5, icono: "◇" },
  { id: "mensajes-nuevos", label: "Mensajes nuevos", valor: 2, icono: "▢" },
];

export interface AvisoDemo {
  id: string;
  avatar: string;
  titulo: string;
  texto: string;
  destino: string;
}

/** TODO(endpoint): falta el endpoint de avisos/notificaciones del usuario. */
export const avisosDemo: AvisoDemo[] = [
  {
    id: "aviso-proyecto",
    avatar: "FG",
    titulo: "Nuevo proyecto recomendado",
    texto: "Hay oportunidades que coinciden con tus habilidades.",
    destino: "#services",
  },
  {
    id: "aviso-actividad",
    avatar: "✳",
    titulo: "Tu actividad está al día",
    texto: "Vuelve pronto para ver nuevas actualizaciones.",
    destino: "#activity",
  },
];

export interface MensajeDemo {
  id: string;
  autor: string;
  texto: string;
}

/** TODO(endpoint): falta el endpoint de mensajes/conversaciones del usuario. */
export const mensajesDemo: MensajeDemo[] = [
  { id: "msg-1", autor: "Mateo · Desarrollo frontend", texto: "Hola, me interesa tu proyecto. ¿Podemos agendar una llamada?" },
  { id: "msg-2", autor: "Lucía · Estrategia de contenido", texto: "Compartí el brief y te mando las propuestas." },
];

export interface PublicacionDemo {
  id: string;
  autor: string;
  titulo: string;
  resumen: string;
}

/** TODO(endpoint): falta el endpoint de publicaciones (blog / actividad). */
export const publicacionesDemo: PublicacionDemo[] = [
  { id: "pub-1", autor: "First Gig", titulo: "Cómo elegir tu primer cliente freelance", resumen: "Guía para freelancers en sus primeros 90 días." },
];

export interface ServicioDemo {
  id: string;
  freelancer: string;
  titulo: string;
  precio: string;
}

/** TODO(endpoint): falta el endpoint de servicios (catálogo Fiverr-style del freelancer). */
export const serviciosDemo: ServicioDemo[] = [
  { id: "svc-1", freelancer: "Mateo · Desarrollo frontend", titulo: "Landing page + integración", precio: "$ 850" },
];

export interface TrabajoEnCursoDemo {
  id: string;
  proyecto: string;
  freelancer: string;
  estado: string;
  progreso: number;
}

/** TODO(endpoint): falta el endpoint de trabajos en curso / contratos activos. */
export const trabajosEnCursoDemo: TrabajoEnCursoDemo[] = [
  { id: "proyecto-1", proyecto: "Sitio web para una tienda independiente", freelancer: "Diseño · Desarrollo web", estado: "en_progreso", progreso: 40 },
];
