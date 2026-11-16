import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

const SEARCH_HINTS = ["diseño web", "marketing", "desarrollo de apps", "edición de video"];

export function Hero() {
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const hintsPaused = focused || q.length > 0 || loading;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const term = q.trim();
    setLoading(true);
    // Deja ver el spinner sin cambiar la consulta ni el destino de búsqueda.
    window.setTimeout(() => {
      navigate(term ? `/explorar-servicios?q=${encodeURIComponent(term)}` : "/explorar-servicios");
    }, 220);
  };

  return (
    <section className="landing-hero" aria-labelledby="hero-title">
      <div className="landing-container">
        <div className="landing-hero__panel">
          <div className="landing-hero__content">
            <p className="landing-hero__eyebrow">Marketplace de servicios</p>
            <h1 id="hero-title">Encuentra talento o ofrece lo que mejor sabes hacer</h1>
            <p className="landing-hero__subtitle">
              En FirstGig conectas con profesionales verificados para impulsar tus proyectos, o publicas tus servicios y consigues nuevos clientes.
            </p>
            <form className="landing-search" role="search" onSubmit={onSubmit}>
              <label htmlFor="landing-search" className="landing-sr">Buscar servicios</label>
              <div className="landing-search__field">
                <input
                  id="landing-search"
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="Busca un servicio: diseño web, marketing, desarrollo…"
                />
                <span
                  className={`landing-search__hints${hintsPaused ? " is-paused" : ""}`}
                  aria-hidden="true"
                >
                  <span className="landing-search__prefix">Busca un servicio:</span>
                  <span className="landing-search__words">
                    {SEARCH_HINTS.map((hint, index) => (
                      <span key={hint} style={{ animationDelay: `${index * 3}s` }}>{hint}</span>
                    ))}
                  </span>
                </span>
              </div>
              <button type="submit" disabled={loading} aria-busy={loading}>
                {loading ? <span className="landing-search__spinner" aria-hidden="true" /> : null}
                <span>{loading ? "Buscando…" : "Buscar"}</span>
              </button>
            </form>
          </div>
          <div className="landing-hero__visual">
            <img
              className="landing-hero__image"
              src="/hero-servicio.jpg"
              alt="Profesional trabajando en su laptop rodeada de tarjetas de búsqueda, verificación, reseñas y mensajes"
              fetchPriority="high"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
