import { useState } from "react";
import type { ChangeEvent, SyntheticEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../../components/button";
import { Input } from "../../../components/input";
import { Spinner } from "../../../components/spinner";
import { Brand } from "../../../components/Brand";
import { useVerificarCuenta } from "../../../hooks/useVerificarCuenta";
import { useLogin } from "../../../hooks/UserLogin";
import { useAuth } from "../../../context/AuthContext";

export function VerificarCuenta() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const { verificar, reenviar, loading, error, info } = useVerificarCuenta();
  const { iniciarSesion } = useLogin();
  const { guardarSesion } = useAuth();
  // La contraseña solo viaja en memoria desde el registro (no se guarda en ningún storage)
  const passwordRegistro = (location.state as { password?: string } | null)?.password;

  // El correo llega desde el registro; si recargan la página se recupera de sessionStorage
  const emailInicial =
    (location.state as { email?: string } | null)?.email ??
    params.get("email") ??
    sessionStorage.getItem("first_gig_email_pendiente") ??
    "";
  // El enlace del correo trae ?token=CODIGO
  const codigoInicial = params.get("token") ?? "";

  const [email, setEmail] = useState(emailInicial);
  const [code, setCode] = useState(codigoInicial);
  const [exito, setExito] = useState(false);

  const handleCode = (e: ChangeEvent<HTMLInputElement>) =>
    setCode(e.target.value.replace(/\D/g, "").slice(0, 6));

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (await verificar(email, code)) {
      sessionStorage.removeItem("first_gig_email_pendiente");

      // Si venimos del registro, se inicia sesión solo y se muestra la página principal
      if (passwordRegistro) {
        const sesion = await iniciarSesion({ email, password: passwordRegistro });
        if (sesion) {
          guardarSesion(sesion);
          navigate("/dashboard", { replace: true });
          return;
        }
      }
      setExito(true);
    }
  };

  if (exito) {
    return (
      <div className="verificar">
        <h1>¡Cuenta confirmada!</h1>
        <p>Ya puedes iniciar sesión con tu correo y contraseña.</p>
        <Button type="button" onClick={() => navigate("/login")}>
          Ir a iniciar sesión
        </Button>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <Brand />
      <form onSubmit={handleSubmit} className="login">
        <h1>Confirma tu cuenta</h1>
        <p>
          Te enviamos un código de 6 dígitos {email ? <>a <strong>{email}</strong></> : "a tu correo"}.
        </p>

        {!emailInicial && (
          <Input
            name="email"
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        )}
        <Input
          name="code"
          inputMode="numeric"
          placeholder="Código de 6 dígitos"
          value={code}
          onChange={handleCode}
          className={error ? "input--error" : ""}
        />

        {error && <p className="error">{error}</p>}
        {info && <p className="success">{info}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? <Spinner size="small" /> : "Confirmar"}
        </Button>

        <div className="links">
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