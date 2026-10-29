import { useState } from "react";
import type { ChangeEvent, SyntheticEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../../../components/button";
import { Input } from "../../../components/input";
import { Spinner } from "../../../components/spinner";
import { Brand } from "../../../components/Brand";
import { useRegistro } from "../../../hooks/UseRegistro";

type Rol = "cliente" | "freelancer";

export function Registro() {
  const navigate = useNavigate();
  const { registrar, loading, error, limpiarError } = useRegistro();

  const [rol, setRol] = useState<Rol>("cliente");
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

    const base = {
      nombre: form.nombre,
      apellido: form.apellido,
      email: form.email,
      password: form.password,
      confirmPassword: form.confirmPassword,
      mayorDeEdad,
    };

    const resultado = await registrar(
      rol === "freelancer"
        ? { ...base, rol, telefono: form.telefono, documento: form.documento }
        : { ...base, rol, telefono: form.telefono, ...(form.documento.trim() ? { documento: form.documento } : {}) }
    );

    if (!resultado) return;
    sessionStorage.setItem("first_gig_email_pendiente", resultado.email);
    navigate("/verificar-cuenta", { state: { email: resultado.email } });
  };

  return (
    <div className="auth-page auth-screen auth-screen--registro">
      <Brand appearance="auth" onClick={() => navigate("/")} />

      <form onSubmit={handleSubmit} className="registro auth-card">
        <h1>Crear cuenta</h1>
        <p>Completa tus datos para comenzar.</p>

        <fieldset className="roles roles--pill">
          <legend>Tipo de cuenta</legend>
          <Button
            type="button"
            variant={rol === "cliente" ? "primary" : "secondary"}
            className="account-selector__button"
            aria-pressed={rol === "cliente"}
            onClick={() => setRol("cliente")}
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
        {rol === "freelancer" ? (
          <div className="auth-field">
            <label htmlFor="registro-documento">Número de documento</label>
            <Input
              id="registro-documento"
              name="documento"
              placeholder="Número de documento"
              value={form.documento}
              onChange={handleChange}
              required
            />
          </div>
        ) : (
          <div className="auth-field">
            <label htmlFor="registro-documento">Número de documento (opcional)</label>
            <Input
              id="registro-documento"
              name="documento"
              placeholder="Número de documento (opcional)"
              value={form.documento}
              onChange={handleChange}
            />
          </div>
        )}

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

        <div className="links">
          <p>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
