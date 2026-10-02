import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Login / registro: si ya hay sesión, se va directo a la página principal
export function RutaPublica({ children }: { children: ReactNode }) {
  const { user, cargando } = useAuth();

  if (cargando) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}