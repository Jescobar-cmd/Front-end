import { useCallback, useMemo, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FeedSidebar } from "../feed/FeedSidebar";
import { FeedTopbar } from "../feed/FeedTopbar";
import { InternalSearchContext } from "./InternalSearchContext";
import "../feed/feed.css";
import "./internal-layout.css";

const SIDEBAR_KEY = "first_gig_sidebar_colapsada";

function leerSidebarColapsada(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === "true";
  } catch {
    return false;
  }
}

export function InternalLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [sidebarColapsada, setSidebarColapsada] = useState(leerSidebarColapsada);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  const esFreelancer = user?.rol === "freelancer";

  const alternarSidebar = useCallback(() => {
    setSidebarColapsada((actual) => {
      const siguiente = !actual;
      try {
        localStorage.setItem(SIDEBAR_KEY, String(siguiente));
      } catch {
        // La preferencia sigue funcionando durante la sesión.
      }
      return siguiente;
    });
  }, []);

  const cerrarMenuMovil = useCallback(() => {
    setMenuMovilAbierto(false);
    // Devuelve el foco al botón que abrió el drawer para no perderlo.
    requestAnimationFrame(() => document.getElementById("feed-menu-button")?.focus());
  }, []);

  const buscar = useCallback(() => {
    navigate(esFreelancer ? "/dashboard/freelancer/ofertas" : "/servicios");
  }, [esFreelancer, navigate]);

  const valorBusqueda = useMemo(() => ({ query, setQuery }), [query]);

  return (
    <InternalSearchContext.Provider value={valorBusqueda}>
      <div className={`feed-layout feed-layout--${user?.rol ?? "cliente"}`}>
        <a className="fg-skip" href="#contenido">Saltar al contenido</a>
        <FeedTopbar
          valor={query}
          onChange={setQuery}
          onSubmit={buscar}
          onAbrirMenu={() => setMenuMovilAbierto(true)}
          menuAbierto={menuMovilAbierto}
        />

        <div className="feed-app">
          <FeedSidebar
            esFreelancer={esFreelancer}
            colapsada={sidebarColapsada}
            onToggleColapsada={alternarSidebar}
            abierta={menuMovilAbierto}
            onCerrar={cerrarMenuMovil}
          />

          <main className="feed-main fg-main" id="contenido" tabIndex={-1}>
            <Outlet />
          </main>
        </div>

        <footer className="feed-footer">
          <span>FIRST GIG</span>
          <span>Ideas que encuentran su equipo.</span>
        </footer>
      </div>
    </InternalSearchContext.Provider>
  );
}
