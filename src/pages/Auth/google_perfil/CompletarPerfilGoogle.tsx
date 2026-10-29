import { useState } from "react";
import type { SyntheticEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../../components/button";
import { Input } from "../../../components/input";
import { Spinner } from "../../../components/spinner";
import { Brand } from "../../../components/Brand";
import { useAuth } from "../../../context/AuthContext";
import { useCompletarPerfilGoogle } from "../../../hooks/useCompletarPerfilGoogle";
import { dashboardPorRol } from "../../../routes/rutasPorRol";

const GOOGLE_PENDIENTE_KEY = "first_gig_google_pendiente";

export function CompletarPerfilGoogle() {
  const navigate = useNavigate();
  const { guardarSesion } = useAuth();
  const state = useLocation().state as { idToken?: string; email?: string } | null;
  const { completar, loading, error } = useCompletarPerfilGoogle();

  const pendiente = (() => {
    try {
      return JSON.parse(sessionStorage.getItem(GOOGLE_PENDIENTE_KEY) ?? "null") as {
        idToken?: string;
        email?: string;
      } | null;
    } catch {
      return null;
    }
  })();

  const idToken = state?.idToken ?? pendiente?.idToken;
  const email = state?.email ?? pendiente?.email;

  const [rol, setRol] = useState<"cliente" | "freelancer">("cliente");
  const [telefono, setTelefono] = useState("");
  const [documento, setDocumento] = useState("");

  // Sin idToken (ni state ni sessionStorage) hay que volver a iniciar con Google
  if (!idToken) return <Navigate to="/login" replace />;

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const sesion = await completar(
      rol === "freelancer"
        ? { idToken, rol, telefono, documento }
        : { idToken, rol, telefono, ...(documento.trim() ? { documento } : {}) }
    );
    if (sesion) {
      sessionStorage.removeItem(GOOGLE_PENDIENTE_KEY);
      guardarSesion(sesion);
      navigate(dashboardPorRol(sesion.user.rol), { replace: true });
    }
  };

  return (
    <div className="auth-page auth-screen auth-screen--google-profile">
      <Brand appearance="auth" onClick={() => navigate("/")} />
      <form onSubmit={handleSubmit} className="registro auth-card">
        <h1>Completa tu perfil</h1>
        <p>{email ? `Cuenta de Google: ${email}` : "Cuenta de Google"}</p>

        <fieldset className="roles account-selector">
          <legend>Tipo de cuenta</legend>
          <Button
            type="button"
            variant={rol === "cliente" ? "primary" : "secondary"}
            className="account-selector__button"
            onClick={() => setRol("cliente")}
            aria-pressed={rol === "cliente"}
          >
            Soy cliente
          </Button>
          <Button
            type="button"
            variant={rol === "freelancer" ? "primary" : "secondary"}
            className="account-selector__button"
            aria-pressed={rol === "freelancer"}
            onClick={() => setRol("freelancer")}
          >
            Soy freelancer
          </Button>
        </fieldset>

        <div className="auth-field">
          <label htmlFor="google-telefono">Teléfono (opcional)</label>
          <Input
            id="google-telefono"
            type="tel"
            placeholder="Teléfono (opcional)"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
        </div>
        <div className="auth-field">
          <label htmlFor="google-documento">
            {rol === "freelancer" ? "Número de documento" : "Número de documento (opcional)"}
          </label>
          <Input
            id="google-documento"
            placeholder={rol === "freelancer" ? "Número de documento" : "Número de documento (opcional)"}
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            required={rol === "freelancer"}
          />
        </div>

        {error && <p className="error" role="alert">{error}</p>}

        <Button type="submit" className="btn-primary" disabled={loading} aria-busy={loading}>
          {loading ? <Spinner size="small" /> : "Continuar"}
        </Button>
      </form>
    </div>
  );
}
