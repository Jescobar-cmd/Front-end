import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { Button, buttonClassName } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";
import { useCambiarPassword } from "../../hooks/useCambiarPassword";
import { dashboardPorRol } from "../../routes/rutasPorRol";
import "./account.css";

interface ErroresCampo {
  actual?: string;
  nueva?: string;
  confirmacion?: string;
}

export function SecurityPage() {
  const { token, user } = useAuth();
  const { cambiar, loading, error, exito } = useCambiarPassword(token);
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [errores, setErrores] = useState<ErroresCampo>({});

  const validar = (): ErroresCampo => {
    const siguientes: ErroresCampo = {};
    if (!actual.trim()) siguientes.actual = "Ingresa tu contraseña actual.";
    if (!nueva) {
      siguientes.nueva = "Ingresa una nueva contraseña.";
    } else if (nueva.length < 8) {
      siguientes.nueva = "La nueva contraseña debe tener al menos 8 caracteres.";
    }
    if (!confirmacion) {
      siguientes.confirmacion = "Confirma la nueva contraseña.";
    } else if (nueva !== confirmacion) {
      siguientes.confirmacion = "Las contraseñas no coinciden.";
    }
    return siguientes;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const siguientes = validar();
    setErrores(siguientes);
    if (Object.keys(siguientes).length > 0) return;

    const ok = await cambiar(actual, nueva, confirmacion);
    if (ok) {
      setActual("");
      setNueva("");
      setConfirmacion("");
      setErrores({});
    }
  };

  const destino = user ? dashboardPorRol(user.rol) : "/dashboard";

  return (
    <div className="account-page">
      <header className="account-page__head">
        <p className="ui-eyebrow">Seguridad de la cuenta</p>
        <h1>Cambiar contraseña</h1>
        <p>Actualiza tu contraseña cuando lo necesites. Usa al menos 8 caracteres.</p>
      </header>

      <form className="account-card" onSubmit={(event) => void handleSubmit(event)} noValidate>
        {error ? (
          <div className="account-alert account-alert--error" role="alert">
            {error}
          </div>
        ) : null}

        {exito ? (
          <div className="account-alert account-alert--success" role="status" aria-live="polite">
            Contraseña actualizada correctamente.
          </div>
        ) : null}

        <Input
          label="Contraseña actual"
          type="password"
          value={actual}
          onChange={(event) => setActual(event.target.value)}
          autoComplete="current-password"
          error={errores.actual}
          required
        />

        <Input
          label="Nueva contraseña"
          type="password"
          value={nueva}
          onChange={(event) => setNueva(event.target.value)}
          autoComplete="new-password"
          hint="Mínimo 8 caracteres."
          error={errores.nueva}
          required
        />

        <Input
          label="Confirmar nueva contraseña"
          type="password"
          value={confirmacion}
          onChange={(event) => setConfirmacion(event.target.value)}
          autoComplete="new-password"
          error={errores.confirmacion}
          required
        />

        <div className="account-card__actions">
          <Button variant="action" type="submit" disabled={loading}>
            {loading ? "Guardando…" : "Guardar cambios"}
          </Button>
          <Link className={buttonClassName({ variant: "secondary" })} to={destino}>
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
