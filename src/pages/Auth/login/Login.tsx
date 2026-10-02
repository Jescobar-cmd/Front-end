import { useState } from "react";
import type { ChangeEvent, SyntheticEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../../../components/button";
import { Input } from "../../../components/input";
import { Spinner } from "../../../components/spinner";
import { useLogin } from "../../../hooks/UserLogin";
import { useGoogleLogin } from "../../../hooks/useGoogleLogin";
import { useAuth } from "../../../context/AuthContext";
import type { Sesion } from "../../../core/application/ports/AuthRepositoryPort";
import { Brand } from "../../../components/Brand";

export function Login() {
  const navigate = useNavigate();
  const { guardarSesion } = useAuth();
  const { iniciarSesion, loading, error } = useLogin();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSesionGoogle = (sesion: Sesion) => {
    guardarSesion(sesion);
    navigate("/dashboard");
  };
  const { contenedorRef, error: errorGoogle } = useGoogleLogin(handleSesionGoogle);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const sesion = await iniciarSesion(form);
    if (sesion) {
      guardarSesion(sesion);
      navigate("/dashboard");
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