import { useState } from "react";
import type { ChangeEvent, SyntheticEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../../components/button";
import { Input } from "../../../components/input";
import { Spinner } from "../../../components/spinner";
import { Brand } from "../../../components/Brand";
import { useAuth } from "../../../context/AuthContext";
import { useCompletarPerfilGoogle } from "../../../hooks/useCompletarPerfilGoogle";

interface GoogleState {
  idToken?: string;
  email?: string;
}

export function CompletarPerfilGoogle() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as GoogleState | null;
  const { guardarSesion } = useAuth();
  const { completar, loading, error } = useCompletarPerfilGoogle();
  const [rol, setRol] = useState<"cliente" | "freelancer">("cliente");
  const [form, setForm] = useState({ telefono: "", documento: "" });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!state?.idToken) return;
    const datos = rol === "freelancer"
      ? { idToken: state.idToken, rolId: 2 as const, telefono: form.telefono, cedula: form.documento }
      : { idToken: state.idToken, rolId: 3 as const, telefono: form.telefono };
    const sesion = await completar(datos);
    if (sesion) {
      guardarSesion(sesion);
      navigate("/dashboard", { replace: true });
    }
  };

  if (!state?.idToken) {
    return <div className="auth-page"><Brand /><p>La sesión de Google expiró. <Link to="/login">Volver a iniciar sesión</Link></p></div>;
  }

  return (
    <div className="auth-page">
      <Brand />
      <form onSubmit={handleSubmit} className="registro">
        <h1>Completa tu perfil</h1>
        {state.email && <p>{state.email}</p>}
        <div className="roles">
          <Button type="button" variant={rol === "cliente" ? "primary" : "secondary"} onClick={() => setRol("cliente")}>
            Soy cliente
          </Button>
          <Button type="button" variant={rol === "freelancer" ? "primary" : "secondary"} onClick={() => setRol("freelancer")}>
            Soy freelancer
          </Button>
        </div>
        <Input name="telefono" type="tel" placeholder="Teléfono (opcional)" value={form.telefono} onChange={handleChange} />
        {rol === "freelancer" && (
          <Input name="documento" placeholder="Cédula" value={form.documento} onChange={handleChange} required />
        )}
        {error && <p className="error">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? <Spinner size="small" /> : "Continuar"}
        </Button>
      </form>
    </div>
  );
}