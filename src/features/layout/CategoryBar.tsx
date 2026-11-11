import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useInternalSearch } from "./InternalSearchContext";

const CATEGORIAS = [
  "Aplicaciones móviles",
  "Datos y análisis",
  "Desarrollo web",
  "Diseño gráfico",
  "Marketing digital",
  "Redacción y contenido",
  "Soporte técnico",
  "Video y animación",
];

export function CategoryBar() {
  const { user } = useAuth();
  const { setQuery } = useInternalSearch();
  const esFreelancer = user?.rol === "freelancer";
  const destino = esFreelancer ? "/dashboard/freelancer/ofertas" : "/servicios";

  return (
    <nav className="category-bar" aria-label="Categorías principales">
      <div className="category-bar__inner">
        {CATEGORIAS.map((categoria) => (
          <Link className="category-bar__link" key={categoria} to={destino} onClick={() => setQuery(categoria)}>
            {categoria}
          </Link>
        ))}
      </div>
    </nav>
  );
}
