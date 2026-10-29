import logoFirstGig from "../assets/logo-firstgig.svg";

type BrandProps = {
  variant?: "light" | "dark";
  onClick?: () => void;
  appearance?: "default" | "auth";
};

export function Brand({ variant = "light", onClick, appearance = "default" }: BrandProps) {
  const contenido =
    appearance === "auth" ? (
      <>
        <img src={logoFirstGig} alt="" width={30} height={30} />
        <span className="auth-brand__name">
          <span className="auth-brand__first">First</span>
          <span className="auth-brand__gig">Gig</span>
        </span>
      </>
    ) : (
      <>
        <svg
          className="auth-brand__mark"
          viewBox="0 0 44 28"
          role="img"
          aria-label="First Gig"
        >
          <circle className="auth-brand__circle auth-brand__circle--back" cx="17" cy="14" r="12" />
          <circle className="auth-brand__circle auth-brand__circle--front" cx="27" cy="14" r="12" />
        </svg>
        <span className="auth-brand__gig">First Gig</span>
      </>
    );

  if (onClick) {
    return (
      <button
        type="button"
        className={`auth-brand auth-brand--button${appearance === "auth" ? " auth-brand--auth" : ` auth-brand--${variant}`}`}
        onClick={onClick}
      >
        {contenido}
      </button>
    );
  }

  return (
    <div className={`auth-brand${appearance === "auth" ? " auth-brand--auth" : ` auth-brand--${variant}`}`}>
      {contenido}
    </div>
  );
}
