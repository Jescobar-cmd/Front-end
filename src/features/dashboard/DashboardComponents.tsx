import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { Oferta } from "../../core/domain/entities/oferta";
import type { Contrato } from "../../infrastructure/api/apiContratos";
import type { Propuesta } from "../../infrastructure/api/apiOfertas";
import type { Servicio } from "../../infrastructure/api/apiServicios";
import { NotificacionItem } from "../notifications/NotificacionItem";
import { useNotificaciones } from "../notifications/NotificationsContext";
import {
  formatMoney,
  isActive,
  isCancelled,
  isCompleted,
  statusLabel,
} from "../chat-contracts/chatContractsUtils";
import { DashboardIcon } from "./DashboardIcons";
import type { DashboardIconKind } from "./DashboardIcons";
import "./dashboard.css";

function formatShortDate(value?: string | null): string {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });
}

function inicial(nombre?: string | null): string {
  return nombre?.trim().charAt(0).toLocaleUpperCase() || "?";
}

function contractTone(estado: string): "active" | "done" | "cancelled" | "neutral" {
  if (isActive(estado)) return "active";
  if (isCompleted(estado)) return "done";
  if (isCancelled(estado)) return "cancelled";
  return "neutral";
}

function stateTone(estado: string): "active" | "done" | "cancelled" | "pending" | "neutral" {
  const normalized = estado.trim().toLocaleLowerCase();
  if (["activo", "abierto", "en_progreso", "aceptada", "accepted"].includes(normalized)) {
    return "active";
  }
  if (["completado", "completed"].includes(normalized)) return "done";
  if (["cancelado", "cancelada", "rechazada", "rejected"].includes(normalized)) return "cancelled";
  if (["pendiente", "pending", "contraofertada"].includes(normalized)) return "pending";
  return "neutral";
}

export function DashboardHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="dashboard__welcome">
      <div>
        <p className="ui-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions ? <div className="dashboard-head-actions">{actions}</div> : null}
    </header>
  );
}

export function DashboardStat({
  label,
  value,
  hint,
  icon,
  to,
  tone = "accent",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon: DashboardIconKind;
  to?: string;
  tone?: "accent" | "action" | "warning" | "danger" | "gold" | "neutral";
}) {
  const contenido = (
    <>
      <span className={`dashboard-stat__icon dashboard-stat__icon--${tone}`} aria-hidden="true">
        <DashboardIcon kind={icon} />
      </span>
      <span className="dashboard-stat__label">{label}</span>
      <strong className="dashboard-stat__value">{value}</strong>
      {hint ? <span className="dashboard-stat__hint">{hint}</span> : null}
    </>
  );

  if (to) {
    return (
      <Link className="dashboard-stat dashboard-stat--link" to={to}>
        {contenido}
      </Link>
    );
  }

  return <article className="dashboard-stat">{contenido}</article>;
}

export function DashboardStatsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="dashboard-stats" role="status" aria-live="polite">
      <span className="dashboard-sr">Cargando resumen…</span>
      {Array.from({ length: count }, (_, index) => (
        <div className="dashboard-stat dashboard-stat--skeleton" key={index} aria-hidden="true" />
      ))}
    </div>
  );
}

export function DashboardPanel({
  id,
  title,
  description,
  action,
  children,
  className = "",
}: {
  id: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`dashboard-panel ${className}`.trim()} aria-labelledby={id}>
      <div className="dashboard-panel__head">
        <div>
          <h2 id={id}>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {action ? <div className="dashboard-panel__action">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function DashboardInlineError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="dashboard-inline-error" role="alert">
      <span>{message}</span>
      <button type="button" onClick={onRetry}>
        Reintentar
      </button>
    </div>
  );
}

export function DashboardEmpty({
  title,
  description,
  actionLabel,
  to,
  icon = "bell",
}: {
  title: string;
  description: string;
  actionLabel?: string;
  to?: string;
  icon?: DashboardIconKind;
}) {
  return (
    <div className="dashboard-empty">
      <span className="dashboard-empty__icon" aria-hidden="true">
        <DashboardIcon kind={icon} />
      </span>
      <strong>{title}</strong>
      <p>{description}</p>
      {actionLabel && to ? <Link to={to}>{actionLabel}</Link> : null}
    </div>
  );
}

export function DashboardRowsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="dashboard-rows-skeleton" role="status" aria-live="polite">
      <span className="dashboard-sr">Cargando información…</span>
      {Array.from({ length: count }, (_, index) => (
        <span className="dashboard-row-skeleton" key={index} aria-hidden="true" />
      ))}
    </div>
  );
}

export function DashboardDisputeAlert({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <aside className="dashboard-alert dashboard-alert--danger" role="status">
      <span className="dashboard-alert__icon" aria-hidden="true">
        <DashboardIcon kind="dispute" />
      </span>
      <div>
        <strong>
          {count === 1 ? "Tienes 1 disputa abierta" : `Tienes ${count} disputas abiertas`}
        </strong>
        <p>Revisa tus contratos para dar seguimiento a la revisión.</p>
      </div>
      <Link to="/contracts">Ver contratos</Link>
    </aside>
  );
}

