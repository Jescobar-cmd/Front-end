import { useEffect, useState } from "react";
import { iniciales } from "../utils";

interface AvatarProps {
  nombre: string;
  fotoPerfil?: string | null;
  size?: "sm" | "md" | "lg";
}

export function Avatar({ nombre, fotoPerfil, size = "md" }: AvatarProps) {
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    setFallo(false);
  }, [fotoPerfil]);

  return (
    <span className={`mod-avatar mod-avatar--${size}`} aria-hidden="true">
      {fotoPerfil && !fallo ? (
        <img src={fotoPerfil} alt="" loading="lazy" onError={() => setFallo(true)} />
      ) : (
        <span>{iniciales(nombre)}</span>
      )}
    </span>
  );
}
