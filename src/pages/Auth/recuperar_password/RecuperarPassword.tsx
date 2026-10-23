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

      <form onSubmit={handleSubmit} className="login">
        <h1>Recupera tu contraseña</h1>
        <p>Te enviaremos un código de 6 dígitos para restablecerla.</p>

        <Input
          name="email"
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={handleChange}
          className={error ? "input--error" : ""}
        />

        {error && <p className="error">{error}</p>}
        {enviado && <p className="success">Si existe una cuenta con ese correo, te hemos enviado un código.</p>}

        <Button type="submit" disabled={loading}>
          {loading ? <Spinner size="small" /> : "Enviar código"}
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

        <p>
          <Link to="/login">Volver al inicio</Link>
        </p>
      </form>
    </div>
  );
}
