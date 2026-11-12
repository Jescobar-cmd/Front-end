import { useState } from "react";
import type { ChangeEvent, SyntheticEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../../../components/button";
import { Input } from "../../../components/input";
import { Spinner } from "../../../components/spinner";
import { Brand } from "../../../components/Brand";
import { useRegistro } from "../../../hooks/UseRegistro";

export function Registro() {
  const navigate = useNavigate();
  const { registrar, loading, error, limpiarError } = useRegistro();

  const [rol, setRol] = useState<"cliente" | "freelancer" | null>(null);
  const [rolError, setRolError] = useState("");
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
    if (!rol) {
      setRolError("Elige si usarás FirstGig como cliente o freelancer.");
      return;
    }
    setRolError("");

    const resultado = await registrar({
      nombre: form.nombre,
      apellido: form.apellido,
      email: form.email,
      password: form.password,
      confirmPassword: form.confirmPassword,
      mayorDeEdad,
      rolId: rol === "freelancer" ? 2 : 3,
      telefono: form.telefono,
      ...(form.documento.trim() ? { documento: form.documento } : {}),
    });

    if (!resultado) return;
    sessionStorage.setItem("first_gig_email_pendiente", resultado.email);
    navigate("/verificar-cuenta", { state: { email: resultado.email } });
  };

  return (
    <div className="auth-page auth-screen auth-screen--registro">
      <Brand appearance="auth" onClick={() => navigate("/")} />

      <form onSubmit={handleSubmit} className="registro auth-card">
        <h1>Crear cuenta</h1>
        <p>Completa tus datos y elige cómo usarás FirstGig. Después solo tendrás que confirmar tu correo.</p>

        <fieldset
          className="roles roles--pill account-selector"
          aria-label="Tipo de cuenta"
          aria-describedby={rolError ? "registro-rol-error" : undefined}
        >
          <legend>Tipo de cuenta</legend>
          <Button
            type="button"
            variant={rol === "cliente" ? "primary" : "secondary"}
            className="account-selector__button"
            aria-pressed={rol === "cliente"}
            onClick={() => { setRol("cliente"); setRolError(""); }}
          >
            Soy cliente
          </Button>
          <Button
            type="button"
            variant={rol === "freelancer" ? "primary" : "secondary"}
            className="account-selector__button"
            aria-pressed={rol === "freelancer"}
            onClick={() => { setRol("freelancer"); setRolError(""); }}
          >
            Soy freelancer
          </Button>
        </fieldset>
        {rolError && <p className="error" id="registro-rol-error" role="alert">{rolError}</p>}

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
          <label htmlFor="registro-documento">
            Número de documento {rol === "freelancer" ? "(obligatorio)" : "(opcional)"}
          </label>
          <Input
            id="registro-documento"
            name="documento"
            placeholder={rol === "freelancer" ? "Número de documento" : "Número de documento (opcional)"}
            value={form.documento}
            onChange={handleChange}
            required={rol === "freelancer"}
          />
          <p className="auth-hint">La cédula es obligatoria si te registras como freelancer.</p>
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
