import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { useAuth } from "../../../context/AuthContext";

export function CuentaSuspendida() {
  const { cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const salir = () => {
    cerrarSesion();
    navigate("/login", { replace: true });
  };

  return (
    <div className="mod-suspended">
      <div className="mod-suspended__card">
        <span className="mod-suspended__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M5.5 5.5 18.5 18.5" />
            <path d="M12 8v4" />
            <circle cx="12" cy="15.5" r="0.7" fill="currentColor" stroke="none" />
          </svg>
        </span>
        <p className="mod-eyebrow">Acceso restringido</p>
        <h1>Tu cuenta ha sido suspendida</h1>
        <p>
          Contacta a la moderación de FirstGig para revisar tu situación. Mientras la
          suspensión esté activa no podrás acceder al panel ni realizar operaciones.
        </p>
        <div className="mod-suspended__actions">
          <Button variant="primary" onClick={salir}>
            Volver al inicio de sesión
          </Button>
          <a className="ui-button ui-button--secondary" href="mailto:moderacion@firstgig.com">
            Contactar a moderación
          </a>
        </div>
      </div>
    </div>
  );
}
