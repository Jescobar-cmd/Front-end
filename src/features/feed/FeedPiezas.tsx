import { EmptyState } from "../../components/ui/EmptyState";
import { ServiceCard } from "../../components/ui/ServiceCard";
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
  return (
    <ServiceCard
      title={pieza.titulo}
      description={pieza.descripcion}
      category={pieza.categoria}
      imageUrl={pieza.imagenUrl}
      authorName={pieza.autorNombre}
      authorPhoto={pieza.autorFoto}
      authorTitle={pieza.autorTitulo}
      showRating={pieza.etiquetaPrecio !== "Presupuesto"}
      rating={pieza.calificacion}
      price={pieza.precio}
      pricePrefix={pieza.etiquetaPrecio === "Presupuesto" ? "Presupuesto" : "Desde"}
      priceFallback={pieza.etiquetaPrecio === "Presupuesto" ? "Por definir" : "A convenir"}
      href={pieza.href}
      ctaHref={pieza.href}
      ctaLabel={pieza.ctaLabel}
      eyebrow={pieza.etiquetas[0] ?? pieza.categoria}
    />
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
      <div className="dashboard-loading" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="dashboard-skeleton" key={index} />
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
    <EmptyState
      title={buscando ? "No encontramos resultados" : titulo ?? "Tu feed empieza aquí"}
      description={
        buscando
          ? "Prueba con otra palabra o categoría."
          : mensaje ?? "Cuando haya nuevas oportunidades para ti, las encontrarás en este espacio."
      }
      actionLabel={onAccion ? etiquetaAccion ?? (buscando ? "Limpiar búsqueda" : "Explorar oportunidades") : undefined}
      onAction={onAccion}
    />
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
