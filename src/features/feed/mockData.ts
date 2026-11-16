import type { Oferta } from "../../core/domain/entities/oferta";
import type { Publicacion, AutorPublicacion } from "../../infrastructure/api/apiPublicaciones";

export const AUTORES_MOCK: AutorPublicacion[] = [
  { id: 1, nombre: "María González", fotoPerfil: null, rol: 2 },
  { id: 2, nombre: "Carlos Ruiz", fotoPerfil: null, rol: 2 },
  { id: 3, nombre: "Ana López", fotoPerfil: null, rol: 2 },
  { id: 4, nombre: "Diego Martínez", fotoPerfil: null, rol: 3 },
  { id: 5, nombre: "Laura Sánchez", fotoPerfil: null, rol: 2 },
  { id: 6, nombre: "Roberto Jiménez", fotoPerfil: null, rol: 3 },
];

export const OFERTAS_MOCK: Oferta[] = [
  {
    id: 1,
    titulo: "Desarrollo de e-commerce completo con React y Node.js",
    descripcion: "Necesito una tienda online completa con carrito de compras, pasarela de pagos (Stripe), panel de administración, gestión de inventario y envíos. Diseño responsive obligatorio. SEO on-page incluido.",
    presupuesto: 3500,
    plazoDias: 45,
    estado: "abierto",
    imagenUrl: null,
    fechaPublicacion: "2026-11-10T09:00:00Z",
    categoria: { id: 3, nombre: "Desarrollo web" },
    habilidades: [
      { id: 1, nombre: "React" },
      { id: 2, nombre: "Node.js" },
      { id: 3, nombre: "PostgreSQL" },
      { id: 4, nombre: "Stripe" },
    ],
    totalPropuestas: 12,
  },
  {
    id: 2,
    titulo: "App móvil de delivery para restaurantes (iOS + Android)",
    descripcion: "App nativa multiplataforma para pedidos a domicilio. Mapa en tiempo real, notificaciones push, chat cliente-repartidor, pagos integrados, panel de métricas para el admin. Experiencia previa en delivery requerida.",
    presupuesto: 8500,
    plazoDias: 90,
    estado: "abierto",
    imagenUrl: null,
    fechaPublicacion: "2026-11-08T14:30:00Z",
    categoria: { id: 1, nombre: "Aplicaciones móviles" },
    habilidades: [
      { id: 5, nombre: "React Native" },
      { id: 6, nombre: "TypeScript" },
      { id: 7, nombre: "Firebase" },
      { id: 8, nombre: "Google Maps API" },
    ],
    totalPropuestas: 8,
  },
  {
    id: 3,
    titulo: "Rediseño de identidad visual y brandbook para startup fintech",
    descripcion: "Buscamos diseñador senior para rebranding completo: logo, paleta, tipografía, iconografía, guía de estilo (brandbook), plantillas para redes, papelería y assets para web/app. Entregables en Figma.",
    presupuesto: 2200,
    plazoDias: 30,
    estado: "abierto",
    imagenUrl: null,
    fechaPublicacion: "2026-11-05T11:00:00Z",
    categoria: { id: 4, nombre: "Diseño gráfico" },
    habilidades: [
      { id: 9, nombre: "Figma" },
      { id: 10, nombre: "Branding" },
      { id: 11, nombre: "Illustrator" },
      { id: 12, nombre: "Diseño de sistemas" },
    ],
    totalPropuestas: 15,
  },
  {
    id: 4,
    titulo: "Estrategia SEO y contenido para blog tecnológico B2B",
    descripcion: "Plan de 6 meses: auditoría técnica, keyword research, calendario editorial (24 artículos), redacción optimizada, link building, informes mensuales. Nicho: SaaS para empresas. Experiencia en sector tech obligatoria.",
    presupuesto: 1800,
    plazoDias: 180,
    estado: "abierto",
    imagenUrl: null,
    fechaPublicacion: "2026-11-03T16:45:00Z",
    categoria: { id: 5, nombre: "Marketing digital" },
    habilidades: [
      { id: 13, nombre: "SEO" },
      { id: 14, nombre: "Copywriting" },
      { id: 15, nombre: "Ahrefs/SEMrush" },
      { id: 16, nombre: "Google Analytics" },
    ],
    totalPropuestas: 9,
  },
  {
    id: 5,
    titulo: "Dashboard analítico en Power BI para área comercial",
    descripcion: "Dashboard ejecutivo con KPIs de ventas: funnel, conversión, ticket medio, churn, LTV, cohortes. Fuente de datos: PostgreSQL + CSV. 5 páginas, filtros dinámicos, alertas por umbrales, publicación en Power BI Service.",
    presupuesto: 1500,
    plazoDias: 21,
    estado: "abierto",
    imagenUrl: null,
    fechaPublicacion: "2026-11-01T10:00:00Z",
    categoria: { id: 2, nombre: "Datos y análisis" },
    habilidades: [
      { id: 17, nombre: "Power BI" },
      { id: 18, nombre: "DAX" },
      { id: 19, nombre: "SQL" },
      { id: 20, nombre: "Modelado de datos" },
    ],
    totalPropuestas: 6,
  },
  {
    id: 6,
    titulo: "Migración de legado PHP a Laravel 11 + API REST",
    descripcion: "Sistema interno de gestión (CRM ligero) en PHP 5.6 spaghetti code. Migración completa a Laravel 11: modelos, migraciones, seeders, policies, resources, tests. API REST versionada para futura app móvil. Deploy en AWS.",
    presupuesto: 4200,
    plazoDias: 60,
    estado: "en_progreso",
    imagenUrl: null,
    fechaPublicacion: "2026-10-25T09:00:00Z",
    categoria: { id: 3, nombre: "Desarrollo web" },
    habilidades: [
      { id: 21, nombre: "Laravel" },
      { id: 22, nombre: "PHP 8.3" },
      { id: 23, nombre: "MySQL" },
      { id: 24, nombre: "Docker" },
    ],
    totalPropuestas: 0,
  },
  {
    id: 7,
    titulo: "Animación 3D explicativa para producto SaaS (90 seg)",
    descripcion: "Video animado estilo motion graphics 3D para landing page. Guion proporcionado (90 seg). Estilo clean, colores de marca, voiceover en español neutro. Entregables: MP4 4K, versión 15s para ads, fuentes en Blender/After Effects.",
    presupuesto: 1200,
    plazoDias: 25,
    estado: "abierto",
    imagenUrl: null,
    fechaPublicacion: "2026-10-28T12:00:00Z",
    categoria: { id: 8, nombre: "Video y animación" },
    habilidades: [
      { id: 25, nombre: "Blender" },
      { id: 26, nombre: "After Effects" },
      { id: 27, nombre: "Motion Graphics" },
      { id: 28, nombre: "Premiere" },
    ],
    totalPropuestas: 11,
  },
  {
    id: 8,
    titulo: "Redacción técnica: documentación API para desarrolladores",
    descripcion: "Documentar API REST (OpenAPI 3.1) de plataforma de pagos: endpoints, parámetros, ejemplos de request/response, códigos de error, guías de integración, SDKs. Público: devs. Herramientas: Redoc/Swagger UI, Markdown, GitBook.",
    presupuesto: 900,
    plazoDias: 20,
    estado: "abierto",
    imagenUrl: null,
    fechaPublicacion: "2026-10-22T15:00:00Z",
    categoria: { id: 6, nombre: "Redacción y contenido" },
    habilidades: [
      { id: 29, nombre: "Redacción técnica" },
      { id: 30, nombre: "OpenAPI/Swagger" },
      { id: 31, nombre: "Markdown" },
      { id: 32, nombre: "Postman" },
    ],
    totalPropuestas: 7,
  },
  {
    id: 9,
    titulo: "Soporte DevOps: CI/CD, Kubernetes, observabilidad",
    descripcion: "Contrato mensual (retainer) para: pipelines GitLab CI/CD, clúster GKE, Helm charts, Prometheus/Grafana/Loki, logging centralizado, alertas, disaster recovery, optimización de costes cloud. Disponibilidad 20h/semana.",
    presupuesto: 2500,
    plazoDias: 30,
    estado: "abierto",
    imagenUrl: null,
    fechaPublicacion: "2026-10-20T10:00:00Z",
    categoria: { id: 7, nombre: "Soporte técnico" },
    habilidades: [
      { id: 33, nombre: "Kubernetes" },
      { id: 34, nombre: "Terraform" },
      { id: 35, nombre: "Prometheus/Grafana" },
      { id: 36, nombre: "GitLab CI" },
    ],
    totalPropuestas: 4,
  },
  {
    id: 10,
    titulo: "Marketplace de servicios: MVP en 8 semanas",
    descripcion: "Plataforma tipo Fiverr/Upwork simplificada: registro, perfiles, publicación de servicios, búsqueda con filtros, chat, contratos, pagos simulados, panel admin. Stack: Next.js 14, NestJS, PostgreSQL, Redis, Docker. Deploy en Vercel + Railway.",
    presupuesto: 6000,
    plazoDias: 56,
    estado: "abierto",
    imagenUrl: null,
    fechaPublicacion: "2026-10-18T08:00:00Z",
    categoria: { id: 3, nombre: "Desarrollo web" },
    habilidades: [
      { id: 37, nombre: "Next.js" },
      { id: 38, nombre: "NestJS" },
      { id: 39, nombre: "PostgreSQL" },
      { id: 40, nombre: "TypeScript" },
    ],
    totalPropuestas: 18,
  },
];

