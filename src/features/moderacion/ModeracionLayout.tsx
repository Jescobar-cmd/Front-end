import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { NavLink, Outlet } from "react-router-dom";
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
  | "usuarios";

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
  const { token } = useAuth();
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
          <nav className="mod-subnav" aria-label="Secciones del panel de moderación">
            <div className="mod-subnav__inner">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `mod-subnav__link${isActive ? " is-active" : ""}`
                  }
                >
                  <span className="mod-subnav__icon">
                    <NavIcon name={item.icon} />
                  </span>
                  <span className="mod-subnav__text">{item.label}</span>
                  {item.badge && item.badge > 0 ? (
                    <span className="mod-subnav__badge" aria-label={`${item.badge} pendientes`}>
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  ) : null}
                </NavLink>
              ))}
            </div>
          </nav>

          <Outlet />
        </div>
      </ModeracionPanelContext.Provider>
    </ToastProvider>
  );
}
