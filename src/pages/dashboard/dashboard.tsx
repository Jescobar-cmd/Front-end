import { useNavigate } from "react-router-dom";
import { Button } from "../../components/button";
import { useAuth } from "../../context/AuthContext";

export function Dashboard() {
  const { user, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    cerrarSesion();
    navigate("/login");
  };

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Hola, {user?.username} 👋</h1>
      <p>Rol: {user?.rol}</p>
      <div style={{ maxWidth: 200, margin: "1rem auto" }}>
        <Button type="button" variant="secondary" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}