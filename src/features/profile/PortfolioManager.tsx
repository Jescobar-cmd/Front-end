import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import type { PortfolioProject } from "../../core/domain/entities/perfilProfesional";
import { PlusIcon } from "./ProfileIcons";
import { ProjectCard } from "./ProjectCard";

interface PortfolioManagerProps {
  projects: PortfolioProject[];
  isOwner: boolean;
  loading: boolean;
  error: string;
  onAdd: () => void;
  onEdit: (project: PortfolioProject) => void;
  onDelete: (project: PortfolioProject) => void;
  onOpen: (project: PortfolioProject) => void;
  onRetry: () => void;
}

function PortfolioSkeleton() {
  return (
    <div className="pp-projects" aria-hidden="true">
      {Array.from({ length: 2 }, (_, index) => (
        <div className="pp-project-skeleton" key={index}>
          <div className="pp-skeleton pp-project-skeleton__cover" />
          <div className="pp-project-skeleton__body">
            <div className="pp-skeleton pp-skeleton--title" />
            <div className="pp-skeleton pp-skeleton--line" />
            <div className="pp-skeleton pp-skeleton--line pp-skeleton--short" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PortfolioManager({
  projects,
  isOwner,
  loading,
  error,
  onAdd,
  onEdit,
  onDelete,
  onOpen,
  onRetry,
}: PortfolioManagerProps) {
  return (
    <div className="pp-portfolio">
      <div className="pp-section__head">
        <div>
          <p className="pp-eyebrow">Portafolio</p>
          <h2>Proyectos destacados</h2>
          <p>Casos reales que muestran cómo trabajo y qué resultados genero.</p>
        </div>
        {isOwner && !loading ? (
          <Button variant="secondary" size="sm" onClick={onAdd}>
            <PlusIcon className="pp-btn-icon" />
            Agregar proyecto
          </Button>
        ) : null}
      </div>

      {loading ? <PortfolioSkeleton /> : null}

      {!loading && error ? (
        <div className="pp-inline-error" role="alert">
          <p>No se pudo cargar el portafolio: {error}</p>
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Reintentar
          </Button>
        </div>
      ) : null}

      {!loading && !error && projects.length > 0 ? (
        <div className="pp-projects">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isOwner={isOwner}
              onOpen={onOpen}
              onEdit={isOwner ? onEdit : undefined}
              onDelete={isOwner ? onDelete : undefined}
            />
          ))}
        </div>
      ) : null}

      {!loading && !error && projects.length === 0 ? (
        isOwner ? (
          <EmptyState
            title="Aún no tienes proyectos en tu portafolio"
            description="Agrega tu primer caso con una portada, una descripción y el resultado que lograste."
            actionLabel="Agregar tu primer proyecto"
            onAction={onAdd}
          />
        ) : (
          <EmptyState
            title="Este freelancer aún no ha publicado proyectos"
            description="Puedes revisar sus servicios y reseñas mientras suma nuevos casos a su portafolio."
          />
        )
      ) : null}
    </div>
  );
}