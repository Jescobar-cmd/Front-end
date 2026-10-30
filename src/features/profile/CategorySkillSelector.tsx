import type { Categoria } from "../../core/domain/entities/categoria";

export interface HabilidadCatalogo {
  id: number;
  nombre: string;
  categoriaId: number | null;
}

interface CategorySkillSelectorProps {
  categories: Categoria[];
  skills: HabilidadCatalogo[];
  selectedSkillIds: number[];
  selectedCategoryId: number | null;
  disabled?: boolean;
  error?: string;
  onCategoryChange: (categoryId: number | null) => void;
  onSkillsChange: (skillIds: number[]) => void;
}

export function CategorySkillSelector({
  categories,
  skills,
  selectedSkillIds,
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
      ? [...new Set([...selectedSkillIds, skillId])]
      : selectedSkillIds.filter((id) => id !== skillId);
    onSkillsChange(next);
  };

  return (
    <fieldset className="profile-skills" disabled={disabled} aria-describedby={error ? "profile-skills-error" : undefined}>
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
          visibleSkills.map((skill) => (
            <label className="profile-skill-option" key={skill.id}>
              <input
                type="checkbox"
                checked={selectedSkillIds.includes(skill.id)}
                onChange={(event) => toggleSkill(skill.id, event.target.checked)}
              />
              <span>{skill.nombre}</span>
            </label>
          ))
        ) : (
          <p className="profile-muted">No hay habilidades en esta categoría.</p>
        )}
      </div>
      <p className="profile-muted">
        {selectedSkillIds.length} {selectedSkillIds.length === 1 ? "habilidad seleccionada" : "habilidades seleccionadas"}
      </p>
      {error && (
        <p className="profile-field-error" id="profile-skills-error" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
