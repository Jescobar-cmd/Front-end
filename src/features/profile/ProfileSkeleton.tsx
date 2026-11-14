export function ProfileSkeleton() {
  return (
    <div className="pp-page" role="status" aria-label="Cargando perfil">
      <div className="pp-skeleton pp-skeleton--hero" />
      <div className="pp-skeleton pp-skeleton--tabs" />
      <div className="pp-skeleton pp-skeleton--section">
        <div className="pp-skeleton pp-skeleton--title" />
        <div className="pp-skeleton pp-skeleton--line" />
        <div className="pp-skeleton pp-skeleton--line pp-skeleton--short" />
      </div>
      <div className="pp-skeleton pp-skeleton--section">
        <div className="pp-skeleton pp-skeleton--title" />
        <div className="pp-skeleton pp-skeleton--line" />
        <div className="pp-skeleton pp-skeleton--line pp-skeleton--short" />
      </div>
      <span className="pp-sr-only">Cargando perfil profesional…</span>
    </div>
  );
}