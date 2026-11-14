import type { ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
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

export function AppHeader({
  valor,
  onChange,
  onSubmit,
}: {
  valor: string;
  onChange: (valor: string) => void;
  onSubmit: () => void;
}) {
  const { user } = useAuth();
  const esFreelancer = user?.rol === "freelancer";
  const brandPath = !user
    ? "/"
    : esFreelancer
      ? "/dashboard/freelancer"
      : "/dashboard/cliente";

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link className="app-header__brand" to={brandPath} aria-label="First Gig, ir al inicio">
          <Brand />
        </Link>

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
          {user ? (
            <Link className="app-header__icon-link" to="/chat" aria-label="Mensajes">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.3 9 9 0 0 1-3.8-.8L3 21l1.8-4.1a8 8 0 0 1-1.3-4.4A8.4 8.4 0 0 1 12 4.2a8.4 8.4 0 0 1 9 7.3Z" />
              </svg>
            </Link>
          ) : (
            <Link className="app-header__login" to="/login">Iniciar sesión</Link>
          )}
          <ProfileMenu />
        </div>
      </div>
      <CategoryBar />
    </header>
  );
}
