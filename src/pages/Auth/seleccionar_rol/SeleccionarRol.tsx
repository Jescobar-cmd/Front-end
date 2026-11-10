import { useState } from "react";
import type { SyntheticEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "../../../components/button";
import { Input } from "../../../components/input";
import { Spinner } from "../../../components/spinner";
import { Brand } from "../../../components/Brand";
import { useAuth } from "../../../context/AuthContext";
import { useSeleccionarRol } from "../../../hooks/useSeleccionarRol";
import { dashboardPorRol } from "../../../routes/rutasPorRol";

const NEEDS_ROLE_SELECTION_KEY = "first_gig_needs_role_selection";
const ROL_INTENT_KEY = "first_gig_rol_intent";

type RolCuenta = "cliente" | "freelancer";

export function SeleccionarRol() {
  const navigate = useNavigate();
  const { token, guardarSesion, cerrarSesion } = useAuth();
  const { seleccionar, loading, error, limpiarError } = useSeleccionarRol();

  const salir = () => {
    try {
      sessionStorage.removeItem(NEEDS_ROLE_SELECTION_KEY);
      sessionStorage.removeItem(ROL_INTENT_KEY);
    } catch {
      // no-op
    }
    cerrarSesion();
    navigate("/login", { replace: true });
  };

  const [rol, setRol] = useState<RolCuenta | null>(null);
  const [telefono, setTelefono] = useState("");
  const [documento, setDocumento] = useState("");
  const [rolError, setRolError] = useState("");

  if (!token) return <Navigate to="/login" replace />;

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!rol) {
      setRolError("Elige si usarás FirstGig como cliente o freelancer.");
      return;
    }
    setRolError("");
    limpiarError();
    const sesion = await seleccionar(token, {
      rol,
      telefono,
      ...(documento.trim() ? { documento } : {}),
    } as { rol: "cliente"; telefono?: string; documento?: string } | { rol: "freelancer"; telefono?: string; documento: string });
    if (sesion) {
      try {
        sessionStorage.removeItem(NEEDS_ROLE_SELECTION_KEY);
        sessionStorage.removeItem(ROL_INTENT_KEY);
      } catch {
        // no-op
      }
      guardarSesion(sesion);
      navigate(dashboardPorRol(sesion.user.rol), { replace: true });
    }
  };

  return (
    <div className="auth-page auth-screen auth-screen--google-profile">
      <Brand appearance="auth" onClick={() => navigate("/")} />
      <form onSubmit={handleSubmit} className="registro auth-card" noValidate>
        <h1>Elige tu tipo de cuenta</h1>
        <p>Este paso es obligatorio. Selecciona cómo usarás FirstGig para continuar.</p>

        <fieldset className="roles account-selector" aria-describedby={rolError ? "rol-error" : "rol-help"}>
          <legend>Tipo de cuenta</legend>
          <Button
            type="button"
            variant={rol === "cliente" ? "primary" : "secondary"}
            className="account-selector__button"
            onClick={() => { setRol("cliente"); setRolError(""); limpiarError(); }}
            aria-pressed={rol === "cliente"}
          >
            Soy cliente
          </Button>
          <Button
            type="button"
            variant={rol === "freelancer" ? "primary" : "secondary"}
            className="account-selector__button"
            onClick={() => { setRol("freelancer"); setRolError(""); limpiarError(); }}
            aria-pressed={rol === "freelancer"}
          >
            Soy freelancer
          </Button>
        </fieldset>

        {rolError && <p className="error" id="rol-error" role="alert">{rolError}</p>}
        {!rol && !rolError && (
          <p className="auth-hint" id="rol-help" role="status">Elige una opción para continuar.</p>
        )}

        <div className="auth-field">
          <label htmlFor="seleccionar-rol-telefono">Teléfono (opcional)</label>
          <Input
            id="seleccionar-rol-telefono"
            type="tel"
            placeholder="Teléfono (opcional)"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
        </div>
        <div className="auth-field">
          <label htmlFor="seleccionar-rol-documento">
            {rol === "freelancer" ? "Número de documento" : "Número de documento (opcional)"}
          </label>
          <Input
            id="seleccionar-rol-documento"
            placeholder={rol === "freelancer" ? "Número de documento" : "Número de documento (opcional)"}
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            required={rol === "freelancer"}
          />
        </div>

        {error && (
          <div role="alert">
            <p className="error">{error}</p>
            {/(404|no encontr|no existe|ruta)/i.test(error) && (
              <p className="auth-hint">No pudimos completar este paso con el servidor actual. Puedes cerrar sesión e intentarlo más tarde.</p>
            )}
          </div>
        )}

        <Button type="submit" className="btn-primary" disabled={loading} aria-busy={loading}>
          {loading ? <Spinner size="small" /> : "Continuar"}
        </Button>
        <Button type="button" variant="secondary" onClick={salir} disabled={loading}>
          Cerrar sesión
        </Button>
      </form>
    </div>
  );
}
