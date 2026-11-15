import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Rol } from "../core/domain/entities/user";
import { dashboardPorRol } from "./rutasPorRol";

export function RutaProtegida({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: Rol[];
}) {
  const { user, token, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="route-loading" role="status" aria-live="polite">
        <span className="route-loading__spinner" aria-hidden="true" />
        <span>Cargando tu cuenta…</span>
      </div>
    );
  }

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.rol)) {
    return <Navigate to={dashboardPorRol(user.rol)} replace />;
  }

  return <>{children}</>;
}
