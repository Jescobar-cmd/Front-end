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
  const { verificar, reenviar, loading, error, info } = useVerificarCuenta();

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
      <div className="verificar apple-card" role="status">
        <div className="apple-head">
          <p className="apple-eyebrow">Verificación exitosa</p>
          <h1 className="apple-title">¡Cuenta confirmada!</h1>
          <p className="apple-subtitle">Ya puedes iniciar sesión con tu correo y contraseña.</p>
        </div>
        <Button type="button" onClick={() => navigate("/login", { replace: true })}>
          Ir a iniciar sesión
        </Button>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <Brand />
      <form onSubmit={handleSubmit} className="login apple-card" aria-busy={loading}>
        <div className="apple-head">
          <p className="apple-eyebrow">Paso 2 de 2</p>
          <h1 className="apple-title">Confirma tu cuenta</h1>
          <p className="apple-subtitle">
            Te enviamos un código de 6 dígitos {email ? <>a <strong>{email}</strong></> : "a tu correo"}.
          </p>
        </div>

        {!emailInicial && (
          <div className="apple-field">
            <label className="apple-label" htmlFor="ver-email">Correo electrónico</label>
            <Input
              id="ver-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        )}
        <div className="apple-field">
          <label className="apple-label" htmlFor="ver-code">Código de verificación</label>
          <Input
            id="ver-code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="6 dígitos"
            value={code}
            onChange={handleCode}
            maxLength={6}
            className={error ? "input--error" : ""}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "ver-error" : undefined}
          />
          <span className="apple-hint">Revisa tu bandeja y spam. Solo números.</span>
        </div>

        {error && <p className="error apple-alert" role="alert" id="ver-error">{error}</p>}
        {info && <p className="success apple-success" role="status">{info}</p>}

        <Button type="submit" disabled={loading} className="apple-submit" aria-busy={loading}>
          {loading ? (<><Spinner size="small" /> Confirmando…</>) : "Confirmar"}
        </Button>

        <div className="links apple-links">
          <p>
            ¿No te llegó?{" "}
            <a href="#" onClick={(e) => { e.preventDefault(); void reenviar(email); }}>
              Reenviar código
            </a>
          </p>
          <p>
            <Link to="/login">Volver al inicio</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
