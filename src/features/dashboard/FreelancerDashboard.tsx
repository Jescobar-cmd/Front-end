import { useCallback } from "react";
import { Link } from "react-router-dom";
import { buttonClassName } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { getContracts } from "../../infrastructure/api/apiContratos";
import { getDashboardFreelancer } from "../../infrastructure/api/apiDashboard";
import { getMyProposals } from "../../infrastructure/api/apiOfertas";
import { getMyServices } from "../../infrastructure/api/apiServicios";
import { formatMoney } from "../chat-contracts/chatContractsUtils";
import { useNotificaciones } from "../notifications/NotificationsContext";
import {
  DashboardActivityPanel,
  DashboardContractsPanel,
  DashboardDisputeAlert,
  DashboardHeader,
  DashboardPanel,
  DashboardProposalsPanel,
  DashboardQuickActions,
  DashboardServicesPanel,
  DashboardStat,
  DashboardStatsSkeleton,
} from "./DashboardComponents";
import { DashboardIcon } from "./DashboardIcons";
import type { DashboardIconKind } from "./DashboardIcons";
import { useAsyncResource } from "./useAsyncResource";
import "./dashboard.css";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("es").format(Number.isFinite(value) ? value : 0);
}

export function FreelancerDashboard() {
  const { user, token } = useAuth();
  const {
    noLeidas,
    mensajesNoLeidos,
    cargando: cargandoNotificaciones,
    error: errorNotificaciones,
  } = useNotificaciones();

  const cargarDashboard = useCallback(() => {
    if (!token) return Promise.reject(new Error("Sesión no disponible."));
    return getDashboardFreelancer(token);
  }, [token]);

  const cargarContratos = useCallback(() => {
    if (!token) return Promise.reject(new Error("Sesión no disponible."));
    return getContracts(token);
  }, [token]);

  const cargarPropuestas = useCallback(() => {
    if (!token) return Promise.reject(new Error("Sesión no disponible."));
    return getMyProposals(token);
  }, [token]);

  const cargarServicios = useCallback(() => {
    if (!token) return Promise.reject(new Error("Sesión no disponible."));
    return getMyServices(token, { page: 1, limit: 4 });
  }, [token]);

  const dashboard = useAsyncResource(
    cargarDashboard,
    Boolean(token),
    "No se pudo cargar tu panel.",
  );
  const contratos = useAsyncResource(
    cargarContratos,
    Boolean(token),
    "No se pudieron cargar tus contratos.",
  );
  const propuestas = useAsyncResource(
    cargarPropuestas,
    Boolean(token),
    "No se pudieron cargar tus propuestas.",
  );
  const servicios = useAsyncResource(
    cargarServicios,
    Boolean(token),
    "No se pudieron cargar tus servicios.",
  );

  const nombre = user?.nombre?.trim().split(/\s+/)[0] || "de nuevo";
  const sinLeer =
    errorNotificaciones || cargandoNotificaciones
      ? dashboard.data?.notificacionesSinLeer ?? noLeidas
      : noLeidas;

  const header = (
    <DashboardHeader
      eyebrow="Espacio freelancer"
      title={`Hola, ${nombre}`}
      description="Revisa tu actividad, propuestas y servicios en un solo panel."
      actions={
        <>
          <Link
            className={buttonClassName({ variant: "action", size: "sm" })}
            to="/crear/servicio"
          >
            Publicar servicio
          </Link>
          <Link
            className={buttonClassName({ variant: "secondary", size: "sm" })}
            to="/dashboard/freelancer/ofertas"
          >
            Explorar proyectos
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
          description="Inicia sesión para consultar tu panel de freelancer."
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
  const calificacion =
    datos.calificacionPromedio > 0
      ? `${datos.calificacionPromedio.toFixed(1)} / 5`
      : "Sin calificar";

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
          label="Propuestas pendientes"
          value={datos.propuestasPendientes}
          hint="Esperando respuesta"
          icon="proposal"
          to="/dashboard/freelancer/ofertas"
          tone={datos.propuestasPendientes > 0 ? "action" : "neutral"}
        />
        <DashboardStat
          label="Servicios activos"
          value={datos.serviciosActivos}
          hint="Publicados en tu perfil"
          icon="service"
          to="/dashboard/freelancer/servicios"
        />
        <DashboardStat
          label="Saldo disponible"
          value={formatMoney(datos.saldoDisponible)}
          hint="Listo para retirar"
          icon="wallet"
          to="/dashboard/freelancer/liquidaciones"
          tone="action"
        />
        <DashboardStat
          label="Calificación promedio"
          value={calificacion}
          hint={`${formatNumber(datos.visitasPerfil)} visitas al perfil`}
          icon="star"
          tone="gold"
        />
        <DashboardStat
          label="Notificaciones sin leer"
          value={sinLeer}
          hint={`${formatNumber(datos.visualizacionesPropuesta)} visualizaciones de propuestas`}
          icon="bell"
          to="/notificaciones"
          tone={sinLeer > 0 ? "gold" : "neutral"}
        />
      </div>

      <DashboardQuickActions
        actions={[
          {
            to: "/dashboard/freelancer/ofertas",
            label: "Explorar proyectos",
            hint: "Encuentra nuevos clientes",
            icon: "search",
          },
          {
            to: "/crear/servicio",
            label: "Publicar servicio",
            hint: "Muestra lo que haces",
            icon: "plus",
          },
          {
            to: "/dashboard/freelancer/servicios",
            label: "Mis servicios",
            hint: "Gestiona tus publicaciones",
            icon: "service",
          },
          {
            to: "/contracts",
            label: "Contratos",
            hint: "Revisa acuerdos y entregas",
            icon: "contract",
          },
          {
            to: "/dashboard/freelancer/liquidaciones",
            label: "Liquidaciones",
            hint: "Cobra tu saldo disponible",
            icon: "wallet",
          },
          {
            to: "/chat",
            label: "Mensajes",
            hint: "Habla con tus clientes",
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
          contratos={contratos.data?.contratos.slice(0, 5) ?? []}
          loading={contratos.loading}
          error={contratos.error}
          onRetry={contratos.recargar}
          emptyDescription="Encuentra un proyecto y envía tu primera propuesta."
          emptyTo="/dashboard/freelancer/ofertas"
          emptyLabel="Explorar proyectos"
        />

        <div className="dashboard-side-stack">
          <DashboardActivityPanel />
          <DashboardPanel
            id="dashboard-performance-title"
            title="Rendimiento"
            description="Cómo está funcionando tu perfil."
          >
            <div className="dashboard-metrics">
              <Metric
                icon="eye"
                label="Visitas al perfil"
                value={formatNumber(datos.visitasPerfil)}
              />
              <Metric
                icon="chart"
                label="Vistas de propuestas"
                value={formatNumber(datos.visualizacionesPropuesta)}
              />
              <Metric
                icon="contract"
                label="Contratos completados"
                value={formatNumber(datos.contratosCompletados)}
              />
              <Metric
                icon="delivery"
                label="Entregas pendientes"
                value={formatNumber(datos.entregasPendientes)}
                tone={datos.entregasPendientes > 0 ? "warning" : "neutral"}
              />
              <Metric
                icon="payment"
                label="Pagos pendientes"
                value={formatNumber(datos.pagosPendientes)}
                tone={datos.pagosPendientes > 0 ? "warning" : "neutral"}
              />
              <Metric
                icon="dispute"
                label="Disputas abiertas"
                value={formatNumber(datos.disputasAbiertas)}
                tone={datos.disputasAbiertas > 0 ? "danger" : "neutral"}
              />
            </div>
          </DashboardPanel>
        </div>
      </div>

      <div className="dashboard-secondary-grid">
        <DashboardProposalsPanel
          propuestas={propuestas.data?.propuestas.slice(0, 4) ?? []}
          loading={propuestas.loading}
          error={propuestas.error}
          onRetry={propuestas.recargar}
        />
        <DashboardServicesPanel
          servicios={servicios.data?.items.slice(0, 4) ?? []}
          loading={servicios.loading}
          error={servicios.error}
          onRetry={servicios.recargar}
        />
      </div>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: DashboardIconKind;
  label: string;
  value: string;
  tone?: "neutral" | "warning" | "danger" | "action";
}) {
  return (
    <div className={`dashboard-metric dashboard-metric--${tone}`}>
      <span className="dashboard-metric__icon" aria-hidden="true">
        <DashboardIcon kind={icon} />
      </span>
      <strong>{value}</strong>
      <small>{label}</small>
    </div>
  );
}
