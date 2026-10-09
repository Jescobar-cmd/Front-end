import { useState } from "react";
import { Link } from "react-router-dom";
import { Brand } from "../../components/Brand";
import { Button } from "../../components/button";
import { useAuth } from "../../context/AuthContext";

const BANNERS = [
  {
    etiqueta: "Destacado",
    titulo: "Encuentra talento verificado",
    texto: "Explora freelancers con experiencia comprobada en tu sector.",
  },
  {
    etiqueta: "Nuevo",
    titulo: "Publica tu primer servicio",
    texto: "Describe lo que necesitas y recibe ofertas en pocas horas.",
  },
  {
    etiqueta: "Consejo",
    titulo: "Compara precios y reseñas",
    texto: "Elige con confianza revisando el trabajo previo de cada perfil.",
  },
];

const FREELANCERS = [
  { nombre: "Ana Martínez", servicio: "Diseño de logotipos", precio: "$45 USD" },
  { nombre: "Carlos Ruiz", servicio: "Desarrollo web", precio: "$120 USD" },
  { nombre: "Lucía Gómez", servicio: "Redacción de contenidos", precio: "$30 USD" },
  { nombre: "Diego Torres", servicio: "Edición de video", precio: "$80 USD" },
  { nombre: "Sofía Herrera", servicio: "Marketing digital", precio: "$95 USD" },
  { nombre: "Martín Castro", servicio: "Ilustración digital", precio: "$60 USD" },
];

const PUBLICACIONES = [
  {
    autor: "Ana Martínez",
    tiempo: "hace 2 horas",
    texto: "Nuevo paquete de identidad visual para emprendimientos. ¡Agenda tu proyecto de marzo!",
  },
  {
    autor: "Carlos Ruiz",
    tiempo: "hace 5 horas",
    texto: "Sitios web rápidos y optimizados para buscadores. Descuento del 15% esta semana.",
  },
  {
    autor: "Lucía Gómez",
    tiempo: "ayer",
    texto: "Artículos y copywriting que convierten lectores en clientes. Entrega en 48 horas.",
  },
];

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function InicioCliente() {
  const { user } = useAuth();
  const nombre = user?.nombre?.trim() || "Cliente";
  const [banner, setBanner] = useState(0);
  const [menu, setMenu] = useState<"estadisticas" | "crear">("estadisticas");

  return (
    <div className="ic-page">
      <header className="ic-topbar">
        <Link to="/inicio" className="ic-logo" aria-label="First Gig - inicio">
          <Brand />
        </Link>
        <div className="ic-user">
          <span className="ic-username">{nombre}</span>
          <span className="ic-avatar" aria-hidden="true">
            {iniciales(nombre)}
          </span>
        </div>
      </header>

      <section className="ic-banner" aria-label="Anuncios destacados">
        <p className="ic-banner-tag">{BANNERS[banner].etiqueta}</p>
        <h2 className="ic-banner-title">{BANNERS[banner].titulo}</h2>
        <p className="ic-banner-text">{BANNERS[banner].texto}</p>
        <div className="ic-dots" role="tablist" aria-label="Cambiar anuncio">
          {BANNERS.map((b, i) => (
            <button
              key={b.titulo}
              type="button"
              role="tab"
              aria-selected={i === banner}
              aria-label={`Ver anuncio ${i + 1}`}
              className={`ic-dot${i === banner ? " ic-dot--activo" : ""}`}
              onClick={() => setBanner(i)}
            />
          ))}
        </div>
      </section>

      <div className="ic-layout">
        <nav className="ic-menu" aria-label="Menú principal">
          <button
            type="button"
            className={`ic-menu-btn${menu === "estadisticas" ? " ic-menu-btn--activo" : ""}`}
            aria-current={menu === "estadisticas" ? "page" : undefined}
            onClick={() => setMenu("estadisticas")}
          >
            Estadísticas
          </button>
          <button
            type="button"
            className={`ic-menu-btn${menu === "crear" ? " ic-menu-btn--activo" : ""}`}
            aria-current={menu === "crear" ? "page" : undefined}
            onClick={() => setMenu("crear")}
          >
            Crear servicio
          </button>
        </nav>

        <main className="ic-main">
          <section aria-labelledby="ic-ofertas">
            <h2 id="ic-ofertas" className="ic-section-title">
              Ofertas de freelancers
            </h2>
            <div className="ic-grid">
              {FREELANCERS.map((f) => (
                <article key={f.nombre} className="ic-card">
                  <span className="ic-card-avatar" aria-hidden="true">
                    {iniciales(f.nombre)}
                  </span>
                  <h3 className="ic-card-name">{f.nombre}</h3>
                  <p className="ic-card-service">{f.servicio}</p>
                  <p className="ic-card-price">{f.precio}</p>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="ic-pubs">
            <h2 id="ic-pubs" className="ic-section-title">
              Publicaciones
            </h2>
            <div className="ic-posts">
              {PUBLICACIONES.map((p) => (
                <article key={`${p.autor}-${p.tiempo}`} className="ic-post">
                  <div className="ic-post-head">
                    <span className="ic-post-avatar" aria-hidden="true">
                      {iniciales(p.autor)}
                    </span>
                    <div>
                      <p className="ic-post-author">{p.autor}</p>
                      <p className="ic-post-time">{p.tiempo}</p>
                    </div>
                  </div>
                  <p className="ic-post-text">{p.texto}</p>
                </article>
              ))}
            </div>
          </section>

          <Button type="button" className="ic-cta">
            Consultar servicios
          </Button>
        </main>
      </div>
    </div>
  );
}
