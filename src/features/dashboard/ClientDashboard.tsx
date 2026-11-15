import { useCallback } from "react";
import { Link } from "react-router-dom";
import { buttonClassName } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { getDashboardCliente } from "../../infrastructure/api/apiDashboard";
import { getMyOffers } from "../../infrastructure/api/apiOfertas";
import { formatMoney } from "../chat-contracts/chatContractsUtils";
import { useNotificaciones } from "../notifications/NotificationsContext";
import {
  DashboardActivityPanel,
  DashboardContractsPanel,
  DashboardDisputeAlert,
  DashboardHeader,
  DashboardOffersPanel,
  DashboardQuickActions,
  DashboardStat,
  DashboardStatsSkeleton,
} from "./DashboardComponents";
import { useAsyncResource } from "./useAsyncResource";
import "./dashboard.css";

export function ClientDashboard() {
  const { user, token } = useAuth();
  const {
    noLeidas,
    mensajesNoLeidos,
    cargando: cargandoNotificaciones,
    error: errorNotificaciones,
  } = useNotificaciones();

  const cargarDashboard = useCallback(() => {
    if (!token) return Promise.reject(new Error("Sesión no disponible."));
    return getDashboardCliente(token);
  }, [token]);

  const cargarOfertas = useCallback(() => {
    if (!token) return Promise.reject(new Error("Sesión no disponible."));
    return getMyOffers(token, { page: 1, limit: 5 });
  }, [token]);

  const dashboard = useAsyncResource(
    cargarDashboard,
    Boolean(token),
    "No se pudo cargar tu panel.",
  );
  const ofertas = useAsyncResource(
    cargarOfertas,
    Boolean(token),
    "No se pudieron cargar tus proyectos.",
  );

  const nombre = user?.nombre?.trim().split(/\s+/)[0] || "de nuevo";
  const sinLeer =
    errorNotificaciones || cargandoNotificaciones
      ? dashboard.data?.notificacionesSinLeer ?? noLeidas
      : noLeidas;

  const header = (
    <DashboardHeader
      eyebrow="Espacio cliente"
      title={`Hola, ${nombre}`}
      description="Gestiona tus proyectos, contratos y conversaciones desde un solo lugar."
      actions={
        <>
          <Link
            className={buttonClassName({ variant: "action", size: "sm" })}
            to="/crear/proyecto"
          >
            Publicar proyecto
          </Link>
          <Link
            className={buttonClassName({ variant: "secondary", size: "sm" })}
            to="/talento"
          >
            Explorar talento
          </Link>
        </>
      }
    />
  );

  if (!token) {
    return (
      <div className="dashboard">
        {header}
        <EmptyState
          title="Sesión no disponible"
          description="Inicia sesión para consultar tu panel de cliente."
          actionLabel="Ir al inicio de sesión"
          to="/login"
        />
      </div>
    );
  }

  if (dashboard.loading) {
    return (
      <div className="dashboard">
        {header}
        <DashboardStatsSkeleton />
      </div>
    );
  }

  if (dashboard.error || !dashboard.data) {
    return (
      <div className="dashboard">
        {header}
        <EmptyState
          title="No pudimos cargar tu panel"
          description={dashboard.error || "Intenta de nuevo en unos segundos."}
          actionLabel="Reintentar"
          onAction={dashboard.recargar}
        />
      </div>
    );
  }

  const datos = dashboard.data;

  return (
    <div className="dashboard">
      {header}

      <DashboardDisputeAlert count={datos.disputasAbiertas} />

      <div className="dashboard-stats">
        <DashboardStat
          label="Contratos activos"
          value={datos.contratosActivos}
          hint={`${datos.contratosCompletados} completados`}
          icon="contract"
          to="/contracts"
        />
        <DashboardStat
          label="Entregas pendientes"
          value={datos.entregasPendientes}
          hint="Esperando tu revisión"
          icon="delivery"
          to="/contracts"
          tone={datos.entregasPendientes > 0 ? "warning" : "accent"}
        />
        <DashboardStat
          label="Pagos pendientes"
          value={datos.pagosPendientes}
          hint="Por confirmar"
          icon="payment"
          to="/contracts"
          tone={datos.pagosPendientes > 0 ? "warning" : "accent"}
        />
        <DashboardStat
          label="Total pagado"
          value={formatMoney(datos.totalPagado)}
          hint="Histórico de pagos"
          icon="wallet"
          tone="action"
        />
        <DashboardStat
          label="Notificaciones sin leer"
          value={sinLeer}
          hint="Avisos sin revisar"
          icon="bell"
          to="/notificaciones"
          tone={sinLeer > 0 ? "gold" : "neutral"}
        />
        <DashboardStat
          label="Mensajes sin leer"
          value={mensajesNoLeidos}
          hint="Conversaciones abiertas"
          icon="message"
          to="/chat"
          tone={mensajesNoLeidos > 0 ? "action" : "neutral"}
        />
      </div>

      <DashboardQuickActions
        actions={[
          {
            to: "/talento",
            label: "Explorar talento",
            hint: "Encuentra freelancers",
            icon: "search",
          },
          {
            to: "/crear/proyecto",
            label: "Publicar proyecto",
            hint: "Recibe propuestas",
            icon: "plus",
          },
          {
            to: "/dashboard/cliente/ofertas",
            label: "Mis proyectos",
            hint: "Gestiona tus publicaciones",
            icon: "proposal",
          },
          {
            to: "/contracts",
            label: "Contratos",
            hint: "Revisa acuerdos y entregas",
            icon: "contract",
          },
          {
            to: "/chat",
            label: "Mensajes",
            hint: "Habla con freelancers",
            icon: "message",
            badge: mensajesNoLeidos,
          },
          {
            to: "/notificaciones",
            label: "Notificaciones",
            hint: "Revisa tus avisos",
            icon: "bell",
            badge: sinLeer,
          },
        ]}
      />

      <div className="dashboard-main-grid">
        <DashboardContractsPanel
          contratos={datos.contratosRecientes.slice(0, 5)}
          loading={false}
          error=""
          onRetry={dashboard.recargar}
          emptyDescription="Explora talento y acuerda tu primer proyecto."
          emptyTo="/talento"
          emptyLabel="Explorar talento"
        />
        <DashboardActivityPanel />
      </div>

      <DashboardOffersPanel
        ofertas={ofertas.data?.items.slice(0, 5) ?? []}
        loading={ofertas.loading}
        error={ofertas.error}
        onRetry={ofertas.recargar}
      />
    </div>
  );
}
