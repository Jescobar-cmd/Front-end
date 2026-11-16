import { Link } from "react-router-dom";

export function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="landing-container landing-footer__inner">
        <div>
          <strong>FirstGig</strong>
          <p>Marketplace para publicar y contratar servicios profesionales.</p>
        </div>
        <nav aria-label="Enlaces del sitio" className="landing-footer__links">
          <Link to="/explorar-servicios">Explorar servicios</Link>
          <Link to="/registro">Registrarse</Link>
          <Link to="/login">Iniciar sesión</Link>
        </nav>
      </div>
      <div className="landing-footer__bottom">
        <span>© {new Date().getFullYear()} FirstGig. Todos los derechos reservados.</span>
      </div>
    </footer>
  );
}
