const pasos = [
  { n: "1", titulo: "Explora y elige", texto: "Busca por categoría o palabra clave y compara servicios, precios y perfiles." },
  { n: "2", titulo: "Contacta y acuerda", texto: "Habla con el profesional, define alcances y acuerda los detalles del trabajo." },
  { n: "3", titulo: "Recibe resultados", texto: "Colabora con confianza y consigue el resultado que tu proyecto necesita." },
];

export function HowItWorks() {
  return (
    <section className="landing-section" aria-labelledby="how-title">
      <div className="landing-container">
        <div className="landing-section__head">
          <h2 id="how-title">Cómo funciona</h2>
          <p>Contratar o publicar un servicio es simple y rápido.</p>
        </div>
        <ol className="landing-steps">
          {pasos.map((p) => (
            <li className="landing-step" key={p.n}>
              <span className="landing-step__num" aria-hidden="true">{p.n}</span>
              <h3>{p.titulo}</h3>
              <p>{p.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
