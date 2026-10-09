import { useState } from "react";
import type { SyntheticEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../../components/button";
import { RoleSelector } from "../../../components/role-selector";
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
    <div className="auth-page">
      <Brand />
      <form onSubmit={handleSubmit} className="registro apple-card" aria-busy={loading}>
        <div className="apple-head">
          <p className="apple-eyebrow">Ya casi terminas</p>
          <h1 className="apple-title">Completa tu perfil</h1>
          <p className="apple-subtitle">{email ? <>Cuenta de Google: <strong>{email}</strong></> : "Cuenta de Google"}</p>
        </div>

        <RoleSelector value={rol} onChange={setRol} />

        <div className="apple-field">
          <label className="apple-label" htmlFor="gp-tel">Teléfono</label>
          <Input id="gp-tel" type="tel" autoComplete="tel" inputMode="tel" placeholder="Teléfono (opcional)" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
        </div>
        <div className="apple-field">
          <label className="apple-label" htmlFor="gp-doc">Documento</label>
          <Input
            id="gp-doc"
            inputMode="numeric"
            placeholder={rol === "freelancer" ? "Número de documento" : "Número de documento (opcional)"}
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            required={rol === "freelancer"}
          />
          <span className="apple-hint">{rol === "freelancer" ? "Obligatorio para freelancers." : "Puedes agregarlo después."}</span>
        </div>

        {error && <p className="error apple-alert" role="alert">{error}</p>}

        <Button type="submit" disabled={loading} className="apple-submit" aria-busy={loading}>
          {loading ? (<><Spinner size="small" /> Guardando…</>) : "Continuar"}
        </Button>
      </form>
    </div>
  );
}
