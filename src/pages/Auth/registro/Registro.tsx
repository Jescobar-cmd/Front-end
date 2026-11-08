import { useState } from "react";
import type { ChangeEvent, SyntheticEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../../../components/button";
import { Input } from "../../../components/input";
import { Spinner } from "../../../components/spinner";
import { Brand } from "../../../components/Brand";
import { useRegistro } from "../../../hooks/UseRegistro";

const NEEDS_ROLE_SELECTION_KEY = "first_gig_needs_role_selection";

export function Registro() {
  const navigate = useNavigate();
  const { registrar, loading, error, limpiarError } = useRegistro();

  const [mayorDeEdad, setMayorDeEdad] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    confirmPassword: "",
    telefono: "",
    documento: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((actual) => ({ ...actual, [name]: value }));
    limpiarError();
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const resultado = await registrar({
      nombre: form.nombre,
      apellido: form.apellido,
      email: form.email,
      password: form.password,
      confirmPassword: form.confirmPassword,
      mayorDeEdad,
      telefono: form.telefono,
      ...(form.documento.trim() ? { documento: form.documento } : {}),
    });

    if (!resultado) return;
    sessionStorage.setItem("first_gig_email_pendiente", resultado.email);
    // Tras verificar e iniciar sesión, el usuario deberá elegir su rol (obligatorio).
    sessionStorage.setItem(NEEDS_ROLE_SELECTION_KEY, "1");
    navigate("/verificar-cuenta", { state: { email: resultado.email, needsRoleSelection: true } });
  };

  return (
    <div className="auth-page auth-screen auth-screen--registro">
      <Brand appearance="auth" onClick={() => navigate("/")} />

      <form onSubmit={handleSubmit} className="registro auth-card">
        <h1>Crear cuenta</h1>
        <p>Completa tus datos para comenzar. Después de confirmar tu cuenta elegirás si eres cliente o freelancer.</p>

        <div className="registro-name-row">
          <div className="auth-field">
            <label htmlFor="registro-nombre">Nombre</label>
            <Input
              id="registro-nombre"
              name="nombre"
              placeholder="Nombre"
              autoComplete="given-name"
              value={form.nombre}
              onChange={handleChange}
              className={error ? "input--error" : ""}
              required
            />
          </div>
          <div className="auth-field">
            <label htmlFor="registro-apellido">Apellido</label>
            <Input
              id="registro-apellido"
              name="apellido"
              placeholder="Apellido"
              autoComplete="family-name"
              value={form.apellido}
              onChange={handleChange}
              className={error ? "input--error" : ""}
              required
            />
          </div>
        </div>
        <div className="auth-field">
          <label htmlFor="registro-email">Correo electrónico</label>
          <Input
            id="registro-email"
            name="email"
            type="email"
            placeholder="Correo electrónico"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            className={error ? "input--error" : ""}
          />
        </div>
        <div className="auth-field">
          <label htmlFor="registro-password">Contraseña</label>
          <Input
            id="registro-password"
            name="password"
            type="password"
            placeholder="Contraseña (mínimo 8 caracteres)"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            className={error ? "input--error" : ""}
            minLength={8}
            required
          />
        </div>
        <div className="auth-field">
          <label htmlFor="registro-confirmar-password">Confirmar contraseña</label>
          <Input
            id="registro-confirmar-password"
            name="confirmPassword"
            type="password"
            placeholder="Confirmar contraseña"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={handleChange}
            className={error ? "input--error" : ""}
            minLength={8}
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="registro-telefono">Teléfono (opcional)</label>
          <Input
            id="registro-telefono"
            name="telefono"
            type="tel"
            placeholder="Teléfono (opcional)"
            autoComplete="tel"
            value={form.telefono}
            onChange={handleChange}
          />
        </div>
        <div className="auth-field">
          <label htmlFor="registro-documento">Número de documento (opcional)</label>
          <Input
            id="registro-documento"
            name="documento"
            placeholder="Número de documento (opcional)"
            value={form.documento}
            onChange={handleChange}
          />
          <p className="auth-hint">Si eliges ser freelancer, te pediremos el documento al seleccionar tu rol.</p>
        </div>

        <label className="auth-checkbox">
          <input
            type="checkbox"
            checked={mayorDeEdad}
            onChange={(e) => setMayorDeEdad(e.target.checked)}
          />
          Tengo 18 años o más
        </label>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" className="btn-primary" disabled={loading} aria-busy={loading}>
          {loading ? <Spinner size="small" /> : "Registrarme"}
        </Button>
        {loading && (
          <p className="auth-hint" role="status">
            Estamos creando tu cuenta y enviando el código de verificación. Esto puede tardar unos segundos.
          </p>
        )}

        <div className="links">
          <p>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
