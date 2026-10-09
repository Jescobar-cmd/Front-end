import { Link, useLocation } from "react-router-dom";

interface LocationState {
  email?: string;
}

function IconoSobre() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="56" height="56" aria-hidden="true">
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
    <div className="enviado apple-card" role="status">
      <div className="illustration" aria-hidden="true">
        <IconoSobre />
      </div>
      <div className="apple-head">
        <p className="apple-eyebrow">Revisa tu correo</p>
        <h1 className="apple-title">Confirma tu cuenta</h1>
        <p className="apple-subtitle">
          Te enviamos un enlace de confirmación {email ? <>a <strong>{email}</strong></> : "a tu correo"}.
          Ábrelo para activar tu cuenta.
        </p>
      </div>
      <div className="links apple-links">
        <p>
          ¿No te llegó? <Link to="/registro">Intenta de nuevo</Link>
        </p>
        <p>
          <Link to="/login">Volver al inicio</Link>
        </p>
      </div>
    </div>
  );
}
