import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Brand } from "../../components/Brand";
import { ProfileMenu } from "../../components/ProfileMenu";
import { useAuth } from "../../context/AuthContext";
import { CUENTA_SUSPENDIDA_EVENT, moderacionApi } from "../../infrastructure/api/apiModeracion";
import type { ModeradorDashboard } from "../../infrastructure/api/apiModeracion";
import { ModeracionPanelContext } from "./ModeracionContext";
import { ToastProvider } from "./components/Toast";
import { CuentaSuspendida } from "./components/CuentaSuspendida";
import "./moderacion.css";

type IconName =
  | "dashboard"
  | "reportes"
  | "disputas"
  | "liquidaciones"
  | "notificaciones"
  | "usuarios"
  | "bell";

function NavIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    dashboard: (
      <>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
      </>
    ),
    reportes: (
      <>
        <path d="M12 3.5 5 6.2v5.4c0 4 2.9 7.2 7 8.4 4.1-1.2 7-4.4 7-8.4V6.2L12 3.5Z" />
        <path d="M12 8v4.5" />
        <circle cx="12" cy="15.6" r="0.7" fill="currentColor" stroke="none" />
      </>
    ),
    disputas: (
      <>
        <path d="M12 3.5 3 8l9 4.5L21 8l-9-4.5Z" />
        <path d="M3 8v8l9 4.5V12.5L3 8Z" />
        <path d="M21 8v8l-9 4.5V12.5L21 8Z" />
      </>
    ),
    liquidaciones: (
      <>
        <rect x="3" y="6" width="18" height="12" rx="2.5" />
        <path d="M3 10h18" />
        <path d="M16 14h2" />
      </>
    ),
    notificaciones: (
      <>
        <path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6" />
        <path d="M10.5 19a2 2 0 0 0 3 0" />
      </>
    ),
    usuarios: (
      <>
        <circle cx="9" cy="8.5" r="3.4" />
        <path d="M2.8 20a6.2 6.2 0 0 1 12.4 0" />
        <path d="M16 5.4a3.4 3.4 0 0 1 0 6.2" />
        <path d="M17.6 14.2A6.2 6.2 0 0 1 21.2 20" />
      </>
    ),
    bell: (
      <>
        <path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6" />
        <path d="M10.5 19a2 2 0 0 0 3 0" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  end?: boolean;
  badge?: number;
}