export const PUBLICACIONES_MOCK: Publicacion[] = [
  {
    id: 1,
    autor: { id: 1, nombre: "María González", fotoPerfil: null, rol: 2 },
    titulo: "Cómo cobrar lo que vales como freelancer sin perder clientes",
    contenido: "Durante años cometí el error de competir por precio. Bajaba mis tarifas para ganar proyectos y terminaba quemada, trabajando el doble por la mitad. El cambio llegó cuando entendí que los clientes no compran horas, compran resultados.\n\nAhora estructuro mis propuestas en paquetes de valor: \"Entrega X resultado en Y tiempo con Z garantía\". El precio deja de ser el foco y la conversación gira en torno al ROI.\n\nTres claves que me funcionaron:\n1. Define tu mínimo viable (el suelo que no cruzas)\n2. Calcula tu tarifa por valor, no por hora\n3. Ofrece opciones: básico / profesional / premium\n\n¿Cuál ha sido tu mayor aprendizaje poniendo precio a tu trabajo?",
    imagenUrl: null,
    fechaPublicacion: "2026-11-12T08:00:00Z",
    likes: { total: 47, meGusta: false },
  },
  {
    id: 2,
    autor: { id: 2, nombre: "Carlos Ruiz", fotoPerfil: null, rol: 2 },
    titulo: "De junior a senior: lo que nadie te dice sobre la curva de aprendizaje",
    contenido: "Todos esperan una línea recta: aprendes → practicas → dominas. La realidad es una montaña rusa.\n\nFase 1: «Esto es fácil» (síndrome de Dunning-Kruger)\nFase 2: «No sé nada» (valle de la desesperación)\nFase 3: «Empiezo a ver patrones» (competencia consciente)\nFase 4: «Lo hago sin pensarlo» (maestría)\n\nLo que acelera el paso de la fase 2 a la 3:\n- Code reviews constantes (aunque duela)\n- Enseñar a otros (obliga a estructurar conocimiento)\n- Leer código open source de calidad\n- Tener un mentor que te diga «esto está mal y por qué\"\n\n¿En qué fase te sientes ahora?",
    imagenUrl: null,
    fechaPublicacion: "2026-11-09T10:30:00Z",
    likes: { total: 89, meGusta: false },
  },
  {
    id: 3,
    autor: { id: 3, nombre: "Ana López", fotoPerfil: null, rol: 2 },
    titulo: "Herramientas que uso para gestionar 5 clientes simultáneos sin morir en el intento",
    contenido: "La clave no es trabajar más horas, es tener sistemas que eliminen decisiones triviales.\n\nMi stack:\n📅 **Calendario**: Google Calendar + time blocking (bloques de 90 min deep work)\n📋 **Gestión**: Notion (tableros Kanban por cliente + base de conocimiento)\n⏱ **Time tracking**: Toggl (solo para facturar, no para controlar)\n💬 **Comunicación**: Slack (canales por proyecto) + Loom (async video updates)\n📄 **Documentos**: Notion + Google Drive (plantillas estandarizadas)\n💰 **Facturación**: Holded (automatizado, envía recordatorios)\n\nRegla de oro: si una tarea se repite 3 veces, la automatizo o la delego.\n\n¿Qué herramienta te cambió la vida?",
    imagenUrl: null,
    fechaPublicacion: "2026-11-06T14:00:00Z",
    likes: { total: 63, meGusta: false },
  },
  {
    id: 4,
    autor: { id: 4, nombre: "Diego Martínez", fotoPerfil: null, rol: 3 },
    titulo: "Qué busco realmente cuando contrato a un freelancer (perspectiva de cliente)",
    contenido: "He contratado +50 freelancers en 3 años. Esto es lo que separa a los que repito de los que no:\n\n✅ **Comunicación proactiva**: Me avisan de riesgos ANTES de que sean problemas. \"Esto va a tardar 2 días más porque X\" vale oro.\n✅ **Entregas iterativas**: No desaparecen 3 semanas. Ven progreso cada 2-3 días.\n✅ **Preguntan el «porqué»**: Entienden el negocio, no solo la tarea técnica.\n✅ **Documentan**: Me dejan código/documentación que yo (o otro) pueda mantener.\n\n❌ Lo que me hace no volver a contratar: desaparecer, excusas sin solución, código espagueti sin tests, no cumplir lo prometido.\n\nFreelancers: ¿qué os hace elegir a un cliente para repetir?",
    imagenUrl: null,
    fechaPublicacion: "2026-11-02T11:00:00Z",
    likes: { total: 156, meGusta: false },
  },
  {
    id: 5,
    autor: { id: 5, nombre: "Laura Sánchez", fotoPerfil: null, rol: 2 },
    titulo: "Burnout en freelancers: señales de alarma y cómo frenar a tiempo",
    contenido: "El burnout no llega de golpe. Susurra meses antes de gritar.\n\nSeñales que ignoré:\n- Despertar cansado tras 8h de sueño\n- Irritabilidad con clientes/proyectos que antes me gustaban\n- Procrastinación extrema (doomscrolling en lugar de trabajar)\n- Dolor de cabeza/cuello constante\n- Sensación de «nunca es suficiente\"\n\nLo que hice:\n1. **Stop total** 2 semanas (sin culpa, avisando a clientes)\n2. **Revisión de cargas**: eliminé 30% de proyectos, subí precios 40%\n3. **Rutinas no negociables**: deporte, sueño, límites de horario\n4. **Red de apoyo**: terapeuta + grupo de freelancers\n\nSi te sientes identificado, para YA. Tu salud no tiene precio.\n\nRecursos: burnoutindex.org, freelancersaludmental.es",
    imagenUrl: null,
    fechaPublicacion: "2026-10-28T09:00:00Z",
    likes: { total: 203, meGusta: false },
  },
  {
    id: 6,
    autor: { id: 6, nombre: "Roberto Jiménez", fotoPerfil: null, rol: 3 },
    titulo: "Errores comunes al publicar un proyecto y cómo evitarlos",
    contenido: "Como cliente, he publicado decenas de proyectos. Estos errores me costaron tiempo y dinero:\n\n1. **Brief vago**: \"Quiero una web bonita\" → Resulta en 10 propuestas irrelevantes.\n   ✅ Solución: Objetivos, usuarios, referencias, funcionalidades, no negociables.\n\n2. **Presupuesto irreales**: 500€ por un e-commerce completo.\n   ✅ Solución: Investiga rangos de mercado antes de publicar.\n\n3. **Plazos imposibles**: \"Para ayer\".\n   ✅ Solución: Añade 30% buffer. La calidad requiere tiempo.\n\n4. **No definir criterios de aceptación**: ¿Cuándo está «terminado»?\n   ✅ Solución: Lista de checkpoints medibles (tests, rendimiento, diseño).\n\n5. **Ignorar el portfolio**: Contratar por precio, no por fit.\n   ✅ Solución: Revisa trabajos previos, pide referencias, haz test pequeño pagado.\n\nUna buena publicación atrae a los mejores. Una mala, a los más baratos.",
    imagenUrl: null,
    fechaPublicacion: "2026-10-25T16:00:00Z",
    likes: { total: 78, meGusta: false },
  },
];

export function getOfertasMock(filtro?: { categoria?: string; estado?: string }): Oferta[] {
  let resultado = [...OFERTAS_MOCK];
  if (filtro?.categoria) {
    resultado = resultado.filter((o) => o.categoria?.nombre === filtro.categoria);
  }
  if (filtro?.estado) {
    resultado = resultado.filter((o) => o.estado === filtro.estado);
  }
  return resultado;
}

export function getPublicacionesMock(): Publicacion[] {
  return [...PUBLICACIONES_MOCK].sort(
    (a, b) => new Date(b.fechaPublicacion).getTime() - new Date(a.fechaPublicacion).getTime()
  );
}

export function getOfertaMockById(id: number): Oferta | undefined {
  return OFERTAS_MOCK.find((o) => o.id === id);
}

export function getPublicacionMockById(id: number): Publicacion | undefined {
  return PUBLICACIONES_MOCK.find((p) => p.id === id);
}