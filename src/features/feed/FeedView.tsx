import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useInternalSearch } from "../layout/InternalSearchContext";
import {
  FeedError,
  FeedFiltersSkeleton,
  FeedFiltros,
  FeedPiezaCard,
  FeedSkeleton,
  FeedVacio,
} from "./FeedPiezas";
import type { FeedData } from "./useFeedData";
import "./feed.css";

export function FeedView({ datos }: { datos: FeedData }) {
  const { query, setQuery } = useInternalSearch();
  const [categoriaActiva, setCategoriaActiva] = useState("Todo");

  const {
    usuario,
    estadoFeed,
    errorFeed,
    recargarFeed,
    categorias,
    estadoCategorias,
    errorCategorias,
    recargarCategorias,
    proyectosParaTi,
  } = datos;

  const esFreelancer = usuario.tipoCuenta === "freelancer";
  const nombre = usuario.nombre?.trim().split(/\s+/)[0] || "de nuevo";

  const categoriasDisponibles = useMemo(
    () => [...new Set(categorias.map((categoria) => categoria.nombre).filter(Boolean))],
    [categorias],
  );

  const piezasVisibles = useMemo(() => {
    const termino = query.trim().toLocaleLowerCase();
    return proyectosParaTi.filter((pieza) => {
      const coincideCategoria =
        categoriaActiva === "Todo" || pieza.categoria === categoriaActiva;
      const texto = [pieza.titulo, pieza.descripcion, pieza.categoria, ...pieza.etiquetas]
        .join(" ")
        .toLocaleLowerCase();
      return coincideCategoria && (!termino || texto.includes(termino));
    });
  }, [categoriaActiva, proyectosParaTi, query]);

  const rutaExplorar = esFreelancer ? "/dashboard/freelancer/ofertas" : "/servicios";
  const buscando = Boolean(query.trim()) || categoriaActiva !== "Todo";

  return (
    <div className={`feed-layout feed-layout--embedded feed-layout--${usuario.tipoCuenta}`}>
      <div className="feed-workspace feed-workspace--single">
        <div className="feed-primary">
          <section className="feed-intro" aria-labelledby="feed-title">
            <div>
              <p className="feed-intro__eyebrow">TU ESPACIO</p>
              <h1 id="feed-title">Hola, {nombre}</h1>
              <p>
                {esFreelancer
                  ? "Encuentra proyectos que encajen con lo que sabes hacer."
                  : "Descubre talento y da el siguiente paso en tus proyectos."}
              </p>
            </div>
            <Link className="feed-primary-action" to={rutaExplorar}>
              {esFreelancer ? "Explorar proyectos" : "Explorar talento"}
            </Link>
          </section>

          <section className="feed-content" aria-label="Servicios y oportunidades">
            <div className="feed-toolbar">
              <div>
                <h2>{esFreelancer ? "Proyectos para ti" : "Servicios para explorar"}</h2>
                <p>
                  {esFreelancer
                    ? "Oportunidades publicadas por clientes."
                    : "Profesionales que pueden sumarse a tu proyecto."}
                </p>
              </div>
            </div>

            <div className="feed-content__filters">
              {errorCategorias ? (
                <FeedError mensaje={errorCategorias} onReintentar={recargarCategorias} />
              ) : estadoCategorias.estado === "cargando" ? (
                <FeedFiltersSkeleton />
              ) : (
                <FeedFiltros
                  categorias={categoriasDisponibles}
                  activa={categoriaActiva}
                  onChange={setCategoriaActiva}
                />
              )}
            </div>

            {estadoFeed.estado === "cargando" ? (
              <FeedSkeleton />
            ) : errorFeed ? (
              <FeedError mensaje={errorFeed} onReintentar={recargarFeed} />
            ) : piezasVisibles.length > 0 ? (
              <div className="feed-grid">
                {piezasVisibles.map((pieza) => (
                  <FeedPiezaCard key={pieza.id} pieza={pieza} />
                ))}
              </div>
            ) : (
              <FeedVacio
                buscando={buscando}
                titulo={
                  esFreelancer
                    ? "Aún no hay proyectos publicados"
                    : "Aún no hay servicios publicados"
                }
                mensaje={
                  esFreelancer
                    ? "Cuando un cliente publique un proyecto, aparecerá aquí. Mientras tanto, puedes explorar el marketplace."
                    : "Cuando un freelancer publique un servicio, aparecerá aquí. Mientras tanto, puedes explorar el talento disponible."
                }
                onAccion={
                  query
                    ? () => setQuery("")
                    : categoriaActiva !== "Todo"
                      ? () => setCategoriaActiva("Todo")
                      : undefined
                }
                etiquetaAccion={query ? "Limpiar búsqueda" : "Ver todas las categorías"}
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
