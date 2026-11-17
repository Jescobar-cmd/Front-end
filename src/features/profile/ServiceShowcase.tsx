import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";
import { buttonClassName } from "../../components/ui/Button";
import type { ServicePackage } from "../../core/domain/entities/perfilProfesional";
import { CheckIcon, ChatIcon, ClockIcon, ShieldCheckIcon } from "./ProfileIcons";

function money(value: number): string {
  return new Intl.NumberFormat("es", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

const levelLabels: Record<NonNullable<ServicePackage["nivel"]>, string> = {
  basico: "Básico",
  estandar: "Estándar",
  premium: "Premium",
};

function entregaLabel(pkg: ServicePackage): string {
  return pkg.entrega?.trim() || "A convenir";
}

function revisionesLabel(pkg: ServicePackage): string {
  if (pkg.revisiones === null) return "A convenir";
  return `${pkg.revisiones} ${pkg.revisiones === 1 ? "revisión" : "revisiones"}`;
}

interface ServiceShowcaseProps {
  packages: ServicePackage[];
  initialServiceId?: number | null;
  onContact: (servicioId: number) => void;
  contactDisabled?: boolean;
  contactLoading?: boolean;
  manageHref?: string;
}

/**
 * Presenta los servicios publicados como una sola tarjeta con pestañas,
 * al estilo de un paquete de servicio. Cada pestaña es un servicio real del
 * freelancer (no un nivel inventado), así que el cliente elige la opción que
 * mejor encaja sin perder la información veraz que ya publicó.
 */
export function ServiceShowcase({
  packages,
  initialServiceId,
  onContact,
  contactDisabled,
  contactLoading,
  manageHref,
}: ServiceShowcaseProps) {
  const visibles = useMemo(
    () =>
      [...packages]
        .sort(
          (a, b) =>
            Number(b.estado?.toLowerCase() === "activo") -
            Number(a.estado?.toLowerCase() === "activo"),
        )
        .slice(0, 3),
    [packages],
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const activo =
    (selectedId === null ? undefined : visibles.find((pkg) => pkg.id === selectedId)) ??
    visibles.find((pkg) => pkg.servicioId === initialServiceId) ??
    visibles[0] ??
    null;

  const isActive = activo?.estado?.toLowerCase() === "activo";

  if (!activo) return null;

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = visibles.length - 1;
    let next: number | null = null;

    if (event.key === "ArrowRight") next = index === last ? 0 : index + 1;
    else if (event.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;

    if (next === null) return;
    event.preventDefault();
    setSelectedId(visibles[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="pp-showcase">
      {visibles.length > 1 ? (
        <div className="pp-showcase__tabs" role="tablist" aria-label="Servicios ofrecidos">
          {visibles.map((pkg, index) => {
            const selected = pkg.id === activo.id;
            const label = pkg.nivel ? levelLabels[pkg.nivel] : pkg.nombre;

            return (
              <button
                key={pkg.id}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                className="pp-showcase__tab"
                type="button"
                role="tab"
                id={`pp-servicio-tab-${pkg.id}`}
                aria-selected={selected}
                aria-controls={`pp-servicio-panel-${pkg.id}`}
                tabIndex={selected ? 0 : -1}
                title={pkg.nombre}
                onClick={() => setSelectedId(pkg.id)}
                onKeyDown={(event) => handleKeyDown(event, index)}
              >
                {label}
              </button>
            );
          })}
        </div>
      ) : null}

      <article
        key={activo.id}
        className={`pp-showcase__panel${visibles.length > 1 ? "" : " pp-showcase__panel--solo"}`}
        role={visibles.length > 1 ? "tabpanel" : undefined}
        id={visibles.length > 1 ? `pp-servicio-panel-${activo.id}` : undefined}
        aria-labelledby={visibles.length > 1 ? `pp-servicio-tab-${activo.id}` : undefined}
      >
        <header className="pp-showcase__head">
          <div className="pp-showcase__heading">
            <p className="pp-showcase__eyebrow">{activo.categoria ?? "Servicio profesional"}</p>
            <h3>{activo.nombre}</h3>
          </div>
          <Badge tone={isActive ? "green" : "neutral"}>{isActive ? "Disponible" : "Pausado"}</Badge>
        </header>

        {activo.videoUrl ? (
          <video
            className="pp-showcase__video"
            src={activo.videoUrl}
            poster={activo.imagenUrl ?? undefined}
            controls
            playsInline
            preload="metadata"
            aria-label={`Video de presentación de ${activo.nombre}`}
          />
        ) : null}

        <p className="pp-showcase__price">
          <small>Desde</small>
          <strong>{money(activo.precio)}</strong>
        </p>

        {activo.descripcion?.trim() ? (
          <p className="pp-showcase__description">{activo.descripcion}</p>
        ) : null}
        <dl className="pp-showcase__facts">
          <div>
            <dt>
              <ClockIcon />
              Entrega
            </dt>
            <dd>{entregaLabel(activo)}</dd>
          </div>
          <div>
            <dt>
              <CheckIcon />
              Revisiones
            </dt>
            <dd>{revisionesLabel(activo)}</dd>
          </div>
          <div>
            <dt>
              <ChatIcon />
              Contacto
            </dt>
            <dd>Chat directo</dd>
          </div>
        </dl>

        <ul className="pp-showcase__features">
          <li>
            <CheckIcon />
            <span>Alcance acordado por chat antes de empezar.</span>
          </li>
          <li>
            <CheckIcon />
            <span>Archivos y enlaces compartidos dentro de la plataforma.</span>
          </li>
          <li>
            <CheckIcon />
            <span>Pago retenido hasta que apruebes la entrega.</span>
          </li>
        </ul>

        {manageHref ? (
          <Link className={buttonClassName({ variant: "secondary", block: true })} to={manageHref}>
            Gestionar este servicio
          </Link>
        ) : (
          <div className="pp-showcase__actions">
            <button
              className={buttonClassName({ variant: "action", block: true })}
              type="button"
              disabled={contactDisabled || !isActive}
              onClick={() => onContact(activo.servicioId)}
            >
              {contactLoading ? "Abriendo chat…" : "Continuar"}
            </button>
            <button
              className={buttonClassName({ variant: "secondary", block: true })}
              type="button"
              disabled={contactDisabled || !isActive}
              onClick={() => onContact(activo.servicioId)}
            >
              Contáctame
            </button>
          </div>
        )}

        {!isActive ? (
          <p className="pp-showcase__note">Este servicio está pausado y no acepta nuevos contactos.</p>
        ) : (
          <p className="pp-showcase__note">
            <ShieldCheckIcon />
            El pago se libera cuando apruebas el trabajo entregado.
          </p>
        )}
      </article>

      {packages.length > visibles.length ? (
        <p className="pp-showcase__more">
          Mostrando {visibles.length} de {packages.length} servicios publicados.
        </p>
      ) : null}
    </div>
  );
}
