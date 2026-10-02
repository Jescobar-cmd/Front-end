import { Routes, Route, Navigate } from "react-router-dom";
import { Registro } from "../pages/Auth/registro";
import { Login } from "../pages/Auth/login";
import { RecuperarPassword } from "../pages/Auth/recuperar_password";
import { RestablecerPassword } from "../pages/Auth/restablecer_password";
import { VerificarCuenta } from "../pages/Auth/verificar_cuenta";
import { CompletarPerfilGoogle } from "../pages/Auth/google_perfil/CompletarPerfilGoogle";
import { RutaProtegida } from "./RutaProtegida";
import { RutaPublica } from "./RutaPublica";
import { Dashboard } from "../pages/dashboard/dashboard";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<RutaPublica><Login /></RutaPublica>} />
      <Route path="/registro" element={<RutaPublica><Registro /></RutaPublica>} />
      <Route path="/recuperar-password" element={<RecuperarPassword />} />
      <Route path="/restablecer-password" element={<RestablecerPassword />} />
      <Route path="/verificar-cuenta" element={<VerificarCuenta />} />
      <Route path="/verificar-enviado" element={<Navigate to="/verificar-cuenta" replace />} />
      <Route path="/confirm" element={<VerificarCuenta />} />
      <Route path="/reset-password" element={<RestablecerPassword />} />
      <Route path="/google/completar-perfil" element={<CompletarPerfilGoogle />} />
      <Route
        path="/dashboard"
        element={
          <RutaProtegida>
            <Dashboard />
          </RutaProtegida>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}