export function ModeracionLayout() {
  const { token, user, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<ModeradorDashboard | null>(null);
  const [cargandoContadores, setCargandoContadores] = useState(true);
  const [errorContadores, setErrorContadores] = useState("");
  const [noLeidas, setNoLeidas] = useState(0);
  const [suspendida, setSuspendida] = useState(false);
  const montadoRef = useRef(true);

  useEffect(() => {
    montadoRef.current = true;
    return () => {
      montadoRef.current = false;
    };
  }, []);

  const recargarContadores = useCallback(async () => {
    if (!token) return;
    setCargandoContadores(true);
    setErrorContadores("");
    try {
      const datos = await moderacionApi.obtenerDashboard(token);
      if (montadoRef.current) setDashboard(datos);
    } catch (error) {
      if (montadoRef.current) {
        setErrorContadores(
          error instanceof Error ? error.message : "No se pudo cargar el resumen.",
        );
      }
    } finally {
      if (montadoRef.current) setCargandoContadores(false);
    }
  }, [token]);

  const recargarNoLeidas = useCallback(async () => {
    if (!token) return;
    try {
      const datos = await moderacionApi.listarNotificaciones(token, { page: 1, limit: 1 });
      if (montadoRef.current) setNoLeidas(datos.noLeidas ?? 0);
    } catch {
      // El contador es secundario: no debe romper la navegación del panel.
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    void recargarContadores();
    void recargarNoLeidas();

    const intervalo = window.setInterval(() => {
      void recargarNoLeidas();
      void recargarContadores();
    }, 45000);

    const alSuspender = () => setSuspendida(true);
    window.addEventListener(CUENTA_SUSPENDIDA_EVENT, alSuspender);

    return () => {
      window.clearInterval(intervalo);
      window.removeEventListener(CUENTA_SUSPENDIDA_EVENT, alSuspender);
    };
  }, [token, recargarContadores, recargarNoLeidas]);

  const salir = () => {
    cerrarSesion();
    navigate("/login", { replace: true });
  };

  if (suspendida) {
    return <CuentaSuspendida />;
  }

  const items: NavItem[] = [
    { to: "/moderacion", label: "Dashboard", icon: "dashboard", end: true },
    {
      to: "/moderacion/reportes",
      label: "Reportes",
      icon: "reportes",
      badge: dashboard?.reportesPendientes ?? 0,
    },
    {
      to: "/moderacion/disputas",
      label: "Disputas",
      icon: "disputas",
      badge: dashboard?.disputasAbiertas ?? 0,
    },
    {
      to: "/moderacion/liquidaciones",
      label: "Liquidaciones",
      icon: "liquidaciones",
      badge: dashboard?.retirosPendientes ?? 0,
    },
    {
      to: "/moderacion/notificaciones",
      label: "Notificaciones",
      icon: "notificaciones",
      badge: noLeidas,
    },
    { to: "/moderacion/usuarios", label: "Usuarios", icon: "usuarios" },
  ];
  return (
    <ToastProvider>
      <ModeracionPanelContext.Provider
        value={{
          dashboard,
          cargandoContadores,
          errorContadores,
          noLeidas,
          recargarContadores,
          recargarNoLeidas,
        }}
      >
        <div className="mod-shell">
          <a className="fg-skip" href="#contenido-moderacion">
            Saltar al contenido
          </a>

          <aside className="mod-sidebar" aria-label="Navegación de moderación">
            <Link className="mod-sidebar__brand" to="/moderacion" aria-label="FirstGig, panel de moderación">
              <Brand />
              <span className="mod-sidebar__brand-tag">Moderación</span>
            </Link>

            <nav className="mod-nav" aria-label="Secciones del panel">
              <p className="mod-nav__label">Operación</p>
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `mod-nav__link${isActive ? " is-active" : ""}`}
                >
                  <span className="mod-nav__icon">
                    <NavIcon name={item.icon} />
                  </span>
                  <span className="mod-nav__text">{item.label}</span>
                  {item.badge && item.badge > 0 ? (
                    <span className="mod-nav__badge" aria-label={`${item.badge} pendientes`}>
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  ) : null}
                </NavLink>
              ))}
            </nav>

            <div className="mod-sidebar__footer">
              <span className="mod-sidebar__user">{user?.nombre ?? "Moderación"}</span>
              <span className="mod-sidebar__role">Sesión protegida</span>
            </div>
          </aside>

          <div className="mod-workspace">
            <header className="mod-topbar">
              <div className="mod-topbar__context">
                <span className="mod-topbar__dot" aria-hidden="true" />
                <span>Panel de moderación</span>
              </div>

              <div className="mod-topbar__actions">
                <Link
                  className="mod-bell"
                  to="/moderacion/notificaciones"
                  aria-label={
                    noLeidas > 0
                      ? `Notificaciones, ${noLeidas} sin leer`
                      : "Notificaciones, ninguna sin leer"
                  }
                >
                  <NavIcon name="bell" />
                  {noLeidas > 0 ? (
                    <span className="mod-bell__count" aria-hidden="true">
                      {noLeidas > 99 ? "99+" : noLeidas}
                    </span>
                  ) : null}
                </Link>
                <ProfileMenu />
              </div>
            </header>

            <main id="contenido-moderacion" className="mod-main" tabIndex={-1}>
              <Outlet />
            </main>

            <footer className="mod-footer">
              <span>FIRST GIG · Moderación</span>
              <button type="button" className="mod-footer__link" onClick={salir}>
                Cerrar sesión
              </button>
            </footer>
          </div>
        </div>
      </ModeracionPanelContext.Provider>
    </ToastProvider>
  );
}