export function DashboardQuickActions({
  actions,
}: {
  actions: Array<{
    to: string;
    label: string;
    hint: string;
    icon: DashboardIconKind;
    badge?: number;
  }>;
}) {
  return (
    <section className="dashboard-quick-actions" aria-label="Accesos rápidos">
      {actions.map((accion) => (
        <Link className="dashboard-quick-action" to={accion.to} key={`${accion.to}-${accion.label}`}>
          <span className="dashboard-quick-action__icon" aria-hidden="true">
            <DashboardIcon kind={accion.icon} />
          </span>
          <span className="dashboard-quick-action__body">
            <strong>{accion.label}</strong>
            <small>{accion.hint}</small>
          </span>
          {accion.badge && accion.badge > 0 ? (
            <span className="dashboard-quick-action__badge">
              {accion.badge > 99 ? "99+" : accion.badge}
            </span>
          ) : null}
        </Link>
      ))}
    </section>
  );
}

export function DashboardActivityPanel() {
  const { user } = useAuth();
  const { notificaciones, cargando, error, refrescar, marcarLeida } = useNotificaciones();
  const rol = user?.rol ?? "cliente";
  const visibles = notificaciones.slice(0, 4);

  return (
    <DashboardPanel
      id="dashboard-activity-title"
      title="Actividad reciente"
      description="Avisos de contratos, entregas y pagos."
      action={<Link className="dashboard-panel__link" to="/notificaciones">Ver todas</Link>}
    >
      {cargando && notificaciones.length === 0 ? (
        <DashboardRowsSkeleton />
      ) : error && notificaciones.length === 0 ? (
        <DashboardInlineError message={error} onRetry={() => void refrescar()} />
      ) : visibles.length === 0 ? (
        <DashboardEmpty
          title="Sin actividad reciente"
          description="Cuando recibas un aviso aparecerá aquí."
          actionLabel="Ver notificaciones"
          to="/notificaciones"
        />
      ) : (
        <div className="dashboard-activity-list">
          {visibles.map((notificacion) => (
            <NotificacionItem
              key={notificacion.id}
              notificacion={notificacion}
              rol={rol}
              onOpen={(item) => {
                if (!item.leida) void marcarLeida(item.id);
              }}
            />
          ))}
        </div>
      )}
    </DashboardPanel>
  );
}

function ContratoRow({ contrato }: { contrato: Contrato }) {
  const contraparte = contrato.contraparte ?? contrato.cliente ?? contrato.freelancer;
  const titulo = contrato.contexto?.titulo ?? `Contrato #${contrato.id}`;
  const tone = contractTone(contrato.estado);

  return (
    <Link className="dashboard-row" to={`/contracts/${contrato.id}`}>
      <span className="dashboard-row__avatar" aria-hidden="true">
        {contraparte?.fotoPerfil ? (
          <img src={contraparte.fotoPerfil} alt="" />
        ) : (
          inicial(contraparte?.nombre)
        )}
      </span>
      <span className="dashboard-row__body">
        <strong>{titulo}</strong>
        <small>
          Con {contraparte?.nombre ?? "participante"} · {formatShortDate(contrato.fechaInicio)}
        </small>
      </span>
      <span className="dashboard-row__meta">
        <strong>{formatMoney(contrato.montoAcordado)}</strong>
        <span className={`dashboard-badge dashboard-badge--${tone}`}>{statusLabel(contrato.estado)}</span>
      </span>
    </Link>
  );
}

export function DashboardContractsPanel({
  contratos,
  loading,
  error,
  onRetry,
  emptyDescription,
  emptyTo,
  emptyLabel,
}: {
  contratos: Contrato[];
  loading: boolean;
  error: string;
  onRetry: () => void;
  emptyDescription: string;
  emptyTo: string;
  emptyLabel: string;
}) {
  return (
    <DashboardPanel
      id="dashboard-contracts-title"
      title="Contratos recientes"
      description="Acuerdos activos y su estado actual."
      action={<Link className="dashboard-panel__link" to="/contracts">Ver todos</Link>}
    >
      {loading ? (
        <DashboardRowsSkeleton />
      ) : error ? (
        <DashboardInlineError message={error} onRetry={onRetry} />
      ) : contratos.length === 0 ? (
        <DashboardEmpty
          title="Aún no tienes contratos"
          description={emptyDescription}
          actionLabel={emptyLabel}
          to={emptyTo}
          icon="contract"
        />
      ) : (
        <div className="dashboard-rows">
          {contratos.map((contrato) => (
            <ContratoRow contrato={contrato} key={contrato.id} />
          ))}
        </div>
      )}
    </DashboardPanel>
  );
}

