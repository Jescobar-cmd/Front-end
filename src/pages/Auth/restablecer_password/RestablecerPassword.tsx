import { useState } from "react";
import type { ChangeEvent, SyntheticEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
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
    <div className="auth-page">
      <Brand />
      <form onSubmit={handleSubmit} className="login apple-card" aria-busy={loading}>
        <div className="apple-head">
          <p className="apple-eyebrow">Último paso</p>
          <h1 className="apple-title">Nueva contraseña</h1>
          <p className="apple-subtitle">Ingresa el código y elige una contraseña segura.</p>
        </div>

        <div className="apple-field">
          <label className="apple-label" htmlFor="reset-email">Correo electrónico</label>
          <Input
            id="reset-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="apple-field">
          <label className="apple-label" htmlFor="reset-code">Código</label>
          <Input
            id="reset-code"
            name="code"
            placeholder="6 dígitos"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={form.code}
            onChange={handleChange}
            maxLength={6}
            required
          />
        </div>
        <div className="apple-field">
          <label className="apple-label" htmlFor="reset-pass">Nueva contraseña</label>
          <Input
            id="reset-pass"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            value={form.password}
            onChange={handleChange}
            minLength={8}
          />
        </div>
        <div className="apple-field">
          <label className="apple-label" htmlFor="reset-pass2">Confirmar contraseña</label>
          <Input
            id="reset-pass2"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repite tu contraseña"
            value={form.confirmPassword}
            onChange={handleChange}
          />
        </div>

        {error && <p className="error apple-alert" role="alert">{error}</p>}

        <Button type="submit" disabled={loading} className="apple-submit" aria-busy={loading}>
          {loading ? (<><Spinner size="small" /> Guardando…</>) : "Guardar contraseña"}
        </Button>

        <div className="links apple-links">
          <p>
            <Link to="/login">Volver al inicio</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
