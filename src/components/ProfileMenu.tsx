import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { rolLabel } from "../core/domain/entities/user";
import { dashboardPorRol } from "../routes/rutasPorRol";
import "./ProfileMenu.css";

type IconName = "chevron" | "user" | "contract" | "logout" | "lock" | "shield";

function Icono({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    chevron: <path d="m6 9 6 6 6-6" />,
    user: (
      <>
        <circle cx="12" cy="8" r="3.6" />
        <path d="M5 20a7 7 0 0 1 14 0" />
      </>
    ),
    contract: (
      <>
        <path d="M7 3.5h7l4 4v13H7z" />
        <path d="M14 3.5v4h4" />
        <path d="M10 12h5M10 15.5h5" />
      </>
    ),
    logout: (
      <>
        <path d="M10 5H5v14h5" />
        <path d="m14 8 4 4-4 4" />
        <path d="M18 12H9" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3.5 5 6.2v5.4c0 4 2.9 7.2 7 8.4 4.1-1.2 7-4.4 7-8.4V6.2L12 3.5Z" />
        <path d="m9 12 2 2 4-4" />
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

export function ProfileMenu() {
  const { user, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const disparadorRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // El rol y el nombre salen siempre del contexto de autenticación: una sola
  // fuente de verdad para todas las vistas internas.
  const nombreVisible = user?.nombre.trim() || "Mi cuenta";
  const esAdminOModerador = user?.rol === "administrador" || user?.rol === "moderador";
  const rolVisible = user ? rolLabel(user.rol) : "Cliente";
  const handle = `@${nombreVisible.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, ".").replace(/[^a-z0-9._]/g, "") || "usuario"}`;
  const perfilPath = user && esAdminOModerador ? dashboardPorRol(user.rol) : "/perfil";
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

  const manejarTecladoMenu = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(
      panelRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    );
    if (items.length === 0) return;

    const actual = items.indexOf(document.activeElement as HTMLElement);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      items[(actual + 1) % items.length]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      items[(actual - 1 + items.length) % items.length]?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      items[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      items[items.length - 1]?.focus();
    } else if (event.key === "Tab") {
      setAbierto(false);
    }
  };

  if (!user) return null;

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
          <small>{handle}</small>
        </span>
        <span className={`profile-menu__chevron${abierto ? " is-open" : ""}`} aria-hidden="true">
          <Icono name="chevron" />
        </span>
      </button>

      {abierto && (
        <div
          className="profile-menu__panel"
          id="profile-menu-panel"
          role="menu"
          aria-label="Cuenta"
          ref={panelRef}
          onKeyDown={manejarTecladoMenu}
        >
          <div className="profile-menu__header">
            <span className="profile-menu__avatar profile-menu__avatar--lg" aria-hidden="true">
              {inicial}
            </span>
            <div className="profile-menu__header-text">
              <strong>{nombreVisible}</strong>
              <small>{handle} · {rolVisible}</small>
            </div>
          </div>

          <div className="profile-menu__actions">
            <Link
              className="profile-menu__item"
              to={perfilPath}
              role="menuitem"
              onClick={() => setAbierto(false)}
            >
              <Icono name={esAdminOModerador ? "shield" : "user"} />
              <span>{esAdminOModerador ? "Ir a mi panel" : "Ver mi perfil"}</span>
            </Link>
            <Link
              className="profile-menu__item"
              to="/contracts"
              role="menuitem"
              onClick={() => setAbierto(false)}
            >
              <Icono name="contract" />
              <span>Contratos</span>
            </Link>
            <Link
              className="profile-menu__item"
              to="/cuenta/seguridad"
              role="menuitem"
              onClick={() => setAbierto(false)}
            >
              <Icono name="lock" />
              <span>Cambiar contraseña</span>
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
