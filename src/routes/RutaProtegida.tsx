import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Rol } from "../core/domain/entities/user";

const NEEDS_ROLE_SELECTION_KEY = "first_gig_needs_role_selection";

export function RutaProtegida({
  children,
  roles,
  permitirSeleccionRol = false,
}: {
  children: ReactNode;
  roles?: Rol[];
  permitirSeleccionRol?: boolean;
}) {
  const { user, token, cargando } = useAuth();

  if (cargando) {
    return null;
  }

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  if (!permitirSeleccionRol && sessionStorage.getItem(NEEDS_ROLE_SELECTION_KEY) === "1") {
    return <Navigate to="/seleccionar-rol" replace />;
  }

  if (roles && !roles.includes(user.rol)) {
    return <Navigate to={user.rol === "freelancer" ? "/dashboard/freelancer" : "/dashboard/cliente"} replace />;
  }

  return <>{children}</>;
}