export function DashboardOffersPanel({
  ofertas,
  loading,
  error,
  onRetry,
}: {
  ofertas: Oferta[];
  loading: boolean;
  error: string;
  onRetry: () => void;
}) {
  return (
    <DashboardPanel
      id="dashboard-offers-title"
      title="Tus proyectos"
      description="Proyectos publicados y propuestas recibidas."
      action={<Link className="dashboard-panel__link" to="/dashboard/cliente/ofertas">Gestionar</Link>}
    >
      {loading ? (
        <DashboardRowsSkeleton />
      ) : error ? (
        <DashboardInlineError message={error} onRetry={onRetry} />
      ) : ofertas.length === 0 ? (
        <DashboardEmpty
          title="Aún no has publicado proyectos"
          description="Publica tu primer proyecto y empieza a recibir propuestas."
          actionLabel="Crear proyecto"
          to="/crear/proyecto"
          icon="plus"
        />
      ) : (
        <div className="dashboard-rows">
          {ofertas.map((oferta) => (
            <Link className="dashboard-row" to="/dashboard/cliente/ofertas" key={oferta.id}>
              <span className="dashboard-row__icon" aria-hidden="true">
                <DashboardIcon kind="proposal" />
              </span>
              <span className="dashboard-row__body">
                <strong>{oferta.titulo}</strong>
                <small>
                  {oferta.categoria?.nombre ?? "Sin categoría"} · {oferta.totalPropuestas} propuestas
                </small>
              </span>
              <span className="dashboard-row__meta">
                <strong>{oferta.presupuesto ? formatMoney(oferta.presupuesto) : "A convenir"}</strong>
                <span className={`dashboard-badge dashboard-badge--${stateTone(oferta.estado)}`}>
                  {statusLabel(oferta.estado)}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </DashboardPanel>
  );
}

export function DashboardProposalsPanel({
  propuestas,
  loading,
  error,
  onRetry,
}: {
  propuestas: Propuesta[];
  loading: boolean;
  error: string;
  onRetry: () => void;
}) {
  return (
    <DashboardPanel
      id="dashboard-proposals-title"
      title="Propuestas recientes"
      description="Seguimiento de tus postulaciones."
      action={<Link className="dashboard-panel__link" to="/dashboard/freelancer/ofertas">Explorar proyectos</Link>}
    >
      {loading ? (
        <DashboardRowsSkeleton />
      ) : error ? (
        <DashboardInlineError message={error} onRetry={onRetry} />
      ) : propuestas.length === 0 ? (
        <DashboardEmpty
          title="Aún no has enviado propuestas"
          description="Encuentra un proyecto abierto y envía tu primera propuesta."
          actionLabel="Explorar proyectos"
          to="/dashboard/freelancer/ofertas"
          icon="proposal"
        />
      ) : (
        <div className="dashboard-rows">
          {propuestas.map((propuesta) => (
            <Link className="dashboard-row" to="/dashboard/freelancer/ofertas" key={propuesta.id}>
              <span className="dashboard-row__icon" aria-hidden="true">
                <DashboardIcon kind="proposal" />
              </span>
              <span className="dashboard-row__body">
                <strong>{propuesta.proyecto?.titulo ?? `Propuesta #${propuesta.id}`}</strong>
                <small>Enviada el {formatShortDate(propuesta.fechaEnvio)}</small>
              </span>
              <span className="dashboard-row__meta">
                <strong>{formatMoney(propuesta.montoPropuesto)}</strong>
                <span className={`dashboard-badge dashboard-badge--${stateTone(propuesta.estado)}`}>
                  {statusLabel(propuesta.estado)}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </DashboardPanel>
  );
}

export function DashboardServicesPanel({
  servicios,
  loading,
  error,
  onRetry,
}: {
  servicios: Servicio[];
  loading: boolean;
  error: string;
  onRetry: () => void;
}) {
  return (
    <DashboardPanel
      id="dashboard-services-title"
      title="Tus servicios"
      description="Servicios publicados y disponibles."
      action={<Link className="dashboard-panel__link" to="/dashboard/freelancer/servicios">Gestionar</Link>}
    >
      {loading ? (
        <DashboardRowsSkeleton />
      ) : error ? (
        <DashboardInlineError message={error} onRetry={onRetry} />
      ) : servicios.length === 0 ? (
        <DashboardEmpty
          title="Aún no tienes servicios"
          description="Publica un servicio para que los clientes puedan encontrarte."
          actionLabel="Publicar servicio"
          to="/crear/servicio"
          icon="service"
        />
      ) : (
        <div className="dashboard-rows">
          {servicios.map((servicio) => (
            <Link className="dashboard-row" to="/dashboard/freelancer/servicios" key={servicio.id}>
              <span className="dashboard-row__icon" aria-hidden="true">
                <DashboardIcon kind="service" />
              </span>
              <span className="dashboard-row__body">
                <strong>{servicio.titulo}</strong>
                <small>
                  {servicio.categoria?.nombre ?? "Sin categoría"} · {statusLabel(servicio.estado)}
                </small>
              </span>
              <span className="dashboard-row__meta">
                <strong>{formatMoney(servicio.precio)}</strong>
              </span>
            </Link>
          ))}
        </div>
      )}
    </DashboardPanel>
  );
}
