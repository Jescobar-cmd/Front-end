import type { ChangeEvent } from "react";
import type { PiezaFeed } from "./datosFeed";

interface FeedBuscadorProps {
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
}

interface FeedFiltrosProps {
  categorias: string[];
  activa: string;
  onChange: (categoria: string) => void;
}

export function FeedBuscador({ valor, onChange, placeholder = "Buscar por tema o habilidad" }: FeedBuscadorProps) {
  const manejarCambio = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <label className="feed-search">
      <span className="feed-search__icon" aria-hidden="true">
        ⌕
      </span>
      <span className="feed-visually-hidden">Buscar en el feed</span>
      <input type="search" value={valor} onChange={manejarCambio} placeholder={placeholder} />
      {valor && (
        <button className="feed-search__clear" type="button" onClick={() => onChange("")} aria-label="Limpiar búsqueda">
          ×
        </button>
      )}
    </label>
  );
}

export function FeedFiltros({ categorias, activa, onChange }: FeedFiltrosProps) {
  return (
    <div className="feed-filters" role="group" aria-label="Filtrar por categoría">
      {["Todo", ...categorias].map((categoria) => (
        <button
          className={`feed-filter${activa === categoria ? " is-active" : ""}`}
          key={categoria}
          type="button"
          aria-pressed={activa === categoria}
          onClick={() => onChange(categoria)}
        >
          {categoria}
        </button>
      ))}
    </div>
  );
}

export function FeedPiezaCard({ pieza }: { pieza: PiezaFeed }) {
  return (
    <article className="feed-card">
      <div className="feed-card__image">
        {pieza.imagenUrl ? (
          <img src={pieza.imagenUrl} alt={`Imagen del servicio: ${pieza.titulo}`} />
        ) : (
          <span className="feed-card__image-placeholder">Sin imagen</span>
        )}
        <span className="feed-card__category">{pieza.categoria}</span>
      </div>
      <div className="feed-card__body">
        <div className="feed-card__heading">
          <h3>{pieza.titulo}</h3>
          <span className="feed-card__mark" aria-hidden="true">
            ↗
          </span>
        </div>
        <p className="feed-card__description">{pieza.descripcion}</p>
        <div className="feed-card__bottom">
          <p className="feed-card__detail">{pieza.detalle}</p>
          {typeof pieza.postulaciones === "number" && (
            <p className="feed-card__postulaciones">
              <span aria-hidden="true">◇</span> {pieza.postulaciones}{" "}
              {pieza.postulaciones === 1 ? "postulación" : "postulaciones"}
            </p>
          )}
          <ul className="feed-tags" aria-label="Temas y habilidades">
            {pieza.etiquetas.map((etiqueta) => (
              <li key={etiqueta}>{etiqueta}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

export function FeedVacio({ buscando }: { buscando: boolean }) {
  return (
    <section className="feed-empty" aria-live="polite">
      <span className="feed-empty__symbol" aria-hidden="true">
        ✳
      </span>
      <h2>{buscando ? "No encontramos resultados" : "Tu feed empieza aquí"}</h2>
      <p>
        {buscando
          ? "Prueba con otra palabra o categoría."
          : "Cuando haya nuevas oportunidades para ti, las encontrarás en este espacio."}
      </p>
    </section>
  );
}

export function FeedLoading() {
  return (
    <section className="feed-empty" aria-live="polite">
      <span className="feed-empty__symbol" aria-hidden="true">
        ✳
      </span>
      <h2>Cargando contenido</h2>
      <p>Un momento mientras preparamos tu feed.</p>
    </section>
  );
}

export function FeedError({ mensaje, onReintentar }: { mensaje: string; onReintentar?: () => void }) {
  return (
    <section className="feed-empty" aria-live="polite">
      <span className="feed-empty__symbol" aria-hidden="true">
        ⚠
      </span>
      <h2>No pudimos cargar el feed</h2>
      <p>{mensaje}</p>
      {onReintentar ? (
        <button className="feed-retry" type="button" onClick={onReintentar}>
          Reintentar
        </button>
      ) : null}
    </section>
  );
}
