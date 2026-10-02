import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { dashboardPorRol } from "./rutasPorRol";

// Login / registro: si ya hay sesión, se va directo a su dashboard por rol
export function RutaPublica({ children }: { children: ReactNode }) {
  const { user, cargando } = useAuth();

  if (cargando) return null;
  if (user) return <Navigate to={dashboardPorRol(user.rol)} replace />;

  return <>{children}</>;
}
