import { Routes, Route, Navigate, useParams, useSearchParams } from "react-router-dom";
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
import { ClientDashboard } from "../features/dashboard/ClientDashboard";
import { FreelancerDashboard } from "../features/dashboard/FreelancerDashboard";
import {
  ClientProfilePage,
  FreelancerProfilePage,
  ProfessionalProfilePage,
} from "../features/profile";
import {
  ChatPage,
  ConversationDetailPage,
  ContractDetailPage,
  ContractsPage,
  LiquidacionesFreelancerPage,
  PagoSimuladoPage,
} from "../features/chat-contracts";
import {
  ClientServicesPage,
  FreelancerMarketplacePage,
  FreelancerServicesPage,
} from "../pages/services-offers";
import { FreelancerDirectoryPage } from "../features/freelancers";
import { CreateProjectPage, CreateServicePage } from "../features/services-offers/CreatePages";
import { ClientOffersRoute } from "./ClientOffersRoute";
import { ModeracionLayout } from "../features/moderacion/ModeracionLayout";
import { DashboardModeracionPage } from "../features/moderacion/pages/DashboardModeracionPage";
import { PublicacionesPage } from "../features/moderacion/pages/PublicacionesPage";
import { PublicacionDetallePage } from "../features/moderacion/pages/PublicacionDetallePage";
import { ReportesPage } from "../features/moderacion/pages/ReportesPage";
import { ReporteDetallePage } from "../features/moderacion/pages/ReporteDetallePage";
import { DisputasPage } from "../features/moderacion/pages/DisputasPage";
import { DisputaDetallePage } from "../features/moderacion/pages/DisputaDetallePage";
import { LiquidacionesPage } from "../features/moderacion/pages/LiquidacionesPage";
import { NotificacionesPage } from "../features/moderacion/pages/NotificacionesPage";
import { UsuariosPage } from "../features/moderacion/pages/UsuariosPage";
import { UsuarioDetallePage } from "../features/moderacion/pages/UsuarioDetallePage";
import { SecurityPage } from "../features/account/SecurityPage";
import { NotificationsPage } from "../features/notifications/NotificationsPage";
import { InvoicesPage } from "../features/invoices/InvoicesPage";

function RedireccionDashboard() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={dashboardPorRol(user.rol)} replace />;
}

function MiPerfilRedirect() {
  const { user, cargando } = useAuth();
  if (cargando) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.rol === "administrador" || user.rol === "moderador") {
    return <Navigate to={dashboardPorRol(user.rol)} replace />;
  }
  if (user.id !== undefined) return <Navigate to={`/perfil/${user.id}`} replace />;
  return <Navigate to={user.rol === "cliente" ? "/perfil/cliente" : "/perfil/freelancer"} replace />;
}

function LegacyProfileRedirect() {
  const { id } = useParams();
  return <Navigate to={id ? `/perfil/${id}` : "/"} replace />;
}

// El backend (back_urls de Mercado Pago y enlaces de notificaciones) usa
// /contratos/:id; la ruta canónica del frontend es /contracts/:id.
function ContratoLegacyRedirect() {
  const { contractId } = useParams();
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return (
    <Navigate
      to={`/contracts/${contractId ?? ""}${query ? `?${query}` : ""}`}
      replace
    />
  );
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

      <Route path="/perfil" element={<MiPerfilRedirect />} />

      {/* El perfil profesional es público: el layout se comparte, pero la ruta
          no queda detrás de RutaProtegida. El backend aún exige JWT para los
          datos, así que la página muestra un acceso a login cuando no hay sesión. */}
      <Route element={<InternalLayout />}>
        <Route path="/perfil/:id" element={<ProfessionalProfilePage />} />
        <Route path="/perfil/usuario/:id" element={<LegacyProfileRedirect />} />
      </Route>

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
          path="/dashboard/freelancer/panel"
          element={
            <RutaProtegida roles={["freelancer"]}>
              <FreelancerDashboard />
            </RutaProtegida>
          }
        />
        <Route
          path="/dashboard/cliente/panel"
          element={
            <RutaProtegida roles={["cliente"]}>
              <ClientDashboard />
            </RutaProtegida>
          }
        />
        <Route
          path="/dashboard/moderador"
          element={
            <RutaProtegida roles={["moderador", "administrador"]}>
              <Navigate to="/moderacion" replace />
            </RutaProtegida>
          }
        />
        <Route
          path="/dashboard/administrador"
          element={
            <RutaProtegida roles={["administrador"]}>
              <Navigate to="/moderacion" replace />
            </RutaProtegida>
          }
        />
        <Route
          path="/cuenta/seguridad"
          element={
            <RutaProtegida>
              <SecurityPage />
            </RutaProtegida>
          }
        />
        <Route path="/cambiar-password" element={<Navigate to="/cuenta/seguridad" replace />} />
        <Route path="/notificaciones" element={<NotificationsPage />} />
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
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:conversationId" element={<ConversationDetailPage />} />
        <Route path="/contracts" element={<ContractsPage />} />
        <Route path="/contracts/:contractId" element={<ContractDetailPage />} />
        <Route
          path="/facturas"
          element={<RutaProtegida roles={["cliente", "freelancer"]}><InvoicesPage /></RutaProtegida>}
        />
        <Route path="/contratos/:contractId" element={<ContratoLegacyRedirect />} />
        <Route path="/pago/simulado" element={<PagoSimuladoPage />} />
        <Route
          path="/talento"
          element={
            <RutaProtegida>
              <FreelancerDirectoryPage />
            </RutaProtegida>
          }
        />
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
          path="/dashboard/freelancer/liquidaciones"
          element={
            <RutaProtegida roles={["freelancer"]}>
              <LiquidacionesFreelancerPage />
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
        <Route
          element={
            <RutaProtegida roles={["moderador", "administrador"]}>
              <ModeracionLayout />
            </RutaProtegida>
          }
        >
          <Route path="/moderacion" element={<DashboardModeracionPage />} />
          <Route path="/moderacion/publicaciones" element={<PublicacionesPage />} />
          <Route
            path="/moderacion/publicaciones/:tipo/:id"
            element={<PublicacionDetallePage />}
          />
          <Route path="/moderacion/reportes" element={<ReportesPage />} />
          <Route path="/moderacion/reportes/:id" element={<ReporteDetallePage />} />
          <Route path="/moderacion/disputas" element={<DisputasPage />} />
          <Route path="/moderacion/disputas/:id" element={<DisputaDetallePage />} />
          <Route path="/moderacion/liquidaciones" element={<LiquidacionesPage />} />
          <Route path="/moderacion/notificaciones" element={<NotificacionesPage />} />
          <Route path="/moderacion/usuarios" element={<UsuariosPage />} />
          <Route path="/moderacion/usuarios/:id" element={<UsuarioDetallePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
