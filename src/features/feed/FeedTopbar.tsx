import type { ChangeEvent } from "react";
import { Brand } from "../../components/Brand";
import type { TipoCuentaFeed } from "./datosFeed";

interface FeedTopbarProps {
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  nombre?: string;
  tipoCuenta: TipoCuentaFeed;
}

export function FeedTopbar({ valor, onChange, placeholder, nombre, tipoCuenta }: FeedTopbarProps) {
  const manejarCambio = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const esFreelancer = tipoCuenta === "freelancer";

  return (
    <header className="feed-topbar">
      <a
        className="feed-brand"
        href={esFreelancer ? "/dashboard/freelancer" : "/dashboard/cliente"}
        aria-label="FirstGig, ir al inicio"
      >
        <Brand variant="dark" />
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
        <span className="feed-topbar__icon" aria-hidden="true">
          ▢
        </span>
        <span className="feed-topbar__icon" aria-hidden="true">
          ♧
        </span>
        <div className="feed-account">
          <span className="feed-account__avatar" aria-hidden="true">
            {(nombre ?? "M").trim().charAt(0).toLocaleUpperCase()}
          </span>
          <span className="feed-account__identity">
            <strong>{nombre || "Mi cuenta"}</strong>
            <small>{esFreelancer ? "Cuenta de freelancer" : "Cuenta de cliente"}</small>
          </span>
        </div>
      </div>
    </header>
  );
}
