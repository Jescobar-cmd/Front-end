import { useMemo, useState } from "react";
import { Brand } from "../../components/Brand";
import type { PiezaFeed, TipoCuentaFeed } from "./datosFeed";
import { FeedBuscador, FeedFiltros, FeedPiezaCard, FeedVacio } from "./FeedPiezas";

export interface UsuarioFeed {
  nombre?: string;
  tipoCuenta: TipoCuentaFeed;
}

interface FeedLayoutProps {
  usuario: UsuarioFeed;
  piezas: PiezaFeed[];
}

export function FeedLayout({ usuario, piezas }: FeedLayoutProps) {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todo");

  const categorias = useMemo(
    () => [...new Set(piezas.map((pieza) => pieza.categoria))],
    [piezas],
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

  const nombre = usuario.nombre?.trim().split(/\s+/)[0] || "bienvenido";
  const esFreelancer = usuario.tipoCuenta === "freelancer";

  return (
    <div className={`feed-layout feed-layout--${usuario.tipoCuenta}`}>
      <header className="feed-topbar">
        <a className="feed-brand" href={esFreelancer ? "/dashboard/freelancer" : "/inicio"} aria-label="FirstGig, ir al inicio">
          <Brand variant="dark" />
        </a>
        <FeedBuscador
          valor={busqueda}
          onChange={setBusqueda}
          placeholder={esFreelancer ? "Buscar proyectos por título o habilidad" : "Buscar servicios o freelancers"}
        />
        <div className="feed-topbar__right">
          <span className="feed-topbar__icon" aria-hidden="true">▢</span>
          <span className="feed-topbar__icon" aria-hidden="true">♧</span>
          <div className="feed-account">
            <span className="feed-account__avatar" aria-hidden="true">
              {nombre.charAt(0).toLocaleUpperCase()}
            </span>
            <span className="feed-account__identity">
              <strong>{usuario.nombre || "Mi cuenta"}</strong>
              <small>{esFreelancer ? "Cuenta de freelancer" : "Cuenta de cliente"}</small>
            </span>
          </div>
        </div>
      </header>

      <div className="feed-app">
        <aside className="feed-sidebar" aria-label="Navegación principal">
          <p className="feed-sidebar__label">MI ESPACIO</p>
          <nav>
            <a className="is-current" href="#inicio"><span aria-hidden="true">⌂</span>Inicio</a>
            <a href="#services"><span aria-hidden="true">⌕</span>{esFreelancer ? "Buscar proyectos" : "Explorar talento"}</a>
            <a href="#activity"><span aria-hidden="true">▤</span>{esFreelancer ? "Mis postulaciones" : "Mis proyectos"}</a>
            <a href="#summary"><span aria-hidden="true">▦</span>Estadísticas</a>
            <a href="#services"><span aria-hidden="true">＋</span>{esFreelancer ? "Explorar ofertas" : "Ver talento"}</a>
          </nav>
          <div className="feed-sidebar__help">
            <span aria-hidden="true">?</span>
            <strong>¿Necesitas una mano?</strong>
            <p>Estamos aquí para ayudarte a dar el siguiente paso.</p>
            <a href="#notices">Centro de ayuda ↗</a>
          </div>
          <span className="feed-sidebar__copyright">© 2026 First Gig</span>
        </aside>

        <main className="feed-main" id="inicio">
          <div className="feed-workspace">
            <div className="feed-primary">
              <section className="feed-intro" aria-labelledby="feed-title">
                <div>
                  <h1 id="feed-title">¡Hola de nuevo, {nombre}!</h1>
                  <p>{esFreelancer ? "Explora nuevos proyectos y oportunidades para tu carrera." : "Este es el pulso de tus proyectos y tu comunidad."}</p>
                </div>
                <a className="feed-primary-action" href="#services">
                  {esFreelancer ? "Explorar proyectos" : "Explorar talento"}
                </a>
              </section>

              <section className="feed-feature" aria-label="Recomendación">
                <div>
                  <p className="feed-feature__eyebrow">{esFreelancer ? "TU TALENTO MERECE SER VISTO" : "BUEN TALENTO, GRANDES PROYECTOS"}</p>
                  <h2>{esFreelancer ? "Un perfil completo abre más puertas" : "Encuentra talento verificado"}</h2>
                  <p>{esFreelancer ? "Muestra tus habilidades y conecta con mejores oportunidades." : "Explora freelancers con experiencia comprobada y un perfil claro."}</p>
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
                    <p>{esFreelancer ? "Oportunidades seleccionadas para tus habilidades." : "Conoce profesionales que pueden sumarse a tu proyecto."}</p>
                  </div>
                  <a className="feed-text-link" href="#activity">Ver todas <span aria-hidden="true">→</span></a>
                </div>
                <div className="feed-content__filters">
                  <FeedFiltros categorias={categorias} activa={categoriaActiva} onChange={setCategoriaActiva} />
                </div>
                {piezasVisibles.length > 0 ? (
                  <div className="feed-grid">
                    {piezasVisibles.map((pieza) => <FeedPiezaCard key={pieza.id} pieza={pieza} />)}
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
                <div className="feed-activity__row">
                  <span className="feed-activity__symbol" aria-hidden="true">◇</span>
                  <div><strong>{esFreelancer ? "Tu próxima oportunidad comienza aquí" : "Organiza tus proyectos en un solo lugar"}</strong><small>{esFreelancer ? "Explora los proyectos recomendados para ti." : "Publica un proyecto y encuentra el talento indicado."}</small></div>
                  <a href="#services" aria-label="Ver oportunidades">↗</a>
                </div>
              </section>
            </div>

            <aside className="feed-aside" aria-label="Resumen de cuenta">
              <section className="feed-panel" id="summary">
                <div className="feed-panel__heading"><h2>Resumen</h2><span>Este mes</span></div>
                <p className="feed-panel__caption">Tu actividad en First Gig</p>
                <div className="feed-stat"><span aria-hidden="true">▤</span><span>{esFreelancer ? "Proyectos nuevos" : "Proyectos publicados"}</span><strong>{piezasVisibles.length}</strong></div>
                <div className="feed-stat"><span aria-hidden="true">◇</span><span>{esFreelancer ? "Postulaciones" : "Perfiles vistos"}</span><strong>5</strong></div>
                <div className="feed-stat"><span aria-hidden="true">▢</span><span>Mensajes nuevos</span><strong>2</strong></div>
              </section>

              <section className="feed-panel" id="notices">
                <div className="feed-panel__heading"><h2>Avisos</h2><span className="feed-badge">2 nuevos</span></div>
                <article className="feed-notice"><span className="feed-notice__avatar">FG</span><div><strong>{esFreelancer ? "Nuevo proyecto recomendado" : "Nuevo talento disponible"}</strong><p>{esFreelancer ? "Hay oportunidades que coinciden con tus habilidades." : "Descubre perfiles listos para colaborar en tu proyecto."}</p><a href="#services">Ver detalles ↗</a></div></article>
                <article className="feed-notice"><span className="feed-notice__avatar">✳</span><div><strong>Tu actividad está al día</strong><p>Vuelve pronto para ver nuevas actualizaciones.</p><a href="#activity">Ver actividad ↗</a></div></article>
              </section>

              <section className="feed-panel" id="profile">
                <div className="feed-panel__heading"><h2>{esFreelancer ? "Mi perfil" : "Mi cuenta"}</h2><a className="feed-text-link" href="#inicio">Ver</a></div>
                <p className="feed-panel__caption">{usuario.nombre || "Completa tu perfil para empezar"}</p>
                <div className="feed-profile-progress"><span /><span /></div>
                <a className="feed-panel__link" href="#services">{esFreelancer ? "Completar perfil" : "Explorar servicios"} <span>↗</span></a>
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
