import { Navigate } from "react-router-dom";

/**
 * Compatibilidad con enlaces antiguos al dashboard de moderador/administrador.
 * El panel operativo vive ahora en /moderacion.
 */
export function RoleHomePage() {
  return <Navigate to="/moderacion" replace />;
}
