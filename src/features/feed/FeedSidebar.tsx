import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTema } from "../../hooks/useTema";

type IconName =
  | "home"
  | "folder"
  | "compass"
  | "message"
  | "contract"
  | "plus"
  | "chevronLeft"
  | "chevronRight"
  | "sun"
  | "moon"
  | "close";

interface ItemSidebar {
  id: string;
  icono: IconName;
  label: string;
  href: string;
  exact?: boolean;
}

interface FeedSidebarProps {
  esFreelancer: boolean;
  colapsada: boolean;
  onToggleColapsada: () => void;
  abierta: boolean;
  onCerrar: () => void;
}

function itemsPorRol(esFreelancer: boolean): ItemSidebar[] {
  if (esFreelancer) {
    return [
      { id: "inicio", icono: "home", label: "Inicio", href: "/dashboard/freelancer", exact: true },
      { id: "marketplace", icono: "compass", label: "Explorar proyectos", href: "/dashboard/freelancer/ofertas" },
      { id: "servicios", icono: "plus", label: "Mis servicios", href: "/dashboard/freelancer/servicios" },
      { id: "chat", icono: "message", label: "Mensajes", href: "/chat" },
      { id: "contratos", icono: "contract", label: "Contratos", href: "/contracts" },
    ];
  }
  return [
    { id: "inicio", icono: "home", label: "Inicio", href: "/dashboard/cliente", exact: true },
    { id: "proyectos", icono: "folder", label: "Mis proyectos", href: "/dashboard/cliente/ofertas" },
    { id: "servicios", icono: "compass", label: "Explorar talento", href: "/servicios", exact: true },
    { id: "chat", icono: "message", label: "Mensajes", href: "/chat" },
    { id: "contratos", icono: "contract", label: "Contratos", href: "/contracts" },
  ];
}

function Icono({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    home: (
      <>
        <path d="m3 10.5 9-7.5 9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
        <path d="M9.5 21v-6h5v6" />
      </>
    ),
    folder: (
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z" />
    ),
    compass: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m15.5 8.5-2.1 4.9-4.9 2.1 2.1-4.9z" />
      </>
    ),
    message: (
      <path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.4 9.3 9.3 0 0 1-3.7-.8L3 21l1.9-5.6A8.4 8.4 0 1 1 21 11.5Z" />
    ),
    contract: (
      <>
        <path d="M7 3.5h7l4 4v13H7z" />
        <path d="M14 3.5v4h4" />
        <path d="M10 12h5M10 15.5h5" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    chevronLeft: <path d="m14.5 6-6 6 6 6" />,
    chevronRight: <path d="m9.5 6 6 6-6 6" />,
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
      </>
    ),
    moon: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

export function FeedSidebar({
  esFreelancer,
  colapsada,
  onToggleColapsada,
  abierta,
  onCerrar,
}: FeedSidebarProps) {
  const { pathname } = useLocation();
  const { tema, alternarTema } = useTema();
  const asideRef = useRef<HTMLElement>(null);
  const items = itemsPorRol(esFreelancer);
  const etiquetaTema = tema === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro";

  useEffect(() => {
    if (!abierta) return;
    const manejarTecla = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCerrar();
    };
    document.addEventListener("keydown", manejarTecla);
    return () => document.removeEventListener("keydown", manejarTecla);
  }, [abierta, onCerrar]);

  useEffect(() => {
    if (!abierta) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [abierta]);

  useEffect(() => {
    if (!abierta) return;
    asideRef.current?.querySelector<HTMLElement>(".feed-sidebar__nav a")?.focus();
  }, [abierta]);

  return (
    <>
      {abierta && (
        <button
          className="feed-sidebar-backdrop"
          type="button"
          aria-label="Cerrar menú"
          onClick={onCerrar}
        />
      )}
      <aside
        ref={asideRef}
        id="feed-sidebar"
        className={`feed-sidebar${colapsada ? " is-collapsed" : ""}${abierta ? " is-open" : ""}`}
        aria-label="Navegación principal"
      >
        <div className="feed-sidebar__head">
          <span className="feed-sidebar__label">Mi espacio</span>
          <button
            className="feed-sidebar__toggle"
            type="button"
            onClick={onToggleColapsada}
            aria-label={colapsada ? "Expandir menú" : "Colapsar menú"}
            aria-expanded={!colapsada}
            aria-controls="feed-sidebar"
            data-tooltip={colapsada ? "Expandir menú" : "Colapsar menú"}
          >
            <Icono name={colapsada ? "chevronRight" : "chevronLeft"} />
          </button>
          <button
            className="feed-sidebar__close"
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar menú"
          >
            <Icono name="close" />
          </button>
        </div>

        <nav className="feed-sidebar__nav">
          {items.map((item) => {
            const activo = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.id}
                to={item.href}
                className={activo ? "is-current" : undefined}
                aria-label={item.label}
                aria-current={activo ? "page" : undefined}
                data-tooltip={item.label}
                onClick={onCerrar}
              >
                <Icono name={item.icono} />
                <span className="feed-sidebar__text">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {!esFreelancer && (
          <Link
            className="feed-sidebar__create"
            to="/dashboard/cliente/ofertas"
            aria-label="Crear proyecto"
            data-tooltip="Crear proyecto"
            onClick={onCerrar}
          >
            <Icono name="plus" />
            <span className="feed-sidebar__text">Crear proyecto</span>
          </Link>
        )}

        <div className="feed-sidebar__foot">
          <button
            className="feed-sidebar__theme"
            type="button"
            onClick={alternarTema}
            aria-label={etiquetaTema}
            aria-pressed={tema === "dark"}
            data-tooltip={etiquetaTema}
          >
            <Icono name={tema === "dark" ? "sun" : "moon"} />
            <span className="feed-sidebar__text">{tema === "dark" ? "Modo claro" : "Modo oscuro"}</span>
          </button>
          <p className="feed-sidebar__copyright">© 2026 First Gig</p>
        </div>
      </aside>
    </>
  );
}
