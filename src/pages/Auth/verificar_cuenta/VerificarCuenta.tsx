import { Link, useSearchParams } from "react-router-dom";
import { Spinner } from "../../../components/spinner";
import { useVerificarCuenta } from "../../../hooks/useVerificarCuenta";

function IconoCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="56" height="56">
      <circle cx="12" cy="12" r="10" />
      <path d="m8 12 3 3 5-6" />
    </svg>
  );
}

function IconoError() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="56" height="56">
      <circle cx="12" cy="12" r="10" />
      <path d="M15 9l-6 6M9 9l6 6" />
    </svg>
  );
}

export function VerificarCuenta() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { estado, mensaje } = useVerificarCuenta(token);

  if (estado === "verificando") {
    return (
      <div className="verificar">
        <div className="illustration">
          <Spinner size="large" />
        </div>
        <h1>Verificando tu cuenta</h1>
        <p>Esto solo toma un momento...</p>
      </div>
    );
  }

  if (estado === "exito") {
    return (
      <div className="verificar">
        <div className="illustration">
          <IconoCheck />
        </div>
        <h1>¡Cuenta confirmada!</h1>
        <p>Ya puedes iniciar sesión con tu correo y contraseña.</p>
        <Link to="/login" className="btn btn--primary" style={{ textAlign: "center", textDecoration: "none" }}>
          Ir a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="verificar">
      <div className="illustration">
        <IconoError />
      </div>
      <h1>No se pudo verificar</h1>
      <p className="error">{mensaje}</p>
      <Link to="/login" className="btn btn--secondary" style={{ textAlign: "center", textDecoration: "none" }}>
        Volver al inicio
      </Link>
    </div>
  );
}