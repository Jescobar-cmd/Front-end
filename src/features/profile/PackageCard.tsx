import { Link } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";
import { buttonClassName } from "../../components/ui/Button";
import type { ServicePackage } from "../../core/domain/entities/perfilProfesional";

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

interface PackageCardProps {
  pkg: ServicePackage;
  onContact?: () => void;
  contactDisabled?: boolean;
  manageHref?: string;
}

export function PackageCard({ pkg, onContact, contactDisabled, manageHref }: PackageCardProps) {
  return (
    <article className="pp-package">
      <div className="pp-package__top">
        <Badge tone={pkg.nivel ? "green" : "blue"}>
          {pkg.nivel ? levelLabels[pkg.nivel] : "Servicio"}
        </Badge>
        {pkg.categoria ? <span className="pp-package__category">{pkg.categoria}</span> : null}
      </div>

      <h3>{pkg.nombre}</h3>
      <p className="pp-package__description">{pkg.descripcion}</p>

      <p className="pp-package__price">
        <small>Desde</small>
        <strong>{money(pkg.precio)}</strong>
      </p>

      <dl className="pp-package__facts">
        <div>
          <dt>Tiempo de entrega</dt>
          <dd>{pkg.entrega ?? "A convenir"}</dd>
        </div>
        <div>
          <dt>Revisiones</dt>
          <dd>{pkg.revisiones === null ? "A convenir" : pkg.revisiones}</dd>
        </div>
      </dl>

      {manageHref ? (
        <Link className={buttonClassName({ variant: "secondary", block: true })} to={manageHref}>
          Gestionar servicio
        </Link>
      ) : (
        <button
          className={buttonClassName({ variant: "action", block: true })}
          type="button"
          onClick={onContact}
          disabled={contactDisabled}
        >
          Contactar
        </button>
      )}
    </article>
  );
}