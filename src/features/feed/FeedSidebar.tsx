export interface ItemSidebar {
  id: string;
  icono: string;
  label: string;
  href: string;
}

interface FeedSidebarProps {
  esFreelancer: boolean;
  activo?: string;
}

function itemsPorRol(esFreelancer: boolean): ItemSidebar[] {
  if (esFreelancer) {
    return [
      { id: "inicio", icono: "⌂", label: "Inicio", href: "/dashboard/freelancer" },
      { id: "marketplace", icono: "⌕", label: "Explorar proyectos", href: "/dashboard/freelancer/ofertas" },
      { id: "propuestas", icono: "◇", label: "Mis postulaciones", href: "/dashboard/freelancer/ofertas" },
      { id: "servicios", icono: "＋", label: "Mis servicios", href: "/dashboard/freelancer/servicios" },
      { id: "chat", icono: "▤", label: "Mensajes", href: "/chat" },
      { id: "contratos", icono: "▦", label: "Contratos", href: "/contracts" },
      { id: "perfil", icono: "◉", label: "Mi perfil", href: "/perfil/freelancer" },
    ];
  }
  return [
    { id: "inicio", icono: "⌂", label: "Inicio", href: "/dashboard/cliente" },
    { id: "servicios", icono: "⌕", label: "Explorar servicios", href: "/servicios" },
    { id: "ofertas", icono: "＋", label: "Mis proyectos", href: "/dashboard/cliente/ofertas" },
    { id: "chat", icono: "▤", label: "Mensajes", href: "/chat" },
    { id: "contratos", icono: "▦", label: "Contratos", href: "/contracts" },
    { id: "perfil", icono: "◉", label: "Mi perfil", href: "/perfil/cliente" },
  ];
}

export function FeedSidebar({ esFreelancer, activo }: FeedSidebarProps) {
  const items = itemsPorRol(esFreelancer);

  return (
    <aside className="feed-sidebar" aria-label="Navegación principal">
      <p className="feed-sidebar__label">MI ESPACIO</p>
      <nav>
        {items.map((item) => (
          <a key={`${item.id}-${item.label}`} href={item.href} className={activo === item.id ? "is-current" : undefined}>
            <span aria-hidden="true">{item.icono}</span>
            {item.label}
          </a>
        ))}
      </nav>
      <div className="feed-sidebar__help">
        <span aria-hidden="true">?</span>
        <strong>¿Necesitas una mano?</strong>
        <p>Estamos aquí para ayudarte a dar el siguiente paso.</p>
        <a href="#notices">Centro de ayuda ↗</a>
      </div>
      <span className="feed-sidebar__copyright">© 2026 First Gig</span>
    </aside>
  );
}
