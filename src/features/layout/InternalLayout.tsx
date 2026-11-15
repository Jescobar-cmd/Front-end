import { useCallback, useMemo, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AppHeader } from "./AppHeader";
import { InternalSearchContext } from "./InternalSearchContext";
import "../feed/feed.css";
import "./internal-layout.css";

export function InternalLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const esFreelancer = user?.rol === "freelancer";

  const buscar = useCallback(() => {
    navigate(esFreelancer ? "/dashboard/freelancer/ofertas" : "/talento");
  }, [esFreelancer, navigate]);

  const valorBusqueda = useMemo(() => ({ query, setQuery }), [query]);

  return (
    <InternalSearchContext.Provider value={valorBusqueda}>
      <div className={`feed-layout feed-layout--${user?.rol ?? "cliente"}`}>
        <a className="fg-skip" href="#contenido">Saltar al contenido</a>
        <AppHeader
          valor={query}
          onChange={setQuery}
          onSubmit={buscar}
        />

        <div className="feed-app">
          <main className="feed-main fg-main" id="contenido" tabIndex={-1}>
            <Outlet />
          </main>
        </div>

        <footer className="feed-footer">
          <span>FIRST GIG</span>
          <span>Talento verificado. Portafolio primero.</span>
        </footer>
      </div>
    </InternalSearchContext.Provider>
  );
}
