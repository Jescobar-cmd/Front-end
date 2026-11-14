import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { buttonClassName } from "../../components/ui/Button";
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
  const navigate = useNavigate();
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
      const coincideCategoria = categoriaActiva === "Todo" || pieza.categoria === categoriaActiva;
      const texto = [pieza.titulo, pieza.descripcion, pieza.categoria, ...pieza.etiquetas]
        .join(" ")
        .toLocaleLowerCase();
      return coincideCategoria && (!termino || texto.includes(termino));
    });
  }, [categoriaActiva, proyectosParaTi, query]);

  const rutaExplorar = esFreelancer ? "/dashboard/freelancer/ofertas" : "/talento";
  const rutaCatalogo = esFreelancer ? "/dashboard/freelancer/ofertas" : "/servicios";
  const rutaCrear = esFreelancer ? "/crear/servicio" : "/crear/proyecto";
  const buscando = Boolean(query.trim()) || categoriaActiva !== "Todo";
  const rolVisible = esFreelancer ? "Freelancer" : "Cliente";

  const limpiarFiltros = () => {
    if (query) setQuery("");
    if (categoriaActiva !== "Todo") setCategoriaActiva("Todo");
  };

  return (
    <div className={`dashboard dashboard--${usuario.tipoCuenta}`}>
      <header className="dashboard__welcome">
        <div>
          <p className="ui-eyebrow">Tu espacio</p>
          <h1>Hola, {nombre}</h1>
          <p>{esFreelancer ? "Tu próximo proyecto empieza con una buena presentación." : "Talento verificado para hacer avanzar tus ideas."}</p>
        </div>
        <Link className={buttonClassName({ variant: "secondary", size: "sm" })} to={rutaCrear}>
          {esFreelancer ? "Publicar servicio" : "Crear proyecto"}
        </Link>
      </header>

      <section className="dashboard-hero" aria-labelledby="dashboard-hero-title">
        <div className="dashboard-hero__content">
          <p className="dashboard-hero__eyebrow">First Gig · Talento con portafolio</p>
          <h2 id="dashboard-hero-title">
            {esFreelancer ? "Encuentra tu próximo proyecto" : "Encuentra talento verificado"}
          </h2>
          <p>
            {esFreelancer
              ? "Explora proyectos publicados por clientes, envía propuestas a medida y construye tu reputación con cada entrega."
              : "Descubre freelancers con portafolio, compara propuestas y contacta directamente desde cada perfil. Sin intermediarios innecesarios."}
          </p>
          <div className="dashboard-hero__actions">
            <Link className={buttonClassName({ variant: "primary" })} to={rutaExplorar}>
              {esFreelancer ? "Explorar proyectos" : "Explorar talento"}
            </Link>
            <Link className={buttonClassName({ variant: "secondary" })} to={rutaCrear}>
              {esFreelancer ? "Crear mi servicio" : "Publicar un proyecto"}
            </Link>
          </div>
          <ul className="dashboard-hero__proof">
            <li>✓ Perfiles con portafolio</li>
            <li>✓ Propuestas a medida</li>
            <li>✓ Contratos y chat en un solo lugar</li>
          </ul>
        </div>
      </section>

      <section className="ui-section" aria-labelledby="dashboard-resumen-title">
        <div className="ui-section-head">
          <div>
            <h2 id="dashboard-resumen-title">Resumen</h2>
            <p>Lo que tienes disponible hoy en First Gig.</p>
          </div>
        </div>
        <div className="dashboard-stats">
          <article className="dashboard-stat">
            <span className="dashboard-stat__label">{esFreelancer ? "Proyectos disponibles" : "Servicios para explorar"}</span>
            <strong className="dashboard-stat__value">{proyectosParaTi.length}</strong>
            <span className="dashboard-stat__hint">{esFreelancer ? "Oportunidades publicadas por clientes" : "Publicados por freelancers"}</span>
          </article>
          <article className="dashboard-stat">
            <span className="dashboard-stat__label">Categorías activas</span>
            <strong className="dashboard-stat__value">{categoriasDisponibles.length}</strong>
            <span className="dashboard-stat__hint">Encuentra el área que necesitas</span>
          </article>
          <article className="dashboard-stat">
            <span className="dashboard-stat__label">Tu cuenta</span>
            <strong className="dashboard-stat__value">{rolVisible}</strong>
            <span className="dashboard-stat__hint">{esFreelancer ? "Publica servicios y recibe propuestas" : "Publica proyectos y contacta talento"}</span>
          </article>
        </div>
      </section>

      <section className="ui-section" aria-labelledby="dashboard-avisos-title">
        <div className="ui-section-head">
          <div>
            <h2 id="dashboard-avisos-title">Avisos</h2>
            <p>Recomendaciones para aprovechar mejor tu cuenta.</p>
          </div>
        </div>
        <div className="dashboard-notices">
          <article className="dashboard-notice">
            <span className="dashboard-notice__icon" aria-hidden="true">
              ★
            </span>
            <div>
              <h3>{esFreelancer ? "Tu portafolio es tu carta de presentación" : "El portafolio va primero"}</h3>
              <p>
                {esFreelancer
                  ? "Añade una descripción clara, habilidades y servicios para que los clientes entiendan cómo puedes ayudar."
                  : "Revisa el portafolio y la calificación antes de contactar. Así eliges al profesional correcto desde el inicio."}
              </p>
              <Link to={esFreelancer ? "/perfil/freelancer" : rutaExplorar}>{esFreelancer ? "Revisar mi perfil" : "Explorar talento"}</Link>
            </div>
          </article>
          <article className="dashboard-notice">
            <span className="dashboard-notice__icon" aria-hidden="true">
              ✉
            </span>
            <div>
              <h3>{esFreelancer ? "Postula con contexto" : "Contacta desde un servicio"}</h3>
              <p>
                {esFreelancer
                  ? "Lee el proyecto completo y envía una propuesta con alcance y presupuesto. Las propuestas claras reciben mejores respuestas."
                  : "Abre el perfil de un freelancer y usa Contactar. La conversación queda vinculada al servicio que te interesa."}
              </p>
              <Link to={rutaCatalogo}>{esFreelancer ? "Ver proyectos" : "Ver servicios"}</Link>
            </div>
          </article>
        </div>
      </section>

      <section className="ui-section" aria-labelledby="dashboard-feed-title">
        <div className="ui-section-head">
          <div>
            <h2 id="dashboard-feed-title">{esFreelancer ? "Proyectos para ti" : "Ofertas de freelancers"}</h2>
            <p>
              {esFreelancer
                ? "Oportunidades publicadas por clientes, listas para recibir tu propuesta."
                : "Profesionales con portafolio que pueden sumarse a tu proyecto."}
            </p>
          </div>
          <Link className={buttonClassName({ variant: "ghost", size: "sm" })} to={rutaCatalogo}>
            Ver todo
          </Link>
        </div>

        <div className="feed-content__filters">
          {errorCategorias ? (
            <FeedError mensaje={errorCategorias} onReintentar={recargarCategorias} />
          ) : estadoCategorias.estado === "cargando" ? (
            <FeedFiltersSkeleton />
          ) : (
            <FeedFiltros categorias={categoriasDisponibles} activa={categoriaActiva} onChange={setCategoriaActiva} />
          )}
        </div>

        {estadoFeed.estado === "cargando" ? (
          <FeedSkeleton />
        ) : errorFeed ? (
          <FeedError mensaje={errorFeed} onReintentar={recargarFeed} />
        ) : piezasVisibles.length > 0 ? (
          <div className="dashboard-grid">
            {piezasVisibles.map((pieza) => (
              <FeedPiezaCard key={pieza.id} pieza={pieza} />
            ))}
          </div>
        ) : (
          <FeedVacio
            buscando={buscando}
            titulo={esFreelancer ? "Aún no hay proyectos publicados" : "Aún no hay servicios publicados"}
            mensaje={
              esFreelancer
                ? "Cuando un cliente publique un proyecto, aparecerá aquí. Mientras tanto, puedes explorar el marketplace."
                : "Cuando un freelancer publique un servicio, aparecerá aquí. Mientras tanto, puedes explorar el talento disponible."
            }
            onAccion={buscando ? limpiarFiltros : () => navigate(rutaExplorar)}
            etiquetaAccion={buscando ? "Limpiar filtros" : esFreelancer ? "Explorar proyectos" : "Explorar talento"}
          />
        )}
      </section>
    </div>
  );
}
