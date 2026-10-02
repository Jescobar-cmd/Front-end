import { useState } from "react";
import type { ChangeEvent, SyntheticEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../../components/button";
import { Input } from "../../../components/input";
import { Spinner } from "../../../components/spinner";
import { Brand } from "../../../components/Brand";
import { useRestablecerPassword } from "../../../hooks/useRestablecerPassword";

export function RestablecerPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const { restablecer, loading, error } = useRestablecerPassword();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const ok = await restablecer({ token, ...form });
    if (ok) navigate("/login");
  };

  return (
    <div className="auth-page">
      <Brand />
      <form onSubmit={handleSubmit} className="login">
        <h1>Nueva contraseña</h1>

        <Input
          name="password"
          type="password"
          placeholder="Nueva contraseña"
          value={form.password}
          onChange={handleChange}
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