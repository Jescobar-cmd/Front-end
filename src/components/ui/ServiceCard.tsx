import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Badge } from "./Badge";

function initials(name: string | null | undefined): string {
  if (!name) return "FG";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function StarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="m12 2.6 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9L12 2.6Z" />
    </svg>
  );
}

export interface ServiceCardProps {
  title: string;
  description?: string | null;
  category?: string | null;
  imageUrl?: string | null;
  authorName?: string | null;
  authorPhoto?: string | null;
  authorTitle?: string | null;
  verified?: boolean;
  showRating?: boolean;
  rating?: number | null;
  reviewsLabel?: string;
  price?: number | null;
  pricePrefix?: string;
  priceFallback?: string;
  href?: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCta?: () => void;
  ctaDisabled?: boolean;
  eyebrow?: string;
  footer?: ReactNode;
}

export function ServiceCard({
  title,
  description,
  category,
  imageUrl,
  authorName,
  authorPhoto,
  authorTitle,
  verified = false,
  showRating = true,
  rating,
  reviewsLabel,
  price,
  pricePrefix = "Desde",
  priceFallback = "A convenir",
  href,
  ctaLabel = "Ver detalle",
  ctaHref,
  onCta,
  ctaDisabled = false,
  eyebrow,
  footer,
}: ServiceCardProps) {
  const priceText =
    price === null || price === undefined
      ? priceFallback
      : new Intl.NumberFormat("es", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(price);
  const titleNode = href ? (
    <Link to={href}>{title}</Link>
  ) : (
    title
  );
  const destination = ctaHref ?? href;

  return (
    <article className="marketplace-card">
      <div className="marketplace-card__cover">
        {imageUrl ? <img src={imageUrl} alt="" loading="lazy" /> : <div className="marketplace-card__cover-placeholder">{eyebrow ?? "First Gig"}</div>}
        {category ? (
          <span className="marketplace-card__cover-badge">
            <Badge tone="green">{category}</Badge>
          </span>
        ) : null}
      </div>
      <div className="marketplace-card__body">
        {authorName ? (
          <div className="marketplace-card__author">
            <span className="marketplace-card__avatar">
              {authorPhoto ? <img src={authorPhoto} alt="" loading="lazy" /> : initials(authorName)}
            </span>
            <span className="marketplace-card__author-copy">
              <span className="marketplace-card__author-name">{authorName}</span>
              {authorTitle ? <span className="marketplace-card__author-title">{authorTitle}</span> : null}
            </span>
            {verified ? <Badge tone="green">Verificado</Badge> : null}
          </div>
        ) : null}
        <h3 className="marketplace-card__title">{titleNode}</h3>
        {description ? (
          <p className="ui-help" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {description}
          </p>
        ) : null}
        <div className="marketplace-card__meta">
          {showRating ? (
            <span className="marketplace-card__rating">
              <StarIcon />
              {rating && rating > 0 ? rating.toFixed(1) : "Nuevo"}
              <span>{rating && rating > 0 ? reviewsLabel ?? "calificación" : "sin reseñas"}</span>
            </span>
          ) : null}
          <span className="marketplace-card__price">
            <small>{pricePrefix}</small>
            <strong>{priceText}</strong>
          </span>
        </div>
        {destination ? (
          <Link className="marketplace-card__cta" to={destination}>
            {ctaLabel}
          </Link>
        ) : onCta ? (
          <button className="marketplace-card__cta" type="button" onClick={onCta} disabled={ctaDisabled}>
            {ctaLabel}
          </button>
        ) : null}
        {footer}
      </div>
    </article>
  );
}
