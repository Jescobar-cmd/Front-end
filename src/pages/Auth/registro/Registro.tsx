import { useState } from "react";
import type { ChangeEvent, SyntheticEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../../../components/button";
import { RoleSelector } from "../../../components/role-selector";
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
    <div className="auth-page">
      <Brand />

      <form onSubmit={handleSubmit} className="registro apple-card" aria-busy={loading}>
        <div className="apple-head">
          <p className="apple-eyebrow">First Gig</p>
          <h1 className="apple-title">Crear cuenta</h1>
          <p className="apple-subtitle">Completa tus datos para comenzar.</p>
        </div>

        <RoleSelector value={rol} onChange={setRol} />

        <div className="apple-row-2">
          <div className="apple-field">
            <label className="apple-label" htmlFor="reg-nombre">Nombre</label>
            <Input
              id="reg-nombre"
              name="nombre"
              autoComplete="given-name"
              placeholder="Tu nombre"
              value={form.nombre}
              onChange={handleChange}
              className={error ? "input--error" : ""}
              required
            />
          </div>
          <div className="apple-field">
            <label className="apple-label" htmlFor="reg-apellido">Apellido</label>
            <Input
              id="reg-apellido"
              name="apellido"
              autoComplete="family-name"
              placeholder="Tu apellido"
              value={form.apellido}
              onChange={handleChange}
              className={error ? "input--error" : ""}
              required
            />
          </div>
        </div>

        <div className="apple-field">
          <label className="apple-label" htmlFor="reg-email">Correo electrónico</label>
          <Input
            id="reg-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            value={form.email}
            onChange={handleChange}
            className={error ? "input--error" : ""}
          />
        </div>
        <div className="apple-field">
          <label className="apple-label" htmlFor="reg-pass">Contraseña</label>
          <Input
            id="reg-pass"
            name="password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            className={error ? "input--error" : ""}
            minLength={8}
            required
          />
          <span className="apple-hint">Usa al menos 8 caracteres.</span>
        </div>
        <div className="apple-field">
          <label className="apple-label" htmlFor="reg-pass2">Confirmar contraseña</label>
          <Input
            id="reg-pass2"
            name="confirmPassword"
            type="password"
            placeholder="Repite tu contraseña"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={handleChange}
            className={error ? "input--error" : ""}
            minLength={8}
            required
          />
        </div>

        <div className="apple-field">
          <label className="apple-label" htmlFor="reg-tel">Teléfono</label>
          <Input
            id="reg-tel"
            name="telefono"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="Teléfono (opcional)"
            value={form.telefono}
            onChange={handleChange}
          />
        </div>
        <div className="apple-field">
          <label className="apple-label" htmlFor="reg-doc">Documento</label>
          <Input
            id="reg-doc"
            name="documento"
            inputMode="numeric"
            placeholder={rol === "freelancer" ? "Número de documento" : "Número de documento (opcional)"}
            value={form.documento}
            onChange={handleChange}
            required={rol === "freelancer"}
          />
          <span className="apple-hint">{rol === "freelancer" ? "Obligatorio para freelancers." : "Solo si deseas agregarlo ahora."}</span>
        </div>

        <label className="checkbox apple-check">
          <input
            type="checkbox"
            checked={mayorDeEdad}
            onChange={(e) => setMayorDeEdad(e.target.checked)}
          />
          Tengo 18 años o más
        </label>

        {error && <p className="error apple-alert" role="alert">{error}</p>}

        <Button type="submit" disabled={loading} className="apple-submit" aria-busy={loading}>
          {loading ? (<><Spinner size="small" /> Creando cuenta…</>) : "Registrarme"}
        </Button>

        <div className="links apple-links">
          <p>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
