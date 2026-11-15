import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { moderacionApi } from "../../../infrastructure/api/apiModeracion";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "./Toast";
import { Avatar } from "./Avatar";
import { EstadoBadge } from "./EstadoBadge";
import { PanelDialog } from "./PanelDialog";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { erroresPorCampo, mensajeError } from "../utils";
import { useTemporaryLock } from "../hooks/useTemporaryLock";
import { esApiError } from "../utils";

export interface UsuarioModerable {
  id: number;
  nombre: string;
  fotoPerfil: string | null;
  rolId?: number;
  estado?: string;
}

interface AccountModerationCardProps {
  usuario: UsuarioModerable;
  compact?: boolean;
  onEstadoChange?: (estado: "activo" | "suspendido") => void;
}

export function AccountModerationCard({
  usuario,
  compact = false,
  onEstadoChange,
}: AccountModerationCardProps) {
  const { token } = useAuth();
  const { mostrarToast } = useToast();
  const [estado, setEstado] = useState(usuario.estado ?? "desconocido");
  const [dialogo, setDialogo] = useState<"suspender" | "reactivar" | null>(null);
  const [motivo, setMotivo] = useState("");
  const [errorCampo, setErrorCampo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const { bloqueado, bloquear } = useTemporaryLock();

  useEffect(() => {
    setEstado(usuario.estado ?? "desconocido");
  }, [usuario.id, usuario.estado]);

  const puedeModerar = !usuario.rolId || usuario.rolId === 2 || usuario.rolId === 3;
  const estaSuspendido = estado === "suspendido";
  const estaActivo = estado === "activo";

  const cerrar = () => {
    if (enviando) return;
    setDialogo(null);
    setMotivo("");
    setErrorCampo("");
  };

  const manejarError = (error: unknown) => {
    if (esApiError(error) && error.status === 422) {
      const campos = erroresPorCampo(error);
      setErrorCampo(campos.motivo ?? "Revisa el motivo ingresado.");
      return;
    }
    if (esApiError(error) && error.status === 429) {
      mostrarToast("Demasiados intentos. Espera unos segundos antes de reintentar.", "warning");
      bloquear();
      return;
    }
    if (esApiError(error) && error.status === 409) {
      mostrarToast(mensajeError(error), "warning");
      setDialogo(null);
      return;
    }
    mostrarToast(mensajeError(error), "error");
  };

  const suspender = async () => {
    if (!token) return;
    const limpio = motivo.trim();
    if (limpio.length < 3) {
      setErrorCampo("El motivo debe tener al menos 3 caracteres.");
      return;
    }
    if (limpio.length > 500) {
      setErrorCampo("El motivo no puede exceder 500 caracteres.");
      return;
    }

    setEnviando(true);
    setErrorCampo("");
    try {
      await moderacionApi.suspenderUsuario(token, usuario.id, limpio);
      setEstado("suspendido");
      onEstadoChange?.("suspendido");
      mostrarToast(`La cuenta de ${usuario.nombre} fue suspendida.`, "success");
      setDialogo(null);
      setMotivo("");
    } catch (error) {
      manejarError(error);
    } finally {
      setEnviando(false);
    }
  };

  const reactivar = async () => {
    if (!token) return;
    setEnviando(true);
    try {
      await moderacionApi.reactivarUsuario(token, usuario.id);
      setEstado("activo");
      onEstadoChange?.("activo");
      mostrarToast(`La cuenta de ${usuario.nombre} fue reactivada.`, "success");
      setDialogo(null);
    } catch (error) {
      manejarError(error);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className={`mod-user-card${compact ? " mod-user-card--compact" : ""}`}>
      <div className="mod-user-card__identity">
        <Avatar nombre={usuario.nombre} fotoPerfil={usuario.fotoPerfil} size={compact ? "sm" : "md"} />
        <div className="mod-user-card__text">
          <strong>{usuario.nombre}</strong>
          <span className="mod-user-card__meta">
            Usuario #{usuario.id} · <EstadoBadge estado={estado === "desconocido" ? null : estado} />
          </span>
        </div>
      </div>

      {puedeModerar ? (
        <div className="mod-user-card__actions">
          {!estaSuspendido ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDialogo("suspender")}
              disabled={bloqueado}
            >
              Suspender cuenta
            </Button>
          ) : null}
          {estaSuspendido || (!estaActivo && estado === "desconocido") ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDialogo("reactivar")}
              disabled={bloqueado}
            >
              Reactivar
            </Button>
          ) : null}
          {estado === "desconocido" ? (
            <span className="mod-hint">La API pública no informa el estado actual.</span>
          ) : null}
        </div>
      ) : null}

      <PanelDialog
        open={dialogo === "suspender"}
        title={`Suspender la cuenta de ${usuario.nombre}`}
        description="La cuenta perderá el acceso de inmediato. Explica el motivo para dejar registro de la decisión."
        busy={enviando}
        onClose={cerrar}
        footer={
          <Button variant="danger" onClick={() => void suspender()} disabled={enviando || bloqueado}>
            {enviando ? "Suspendiendo…" : bloqueado ? "Espera un momento…" : "Suspender cuenta"}
          </Button>
        }
      >
        <div className="mod-form">
          <label className="mod-field" htmlFor={`motivo-suspension-${usuario.id}`}>
            <span className="ui-label">Motivo de la suspensión</span>
            <textarea
              id={`motivo-suspension-${usuario.id}`}
              className="mod-textarea"
              value={motivo}
              maxLength={500}
              rows={4}
              placeholder="Describe la conducta o el incumplimiento que motiva la suspensión."
              aria-invalid={errorCampo ? "true" : undefined}
              aria-describedby={errorCampo ? `motivo-error-${usuario.id}` : undefined}
              onChange={(event) => {
                setMotivo(event.target.value);
                if (errorCampo) setErrorCampo("");
              }}
            />
          </label>
          <p className="mod-hint">{motivo.trim().length}/500 caracteres · mínimo 3.</p>
          {errorCampo ? (
            <p className="ui-error" id={`motivo-error-${usuario.id}`} role="alert">
              {errorCampo}
            </p>
          ) : null}
        </div>
      </PanelDialog>

      <ConfirmDialog
        open={dialogo === "reactivar"}
        title={`Reactivar la cuenta de ${usuario.nombre}`}
        description="La cuenta podrá iniciar sesión y volver a operar en la plataforma."
        confirmLabel="Reactivar cuenta"
        loading={enviando}
        onConfirm={() => void reactivar()}
        onCancel={cerrar}
      />
    </div>
  );
}
