import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listServices, type Servicio } from "../../../infrastructure/api/apiServicios";

const EJEMPLOS: Array<Pick<Servicio, "id" | "titulo" | "precio" | "imagenUrl"> & { proveedor: string }> = [
  { id: -1, titulo: "Diseño de sitio web moderno y responsivo", precio: 120, imagenUrl: null, proveedor: "María G." },
  { id: -2, titulo: "Gestión de campañas de marketing digital", precio: 90, imagenUrl: null, proveedor: "Carlos R." },
  { id: -3, titulo: "Desarrollo de aplicación móvil a medida", precio: 250, imagenUrl: null, proveedor: "Ana L." },
  { id: -4, titulo: "Edición de video y animación para redes", precio: 75, imagenUrl: null, proveedor: "Diego M." },
];

function precio(valor: number) {
  try { return new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(valor); }
  catch { return `$${valor}`; }
}

export function PopularServices() {
  const [items, setItems] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    let active = true;
    listServices(undefined, { page: 1, limit: 8 })
      .then((res) => {
        if (!active) return;
        const activos = (res.items ?? []).filter((s) => s.estado?.toLowerCase() === "activo");
        if (activos.length > 0) { setItems(activos.slice(0, 8)); setError(""); }
        else { setUseFallback(true); }
      })
      .catch(() => {
        if (!active) return;
        setError("No pudimos cargar los servicios en este momento.");
        setUseFallback(true);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <section className="landing-section landing-section--alt" aria-labelledby="pop-title">
      <div className="landing-container">
        <div className="landing-section__head">
          <h2 id="pop-title">Servicios populares</h2>
          <p>Descubre lo que otros clientes están contratando en la plataforma.</p>
        </div>

        {loading && (
          <div className="landing-services-grid" aria-live="polite" aria-busy="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <div className="landing-service-card landing-service-card--skeleton" key={i}>
                <div className="landing-skel landing-skel--img" />
                <div className="landing-skel landing-skel--line" />
                <div className="landing-skel landing-skel--short" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && useFallback && (
          <p className="landing-note" role="status">{error} Te mostramos algunos ejemplos mientras tanto.</p>
        )}

        {!loading && !useFallback && items.length > 0 && (
          <div className="landing-services-grid">
            {items.map((s) => (
              <article className="landing-service-card" key={s.id}>
                <div className="landing-service-card__img">
                  {s.imagenUrl ? <img src={s.imagenUrl} alt="" loading="lazy" /> : <span aria-hidden="true">FG</span>}
                </div>
                <div className="landing-service-card__body">
                  <h3 className="landing-service-card__title">{s.titulo}</h3>
                  <p className="landing-service-card__provider">{s.freelancer?.nombre ?? "Profesional FirstGig"}</p>
                  <p className="landing-service-card__price"><span>Desde</span> <strong>{precio(s.precio)}</strong></p>
                </div>
                <Link className="landing-service-card__link" to="/explorar-servicios">Ver servicios</Link>
              </article>
            ))}
          </div>
        )}

        {!loading && useFallback && (
          <div className="landing-services-grid">
            {EJEMPLOS.map((s) => (
              <article className="landing-service-card" key={s.id}>
                <div className="landing-service-card__img"><span aria-hidden="true">FG</span></div>
                <div className="landing-service-card__body">
                  <h3 className="landing-service-card__title">{s.titulo}</h3>
                  <p className="landing-service-card__provider">{s.proveedor}</p>
                  <p className="landing-service-card__price"><span>Desde</span> <strong>{precio(s.precio)}</strong></p>
                </div>
                <Link className="landing-service-card__link" to="/registro">Ver más</Link>
              </article>
            ))}
          </div>
        )}

        <div className="landing-section__cta">
          <Link className="landing-btn landing-btn--secondary" to="/explorar-servicios">Explorar todos los servicios</Link>
        </div>
      </div>
    </section>
  );
}
