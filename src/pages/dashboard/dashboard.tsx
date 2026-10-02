import { useNavigate } from "react-router-dom";
import { Button } from "../../components/button";
import { Brand } from "../../components/Brand";
import { useAuth } from "../../context/AuthContext";

export function Dashboard() {
  const { user, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    cerrarSesion();
    navigate("/login");
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <Brand />
        <div className="dashboard-account">
          <span>{user?.nombre}</span>
          <Button type="button" variant="secondary" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </div>
      </header>

      <main>
        <section className="dashboard-welcome">
          <p className="dashboard-eyebrow">PÁGINA PRINCIPAL</p>
          <h1>Hola, {user?.nombre}</h1>
          <p>Tu espacio de First Gig está listo.</p>
        </section>

        <section className="dashboard-placeholder" aria-labelledby="dashboard-title">
          <div>
            <p className="dashboard-eyebrow">{user?.rol === "freelancer" ? "FREELANCER" : "CLIENTE"}</p>
            <h2 id="dashboard-title">Inicio</h2>
          </div>
          <p>Aquí aparecerá tu actividad y las herramientas de tu cuenta.</p>
        </section>
      </main>

      <footer className="dashboard-footer">
        <span>FIRST GIG</span>
        <span>{user?.rol}</span>
      </footer>
    </div>
  );
}