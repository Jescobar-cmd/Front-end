import type { ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import { Brand } from "../../components/Brand";
import { ProfileMenu } from "../../components/ProfileMenu";
import { useAuth } from "../../context/AuthContext";

interface FeedTopbarProps {
  valor: string;
  onChange: (valor: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  onAbrirMenu?: () => void;
  menuAbierto?: boolean;
}

export function FeedTopbar({
  valor,
  onChange,
  onSubmit,
  placeholder,
  onAbrirMenu,
  menuAbierto = false,
}: FeedTopbarProps) {
  const { user } = useAuth();
  const manejarCambio = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  // El rol sale del contexto de autenticación, no de una prop derivada.
  const esFreelancer = user?.rol === "freelancer";

  return (
    <header className="feed-topbar">
      <button
        id="feed-menu-button"
        className="feed-menu-button"
        type="button"
        onClick={onAbrirMenu}
        aria-label="Abrir menú de navegación"
        aria-controls="feed-sidebar"
        aria-expanded={menuAbierto}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
      <Link
        className="feed-brand"
        to={esFreelancer ? "/dashboard/freelancer" : "/dashboard/cliente"}
        aria-label="FirstGig, ir al inicio"
      >
        <Brand />
      </Link>
      <form
        className="feed-search"
        role="search"
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          onSubmit?.();
        }}
      >
        <span className="feed-search__icon" aria-hidden="true">
          ⌕
        </span>
        <span className="feed-visually-hidden">Buscar</span>
        <input
          type="search"
          value={valor}
          onChange={manejarCambio}
          aria-label="Buscar"
          placeholder={placeholder ?? (esFreelancer ? "Buscar proyectos por título o habilidad" : "Buscar servicios o freelancers")}
        />
        {valor && (
          <button className="feed-search__clear" type="button" onClick={() => onChange("")} aria-label="Limpiar búsqueda">
            ×
          </button>
        )}
      </form>
      <div className="feed-topbar__right">
        <ProfileMenu />
      </div>
    </header>
  );
}
