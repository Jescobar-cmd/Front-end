import { Badge } from "../../components/ui/Badge";
import { Button, buttonClassName } from "../../components/ui/Button";
import type { ProfesionalProfileData } from "../../core/domain/entities/perfilProfesional";
import {
  ClockIcon,
  GlobeIcon,
  PinIcon,
  ShieldCheckIcon,
  StarIcon,
} from "./ProfileIcons";

function fechaRegistro(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";
  return date.toLocaleDateString("es", { month: "long", year: "numeric" });
}

function inicial(nombre: string): string {
  return nombre.trim().charAt(0).toLocaleUpperCase() || "F";
}

interface ProfileHeaderProps {
  profile: ProfesionalProfileData;
  isOwner: boolean;
  isFreelancer: boolean;
  totalResenas: number;
  showServices: boolean;
  onContact: () => void;
  onEdit: () => void;
  contactLoading: boolean;
  contactDisabled: boolean;
  contactHint?: string;
}

export function ProfileHeader({
  profile,
  isOwner,
  isFreelancer,
  totalResenas,
  showServices,
  onContact,
  onEdit,
  contactLoading,
  contactDisabled,
  contactHint,
}: ProfileHeaderProps) {
  const freelancer = profile.freelancer;
  const titular = isFreelancer
    ? freelancer?.propuesta || freelancer?.titular || "Freelancer en First Gig"
    : profile.cliente?.empresa || "Cliente en First Gig";
  const verificado = Boolean(isFreelancer && freelancer?.verificado);
  const rating = isFreelancer ? freelancer?.calificacion ?? 0 : 0;
  const rol = isFreelancer ? "Freelancer" : "Cliente";

  return (
    <header className="pp-hero" aria-labelledby="pp-profile-name">
      <div className="pp-hero__cover" aria-hidden="true" />
      <div className="pp-hero__body">
        <div className="pp-hero__identity">
          {profile.foto ? (
            <img className="pp-avatar" src={profile.foto} alt={`Foto de ${profile.nombre}`} />
          ) : (
            <span className="pp-avatar pp-avatar--initial" aria-hidden="true">
              {inicial(profile.nombre)}
            </span>
          )}

          <div className="pp-hero__copy">
            <p className="pp-eyebrow">
              {rol} · Miembro desde {fechaRegistro(profile.fechaRegistro)}
            </p>
            <div className="pp-hero__name-row">
              <h1 id="pp-profile-name">{profile.nombre}</h1>
              {verificado ? (
                <Badge tone="green" className="pp-verified">
                  <ShieldCheckIcon />
                  Verificado
                </Badge>
              ) : null}
            </div>
            <p className="pp-hero__headline">{titular}</p>

            <div className="pp-hero__meta">
              {isFreelancer && freelancer?.ubicacion ? (
                <span>
                  <PinIcon />
                  {freelancer.ubicacion}
                </span>
              ) : null}
              {isFreelancer && freelancer?.remoto ? (
                <span>
                  <GlobeIcon />
                  Disponible para trabajo remoto
                </span>
              ) : null}
              {isFreelancer && freelancer?.disponibilidad ? (
                <span>
                  <ClockIcon />
                  {freelancer.disponibilidad}
                </span>
              ) : null}
              {rating > 0 ? (
                <span className="pp-rating">
                  <StarIcon />
                  <strong>{rating.toFixed(1)}</strong>
                  <span>({totalResenas} {totalResenas === 1 ? "reseña" : "reseñas"})</span>
                </span>
              ) : (
                <span className="pp-rating pp-rating--empty">Sin reseñas todavía</span>
              )}
            </div>
          </div>
        </div>

        <div className="pp-hero__actions">
          {isOwner ? (
            <Button variant="action" onClick={onEdit}>
              Editar perfil
            </Button>
          ) : (
            <Button
              variant="action"
              onClick={onContact}
              disabled={contactLoading || contactDisabled}
              aria-describedby={contactHint ? "pp-contact-hint" : undefined}
            >
              {contactLoading ? "Abriendo conversación…" : "Contactar"}
            </Button>
          )}

          {isFreelancer && showServices ? (
            <a className={buttonClassName({ variant: "secondary" })} href="#servicios">
              Ver servicios
            </a>
          ) : null}
        </div>
      </div>

      {!isOwner && contactHint ? (
        <p className="pp-contact-hint" id="pp-contact-hint">
          {contactHint}
        </p>
      ) : null}
    </header>
  );
}