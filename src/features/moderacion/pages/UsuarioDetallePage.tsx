import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../../../components/ui/Badge";
import { Button, buttonClassName } from "../../../components/ui/Button";
import { useAuth } from "../../../context/AuthContext";
import { moderacionApi } from "../../../infrastructure/api/apiModeracion";
import type { UsuarioModeracionDetalle } from "../../../infrastructure/api/apiModeracion";
import { AccountModerationCard } from "../components/AccountModerationCard";
import { Avatar } from "../components/Avatar";
import { EstadoBadge } from "../components/EstadoBadge";
import { PageHeader } from "../components/PageHeader";
import {
  esApiError,
  etiquetaRolDesdeNombre,
  formatearFecha,
  formatearFechaHora,
  formatearNumero,
  mensajeError,
} from "../utils";

export function UsuarioDetallePage() {
  const { id } = useParams();
  const usuarioId = Number(id);
  const { token } = useAuth();

  const [usuario, setUsuario] = useState<UsuarioModeracionDetalle | null>(null);
  const [estadoCuenta, setEstadoCuenta] = useState<string | undefined>(undefined);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);

  const cargar = useCallback(async () => {
    if (!token || !Number.isInteger(usuarioId) || usuarioId <= 0) {
      setError("El identificador del usuario no es válido.");
      setCargando(false);
      return;
    }
    setCargando(true);
    setError("");
    try {
      const datos = await moderacionApi.obtenerUsuario(token, usuarioId);
      setUsuario(datos);
      setEstadoCuenta(datos.estado);
    } catch (reason) {
      if (esApiError(reason) && reason.status === 404) {
        setError("No encontramos ese usuario o el backend aún no expone la ficha de moderación.");
      } else {
        setError(mensajeError(reason));
      }
    } finally {
      setCargando(false);
    }
  }, [token, usuarioId]);

  useEffect(() => {
    void cargar();
  }, [cargar, recarga]);

  if (cargando && !usuario) {
    return (
      <div className="mod-page">
        <PageHeader
          eyebrow="Moderación · Usuarios"
          title="Cargando usuario…"
          backTo="/moderacion/usuarios"
        />
        <div className="mod-panel mod-panel--skeleton" aria-hidden="true" />
      </div>
    );
  }

  if (error && !usuario) {
    return (
      <div className="mod-page">
        <PageHeader
          eyebrow="Moderación · Usuarios"
          title="No pudimos cargar el usuario"
          description={error}
          backTo="/moderacion/usuarios"
          backLabel="Volver a usuarios"
        />
        <div className="mod-alert mod-alert--error" role="alert">
          <span>{error}</span>
          <Button variant="secondary" size="sm" onClick={() => setRecarga((valor) => valor + 1)}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (!usuario) return null;

  const suspension = usuario.suspension;
  const suspendido = estadoCuenta === "suspendido";
  const sanciones = usuario.sanciones ?? [];

  return (
    <div className="mod-page">
      <PageHeader
        eyebrow={`Moderación · Usuario #${usuario.id}`}
        title={usuario.nombre}
        description="Ficha de la cuenta, estado de acceso y registro de sanciones."
        backTo="/moderacion/usuarios"
        backLabel="Volver a usuarios"
        actions={<EstadoBadge estado={estadoCuenta ?? usuario.estado} />}
      />

      <div className="mod-detail-grid">
        <div className="mod-detail-main">
          <section className="mod-panel" aria-labelledby="usuario-perfil">
            <div className="mod-panel__head">
              <div>
                <h2 id="usuario-perfil">Perfil</h2>
                <p>Datos de contacto y actividad en la plataforma.</p>
              </div>
              <Badge tone={suspendido ? "danger" : "neutral"}>
                {etiquetaRolDesdeNombre(usuario.rol, usuario.rolId)}
              </Badge>
            </div>

            <div className="mod-user-profile">
              <Avatar nombre={usuario.nombre} fotoPerfil={usuario.fotoPerfil} size="lg" />
              <div className="mod-user-profile__data">
                <strong>{usuario.nombre}</strong>
                <span>{usuario.email}</span>
                <span>
                  {etiquetaRolDesdeNombre(usuario.rol, usuario.rolId)} · Registro:{" "}
                  {formatearFecha(usuario.fechaRegistro)}
                </span>
              </div>
            </div>

            <dl className="mod-info">
              <div>
                <dt>Teléfono</dt>
                <dd>{usuario.telefono || "No registrado"}</dd>
              </div>
              <div>
                <dt>Cédula</dt>
                <dd>{usuario.cedula || "No registrada"}</dd>
              </div>
              <div>
                <dt>Contratos</dt>
                <dd>{formatearNumero(usuario.totalContratos ?? 0)}</dd>
              </div>
              <div>
                <dt>Publicaciones</dt>
                <dd>{formatearNumero(usuario.totalPublicaciones ?? 0)}</dd>
              </div>
              <div>
                <dt>Calificación promedio</dt>
                <dd>
                  {typeof usuario.calificacionPromedio === "number"
                    ? usuario.calificacionPromedio.toFixed(1)
                    : "Sin calificaciones"}
                </dd>
              </div>
              <div>
                <dt>Estado</dt>
                <dd>
                  <EstadoBadge estado={estadoCuenta ?? usuario.estado} />
                </dd>
              </div>
            </dl>
          </section>

          <section className="mod-panel" aria-labelledby="usuario-sanciones">
            <div className="mod-panel__head">
              <div>
                <h2 id="usuario-sanciones">Historial de sanciones</h2>
                <p>Decisiones de moderación aplicadas sobre esta cuenta.</p>
              </div>
              <Badge tone={sanciones.length ? "warning" : "neutral"}>
                {sanciones.length} {sanciones.length === 1 ? "registro" : "registros"}
              </Badge>
            </div>

            {sanciones.length === 0 ? (
              <p className="mod-muted">
                Esta cuenta no tiene sanciones registradas.
              </p>
            ) : (
              <ul className="mod-timeline">
                {sanciones.map((sancion) => (
                  <li key={sancion.id}>
                    <span>
                      <strong>{sancion.tipo}</strong>
                      <small>
                        {formatearFechaHora(sancion.fecha)}
                        {sancion.moderador ? ` · ${sancion.moderador.nombre}` : ""}
                      </small>
                    </span>
                    <p>{sancion.motivo}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="mod-detail-aside">
          <section className="mod-panel" aria-labelledby="usuario-acceso">
            <div className="mod-panel__head">
              <div>
                <h2 id="usuario-acceso">Acceso a la cuenta</h2>
                <p>Suspende o reactiva el acceso de este usuario.</p>
              </div>
            </div>

            <AccountModerationCard
              usuario={{
                id: usuario.id,
                nombre: usuario.nombre,
                fotoPerfil: usuario.fotoPerfil,
                rolId: usuario.rolId,
                estado: estadoCuenta ?? usuario.estado,
              }}
              onEstadoChange={(nuevoEstado) => {
                setEstadoCuenta(nuevoEstado);
                setRecarga((valor) => valor + 1);
              }}
            />

            {suspendido ? (
              <div className="mod-resolution mod-resolution--danger">
                <p className="mod-eyebrow">Suspensión activa</p>
                <p>{suspension?.motivo ?? "Sin motivo registrado."}</p>
                <span className="mod-muted">
                  {suspension?.fecha
                    ? `${formatearFechaHora(suspension.fecha)}${
                        suspension.por ? ` · ${suspension.por}` : ""
                      }`
                    : "Sin fecha registrada"}
                </span>
              </div>
            ) : (
              <p className="mod-muted">
                La cuenta puede iniciar sesión y operar con normalidad.
              </p>
            )}
          </section>

          <Link
            className={buttonClassName({ variant: "ghost", size: "sm" })}
            to="/moderacion/usuarios"
          >
            ← Volver al listado
          </Link>
        </aside>
      </div>
    </div>
  );
}
