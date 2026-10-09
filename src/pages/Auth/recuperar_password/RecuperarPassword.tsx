import { useState } from "react";
import type { ChangeEvent, SyntheticEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../../components/button";
import { Input } from "../../../components/input";
import { Spinner } from "../../../components/spinner";
import { Brand } from "../../../components/Brand";
import { useRecuperarPassword } from "../../../hooks/useRecuperarPassword";

export function RecuperarPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const { solicitar, loading, error, enviado } = useRecuperarPassword();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    await solicitar(email);
  };

  return (
    <div className="auth-page">
      <Brand />

      <form onSubmit={handleSubmit} className="login apple-card" aria-busy={loading}>
        <div className="apple-head">
          <p className="apple-eyebrow">Recuperación</p>
          <h1 className="apple-title">Recupera tu contraseña</h1>
          <p className="apple-subtitle">Te enviaremos un código de 6 dígitos para restablecerla.</p>
        </div>

        <div className="apple-field">
          <label className="apple-label" htmlFor="rec-email">Correo electrónico</label>
          <Input
            id="rec-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={handleChange}
            className={error ? "input--error" : ""}
            aria-invalid={Boolean(error)}
          />
        </div>

        {error && <p className="error apple-alert" role="alert">{error}</p>}
        {enviado && <p className="success apple-success" role="status">Si existe una cuenta con ese correo, te hemos enviado un código.</p>}

        <Button type="submit" disabled={loading} className="apple-submit" aria-busy={loading}>
          {loading ? (<><Spinner size="small" /> Enviando…</>) : "Enviar código"}
        </Button>

        {enviado && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/restablecer-password", { state: { email } })}
          >
            Ya tengo mi código
          </Button>
        )}

        <div className="links apple-links">
          <p>
            <Link to="/login">Volver al inicio</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
