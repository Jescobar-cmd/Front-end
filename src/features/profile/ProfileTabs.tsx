import type { MouseEvent } from "react";
import type { ProfileSectionId } from "../../core/domain/entities/perfilProfesional";

interface Tab {
  id: ProfileSectionId;
  label: string;
}

interface ProfileTabsProps {
  tabs: Tab[];
  active: ProfileSectionId;
  onSelect: (id: ProfileSectionId) => void;
}

export function ProfileTabs({ tabs, active, onSelect }: ProfileTabsProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>, id: ProfileSectionId) => {
    event.preventDefault();
    onSelect(id);
  };

  return (
    <nav className="pp-tabs" aria-label="Secciones del perfil">
      {tabs.map((tab) => (
        <a
          key={tab.id}
          href={`#${tab.id}`}
          className={tab.id === active ? "is-active" : undefined}
          aria-current={tab.id === active ? "true" : undefined}
          onClick={(event) => handleClick(event, tab.id)}
        >
          {tab.label}
        </a>
      ))}
    </nav>
  );
}