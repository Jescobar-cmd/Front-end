import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

export function Hero() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/explorar-servicios?q=${encodeURIComponent(term)}` : "/explorar-servicios");
  };

  return (
    <section className="landing-hero" aria-labelledby="hero-title">
      <div className="landing-container">
        <div className="landing-hero__panel">
          <p className="landing-hero__eyebrow">Marketplace de servicios</p>
          <h1 id="hero-title">Encuentra talento o ofrece lo que mejor sabes hacer</h1>
          <p className="landing-hero__subtitle">
            En FirstGig conectas con profesionales verificados para impulsar tus proyectos, o publicas tus servicios y consigues nuevos clientes.
          </p>
          <form className="landing-search" role="search" onSubmit={onSubmit}>
            <label htmlFor="landing-search" className="landing-sr">Buscar servicios</label>
            <input
              id="landing-search"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Busca un servicio: diseño web, marketing, desarrollo…"
            />
            <button type="submit">Buscar</button>
          </form>
        </div>
      </div>
    </section>
  );
}
