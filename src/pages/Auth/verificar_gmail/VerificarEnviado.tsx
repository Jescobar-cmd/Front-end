import { Link, useLocation } from "react-router-dom";

interface LocationState {
  email?: string;
}

function IconoSobre() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="56" height="56">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 6 10 7 10-7" />
    </svg>
  );
}

export function VerificarEnviado() {
  const location = useLocation();
  const state = location.state as LocationState | null;
  const email = state?.email;

  return (
    <div className="enviado">
      <div className="illustration">
        <IconoSobre />
      </div>
      <h1>Confirma tu cuenta</h1>
      <p>
        Te enviamos un enlace de confirmación {email ? <>a <strong>{email}</strong></> : "a tu correo"}.
        Ábrelo para activar tu cuenta.
      </p>
      <div className="links">
        <p>
          ¿No te llegó? <Link to="/registro">Intenta de nuevo</Link>
        </p>
      </div>
    </div>
  );
}