import type { PiezaFeed } from "./datosFeed";

interface FeedFiltrosProps {
  categorias: string[];
  activa: string;
  onChange: (categoria: string) => void;
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
  const precio = pieza.precio === null
    ? "Por definir"
    : pieza.precio === undefined
      ? null
      : new Intl.NumberFormat("es", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(pieza.precio);

  return (
    <article className="feed-card">
      <div className="feed-card__image">
        {pieza.imagenUrl ? (
          <img src={pieza.imagenUrl} alt={`Imagen de ${pieza.titulo}`} loading="lazy" />
        ) : (
          <span className="feed-card__image-placeholder">Sin imagen</span>
        )}
        <span className="feed-card__category">{pieza.categoria}</span>
      </div>
      <div className="feed-card__body">
        <div className="feed-card__heading">
          <h3>{pieza.titulo}</h3>
        </div>
        <p className="feed-card__description">{pieza.descripcion}</p>
        <div className="feed-card__bottom">
          {precio !== null && (
            <p className="feed-card__price">
              <span>{pieza.etiquetaPrecio ?? "Precio"}</span>
              <strong>{precio}</strong>
            </p>
          )}
          <p className="feed-card__detail">{pieza.detalle}</p>
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

export function FeedFiltersSkeleton() {
  return (
    <div className="feed-filters feed-filters--skeleton" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <span className="feed-skeleton-chip" key={index} />
      ))}
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div role="status" aria-live="polite">
      <span className="feed-visually-hidden">Cargando contenido…</span>
      <div className="feed-grid" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <article className="feed-card feed-card--skeleton" key={index}>
            <div className="feed-card__image" />
            <div className="feed-card__body">
              <span className="feed-skeleton-line feed-skeleton-line--short" />
              <span className="feed-skeleton-line" />
              <span className="feed-skeleton-line feed-skeleton-line--wide" />
              <span className="feed-skeleton-line feed-skeleton-line--price" />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function FeedVacio({
  buscando,
  titulo,
  mensaje,
  onAccion,
  etiquetaAccion,
}: {
  buscando: boolean;
  titulo?: string;
  mensaje?: string;
  onAccion?: () => void;
  etiquetaAccion?: string;
}) {
  return (
    <section className="feed-empty" aria-live="polite">
      <span className="feed-empty__symbol" aria-hidden="true">
        {buscando ? "⌕" : "✳"}
      </span>
      <h2>{buscando ? "No encontramos resultados" : titulo ?? "Tu feed empieza aquí"}</h2>
      <p>
        {buscando
          ? "Prueba con otra palabra o categoría."
          : mensaje ?? "Cuando haya nuevas oportunidades para ti, las encontrarás en este espacio."}
      </p>
      {onAccion ? (
        <button className="feed-empty__cta" type="button" onClick={onAccion}>
          {etiquetaAccion ?? (buscando ? "Limpiar búsqueda" : "Explorar oportunidades")}
        </button>
      ) : null}
    </section>
  );
}

export function FeedError({ mensaje, onReintentar }: { mensaje: string; onReintentar?: () => void }) {
  return (
    <section className="feed-empty" role="alert">
      <span className="feed-empty__symbol" aria-hidden="true">
        ⚠
      </span>
      <h2>No pudimos cargar el contenido</h2>
      <p>{mensaje}</p>
      {onReintentar ? (
        <button className="feed-retry" type="button" onClick={onReintentar}>
          Reintentar
        </button>
      ) : null}
    </section>
  );
}
