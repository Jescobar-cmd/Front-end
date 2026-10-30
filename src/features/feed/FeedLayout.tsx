import { useCallback, useMemo, useState } from "react";
import { FeedTopbar } from "./FeedTopbar";
import { FeedSidebar } from "./FeedSidebar";
import {
  FeedFiltros,
  FeedPiezaCard,
  FeedVacio,
  FeedError,
  FeedLoading,
} from "./FeedPiezas";
import { MOSTRAR_EJEMPLOS } from "./datosFeed";
import { avisosDemo, resumenDemo } from "./datosDemoFeed";
import type { FeedData } from "./useFeedData";
import { FeedPublicaciones } from "./FeedPublicaciones";
import "./feed.css";

interface FeedLayoutProps {
  datos: FeedData;
}

const SIDEBAR_KEY = "first_gig_sidebar_colapsada";

function leerSidebarColapsada(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === "true";
  } catch {
    return false;
  }
}

export function FeedLayout({ datos }: FeedLayoutProps) {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todo");
  const [sidebarColapsada, setSidebarColapsada] = useState(leerSidebarColapsada);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  const alternarSidebar = useCallback(() => {
    setSidebarColapsada((actual) => {
      const siguiente = !actual;
      try {
        localStorage.setItem(SIDEBAR_KEY, String(siguiente));
      } catch {
        // La preferencia sigue funcionando durante la sesión.
      }
      return siguiente;
    });
  }, []);

  const cerrarMenuMovil = useCallback(() => setMenuMovilAbierto(false), []);

  const {
    usuario,
    errorUsuario,
    recargarUsuario,
    estadoFeed,
    errorFeed,
    recargarFeed,
    categorias,
    estadoCategorias,
    errorCategorias,
    recargarCategorias,
    proyectosParaTi,
    vistaPrevia,
  } = datos;
  const esFreelancer = usuario.tipoCuenta === "freelancer";
  const mostrarEjemplos = MOSTRAR_EJEMPLOS || vistaPrevia;

  const categoriasDisponibles = useMemo(
    () => [...new Set(categorias.map((categoria) => categoria.nombre).filter(Boolean))],
    [categorias],
  );

  const piezasVisibles = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase();
    return proyectosParaTi.filter((pieza) => {
      const coincideCategoria =
        categoriaActiva === "Todo" || pieza.categoria === categoriaActiva;
      const texto = [pieza.titulo, pieza.descripcion, pieza.categoria, ...pieza.etiquetas]
        .join(" ")
        .toLocaleLowerCase();
      return coincideCategoria && (!termino || texto.includes(termino));
    });
  }, [busqueda, categoriaActiva, proyectosParaTi]);

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
        onAbrirMenu={() => setMenuMovilAbierto(true)}
        menuAbierto={menuMovilAbierto}
      />

      <div className="feed-app">
        <FeedSidebar
          esFreelancer={esFreelancer}
          colapsada={sidebarColapsada}
          onToggleColapsada={alternarSidebar}
          abierta={menuMovilAbierto}
          onCerrar={cerrarMenuMovil}
        />

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
                  {errorUsuario && (
                    <p role="status">
                      No se pudo actualizar tu perfil: {errorUsuario}
                      {" "}
                      <button type="button" onClick={recargarUsuario}>Reintentar</button>
                    </p>
                  )}
                </div>
                <a className="feed-primary-action" href={esFreelancer ? "/dashboard/freelancer/ofertas" : "/servicios"}>
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
                <a href={esFreelancer ? "/perfil/freelancer" : "/perfil/cliente"}>
                  {esFreelancer ? "Completar mi perfil" : "Explorar talento"} <span aria-hidden="true">↗</span>
                </a>
                {esFreelancer && (mostrarEjemplos ? (
                  <div className="feed-feature__progress"><span>Tu perfil</span><strong>80%</strong><i><b /></i></div>
                ) : (
                  <p>No hay datos de completitud del perfil disponibles.</p>
                ))}
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
                  <a className="feed-text-link" href={esFreelancer ? "/dashboard/freelancer/ofertas" : "/servicios"}>Ver todas <span aria-hidden="true">→</span></a>
                </div>
                <div className="feed-content__filters">
                  {errorCategorias ? (
                    <FeedError mensaje={errorCategorias} onReintentar={recargarCategorias} />
                  ) : estadoCategorias.estado === "cargando" ? (
                    <FeedLoading />
                  ) : (
                    <FeedFiltros
                      categorias={categoriasDisponibles}
                      activa={categoriaActiva}
                      onChange={setCategoriaActiva}
                    />
                  )}
                </div>
                {estadoFeed.estado === "cargando" && !mostrarEjemplos ? (
                  <FeedLoading />
                ) : errorFeed && !mostrarEjemplos ? (
                  <FeedError mensaje={errorFeed} onReintentar={recargarFeed} />
                ) : (
                  <>
                    {errorFeed && mostrarEjemplos && !vistaPrevia && (
                      <FeedError mensaje={errorFeed} onReintentar={recargarFeed} />
                    )}
                    {piezasVisibles.length > 0 ? (
                      <div className="feed-grid">
                        {piezasVisibles.map((pieza) => (
                          <FeedPiezaCard key={pieza.id} pieza={pieza} />
                        ))}
                      </div>
                    ) : (
                      <FeedVacio
                        buscando={Boolean(busqueda) || categoriaActiva !== "Todo"}
                        onAccion={busqueda ? () => setBusqueda("") : () => setCategoriaActiva("Todo")}
                        etiquetaAccion={busqueda ? "Limpiar búsqueda" : "Ver todas las categorías"}
                      />
                    )}
                  </>
                )}
              </section>

              <FeedPublicaciones vistaPrevia={vistaPrevia} />

              {esFreelancer && (
                <section className="feed-activity" id="activity">
                  <div className="feed-toolbar">
                    <div>
                      <h2>Mis postulaciones</h2>
                      <p>Un vistazo rápido a tu actividad reciente.</p>
                    </div>
                    <a className="feed-text-link" href="/dashboard/freelancer/ofertas">Ver actividad <span aria-hidden="true">→</span></a>
                  </div>

                  {mostrarEjemplos ? (
                    <div className="feed-activity__row">
                      <span className="feed-activity__symbol" aria-hidden="true">◇</span>
                      <div>
                        <strong>Tu próxima oportunidad comienza aquí</strong>
                        <small>Explora los proyectos recomendados para ti.</small>
                      </div>
                      <a href="/dashboard/freelancer/ofertas" aria-label="Ver oportunidades">↗</a>
                    </div>
                  ) : (
                    <FeedVacio buscando={false} />
                  )}
                </section>
              )}
            </div>

            <aside className="feed-aside" aria-label="Resumen de cuenta">
              <section className="feed-panel" id="summary">
                <div className="feed-panel__heading">
                  <h2>Resumen</h2>
                  <span>Este mes</span>
                </div>
                <p className="feed-panel__caption">Tu actividad en First Gig</p>
                {mostrarEjemplos ? resumenDemo.map((stat) => (
                  <div className="feed-stat" key={stat.id}>
                    <span aria-hidden="true">{stat.icono}</span>
                    <span>{stat.label}</span>
                    <strong>{stat.valor}</strong>
                  </div>
                )) : <p className="feed-panel__caption">No hay datos de resumen disponibles.</p>}
              </section>

              <section className="feed-panel" id="notices">
                <div className="feed-panel__heading">
                  <h2>Avisos</h2>
                  {mostrarEjemplos && <span className="feed-badge">2 nuevos</span>}
                </div>
                {mostrarEjemplos ? avisosDemo.map((aviso) => (
                  <article className="feed-notice" key={aviso.id}>
                    <span className="feed-notice__avatar">{aviso.avatar}</span>
                    <div>
                      <strong>{aviso.titulo}</strong>
                      <p>{aviso.texto}</p>
                      <a href={aviso.destino}>Ver detalles ↗</a>
                    </div>
                  </article>
                )) : <p className="feed-panel__caption">No hay avisos disponibles.</p>}
              </section>

              <section className="feed-aside-callout">
                <span aria-hidden="true">✧</span>
                <p>UN BUEN COMIENZO</p>
                <h2>{esFreelancer ? "Tu próximo proyecto puede estar aquí." : "Una propuesta a tu medida marca la diferencia."}</h2>
                <a href={esFreelancer ? "/dashboard/freelancer/ofertas" : "/servicios"}>{esFreelancer ? "Ver oportunidades" : "Explorar servicios"} ↗</a>
              </section>
            </aside>
          </div>
        </main>
      </div>
      <footer className="feed-footer"><span>FIRST GIG</span><span>Ideas que encuentran su equipo.</span></footer>
    </div>
  );
}
