import { useState } from "react";
import type { ChangeEvent, SyntheticEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../../components/button";
import { Input } from "../../../components/input";
import { Spinner } from "../../../components/spinner";
import { Brand } from "../../../components/Brand";
import { useRestablecerPassword } from "../../../hooks/useRestablecerPassword";

export function RestablecerPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { email?: string } | null;

  const { restablecer, loading, error } = useRestablecerPassword();
  const [form, setForm] = useState({ email: state?.email ?? "", code: "", password: "", confirmPassword: "" });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.name === "code" ? e.target.value.replace(/\D/g, "").slice(0, 6) : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const ok = await restablecer(form);
    if (ok) navigate("/login");
  };

  return (
    <div className="auth-page">
      <Brand />
      <form onSubmit={handleSubmit} className="login">
        <h1>Nueva contraseña</h1>

        <Input
          name="email"
          type="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={handleChange}
          required
        />
        <Input
          name="code"
          placeholder="Código de 6 dígitos"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={form.code}
          onChange={handleChange}
          maxLength={6}
          required
        />
        <Input
          name="password"
          type="password"
          placeholder="Nueva contraseña (mínimo 8 caracteres)"
          value={form.password}
          onChange={handleChange}
          minLength={8}
        />
        <Input
          name="confirmPassword"
          type="password"
          placeholder="Confirmar contraseña"
          value={form.confirmPassword}
          onChange={handleChange}
        />

        {error && <p className="error">{error}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? <Spinner size="small" /> : "Guardar contraseña"}
        </Button>
      </form>
    </div>
  );
}