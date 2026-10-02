import { useState } from "react";
import type { ChangeEvent, SyntheticEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../components/button";
import { Input } from "../../../components/input";
import { Spinner } from "../../../components/spinner";
import { Brand } from "../../../components/Brand";
import { useRecuperarPassword } from "../../../hooks/useRecuperarPassword";

export function RecuperarPassword() {
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
        <p>Te enviaremos un enlace para restablecerla.</p>

        <Input
          name="email"
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={handleChange}
          className={error ? "input--error" : ""}
        />

        {error && <p className="error">{error}</p>}
        {enviado && <p className="success">Si existe una cuenta con ese correo, te hemos enviado un enlace.</p>}

        <Button type="submit" disabled={loading}>
          {loading ? <Spinner size="small" /> : "Enviar enlace"}
        </Button>

        <p>
          <Link to="/login">Volver al inicio</Link>
        </p>
      </form>
    </div>
  );
}