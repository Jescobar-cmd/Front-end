import { useState } from "react";
import type { ChangeEvent, SyntheticEvent } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../../components/button";
import { Input } from "../../../components/input";
import { Spinner } from "../../../components/spinner";
import { Brand } from "../../../components/Brand";
import { useRestablecerPassword } from "../../../hooks/useRestablecerPassword";

export function RestablecerPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const state = location.state as { email?: string } | null;

  const emailInicial = state?.email ?? params.get("email") ?? "";
  const codigoInicial = params.get("token") ?? params.get("code") ?? "";

  const { restablecer, loading, error } = useRestablecerPassword();
  const [form, setForm] = useState({
    email: emailInicial,
    code: codigoInicial,
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.name === "code" ? e.target.value.replace(/\D/g, "").slice(0, 6) : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const ok = await restablecer(form);
    if (ok) navigate("/login", { replace: true });
  };

  return (
    <div className="auth-page auth-screen auth-screen--restablecer">
      <Brand appearance="auth" onClick={() => navigate("/")} />
      <form onSubmit={handleSubmit} className="login auth-card">
        <h1>Nueva contraseña</h1>

        <div className="auth-field">
          <label htmlFor="reset-email">Correo electrónico</label>
          <Input
            id="reset-email"
            name="email"
            type="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="auth-field">
          <label htmlFor="reset-code">Código de 6 dígitos</label>
          <Input
            id="reset-code"
            name="code"
            placeholder="Código de 6 dígitos"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={form.code}
            onChange={handleChange}
            className="auth-code-input"
            maxLength={6}
            required
          />
        </div>
        <div className="auth-field">
          <label htmlFor="reset-password">Nueva contraseña</label>
          <Input
            id="reset-password"
            name="password"
            type="password"
            placeholder="Nueva contraseña (mínimo 8 caracteres)"
            value={form.password}
            onChange={handleChange}
            minLength={8}
          />
        </div>
        <div className="auth-field">
          <label htmlFor="reset-confirm-password">Confirmar contraseña</label>
          <Input
            id="reset-confirm-password"
            name="confirmPassword"
            type="password"
            placeholder="Confirmar contraseña"
            value={form.confirmPassword}
            onChange={handleChange}
          />
        </div>

        {error && <p className="error" role="alert">{error}</p>}

        <Button type="submit" className="btn-primary" disabled={loading} aria-busy={loading}>
          {loading ? <Spinner size="small" /> : "Guardar contraseña"}
        </Button>
      </form>
    </div>
  );
}
