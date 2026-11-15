import type { Review } from "../../core/domain/entities/perfilProfesional";
import { StarIcon } from "./ProfileIcons";

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toLocaleUpperCase())
    .join("");
}

function fecha(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es", { month: "long", year: "numeric" });
}

export function ReviewCard({ review }: { review: Review }) {
  const puntuacion = Math.max(0, Math.min(5, Math.round(review.calificacion)));

  return (
    <article className="pp-review">
      <div className="pp-review__head">
        <span className="pp-review__avatar" aria-hidden="true">
          {initials(review.autor)}
          {review.fotoAutor ? (
            <img
              src={review.fotoAutor}
              alt=""
              loading="lazy"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : null}
        </span>
        <div className="pp-review__author">
          <strong>{review.autor}</strong>
          {review.cargo ? <span>{review.cargo}</span> : null}
        </div>
        <div className="pp-review__rating">
          <span className="pp-stars" aria-label={`Calificación: ${puntuacion} de 5`}>
            {Array.from({ length: 5 }, (_, index) => (
              <StarIcon key={index} className={index < puntuacion ? "is-filled" : "is-empty"} />
            ))}
          </span>
          {fecha(review.fecha) ? <time dateTime={review.fecha}>{fecha(review.fecha)}</time> : null}
        </div>
      </div>

      {review.texto ? (
        <p className="pp-review__text">{review.texto}</p>
      ) : (
        <p className="pp-review__text pp-muted">Calificación sin comentario.</p>
      )}
    </article>
  );
}