import { Link } from "react-router-dom";
import { buttonClassName } from "../../components/ui/Button";
import type { FreelancerDirectorioItem } from "../../infrastructure/api/apiFreelancers";

const ETIQUETAS_NIVEL: Record<string, string> = {
  basico: "Básico",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
  experto: "Experto",
};

function iniciales(nombre: string): string {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toLocaleUpperCase())
    .join("") || "FG";
}

function nivelLabel(nivel: string | null): string | null {
  if (!nivel) return null;
  return ETIQUETAS_NIVEL[nivel] ?? null;
}

function Estrella() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="m12 2.6 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9L12 2.6Z" />
    </svg>
  );
}

export function FreelancerCard({ freelancer }: { freelancer: FreelancerDirectorioItem }) {
  const perfilPath = `/perfil/${freelancer.id}`;
  const habilidades = freelancer.habilidades ?? [];
  const visibles = habilidades.slice(0, 4);
  const restantes = habilidades.length - visibles.length;
  const calificacion = Number(freelancer.calificacionPromedio) || 0;

  return (
    <article className="fl-card">
      <div className="fl-card__head">
        <Link className="fl-card__avatar" to={perfilPath} aria-label={`Ver perfil de ${freelancer.nombre}`}>
          {freelancer.fotoPerfil ? (
            <img src={freelancer.fotoPerfil} alt="" loading="lazy" />
          ) : (
            <span aria-hidden="true">{iniciales(freelancer.nombre)}</span>
          )}
        </Link>

        <div className="fl-card__identity">
          <h2>
            <Link to={perfilPath}>{freelancer.nombre}</Link>
          </h2>
          <p>{freelancer.tituloProfesional ?? "Freelancer en First Gig"}</p>
          <span className="fl-card__rating" aria-label={calificacion > 0 ? `Calificación ${calificacion.toFixed(1)} de 5` : "Sin reseñas todavía"}>
            <Estrella />
            {calificacion > 0 ? (
              <strong>{calificacion.toFixed(1)}</strong>
            ) : (
              <span>Nuevo</span>
            )}
          </span>
        </div>
      </div>

      {freelancer.biografia ? (
        <p className="fl-card__bio">{freelancer.biografia}</p>
      ) : (
        <p className="fl-card__bio fl-card__bio--empty">Este freelancer todavía no ha escrito su presentación.</p>
      )}

      {visibles.length > 0 ? (
        <ul className="fl-card__skills" aria-label="Habilidades principales">
          {visibles.map((habilidad) => {
            const nivel = nivelLabel(habilidad.nivel);
            return (
              <li key={habilidad.id} className="fl-card__skill">
                {habilidad.nombre}
                {nivel ? <small>{nivel}</small> : null}
              </li>
            );
          })}
          {restantes > 0 ? <li className="fl-card__skill fl-card__skill--more">+{restantes}</li> : null}
        </ul>
      ) : (
        <p className="fl-card__bio fl-card__bio--empty">Perfil en construcción: aún no hay habilidades publicadas.</p>
      )}

      <div className="fl-card__footer">
        <Link className={buttonClassName({ variant: "secondary", size: "sm" })} to={perfilPath}>
          Ver perfil
        </Link>
      </div>
    </article>
  );
}