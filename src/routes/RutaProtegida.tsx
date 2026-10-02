import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RutaProtegida({ children }: { children: ReactNode }) {
  const { user, cargando } = useAuth();

  if (cargando) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}