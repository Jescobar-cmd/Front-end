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
import { GoogleLogo } from "../../../components/GoogleLogo";
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
    <div className="auth-page auth-screen auth-screen--login">
      <Brand appearance="auth" onClick={() => navigate("/")} />

      <form onSubmit={handleSubmit} className="login auth-card">
        <h1>Iniciar sesión</h1>
        <p>Ingresa tus datos para continuar.</p>

        <div className="auth-field">
          <label htmlFor="login-email">Correo electrónico</label>
          <Input
            id="login-email"
            name="email"
            type="email"
            placeholder="Correo electrónico"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            className={error ? "input--error" : ""}
          />
        </div>
        <div className="auth-field">
          <label htmlFor="login-password">Contraseña</label>
          <Input
            id="login-password"
            name="password"
            type="password"
            placeholder="Contraseña"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            className={error ? "input--error" : ""}
          />
        </div>

        {error && <p className="error" role="alert">{error}</p>}

        <Button type="submit" className="btn-primary" disabled={loading} aria-busy={loading}>
          {loading ? <Spinner size="small" /> : "Ingresar"}
        </Button>

        <div className="divisor">
          <span>O CONTINÚA CON</span>
        </div>

        <div className="google-login-button" role="group" aria-label="Continuar con Google">
          <GoogleLogo size={24} />
          <div className="google-login-button__target" ref={contenedorRef} />
        </div>
        {errorGoogle && <p className="error" role="alert">{errorGoogle}</p>}

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
