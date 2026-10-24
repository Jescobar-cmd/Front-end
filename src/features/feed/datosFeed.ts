export type TipoCuentaFeed = "cliente" | "freelancer";

export interface PiezaFeed {
  id: string;
  categoria: string;
  titulo: string;
  descripcion: string;
  detalle: string;
  etiquetas: string[];
  imagenUrl?: string;
}

const oportunidadesFreelancer: PiezaFeed[] = [
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

const perfilesCliente: PiezaFeed[] = [
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

const mostrarEjemplos =
  import.meta.env.DEV || import.meta.env.VITE_MOSTRAR_EJEMPLOS === "true";

export function obtenerPiezasFeed(tipoCuenta: TipoCuentaFeed): PiezaFeed[] {
  if (!mostrarEjemplos) return [];
  return tipoCuenta === "freelancer" ? oportunidadesFreelancer : perfilesCliente;
}
