import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import type { PortfolioProject } from "../../core/domain/entities/perfilProfesional";
import { CloseIcon, ExternalLinkIcon, ImageIcon } from "./ProfileIcons";

interface ProjectDetailModalProps {
  project: PortfolioProject;
  onClose: () => void;
}

export function ProjectDetailModal({ project, onClose }: ProjectDetailModalProps) {
  const [selectedImage, setSelectedImage] = useState(project.portada ?? project.imagenes[0] ?? null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleBackdrop = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  const facts = [
    { label: "Cliente", value: project.cliente },
    { label: "Reto", value: project.reto },
    { label: "Solución", value: project.solucion },
    { label: "Resultado", value: project.resultado },
  ].filter((fact) => Boolean(fact.value));

  const images = project.imagenes.length > 0
    ? project.imagenes
    : project.portada
      ? [project.portada]
      : [];

  return (
    <div className="pp-modal" role="presentation" onMouseDown={handleBackdrop}>
      <div
        className="pp-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pp-project-modal-title"
      >
        <div className="pp-modal__head">
          <div>
            <p className="pp-eyebrow">Caso completo</p>
            <h2 id="pp-project-modal-title">{project.titulo}</h2>
            {project.cliente ? <p className="pp-modal__client">Cliente: {project.cliente}</p> : null}
          </div>
          <button className="pp-icon-button" type="button" aria-label="Cerrar caso completo" onClick={onClose} autoFocus>
            <CloseIcon />
          </button>
        </div>

        <div className="pp-modal__gallery">
          <div className="pp-modal__main-image">
            {selectedImage ? (
              <img src={selectedImage} alt={`Imagen de ${project.titulo}`} />
            ) : (
              <span className="pp-modal__image-placeholder" aria-hidden="true">
                <ImageIcon />
              </span>
            )}
          </div>

          {images.length > 1 ? (
            <div className="pp-modal__thumbs" aria-label="Imágenes del proyecto">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  className={image === selectedImage ? "is-active" : undefined}
                  type="button"
                  aria-label={`Ver imagen ${index + 1} de ${project.titulo}`}
                  aria-pressed={image === selectedImage}
                  onClick={() => setSelectedImage(image)}
                >
                  <img src={image} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {project.descripcion ? (
          <section className="pp-modal__block">
            <h3>Descripción</h3>
            <p>{project.descripcion}</p>
          </section>
        ) : null}

        {facts.length > 0 ? (
          <dl className="pp-modal__facts">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {project.enlace ? (
          <a className="pp-link-button" href={project.enlace} target="_blank" rel="noreferrer">
            Abrir proyecto
            <ExternalLinkIcon />
          </a>
        ) : null}
      </div>
    </div>
  );
}