import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { Registro } from "../pages/Auth/registro";
import { Login } from "../pages/Auth/login";
import { RecuperarPassword } from "../pages/Auth/recuperar_password";
import { RestablecerPassword } from "../pages/Auth/restablecer_password";
import { VerificarCuenta } from "../pages/Auth/verificar_cuenta";
import { CompletarPerfilGoogle } from "../pages/Auth/google_perfil/CompletarPerfilGoogle";
import { RutaProtegida } from "./RutaProtegida";
import { RutaPublica } from "./RutaPublica";
import { useAuth } from "../context/AuthContext";
import { dashboardPorRol } from "./rutasPorRol";
import { InicioCliente } from "../features/feed/InicioCliente";
import { InicioFreelancer } from "../features/feed/InicioFreelancer";

function RedireccionDashboard() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={dashboardPorRol(user.rol)} replace />;
}

function VistaPreviaFeed() {
  const { tipoCuenta } = useParams();

  if (!import.meta.env.DEV) return <Navigate to="/login" replace />;
  if (tipoCuenta === "cliente") {
    return <InicioCliente usuario={{ nombre: "Demo", tipoCuenta: "cliente" }} />;
  }
  if (tipoCuenta === "freelancer") {
    return <InicioFreelancer usuario={{ nombre: "Demo", tipoCuenta: "freelancer" }} />;
  }
  return <Navigate to="/feed-preview/cliente" replace />;
}

export function AppRoutes() {
  const { user } = useAuth();

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
      <Route path="/dashboard" element={<RutaProtegida><RedireccionDashboard /></RutaProtegida>} />
      <Route
        path="/inicio"
        element={
          <RutaProtegida roles={["cliente"]}>
            <InicioCliente
              usuario={{ nombre: user?.nombre, tipoCuenta: user?.rol ?? "cliente" }}
            />
          </RutaProtegida>
        }
      />
      <Route
        path="/dashboard/freelancer"
        element={
          <RutaProtegida roles={["freelancer"]}>
            <InicioFreelancer
              usuario={{ nombre: user?.nombre, tipoCuenta: user?.rol ?? "freelancer" }}
            />
          </RutaProtegida>
        }
      />
      <Route
        path="/dashboard/cliente"
        element={
          <RutaProtegida roles={["cliente"]}>
            <InicioCliente
              usuario={{ nombre: user?.nombre, tipoCuenta: user?.rol ?? "cliente" }}
            />
          </RutaProtegida>
        }
      />
      <Route path="/feed-preview/:tipoCuenta" element={<VistaPreviaFeed />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
