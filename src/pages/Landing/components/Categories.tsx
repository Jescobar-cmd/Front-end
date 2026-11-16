import { Link } from "react-router-dom";

// Categorías reales del proyecto (src/features/layout/CategoryBar.tsx). Fácil de editar.
export const CATEGORIAS_LANDING = [
  { nombre: "Aplicaciones móviles", icono: "M" },
  { nombre: "Datos y análisis", icono: "D" },
  { nombre: "Desarrollo web", icono: "W" },
  { nombre: "Diseño gráfico", icono: "G" },
  { nombre: "Marketing digital", icono: "K" },
  { nombre: "Redacción y contenido", icono: "R" },
  { nombre: "Soporte técnico", icono: "S" },
  { nombre: "Video y animación", icono: "V" },
];

export function Categories() {
  return (
    <section className="landing-section" aria-labelledby="cats-title">
      <div className="landing-container">
        <div className="landing-section__head">
          <h2 id="cats-title">Explora por categorías</h2>
          <p>Encuentra el servicio que necesitas o el área donde quieres ofrecer tu talento.</p>
        </div>
        <div className="landing-cats" role="list">
          {CATEGORIAS_LANDING.map((c) => (
            <Link
              key={c.nombre}
              role="listitem"
              className="landing-cat-card"
              to={`/explorar-servicios?q=${encodeURIComponent(c.nombre)}`}
            >
              <span className="landing-cat-card__icon" aria-hidden="true">{c.icono}</span>
              <span className="landing-cat-card__name">{c.nombre}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
