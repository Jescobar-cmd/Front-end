import type { ChangeEvent } from "react";
import { Brand } from "../../components/Brand";
import { ProfileMenu } from "../../components/ProfileMenu";
import type { TipoCuentaFeed } from "./datosFeed";

interface FeedTopbarProps {
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  nombre?: string;
  tipoCuenta: TipoCuentaFeed;
  onAbrirMenu?: () => void;
  menuAbierto?: boolean;
}

export function FeedTopbar({
  valor,
  onChange,
  placeholder,
  nombre,
  tipoCuenta,
  onAbrirMenu,
  menuAbierto = false,
}: FeedTopbarProps) {
  const manejarCambio = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const esFreelancer = tipoCuenta === "freelancer";

  return (
    <header className="feed-topbar">
      <button
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
      <a
        className="feed-brand"
        href={esFreelancer ? "/dashboard/freelancer" : "/dashboard/cliente"}
        aria-label="FirstGig, ir al inicio"
      >
        <Brand />
      </a>
      <label className="feed-search">
        <span className="feed-search__icon" aria-hidden="true">
          ⌕
        </span>
        <span className="feed-visually-hidden">Buscar en el feed</span>
        <input
          type="search"
          value={valor}
          onChange={manejarCambio}
          placeholder={placeholder ?? (esFreelancer ? "Buscar proyectos por título o habilidad" : "Buscar servicios o freelancers")}
        />
        {valor && (
          <button className="feed-search__clear" type="button" onClick={() => onChange("")} aria-label="Limpiar búsqueda">
            ×
          </button>
        )}
      </label>
      <div className="feed-topbar__right">
        <ProfileMenu
          nombre={nombre ?? ""}
          rol={esFreelancer ? "freelancer" : "cliente"}
          editarPerfilPath={esFreelancer ? "/perfil/freelancer" : "/perfil/cliente"}
        />
      </div>
    </header>
  );
}
