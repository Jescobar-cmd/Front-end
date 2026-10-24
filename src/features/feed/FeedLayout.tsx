import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { FeedTopbar } from "./FeedTopbar";
import { FeedSidebar } from "./FeedSidebar";
import {
  FeedFiltros,
  FeedPiezaCard,
  FeedVacio,
  FeedError,
  FeedLoading,
} from "./FeedPiezas";
import { obtenerProyectosParaFreelancer, obtenerTalentoParaExplorar, ofertaAPieza } from "./datosFeed";
import type { TipoCuentaFeed } from "./datosFeed";
import { avisosDemo, resumenDemo } from "./datosDemoFeed";
import { useCategorias, useMisOfertas } from "./hooks/useOfertas";
import "./feed.css";

export interface UsuarioFeed {
  nombre?: string;
  tipoCuenta: TipoCuentaFeed;
}

interface FeedLayoutProps {
  usuario: UsuarioFeed;
}

export function FeedLayout({ usuario }: FeedLayoutProps) {
  const { token } = useAuth();
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todo");

  const esFreelancer = usuario.tipoCuenta === "freelancer";

  const {
    categorias,
    estado: estadoCategorias,
    error: errorCategorias,
    recargar: recargarCategorias,
  } = useCategorias(token);

  const {
    ofertas,
    estado: estadoMisOfertas,
    error: errorMisOfertas,
    recargar: recargarMisOfertas,
  } = useMisOfertas(esFreelancer ? undefined : token);

  const categoriasDisponibles = useMemo(
    () => [...new Set(categorias.map((categoria) => categoria.nombre).filter(Boolean))],
    [categorias],
  );

  const piezas = useMemo(
    () => (esFreelancer ? obtenerProyectosParaFreelancer() : obtenerTalentoParaExplorar()),
    [esFreelancer],
  );

  const piezasVisibles = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase();
    return piezas.filter((pieza) => {
      const coincideCategoria =
        categoriaActiva === "Todo" || pieza.categoria === categoriaActiva;
      const texto = [pieza.titulo, pieza.descripcion, pieza.categoria, ...pieza.etiquetas]
        .join(" ")
        .toLocaleLowerCase();
      return coincideCategoria && (!termino || texto.includes(termino));
    });
  }, [busqueda, categoriaActiva, piezas]);

  const misProyectos = useMemo(
    () => (ofertas && !esFreelancer ? ofertas.items.map(ofertaAPieza) : []),
    [ofertas, esFreelancer],
  );

  const nombre = usuario.nombre?.trim().split(/\s+/)[0] || "bienvenido";

  const placeholder = esFreelancer
    ? "Buscar proyectos por título o habilidad"
    : "Buscar servicios o freelancers";

  return (
    <div className={`feed-layout feed-layout--${usuario.tipoCuenta}`}>
      <FeedTopbar
        valor={busqueda}
        onChange={setBusqueda}
        placeholder={placeholder}
        nombre={usuario.nombre}
        tipoCuenta={usuario.tipoCuenta}
      />

      <div className="feed-app">
        <FeedSidebar esFreelancer={esFreelancer} activo="inicio" />

        <main className="feed-main" id="inicio">
          <div className="feed-workspace">
            <div className="feed-primary">
              <section className="feed-intro" aria-labelledby="feed-title">
                <div>
                  <h1 id="feed-title">¡Hola de nuevo, {nombre}!</h1>
                  <p>
                    {esFreelancer
                      ? "Explora nuevos proyectos y oportunidades para tu carrera."
                      : "Este es el pulso de tus proyectos y tu comunidad."}
                  </p>
                </div>
                <a className="feed-primary-action" href="#services">
                  {esFreelancer ? "Explorar proyectos" : "Explorar talento"}
                </a>
              </section>

              <section className="feed-feature" aria-label="Recomendación">
                <div>
                  <p className="feed-feature__eyebrow">
                    {esFreelancer ? "TU TALENTO MERECE SER VISTO" : "BUEN TALENTO, GRANDES PROYECTOS"}
                  </p>
                  <h2>{esFreelancer ? "Un perfil completo abre más puertas" : "Encuentra talento verificado"}</h2>
                  <p>
                    {esFreelancer
                      ? "Muestra tus habilidades y conecta con mejores oportunidades."
                      : "Explora freelancers con experiencia comprobada y un perfil claro."}
                  </p>
                </div>
                <a href={esFreelancer ? "#profile" : "#services"}>
                  {esFreelancer ? "Completar mi perfil" : "Explorar talento"} <span aria-hidden="true">↗</span>
                </a>
                {esFreelancer && <div className="feed-feature__progress"><span>Tu perfil</span><strong>80%</strong><i><b /></i></div>}
              </section>

              <section className="feed-content" id="services" aria-label="Servicios y oportunidades">
                <div className="feed-toolbar">
                  <div>
                    <h2>{esFreelancer ? "Proyectos para ti" : "Ofertas de freelancers"}</h2>
                    <p>
                      {esFreelancer
                        ? "Oportunidades seleccionadas para tus habilidades."
                        : "Conoce profesionales que pueden sumarse a tu proyecto."}
                    </p>
                  </div>
                  <a className="feed-text-link" href="#activity">Ver todas <span aria-hidden="true">→</span></a>
                </div>
                <div className="feed-content__filters">
                  {errorCategorias ? (
                    <FeedError mensaje={errorCategorias} onReintentar={recargarCategorias} />
                  ) : (
                    <FeedFiltros
                      categorias={categoriasDisponibles}
                      activa={categoriaActiva}
                      onChange={setCategoriaActiva}
                    />
                  )}
                </div>
                {piezasVisibles.length > 0 ? (
                  <div className="feed-grid">
                    {piezasVisibles.map((pieza) => (
                      <FeedPiezaCard key={pieza.id} pieza={pieza} />
                    ))}
                  </div>
                ) : (
                  <FeedVacio buscando={Boolean(busqueda) || categoriaActiva !== "Todo"} />
                )}
              </section>

              <section className="feed-activity" id="activity">
                <div className="feed-toolbar">
                  <div>
                    <h2>{esFreelancer ? "Mis postulaciones" : "Mis proyectos"}</h2>
                    <p>Un vistazo rápido a tu actividad reciente.</p>
                  </div>
                  <a className="feed-text-link" href="#services">Ver actividad <span aria-hidden="true">→</span></a>
                </div>

                {esFreelancer ? (
                  <div className="feed-activity__row">
                    <span className="feed-activity__symbol" aria-hidden="true">◇</span>
                    <div>
                      <strong>Tu próxima oportunidad comienza aquí</strong>
                      <small>Explora los proyectos recomendados para ti.</small>
                    </div>
                    <a href="#services" aria-label="Ver oportunidades">↗</a>
                  </div>
                ) : estadoMisOfertas.estado === "cargando" ? (
                  <FeedLoading />
                ) : errorMisOfertas ? (
                  <FeedError mensaje={errorMisOfertas} onReintentar={recargarMisOfertas} />
                ) : misProyectos.length > 0 ? (
                  <div className="feed-activity__list">
                    {misProyectos.map((proyecto) => (
                      <FeedPiezaCard key={proyecto.id} pieza={proyecto} />
                    ))}
                  </div>
                ) : (
                  <div className="feed-activity__row">
                    <span className="feed-activity__symbol" aria-hidden="true">◇</span>
                    <div>
                      <strong>Organiza tus proyectos en un solo lugar</strong>
                      <small>Publica un proyecto y encuentra el talento indicado.</small>
                    </div>
                    <a href="#services" aria-label="Ver oportunidades">↗</a>
                  </div>
                )}
              </section>
            </div>

            <aside className="feed-aside" aria-label="Resumen de cuenta">
              <section className="feed-panel" id="summary">
                <div className="feed-panel__heading">
                  <h2>Resumen</h2>
                  <span>Este mes</span>
                </div>
                <p className="feed-panel__caption">Tu actividad en First Gig</p>
                {resumenDemo.map((stat) => (
                  <div className="feed-stat" key={stat.id}>
                    <span aria-hidden="true">{stat.icono}</span>
                    <span>{stat.label}</span>
                    <strong>{stat.valor}</strong>
                  </div>
                ))}
              </section>

              <section className="feed-panel" id="notices">
                <div className="feed-panel__heading">
                  <h2>Avisos</h2>
                  <span className="feed-badge">2 nuevos</span>
                </div>
                {avisosDemo.map((aviso) => (
                  <article className="feed-notice" key={aviso.id}>
                    <span className="feed-notice__avatar">{aviso.avatar}</span>
                    <div>
                      <strong>{aviso.titulo}</strong>
                      <p>{aviso.texto}</p>
                      <a href={aviso.destino}>Ver detalles ↗</a>
                    </div>
                  </article>
                ))}
              </section>

              <section className="feed-panel" id="profile">
                <div className="feed-panel__heading">
                  <h2>{esFreelancer ? "Mi perfil" : "Mi cuenta"}</h2>
                  <a className="feed-text-link" href="#inicio">Ver</a>
                </div>
                <p className="feed-panel__caption">{usuario.nombre || "Completa tu perfil para empezar"}</p>
                <div className="feed-profile-progress"><span /><span /></div>
                <a className="feed-panel__link" href="#services">
                  {esFreelancer ? "Completar perfil" : "Explorar servicios"} <span>↗</span>
                </a>
              </section>

              <section className="feed-aside-callout">
                <span aria-hidden="true">✧</span>
                <p>UN BUEN COMIENZO</p>
                <h2>{esFreelancer ? "Tu próximo proyecto puede estar aquí." : "Una propuesta a tu medida marca la diferencia."}</h2>
                <a href="#services">{esFreelancer ? "Ver oportunidades" : "Explorar talento"} ↗</a>
              </section>
            </aside>
          </div>
        </main>
      </div>
      <footer className="feed-footer"><span>FIRST GIG</span><span>Ideas que encuentran su equipo.</span></footer>
    </div>
  );
}
