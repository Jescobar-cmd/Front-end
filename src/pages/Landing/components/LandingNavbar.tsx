import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brand } from "../../components/Brand";

export function LandingNavbar() {
  const navigate = useNavigate();
  return (
    <header className="landing-nav" role="banner">
      <div className="landing-container landing-nav__inner">
        <Link className="landing-nav__brand" to="/" aria-label="FirstGig, inicio">
          <Brand />
        </Link>
        <nav className="landing-nav__links" aria-label="Principal">
          <Link className="landing-nav__link" to="/registro">Ofrecer un servicio</Link>
          <Link className="landing-nav__link" to="/login">Iniciar sesión</Link>
          <Link className="landing-nav__cta" to="/registro">Registrarse</Link>
        </nav>
        <button type="button" className="landing-nav__menu" aria-label="Ir a registrarse" onClick={() => navigate("/registro")}>Registrarse</button>
      </div>
    </header>
  );
}
