import { useCallback, useState } from "react";
import type { ChangeEvent, SyntheticEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../../../components/button";
import { Input } from "../../../components/input";
import { Spinner } from "../../../components/spinner";
import { useLogin } from "../../../hooks/UserLogin";
import { useGoogleLogin } from "../../../hooks/useGoogleLogin";
import { useAuth } from "../../../context/AuthContext";
import type { ResultadoGoogle } from "../../../core/application/ports/AuthRepositoryPort";
import { Brand } from "../../../components/Brand";
import { dashboardPorRol } from "../../../routes/rutasPorRol";

const GOOGLE_PENDIENTE_KEY = "first_gig_google_pendiente";

export function Login() {
  const navigate = useNavigate();
  const { guardarSesion } = useAuth();
  const { iniciarSesion, loading, error } = useLogin();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleResultadoGoogle = useCallback((resultado: ResultadoGoogle) => {
    if (resultado.tipo === "onboarding") {
      sessionStorage.setItem(GOOGLE_PENDIENTE_KEY, JSON.stringify({ idToken: resultado.idToken, email: resultado.email }));
      navigate("/google/completar-perfil", { state: { idToken: resultado.idToken, email: resultado.email } });
      return;
    }
    guardarSesion(resultado.sesion);
    navigate(dashboardPorRol(resultado.sesion.user.rol), { replace: true });
  }, [guardarSesion, navigate]);
  const { contenedorRef, error: errorGoogle } = useGoogleLogin(handleResultadoGoogle);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const sesion = await iniciarSesion(form);
    if (sesion) {
      guardarSesion(sesion);
      navigate(dashboardPorRol(sesion.user.rol), { replace: true });
    }
  };

  return (
    <div className="auth-page">
      <Brand />

      <form onSubmit={handleSubmit} className="login">
        <h1>Iniciar sesión</h1>
        <p>Ingresa tus datos para continuar.</p>

        <Input
          name="email"
          type="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={handleChange}
          className={error ? "input--error" : ""}
        />
        <Input
          name="password"
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          className={error ? "input--error" : ""}
        />

        {error && <p className="error">{error}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? <Spinner size="small" /> : "Ingresar"}
        </Button>

        <div className="divisor">
          <span>o continúa con</span>
        </div>

        <div className="google-btn-wrap" ref={contenedorRef} />
        {errorGoogle && <p className="error">{errorGoogle}</p>}

        <div className="links">
          <p>
            <Link to="/recuperar-password">¿Olvidaste tu contraseña?</Link>
          </p>
          <p>
            ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
