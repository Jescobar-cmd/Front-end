import { useState } from "react";
import type { SyntheticEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../../components/button";
import { Input } from "../../../components/input";
import { Spinner } from "../../../components/spinner";
import { Brand } from "../../../components/Brand";
import { useAuth } from "../../../context/AuthContext";
import { useCompletarPerfilGoogle } from "../../../hooks/useCompletarPerfilGoogle";
import { DocumentoIdentidad } from "../../../core/domain/value-objects/documento";
import { Telefono } from "../../../core/domain/value-objects/telefono";

export function CompletarPerfilGoogle() {
  const navigate = useNavigate();
  const { guardarSesion } = useAuth();
  const state = useLocation().state as { idToken?: string; email?: string } | null;
  const { completar, loading, error } = useCompletarPerfilGoogle();

  const [rol, setRol] = useState<"cliente" | "freelancer">("cliente");
  const [telefono, setTelefono] = useState("");
  const [documento, setDocumento] = useState("");
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  // Sin idToken (recarga de página) hay que volver a iniciar con Google
  if (!state?.idToken) return <Navigate to="/login" replace />;

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorLocal(null);
    try {
      const datos = {
        idToken: state.idToken as string,
        rolId: (rol === "freelancer" ? 2 : 3) as 2 | 3,
        telefono: telefono ? new Telefono(telefono).value : undefined,
        cedula: documento ? new DocumentoIdentidad(documento).value : undefined,
      };
      const sesion = await completar(datos);
      if (sesion) {
        guardarSesion(sesion);
        navigate("/dashboard");
      }
    } catch (err) {
      setErrorLocal(err instanceof Error ? err.message : "Datos inválidos");
    }
  };

  return (
    <div className="auth-page">
      <Brand />
      <form onSubmit={handleSubmit} className="registro">
        <h1>Completa tu perfil</h1>
        <p>{state.email ? `Cuenta de Google: ${state.email}` : "Cuenta de Google"}</p>

        <div className="roles">
          <Button type="button" variant={rol === "cliente" ? "primary" : "secondary"} onClick={() => setRol("cliente")}>
            Soy cliente
          </Button>
          <Button type="button" variant={rol === "freelancer" ? "primary" : "secondary"} onClick={() => setRol("freelancer")}>
            Soy freelancer
          </Button>
        </div>

        <Input type="tel" placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
        <Input
          placeholder={rol === "freelancer" ? "Número de documento" : "Número de documento (opcional)"}
          value={documento}
          onChange={(e) => setDocumento(e.target.value)}
        />

        {(errorLocal || error) && <p className="error">{errorLocal ?? error}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? <Spinner size="small" /> : "Continuar"}
        </Button>
      </form>
    </div>
  );
}