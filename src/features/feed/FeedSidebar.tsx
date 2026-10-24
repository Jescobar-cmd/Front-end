export interface ItemSidebar {
  id: string;
  icono: string;
  label: string;
}

interface FeedSidebarProps {
  esFreelancer: boolean;
  activo?: string;
}

function itemsPorRol(esFreelancer: boolean): ItemSidebar[] {
  if (esFreelancer) {
    return [
      { id: "inicio", icono: "⌂", label: "Inicio" },
      { id: "services", icono: "⌕", label: "Buscar proyectos" },
      { id: "activity", icono: "◇", label: "Mis postulaciones" },
      { id: "summary", icono: "▦", label: "Estadísticas" },
      { id: "services", icono: "＋", label: "Explorar ofertas" },
    ];
  }
  return [
    { id: "inicio", icono: "⌂", label: "Inicio" },
    { id: "services", icono: "⌕", label: "Explorar talento" },
    { id: "activity", icono: "▤", label: "Mis proyectos" },
    { id: "summary", icono: "▦", label: "Estadísticas" },
    { id: "services", icono: "＋", label: "Ver talento" },
  ];
}

export function FeedSidebar({ esFreelancer, activo }: FeedSidebarProps) {
  const items = itemsPorRol(esFreelancer);

  return (
    <aside className="feed-sidebar" aria-label="Navegación principal">
      <p className="feed-sidebar__label">MI ESPACIO</p>
      <nav>
        {items.map((item) => (
          <a key={`${item.id}-${item.label}`} href={`#${item.id}`} className={activo === item.id ? "is-current" : undefined}>
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
