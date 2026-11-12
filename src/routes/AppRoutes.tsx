import { Routes, Route, Navigate } from "react-router-dom";
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
import { InternalLayout } from "../features/layout/InternalLayout";
import { ClientProfilePage, FreelancerProfilePage, PublicProfilePage } from "../features/profile";
import {
  ChatPage,
  ConversationDetailPage,
  ContractDetailPage,
  ContractsPage,
} from "../features/chat-contracts";
import {
  ClientServicesPage,
  FreelancerMarketplacePage,
  FreelancerServicesPage,
} from "../pages/services-offers";
import { CreateProjectPage, CreateServicePage } from "../features/services-offers/CreatePages";
import { ClientOffersRoute } from "./ClientOffersRoute";

function RedireccionDashboard() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={dashboardPorRol(user.rol)} replace />;
}

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
      <Route path="/seleccionar-rol" element={<Navigate to="/dashboard" replace />} />

      <Route path="/dashboard" element={<RutaProtegida><RedireccionDashboard /></RutaProtegida>} />

      <Route element={<RutaProtegida><InternalLayout /></RutaProtegida>}>
        <Route
          path="/dashboard/freelancer"
          element={
            <RutaProtegida roles={["freelancer"]}>
              <InicioFreelancer />
            </RutaProtegida>
          }
        />
        <Route
          path="/dashboard/cliente"
          element={
            <RutaProtegida roles={["cliente"]}>
              <InicioCliente />
            </RutaProtegida>
          }
        />
        <Route
          path="/perfil/freelancer"
          element={
            <RutaProtegida roles={["freelancer"]}>
              <FreelancerProfilePage />
            </RutaProtegida>
          }
        />
        <Route
          path="/perfil/cliente"
          element={
            <RutaProtegida roles={["cliente"]}>
              <ClientProfilePage />
            </RutaProtegida>
          }
        />
        <Route path="/perfil/usuario/:id" element={<PublicProfilePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:conversationId" element={<ConversationDetailPage />} />
        <Route path="/contracts" element={<ContractsPage />} />
        <Route path="/contracts/:contractId" element={<ContractDetailPage />} />
        <Route
          path="/servicios"
          element={
            <RutaProtegida roles={["cliente"]}>
              <ClientServicesPage />
            </RutaProtegida>
          }
        />
        <Route
          path="/dashboard/cliente/servicios"
          element={
            <RutaProtegida roles={["cliente"]}>
              <ClientServicesPage />
            </RutaProtegida>
          }
        />
        <Route
          path="/dashboard/cliente/ofertas"
          element={
            <RutaProtegida roles={["cliente"]}>
              <ClientOffersRoute />
            </RutaProtegida>
          }
        />
        <Route
          path="/dashboard/freelancer/ofertas"
          element={
            <RutaProtegida roles={["freelancer"]}>
              <FreelancerMarketplacePage />
            </RutaProtegida>
          }
        />
        <Route
          path="/dashboard/freelancer/servicios"
          element={
            <RutaProtegida roles={["freelancer"]}>
              <FreelancerServicesPage />
            </RutaProtegida>
          }
        />
        <Route
          path="/crear/proyecto"
          element={
            <RutaProtegida roles={["cliente"]}>
              <CreateProjectPage />
            </RutaProtegida>
          }
        />
        <Route
          path="/crear/servicio"
          element={
            <RutaProtegida roles={["freelancer"]}>
              <CreateServicePage />
            </RutaProtegida>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
