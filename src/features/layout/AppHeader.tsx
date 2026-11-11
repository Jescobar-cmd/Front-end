import type { ChangeEvent, FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { Brand } from "../../components/Brand";
import { ProfileMenu } from "../../components/ProfileMenu";
import { useAuth } from "../../context/AuthContext";
import { useInternalSearch } from "./InternalSearchContext";
import { CategoryBar } from "./CategoryBar";

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function AppHeader({
  valor,
  onChange,
  onSubmit,
  onAbrirMenu,
}: {
  valor: string;
  onChange: (valor: string) => void;
  onSubmit: () => void;
  onAbrirMenu: () => void;
}) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const esFreelancer = user?.rol === "freelancer";
  const explorarPath = esFreelancer ? "/dashboard/freelancer/ofertas" : "/servicios";

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  const links = [
    { label: esFreelancer ? "Explorar proyectos" : "Explorar talento", to: explorarPath },
    { label: "Mensajes", to: "/chat" },
    { label: "Contratos", to: "/contracts" },
  ];

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <button className="app-header__menu-button" type="button" onClick={onAbrirMenu} aria-label="Abrir menú de navegación" id="feed-menu-button">
          <MenuIcon />
        </button>

        <Link className="app-header__brand" to={esFreelancer ? "/dashboard/freelancer" : "/dashboard/cliente"} aria-label="First Gig, ir al inicio">
          <Brand />
        </Link>

        <nav className="app-header__nav" aria-label="Navegación principal">
          {links.map((link) => (
            <Link
              className={`app-header__nav-link${pathname === link.to || pathname.startsWith(`${link.to}/`) ? " is-active" : ""}`}
              key={link.to}
              to={link.to}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form className="app-header__search" role="search" onSubmit={handleSubmit}>
          <span className="app-header__search-icon" aria-hidden="true">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={valor}
            onChange={handleChange}
            placeholder={esFreelancer ? "Buscar proyectos por título o categoría" : "Buscar talento, servicios o categorías"}
            aria-label={esFreelancer ? "Buscar proyectos" : "Buscar talento"}
          />
          <button type="submit">Buscar</button>
        </form>

        <div className="app-header__right">
          <Link className="app-header__icon-link" to="/chat" aria-label="Mensajes">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.3 9 9 0 0 1-3.8-.8L3 21l1.8-4.1a8 8 0 0 1-1.3-4.4A8.4 8.4 0 0 1 12 4.2a8.4 8.4 0 0 1 9 7.3Z" />
            </svg>
          </Link>
          <ProfileMenu />
        </div>
      </div>
      <CategoryBar />
    </header>
  );
}
