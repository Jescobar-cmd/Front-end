interface BrandProps {
  variant?: "light" | "dark";
}

export function Brand({ variant = "light" }: BrandProps) {
  return (
    <div className={`auth-brand auth-brand--${variant}`}>
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
    </div>
  );
}