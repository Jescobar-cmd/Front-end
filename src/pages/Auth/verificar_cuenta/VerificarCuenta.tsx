import { useState } from "react";
import type { ChangeEvent, SyntheticEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../../components/button";
import { Input } from "../../../components/input";
import { Spinner } from "../../../components/spinner";
import { Brand } from "../../../components/Brand";
import { useVerificarCuenta } from "../../../hooks/useVerificarCuenta";

export function VerificarCuenta() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const { verificar, reenviar, loading, error, info, reenviarEn } = useVerificarCuenta();

  // El correo llega desde el registro; si recargan la página se recupera de sessionStorage
  const emailInicial =
    (location.state as { email?: string } | null)?.email ??
    params.get("email") ??
    sessionStorage.getItem("first_gig_email_pendiente") ??
    "";
  // El enlace del correo puede traer ?token=CODIGO o ?code=CODIGO
  const codigoInicial = params.get("token") ?? params.get("code") ?? "";

  const [email, setEmail] = useState(emailInicial);
  const [code, setCode] = useState(codigoInicial);
  const [exito, setExito] = useState(false);

  const handleCode = (e: ChangeEvent<HTMLInputElement>) =>
    setCode(e.target.value.replace(/\D/g, "").slice(0, 6));

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (await verificar(email, code)) {
      sessionStorage.removeItem("first_gig_email_pendiente");
      setExito(true);
    }
  };

  if (exito) {
    return (
      <div className="auth-page auth-screen auth-screen--verificacion">
        <Brand appearance="auth" onClick={() => navigate("/")} />
        <section className="verificar auth-card">
          <h1>¡Cuenta confirmada!</h1>
          <p>Ya puedes iniciar sesión con tu correo y contraseña.</p>
          <Button
            type="button"
            className="btn-primary"
            onClick={() => navigate("/login", { replace: true })}
          >
            Ir a iniciar sesión
          </Button>
        </section>
      </div>
    );
  }

  return (
    <div className="auth-page auth-screen auth-screen--verificacion">
      <Brand appearance="auth" onClick={() => navigate("/")} />
      <form onSubmit={handleSubmit} className="login auth-card">
        <h1>Confirma tu cuenta</h1>
        <p>
          Te enviamos un código de 6 dígitos {email ? <>a <strong>{email}</strong></> : "a tu correo"}.
        </p>

        {!emailInicial && (
          <div className="auth-field">
            <label htmlFor="verificacion-email">Correo electrónico</label>
            <Input
              id="verificacion-email"
              name="email"
              type="email"
              placeholder="Correo electrónico"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        )}
        <div className="auth-field">
          <label htmlFor="verificacion-code">Código de 6 dígitos</label>
          <Input
            id="verificacion-code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="Código de 6 dígitos"
            value={code}
            onChange={handleCode}
            className={`auth-code-input${error ? " input--error" : ""}`}
          />
        </div>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {info && (
          <p className="success" role="status">
            {info}
          </p>
        )}

        <Button type="submit" className="btn-primary" disabled={loading} aria-busy={loading}>
          {loading ? <Spinner size="small" /> : "Confirmar"}
        </Button>

        <div className="links auth-verification-links">
          <p>¿No te llegó?</p>
          <Button
            type="button"
            className="btn-primary"
            disabled={loading || reenviarEn > 0}
            onClick={() => void reenviar(email)}
            aria-busy={loading}
          >
            {loading ? <Spinner size="small" /> : reenviarEn > 0 ? `Reenviar código (${reenviarEn}s)` : "Reenviar código"}
          </Button>
          <p>
            <Link to="/login">Volver al inicio</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
