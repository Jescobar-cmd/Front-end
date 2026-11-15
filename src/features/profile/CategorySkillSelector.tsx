import type { Categoria } from "../../core/domain/entities/categoria";
import {
  NIVELES_HABILIDAD,
  type HabilidadSeleccionada,
  type NivelHabilidad,
} from "../../core/domain/entities/perfil";

export interface HabilidadCatalogo {
  id: number;
  nombre: string;
  categoriaId: number | null;
}

const ETIQUETAS_NIVEL: Record<NivelHabilidad, string> = {
  basico: "Básico",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
  experto: "Experto",
};

interface CategorySkillSelectorProps {
  categories: Categoria[];
  skills: HabilidadCatalogo[];
  selectedSkills: HabilidadSeleccionada[];
  selectedCategoryId: number | null;
  disabled?: boolean;
  error?: string;
  onCategoryChange: (categoryId: number | null) => void;
  onSkillsChange: (skills: HabilidadSeleccionada[]) => void;
}

export function CategorySkillSelector({
  categories,
  skills,
  selectedSkills,
  selectedCategoryId,
  disabled = false,
  error,
  onCategoryChange,
  onSkillsChange,
}: CategorySkillSelectorProps) {
  const visibleSkills =
    selectedCategoryId === null
      ? skills
      : skills.filter((skill) => skill.categoriaId === null || skill.categoriaId === selectedCategoryId);

  const toggleSkill = (skillId: number, checked: boolean) => {
    const next = checked
      ? [
          ...selectedSkills.filter((skill) => skill.id !== skillId),
          { id: skillId, nivel: "intermedio" as NivelHabilidad },
        ]
      : selectedSkills.filter((skill) => skill.id !== skillId);
    onSkillsChange(next);
  };

  const changeLevel = (skillId: number, nivel: NivelHabilidad) => {
    onSkillsChange(
      selectedSkills.map((skill) => (skill.id === skillId ? { ...skill, nivel } : skill)),
    );
  };

  return (
    <fieldset
      className="profile-skills"
      disabled={disabled}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? "profile-skills-error" : undefined}
    >
      <legend>Habilidades</legend>
      <label className="profile-field" htmlFor="profile-category">
        <span>Categoría</span>
        <select
          id="profile-category"
          value={selectedCategoryId ?? ""}
          onChange={(event) => onCategoryChange(event.target.value ? Number(event.target.value) : null)}
        >
          <option value="">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.nombre}
            </option>
          ))}
        </select>
      </label>

      <div className="profile-skill-list" aria-label="Selecciona tus habilidades">
        {visibleSkills.length ? (
          visibleSkills.map((skill) => {
            const seleccionada = selectedSkills.find((item) => item.id === skill.id);

            return (
              <div
                className={`profile-skill-option${seleccionada ? " is-selected" : ""}`}
                key={skill.id}
              >
                <label className="profile-skill-check">
                  <input
                    type="checkbox"
                    checked={Boolean(seleccionada)}
                    onChange={(event) => toggleSkill(skill.id, event.target.checked)}
                  />
                  <span>{skill.nombre}</span>
                </label>
                {seleccionada && (
                  <select
                    className="profile-skill-level"
                    aria-label={`Nivel de ${skill.nombre}`}
                    value={seleccionada.nivel ?? "intermedio"}
                    onChange={(event) => changeLevel(skill.id, event.target.value as NivelHabilidad)}
                  >
                    {NIVELES_HABILIDAD.map((nivel) => (
                      <option key={nivel} value={nivel}>
                        {ETIQUETAS_NIVEL[nivel]}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            );
          })
        ) : (
          <p className="profile-muted">No hay habilidades en esta categoría.</p>
        )}
      </div>
      <p className="profile-muted">
        {selectedSkills.length} {selectedSkills.length === 1 ? "habilidad seleccionada" : "habilidades seleccionadas"}
      </p>
      {error && (
        <p className="profile-field-error" id="profile-skills-error" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
