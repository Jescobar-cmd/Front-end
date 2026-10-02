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
        : { ...base, rol }
    );

    if (!resultado) return;
    sessionStorage.setItem("first_gig_email_pendiente", resultado.email);
    navigate("/verificar-cuenta", { state: { email: resultado.email, password: form.password } });
  };

  return (
    <div className="auth-page">
      <Brand />

      <form onSubmit={handleSubmit} className="registro">
        <h1>Crear cuenta</h1>
        <p>Completa tus datos para comenzar.</p>

        <div className="roles">
          <Button
            type="button"
            variant={rol === "cliente" ? "primary" : "secondary"}
            onClick={() => setRol("cliente")}
          >
            Soy cliente
          </Button>
          <Button
            type="button"
            variant={rol === "freelancer" ? "primary" : "secondary"}
            onClick={() => setRol("freelancer")}
          >
            Soy freelancer
          </Button>
        </div>

        <Input
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
          className={error ? "input--error" : ""}
          required
        />
        <Input
          name="apellido"
          placeholder="Apellido"
          value={form.apellido}
          onChange={handleChange}
          className={error ? "input--error" : ""}
          required
        />
        <Input
          name="email"
          type="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={handleChange}
          className={error ? "input--error" : ""}
        />
        <Input
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
        <Input
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

        {rol === "freelancer" && (
          <>
            <Input
              name="telefono"
              type="tel"
              placeholder="Teléfono"
              value={form.telefono}
              onChange={handleChange}
            />
            <Input
              name="documento"
              placeholder="Número de documento"
              value={form.documento}
              onChange={handleChange}
              required
            />
          </>
        )}

        <label>
          <input
            type="checkbox"
            checked={mayorDeEdad}
            onChange={(e) => setMayorDeEdad(e.target.checked)}
          />
          Tengo 18 años o más
        </label>

        {error && <p className="error">{error}</p>}

        <Button type="submit" disabled={loading}>
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