import { useState } from "react";
import type { SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/button";
import { Input } from "../../components/input";
import { Spinner } from "../../components/spinner";
import { Brand } from "../../components/Brand";
import { useAuth } from "../../context/AuthContext";
import { useCambiarPassword } from "../../hooks/useCambiarPassword";

export function Dashboard() {
  const { user, token, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const { cambiar, loading, error, exito } = useCambiarPassword(token);
  const [pass, setPass] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const handleLogout = () => {
    cerrarSesion();
    navigate("/login", { replace: true });
  };

  const handlePassword = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const ok = await cambiar(pass.currentPassword, pass.newPassword, pass.confirmPassword);
    if (ok) setPass({ currentPassword: "", newPassword: "", confirmPassword: "" });
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
          {user && (
            <p>
              {user.email.value} · {user.rol === "freelancer" ? "Freelancer" : "Cliente"}
            </p>
          )}
        </section>

        <section className="dashboard-placeholder" aria-labelledby="dashboard-title">
          <div>
            <p className="dashboard-eyebrow">{user?.rol === "freelancer" ? "FREELANCER" : "CLIENTE"}</p>
            <h2 id="dashboard-title">Inicio</h2>
          </div>
          <p>Aquí aparecerá tu actividad y las herramientas de tu cuenta.</p>
        </section>

        <section className="dashboard-placeholder" aria-labelledby="password-title">
          <div>
            <h2 id="password-title">Cambiar contraseña</h2>
          </div>
          <form onSubmit={handlePassword} className="login">
            <Input
              name="currentPassword"
              type="password"
              placeholder="Contraseña actual"
              autoComplete="current-password"
              value={pass.currentPassword}
              onChange={(e) => setPass({ ...pass, currentPassword: e.target.value })}
              required
            />
            <Input
              name="newPassword"
              type="password"
              placeholder="Nueva contraseña (mínimo 8 caracteres)"
              autoComplete="new-password"
              value={pass.newPassword}
              onChange={(e) => setPass({ ...pass, newPassword: e.target.value })}
              minLength={8}
              required
            />
            <Input
              name="confirmPassword"
              type="password"
              placeholder="Confirmar nueva contraseña"
              autoComplete="new-password"
              value={pass.confirmPassword}
              onChange={(e) => setPass({ ...pass, confirmPassword: e.target.value })}
              minLength={8}
              required
            />
            {error && <p className="error">{error}</p>}
            {exito && <p className="success">Contraseña actualizada.</p>}
            <Button type="submit" disabled={loading}>
              {loading ? <Spinner size="small" /> : "Guardar contraseña"}
            </Button>
          </form>
        </section>
      </main>

      <footer className="dashboard-footer">
        <span>FIRST GIG</span>
        <span>{user?.rol}</span>
      </footer>
    </div>
  );
}
