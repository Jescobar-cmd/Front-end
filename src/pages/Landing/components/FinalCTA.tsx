import { Link } from "react-router-dom";

export function FinalCTA() {
  return (
    <section className="landing-final" aria-labelledby="final-title">
      <div className="landing-container landing-final__inner">
        <h2 id="final-title">¿Tienes un talento? Ofrece tus servicios</h2>
        <p>Únete a FirstGig, crea tu perfil y conecta con clientes que buscan justo lo que sabes hacer.</p>
        <Link className="landing-btn landing-btn--primary" to="/registro">Crear mi cuenta</Link>
      </div>
    </section>
  );
}
