import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Brand } from "./Brand";
import "./AppShell.css";

export interface ItemAppShell {
  id: string;
  icono: string;
  label: string;
  href: string;
}

interface AppShellProps {
  esFreelancer: boolean;
  activo?: string;
  children: ReactNode;
}

const itemsPorRol: Record<string, ItemAppShell[]> = {
  cliente: [
    { id: "inicio", icono: "⌂", label: "Inicio", href: "/dashboard/cliente" },
    { id: "proyectos", icono: "＋", label: "Mis proyectos", href: "/dashboard/cliente/ofertas" },
    { id: "explorar", icono: "⌕", label: "Explorar talento", href: "/servicios" },
    { id: "mensajes", icono: "▤", label: "Mensajes", href: "/chat" },
    { id: "contratos", icono: "▦", label: "Contratos", href: "/contracts" },
  ],
  freelancer: [
    { id: "inicio", icono: "⌂", label: "Inicio", href: "/dashboard/freelancer" },
    { id: "proyectos", icono: "⌕", label: "Buscar proyectos", href: "/dashboard/freelancer/ofertas" },
    { id: "postulaciones", icono: "◇", label: "Mis postulaciones", href: "/dashboard/freelancer/ofertas" },
    { id: "servicios", icono: "＋", label: "Mis servicios", href: "/dashboard/freelancer/servicios" },
    { id: "mensajes", icono: "▤", label: "Mensajes", href: "/mensajes" },
    { id: "contratos", icono: "▦", label: "Contratos", href: "/contratos" },
  ],
};

export function AppShell({ esFreelancer, activo, children }: AppShellProps) {
  const items = itemsPorRol[esFreelancer ? "freelancer" : "cliente"];
  const inicio = esFreelancer ? "/dashboard/freelancer" : "/dashboard/cliente";

  return (
    <div className="app-shell">
      <aside className="app-shell__sidebar" aria-label="Navegación principal">
        <p className="app-shell__label">MI ESPACIO</p>
        <nav>
          {items.map((item) => (
            <Link
              key={item.id}
              to={item.href}
              className={activo === item.id ? "is-current" : undefined}
            >
              <span aria-hidden="true">{item.icono}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="app-shell__main">
        <header className="app-shell__topbar">
          <Link to={inicio} className="app-shell__brand" aria-label="FirstGig, ir al inicio">
            <Brand />
          </Link>
        </header>
        <main className="app-shell__content">{children}</main>
      </div>
    </div>
  );
}
