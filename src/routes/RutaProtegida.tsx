import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Rol } from "../core/domain/entities/user";

export function RutaProtegida({ children, roles }: { children: ReactNode; roles?: Rol[] }) {
  const { user, token, cargando } = useAuth();

  if (cargando) {
    return null;
  }

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.rol)) {
    return <Navigate to={user.rol === "freelancer" ? "/dashboard/freelancer" : "/dashboard/cliente"} replace />;
  }

  return <>{children}</>;
}
