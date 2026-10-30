import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./ProfileMenu.css";

type RolPerfil = "freelancer" | "cliente";
type IconName = "chevron" | "edit" | "logout";

interface ProfileMenuProps {
  nombre: string;
  rol: RolPerfil;
  editarPerfilPath: string;
}

function Icono({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    chevron: <path d="m6 9 6 6 6-6" />,
    edit: (
      <>
        <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
        <path d="m13.5 6.5 3 3" />
      </>
    ),
    logout: (
      <>
        <path d="M10 5H5v14h5" />
        <path d="m14 8 4 4-4 4" />
        <path d="M18 12H9" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

export function ProfileMenu({ nombre, rol, editarPerfilPath }: ProfileMenuProps) {
  const { cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const disparadorRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const nombreVisible = nombre.trim() || "Mi cuenta";
  const rolVisible = rol === "freelancer" ? "Freelancer" : "Cliente";
  const inicial = nombreVisible.charAt(0).toLocaleUpperCase();

  useEffect(() => {
    setAbierto(false);
  }, [pathname]);

  useEffect(() => {
    if (!abierto) return;

    const manejarPointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !contenedorRef.current?.contains(event.target)) {
        setAbierto(false);
      }
    };

    const manejarTecla = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAbierto(false);
        disparadorRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", manejarPointer);
    document.addEventListener("keydown", manejarTecla);
    panelRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();

    return () => {
      document.removeEventListener("pointerdown", manejarPointer);
      document.removeEventListener("keydown", manejarTecla);
    };
  }, [abierto]);

  const manejarCerrarSesion = () => {
    setAbierto(false);
    cerrarSesion();
    navigate("/login", { replace: true });
  };

  return (
    <div className="profile-menu" ref={contenedorRef}>
      <button
        ref={disparadorRef}
        type="button"
        className="profile-menu__trigger"
        onClick={() => setAbierto((actual) => !actual)}
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-controls="profile-menu-panel"
        aria-label={`${abierto ? "Cerrar" : "Abrir"} menú de perfil de ${nombreVisible}`}
      >
        <span className="profile-menu__avatar" aria-hidden="true">
          {inicial}
        </span>
        <span className="profile-menu__identity">
          <strong>{nombreVisible}</strong>
          <small>{rolVisible}</small>
        </span>
        <span className={`profile-menu__chevron${abierto ? " is-open" : ""}`} aria-hidden="true">
          <Icono name="chevron" />
        </span>
      </button>

      {abierto && (
        <div className="profile-menu__panel" id="profile-menu-panel" role="menu" aria-label="Cuenta" ref={panelRef}>
          <div className="profile-menu__header">
            <span className="profile-menu__avatar profile-menu__avatar--lg" aria-hidden="true">
              {inicial}
            </span>
            <div className="profile-menu__header-text">
              <strong>{nombreVisible}</strong>
              <small>{rolVisible}</small>
            </div>
          </div>

          <div className="profile-menu__actions">
            <Link
              className="profile-menu__item"
              to={editarPerfilPath}
              role="menuitem"
              onClick={() => setAbierto(false)}
            >
              <Icono name="edit" />
              <span>Editar perfil</span>
            </Link>
            <span className="profile-menu__divider" role="separator" />
            <button
              className="profile-menu__item profile-menu__item--danger"
              type="button"
              role="menuitem"
              onClick={manejarCerrarSesion}
            >
              <Icono name="logout" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
