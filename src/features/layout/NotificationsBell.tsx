import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getNotifications } from "../../infrastructure/api/apiNotificaciones";

const POLL_MS = 60_000;

export function NotificationsBell() {
  const { token, user } = useAuth();
  const [noLeidas, setNoLeidas] = useState(0);
  const rol = user?.rol === "freelancer" ? "freelancer" : "cliente";

  useEffect(() => {
    if (!token || !user) return;
    let cancelled = false;
    const cargar = () => {
      getNotifications(token, rol, { limit: 1 })
        .then((datos) => {
          if (!cancelled) setNoLeidas(datos.noLeidas);
        })
        .catch(() => undefined);
    };
    cargar();
    const intervalo = setInterval(cargar, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(intervalo);
    };
  }, [token, user, rol]);

  if (!user) return null;

  return (
    <Link className="app-header__icon-link" to="/notificaciones" aria-label={noLeidas > 0 ? `Notificaciones, ${noLeidas} sin leer` : "Notificaciones"}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 9a6 6 0 1 0-12 0c0 6-2.5 7-2.5 7h17S18 15 18 9Z" />
        <path d="M10.3 20a2 2 0 0 0 3.4 0" />
      </svg>
      {noLeidas > 0 && (
        <span className="app-header__badge" aria-hidden="true">
          {noLeidas > 99 ? "99+" : noLeidas}
        </span>
      )}
    </Link>
  );
}
