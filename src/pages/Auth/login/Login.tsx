import { useCallback, useState } from "react";
import type { ChangeEvent, SyntheticEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../../../components/button";
import { GoogleButton } from "../../../components/GoogleButton";
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
  const { error: errorGoogle, iniciarConGoogle } = useGoogleLogin(handleResultadoGoogle);

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

      <form onSubmit={handleSubmit} className="login apple-card" aria-busy={loading} noValidate={false}>
        <div className="apple-head">
          <p className="apple-eyebrow">First Gig</p>
          <h1 className="apple-title">Iniciar sesión</h1>
          <p className="apple-subtitle">Ingresa tus datos para continuar.</p>
        </div>

        <div className="apple-field">
          <label className="apple-label" htmlFor="login-email">Correo electrónico</label>
          <Input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            value={form.email}
            onChange={handleChange}
            className={error ? "input--error" : ""}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "login-error" : undefined}
          />
        </div>
        <div className="apple-field">
          <label className="apple-label" htmlFor="login-password">Contraseña</label>
          <Input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Tu contraseña"
            value={form.password}
            onChange={handleChange}
            className={error ? "input--error" : ""}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "login-error" : undefined}
          />
        </div>

        {error && <p className="error apple-alert" role="alert" id="login-error">{error}</p>}

        <Button type="submit" disabled={loading} className="apple-submit" aria-busy={loading}>
          {loading ? (<><Spinner size="small" /> Ingresando…</>) : "Ingresar"}
        </Button>

        <div className="divisor" aria-hidden="true">
          <span>o continúa con</span>
        </div>

        <GoogleButton onPress={iniciarConGoogle} />
        {errorGoogle && <p className="error apple-alert" role="alert">{errorGoogle}</p>}

        <div className="links apple-links">
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
