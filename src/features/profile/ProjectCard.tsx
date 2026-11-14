import type { PortfolioProject } from "../../core/domain/entities/perfilProfesional";
import { EditIcon, ExternalLinkIcon, ImageIcon, TrashIcon } from "./ProfileIcons";

interface ProjectCardProps {
  project: PortfolioProject;
  isOwner?: boolean;
  onOpen: (project: PortfolioProject) => void;
  onEdit?: (project: PortfolioProject) => void;
  onDelete?: (project: PortfolioProject) => void;
}

export function ProjectCard({ project, isOwner, onOpen, onEdit, onDelete }: ProjectCardProps) {
  const facts = [
    { label: "Cliente", value: project.cliente },
    { label: "Reto", value: project.reto },
    { label: "Solución", value: project.solucion },
    { label: "Resultado", value: project.resultado },
  ].filter((fact) => Boolean(fact.value));

  return (
    <article className="pp-project">
      <div className="pp-project__cover">
        {project.portada ? (
          <img src={project.portada} alt={`Portada de ${project.titulo}`} loading="lazy" />
        ) : (
          <span className="pp-project__placeholder" aria-hidden="true">
            <ImageIcon />
          </span>
        )}
      </div>

      <div className="pp-project__body">
        <div className="pp-project__heading">
          <h3>{project.titulo}</h3>
          {isOwner ? (
            <div className="pp-project__owner-actions">
              {onEdit ? (
                <button
                  className="pp-icon-button"
                  type="button"
                  aria-label={`Editar ${project.titulo}`}
                  title="Editar proyecto"
                  onClick={() => onEdit(project)}
                >
                  <EditIcon />
                </button>
              ) : null}
              {onDelete ? (
                <button
                  className="pp-icon-button pp-icon-button--danger"
                  type="button"
                  aria-label={`Eliminar ${project.titulo}`}
                  title="Eliminar proyecto"
                  onClick={() => onDelete(project)}
                >
                  <TrashIcon />
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        {project.descripcion ? <p className="pp-project__description">{project.descripcion}</p> : null}

        {facts.length > 0 ? (
          <dl className="pp-project__facts">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        <div className="pp-project__actions">
          <button className="pp-link-button" type="button" onClick={() => onOpen(project)}>
            Ver caso completo
            <ExternalLinkIcon />
          </button>
          {project.enlace ? (
            <a
              className="pp-project__external"
              href={project.enlace}
              target="_blank"
              rel="noreferrer"
              aria-label={`Abrir enlace de ${project.titulo}`}
            >
              <ExternalLinkIcon />
              Ver enlace
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}