import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { useAuth } from "../../../context/AuthContext";
import { moderacionApi } from "../../../infrastructure/api/apiModeracion";
import type { PerfilPublicoModeracion } from "../../../infrastructure/api/apiModeracion";
import { AccountModerationCard } from "../components/AccountModerationCard";
import { Avatar } from "../components/Avatar";
import { PageHeader } from "../components/PageHeader";
import { esApiError, etiquetaRol, formatearFechaHora, mensajeError } from "../utils";

export function UsuariosPage() {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [consulta, setConsulta] = useState(() => searchParams.get("id") ?? "");
  const [perfil, setPerfil] = useState<PerfilPublicoModeracion | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState("");
  const idParam = searchParams.get("id") ?? "";

  const buscar = useCallback(
    async (valor: string) => {
      if (!token) return;
      const id = Number(valor);
      if (!Number.isInteger(id) || id <= 0) {
        setError("Ingresa un ID de usuario válido (número entero mayor que cero).");
        setPerfil(null);
        return;
      }
      setBuscando(true);
      setError("");
      try {
        setPerfil(await moderacionApi.obtenerPerfilPublico(token, id));
      } catch (reason) {
        setPerfil(null);
        setError(
          esApiError(reason) && reason.status === 404
            ? "No existe un usuario con ese ID."
            : mensajeError(reason),
        );
      } finally {
        setBuscando(false);
      }
    },
    [token],
  );

  useEffect(() => {
    if (!idParam) {
      setPerfil(null);
      setError("");
      return;
    }
    setConsulta(idParam);
    void buscar(idParam);
  }, [idParam, buscar]);

  const enviar = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const limpio = consulta.trim();
    const id = Number(limpio);
    if (!Number.isInteger(id) || id <= 0) {
      setError("Ingresa un ID de usuario válido (número entero mayor que cero).");
      setPerfil(null);
      return;
    }
    const params = new URLSearchParams(searchParams);
    params.set("id", String(id));
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="mod-page">
      <PageHeader
        eyebrow="Moderación · Usuarios"
        title="Consulta de usuarios"
        description="El backend no expone un listado global de usuarios. Busca por ID o llega a una cuenta desde un reporte o una disputa."
        actions={
          <Link className="ui-button ui-button--secondary" to="/moderacion/reportes">
            Ir a reportes
          </Link>
        }
      />

      <section className="mod-panel" aria-labelledby="buscar-usuario">
        <div className="mod-panel__head">
          <div>
            <h2 id="buscar-usuario">Buscar por ID</h2>
            <p>Consulta el perfil público y aplica suspensión o reactivación sobre la cuenta.</p>
          </div>
        </div>

        <form className="mod-user-search" onSubmit={enviar} role="search">
          <label className="mod-field" htmlFor="usuario-id">
            <span className="ui-label">ID de usuario</span>
            <input
              id="usuario-id"
              className="ui-input"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={consulta}
              placeholder="Ej. 51"
              aria-invalid={error ? "true" : undefined}
              onChange={(event) => {
                setConsulta(event.target.value);
                if (error) setError("");
              }}
            />
          </label>
          <Button type="submit" variant="primary" disabled={buscando}>
            {buscando ? "Buscando…" : "Buscar usuario"}
          </Button>
        </form>

        {error ? (
          <div className="mod-alert mod-alert--error" role="alert">
            <span>{error}</span>
          </div>
        ) : null}
      </section>

      {buscando ? (
        <div className="mod-panel mod-panel--skeleton" aria-hidden="true" />
      ) : perfil ? (
        <section className="mod-panel" aria-labelledby="usuario-encontrado">
          <div className="mod-panel__head">
            <div>
              <h2 id="usuario-encontrado">Usuario #{perfil.id}</h2>
              <p>Perfil público visible para la moderación.</p>
            </div>
          </div>

          <div className="mod-user-profile">
            <Avatar nombre={perfil.nombre} fotoPerfil={perfil.fotoPerfil} size="lg" />
            <div className="mod-user-profile__data">
              <strong>{perfil.nombre}</strong>
              <span>
                {perfil.rolNombre || etiquetaRol(perfil.rolId)} · Registro:{" "}
                {formatearFechaHora(perfil.fechaRegistro)}
              </span>
            </div>
          </div>

          <AccountModerationCard
            usuario={{
              id: perfil.id,
              nombre: perfil.nombre,
              fotoPerfil: perfil.fotoPerfil,
              rolId: perfil.rolId,
              estado: perfil.estado,
            }}
          />

          <div className="mod-alert mod-alert--warning" role="note">
            <span>
              El perfil público no informa el estado actual de la cuenta. Después de suspender o
              reactivar, el resultado se refleja aquí y queda registrado en el backend.
            </span>
          </div>
        </section>
      ) : (
        !error && (
          <section className="mod-panel" aria-labelledby="usuarios-ayuda">
            <div className="mod-panel__head">
              <div>
                <h2 id="usuarios-ayuda">¿Cómo llegar a una cuenta?</h2>
                <p>Tres rutas para revisar el estado de un usuario.</p>
              </div>
            </div>
            <ol className="mod-steps">
              <li>
                <span className="mod-steps__number" aria-hidden="true">1</span>
                <div>
                  <strong>Desde un reporte</strong>
                  <p>Abre el detalle y modera a la persona reportada sin salir del caso.</p>
                </div>
              </li>
              <li>
                <span className="mod-steps__number" aria-hidden="true">2</span>
                <div>
                  <strong>Desde una disputa</strong>
                  <p>El contrato muestra al cliente y al freelancer con sus acciones de cuenta.</p>
                </div>
              </li>
              <li>
                <span className="mod-steps__number" aria-hidden="true">3</span>
                <div>
                  <strong>Con el ID</strong>
                  <p>Usa el buscador de arriba cuando conozcas el identificador del usuario.</p>
                </div>
              </li>
            </ol>
          </section>
        )
      )}
    </div>
  );
}
