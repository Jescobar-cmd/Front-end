function IconShield() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2 4 5.5v6.2c0 5 3.4 8.6 8 10.3 4.6-1.7 8-5.3 8-10.3V5.5L12 2Zm0 2.2 6 2.6v4.9c0 3.9-2.5 6.8-6 8.3-3.5-1.5-6-4.4-6-8.3V6.8l6-2.6Zm-1 11.5 5-5-1.4-1.4-3.6 3.6-1.6-1.6L8 12.7l3 3Z"/></svg>
  );
}
function IconLock() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-7-2a2 2 0 1 1 4 0v2h-4V7Zm7 12H7v-8h10v8Zm-5-6.5a1.5 1.5 0 0 0-.75 2.8V17h1.5v-1.7A1.5 1.5 0 0 0 12 12.5Z"/></svg>
  );
}
function IconSupport() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 3a8 8 0 0 0-8 8v4a3 3 0 0 0 3 3h1v-6H6v-1a6 6 0 1 1 12 0v1h-2v6h1a1 1 0 0 1-1 1h-3v2h3a3 3 0 0 0 3-3v-7a8 8 0 0 0-8-8Z"/></svg>
  );
}

const puntos = [
  { icon: <IconSupport />, titulo: "Soporte cercano", texto: "Acompañamiento claro en cada paso de tu proyecto." },
  { icon: <IconLock />, titulo: "Pagos seguros", texto: "Acuerdos y seguimiento para contratar con confianza." },
  { icon: <IconShield />, titulo: "Profesionales verificados", texto: "Perfiles con información y servicios transparentes." },
];

export function TrustBar() {
  return (
    <section className="landing-trust" aria-label="Por qué elegir FirstGig">
      <div className="landing-container landing-trust__grid">
        {puntos.map((p) => (
          <div className="landing-trust__item" key={p.titulo}>
            <span className="landing-trust__icon">{p.icon}</span>
            <div>
              <h3>{p.titulo}</h3>
              <p>{p.texto}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
