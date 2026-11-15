import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../../../components/ui/Badge";
import { Button, buttonClassName } from "../../../components/ui/Button";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { useAuth } from "../../../context/AuthContext";
import { moderacionApi } from "../../../infrastructure/api/apiModeracion";
import type {
  PublicacionModerada,
  TipoPublicacion,
} from "../../../infrastructure/api/apiModeracion";
import { useModeracionPanel } from "../ModeracionContext";
import { AccountModerationCard } from "../components/AccountModerationCard";
import { Avatar } from "../components/Avatar";
import { EstadoBadge } from "../components/EstadoBadge";
import { PageHeader } from "../components/PageHeader";
import { PanelDialog } from "../components/PanelDialog";
import { useToast } from "../components/Toast";
import { useTemporaryLock } from "../hooks/useTemporaryLock";
import {
  erroresPorCampo,
  esApiError,
  formatearFecha,
  formatearFechaHora,
  formatearMoneda,
  mensajeError,
} from "../utils";

const MOTIVO_MIN = 5;
const MOTIVO_MAX = 300;

function esTipoValido(valor: string | undefined): valor is TipoPublicacion {
  return valor === "servicio" || valor === "proyecto";
}

export function PublicacionDetallePage() {
  const { tipo, id } = useParams();
  const publicacionId = Number(id);
  const { token } = useAuth();
  const { mostrarToast } = useToast();
  const { recargarContadores } = useModeracionPanel();
  const { bloqueado, bloquear } = useTemporaryLock();

  const [publicacion, setPublicacion] = useState<PublicacionModerada | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);

  const [retiroAbierto, setRetiroAbierto] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [reactivacionAbierta, setReactivacionAbierta] = useState(false);

  const cargar = useCallback(async () => {
    if (!token || !esTipoValido(tipo) || !Number.isInteger(publicacionId) || publicacionId <= 0) {
      setError("La publicación solicitada no es válida.");
      setCargando(false);
      return;
    }
    setCargando(true);
    setError("");
    try {
      setPublicacion(await moderacionApi.obtenerPublicacion(token, tipo, publicacionId));
    } catch (reason) {
      if (esApiError(reason) && reason.status === 404) {
        setError("No encontramos la publicación. Puede que haya sido eliminada o que el backend aún no tenga este módulo.");
      } else {
        setError(mensajeError(reason));
      }
    } finally {
      setCargando(false);
    }
  }, [token, tipo, publicacionId]);

  useEffect(() => {
    void cargar();
  }, [cargar, recarga]);

  const manejarError = (reason: unknown, alCerrar: () => void) => {
    if (esApiError(reason) && reason.status === 422) {
      const campos = erroresPorCampo(reason);
      setErrores({ motivo: campos.motivo ?? "Revisa el motivo ingresado." });
      return;
    }
    if (esApiError(reason) && reason.status === 409) {
      mostrarToast(mensajeError(reason), "warning");
      alCerrar();
      setRecarga((valor) => valor + 1);
      return;
    }
    if (esApiError(reason) && reason.status === 429) {
      mostrarToast("Demasiados intentos. Espera unos segundos antes de reintentar.", "warning");
      bloquear();
      return;
    }
    mostrarToast(mensajeError(reason), "error");
  };

  const abrirRetiro = () => {
    setMotivo("");
    setErrores({});
    setRetiroAbierto(true);
  };

  const cerrarRetiro = () => {
    if (enviando) return;
    setRetiroAbierto(false);
  };

  const retirar = async () => {
    if (!token || !publicacion || !esTipoValido(tipo)) return;
    const limpio = motivo.trim();
    if (limpio.length < MOTIVO_MIN) {
      setErrores({ motivo: `El motivo debe tener al menos ${MOTIVO_MIN} caracteres.` });
      return;
    }
    if (limpio.length > MOTIVO_MAX) {
      setErrores({ motivo: `El motivo no puede exceder ${MOTIVO_MAX} caracteres.` });
      return;
    }

    setEnviando(true);
    setErrores({});
    try {
      await moderacionApi.retirarPublicacion(token, tipo, publicacion.id, limpio);
      mostrarToast("La publicación fue retirada y su autor recibió una notificación.", "success");
      setRetiroAbierto(false);
      setRecarga((valor) => valor + 1);
      void recargarContadores();
    } catch (reason) {
      manejarError(reason, () => setRetiroAbierto(false));
    } finally {
      setEnviando(false);
    }
  };

  const reactivar = async () => {
    if (!token || !publicacion || !esTipoValido(tipo)) return;
    setEnviando(true);
    try {
      await moderacionApi.reactivarPublicacion(token, tipo, publicacion.id);
      mostrarToast("La publicación volvió a estar visible.", "success");
      setReactivacionAbierta(false);
      setRecarga((valor) => valor + 1);
      void recargarContadores();
    } catch (reason) {
      manejarError(reason, () => setReactivacionAbierta(false));
    } finally {
      setEnviando(false);
    }
  };

  if (cargando && !publicacion) {
    return (
      <div className="mod-page">
        <PageHeader
          eyebrow="Moderación · Publicaciones"
          title="Cargando publicación…"
          backTo={`/moderacion/publicaciones${esTipoValido(tipo) ? `?tipo=${tipo}` : ""}`}
        />
        <div className="mod-panel mod-panel--skeleton" aria-hidden="true" />
      </div>
    );
  }

  if (error && !publicacion) {
    return (
      <div className="mod-page">
        <PageHeader
          eyebrow="Moderación · Publicaciones"
          title="No pudimos cargar la publicación"
          description={error}
          backTo={`/moderacion/publicaciones${esTipoValido(tipo) ? `?tipo=${tipo}` : ""}`}
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

  if (!publicacion) return null;

  const retirada = Boolean(publicacion.moderacion.retirada);
  const contratos = publicacion.contratosActivos ?? [];
  const historial = publicacion.historial ?? [];

  return (
    <div className="mod-page">
      <PageHeader
        eyebrow={`Moderación · ${publicacion.tipo === "servicio" ? "Servicio" : "Proyecto"} #${publicacion.id}`}
        title={publicacion.titulo}
        description="Consulta el contenido, el autor y los contratos asociados antes de tomar una decisión."
        backTo={`/moderacion/publicaciones?tipo=${publicacion.tipo}`}
        backLabel="Volver a publicaciones"
        actions={
          <div className="mod-row-actions">
            {retirada ? (
              <Button
                variant="primary"
                onClick={() => setReactivacionAbierta(true)}
                disabled={enviando || bloqueado}
              >
                Reactivar publicación
              </Button>
            ) : (
              <Button variant="danger" onClick={abrirRetiro} disabled={enviando || bloqueado}>
                Retirar publicación
              </Button>
            )}
          </div>
        }
      />

      <div className="mod-detail-grid">
        <div className="mod-detail-main">
          <section className="mod-panel" aria-labelledby="publicacion-detalle">
            <div className="mod-panel__head">
              <div>
                <h2 id="publicacion-detalle">Detalle de la publicación</h2>
                <p>Contenido publicado y estado actual en el marketplace.</p>
              </div>
              <span className="mod-row-actions">
                <EstadoBadge estado={publicacion.estado} />
                {retirada ? <Badge tone="danger">Retirada por moderación</Badge> : null}
              </span>
            </div>

            <dl className="mod-info">
              <div>
                <dt>Tipo</dt>
                <dd>{publicacion.tipo === "servicio" ? "Servicio de freelancer" : "Proyecto de cliente"}</dd>
              </div>
              <div>
                <dt>Categoría</dt>
                <dd>{publicacion.categoria ?? "Sin categoría"}</dd>
              </div>
              <div>
                <dt>{publicacion.tipo === "servicio" ? "Precio" : "Presupuesto"}</dt>
                <dd className="mod-amount">{formatearMoneda(publicacion.precio)}</dd>
              </div>
              <div>
                <dt>Publicada</dt>
                <dd>{formatearFecha(publicacion.fechaPublicacion)}</dd>
              </div>
              <div className="mod-info__wide">
                <dt>Descripción</dt>
                <dd className="mod-long-text">
                  {publicacion.descripcion || "Sin descripción registrada."}
                </dd>
              </div>
            </dl>
          </section>

          <section className="mod-panel" aria-labelledby="publicacion-contratos">
            <div className="mod-panel__head">
              <div>
                <h2 id="publicacion-contratos">Contratos asociados</h2>
                <p>Contratos que siguen activos o pendientes de pago.</p>
              </div>
              <Badge tone={contratos.length ? "warning" : "neutral"}>
                {contratos.length} {contratos.length === 1 ? "contrato" : "contratos"}
              </Badge>
            </div>

            {contratos.length === 0 ? (
              <p className="mod-muted">
                Esta publicación no tiene contratos activos. Retirarla solo afecta su
                visibilidad en el catálogo.
              </p>
            ) : (
              <ul className="mod-contract-list">
                {contratos.map((contrato) => (
                  <li key={contrato.id}>
                    <span>
                      <strong>Contrato #{contrato.id}</strong>
                      <small>Estado: {contrato.estado}</small>
                    </span>
                    <span className="mod-amount">{formatearMoneda(contrato.montoAcordado)}</span>
                  </li>
                ))}
              </ul>
            )}

            {contratos.length > 0 ? (
              <div className="mod-alert mod-alert--warning" role="note">
                <span>
                  Al retirar esta publicación se {contratos.length === 1 ? "cancelará el contrato activo" : `cancelarán los ${contratos.length} contratos activos`} y
                  se reembolsará el pago retenido a {contratos.length === 1 ? "el cliente" : "los clientes"}.
                </span>
              </div>
            ) : null}
          </section>
        </div>

        <aside className="mod-detail-aside">
          <section className="mod-panel" aria-labelledby="publicacion-autor">
            <div className="mod-panel__head">
              <div>
                <h2 id="publicacion-autor">Autor</h2>
                <p>Cuenta que publicó este contenido.</p>
              </div>
            </div>

            <div className="mod-user-profile">
              <Avatar
                nombre={publicacion.autor.nombre}
                fotoPerfil={publicacion.autor.fotoPerfil}
                size="lg"
              />
              <div className="mod-user-profile__data">
                <strong>{publicacion.autor.nombre}</strong>
                <span>Usuario #{publicacion.autor.id}</span>
                <Link className="mod-link" to={`/moderacion/usuarios/${publicacion.autor.id}`}>
                  Ver ficha del usuario
                </Link>
              </div>
            </div>

            <AccountModerationCard
              usuario={{
                id: publicacion.autor.id,
                nombre: publicacion.autor.nombre,
                fotoPerfil: publicacion.autor.fotoPerfil,
                estado: publicacion.autor.estado ?? undefined,
              }}
              compact
            />
          </section>

          <section className="mod-panel" aria-labelledby="publicacion-moderacion">
            <div className="mod-panel__head">
              <div>
                <h2 id="publicacion-moderacion">Moderación</h2>
                <p>Última decisión registrada sobre la publicación.</p>
              </div>
            </div>

            {retirada ? (
              <div className="mod-resolution mod-resolution--danger">
                <p className="mod-eyebrow">Publicación retirada</p>
                <p>{publicacion.moderacion.motivo ?? "Sin motivo registrado."}</p>
                <span className="mod-muted">
                  {publicacion.moderacion.fecha
                    ? `${formatearFechaHora(publicacion.moderacion.fecha)}${
                        publicacion.moderacion.moderador
                          ? ` · ${publicacion.moderacion.moderador.nombre}`
                          : ""
                      }`
                    : "Sin fecha registrada"}
                </span>
              </div>
            ) : (
              <p className="mod-muted">
                La publicación no está retirada. Si incumple las normas, retírala con un
                motivo claro para dejar registro.
              </p>
            )}

            {historial.length > 0 ? (
              <ul className="mod-timeline">
                {historial.map((registro, indice) => (
                  <li key={registro.id ?? `${registro.fecha}-${indice}`}>
                    <span>
                      <strong>{registro.retirada ? "Retirada" : "Reactivada"}</strong>
                      <small>
                        {formatearFechaHora(registro.fecha)}
                        {registro.moderador ? ` · ${registro.moderador.nombre}` : ""}
                      </small>
                    </span>
                    {registro.motivo ? <p>{registro.motivo}</p> : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          <Link
            className={buttonClassName({ variant: "ghost", size: "sm" })}
            to={`/moderacion/publicaciones?tipo=${publicacion.tipo}`}
          >
            ← Volver al listado
          </Link>
        </aside>
      </div>

      <PanelDialog
        open={retiroAbierto}
        title="Retirar publicación"
        description="La publicación dejará de mostrarse en el catálogo. Explica el motivo para dejar registro de la decisión."
        busy={enviando}
        onClose={cerrarRetiro}
        footer={
          <Button
            type="submit"
            form="form-retirar-publicacion"
            variant="danger"
            disabled={enviando || bloqueado}
          >
            {enviando ? "Retirando…" : bloqueado ? "Espera un momento…" : "Retirar publicación"}
          </Button>
        }
      >
        <form
          id="form-retirar-publicacion"
          className="mod-form"
          onSubmit={(event) => {
            event.preventDefault();
            void retirar();
          }}
        >
          {contratos.length > 0 ? (
            <div className="mod-alert mod-alert--warning" role="note">
              <span>
                Se cancelarán {contratos.length}{" "}
                {contratos.length === 1 ? "contrato activo" : "contratos activos"} y se
                reembolsará el pago retenido.
              </span>
            </div>
          ) : null}

          <label className="mod-field" htmlFor="motivo-retiro">
            <span className="ui-label">Motivo del retiro</span>
            <textarea
              id="motivo-retiro"
              className="mod-textarea"
              rows={4}
              maxLength={MOTIVO_MAX}
              value={motivo}
              placeholder="Describe qué norma incumple o por qué se retira la publicación."
              aria-invalid={errores.motivo ? "true" : undefined}
              aria-describedby={errores.motivo ? "motivo-retiro-error" : "motivo-retiro-hint"}
              onChange={(event) => {
                setMotivo(event.target.value);
                if (errores.motivo) {
                  setErrores((actuales) => {
                    const siguiente = { ...actuales };
                    delete siguiente.motivo;
                    return siguiente;
                  });
                }
              }}
            />
          </label>
          <p className="mod-hint" id="motivo-retiro-hint">
            Entre {MOTIVO_MIN} y {MOTIVO_MAX} caracteres. {motivo.trim().length}/{MOTIVO_MAX}.
          </p>
          {errores.motivo ? (
            <p className="ui-error" id="motivo-retiro-error" role="alert">
              {errores.motivo}
            </p>
          ) : null}
        </form>
      </PanelDialog>

      <ConfirmDialog
        open={reactivacionAbierta}
        title="Reactivar publicación"
        description="La publicación volverá a mostrarse en el catálogo y el autor recibirá una notificación. Los contratos cancelados no se restauran."
        confirmLabel="Reactivar publicación"
        loading={enviando}
        onConfirm={() => void reactivar()}
        onCancel={() => {
          if (!enviando) setReactivacionAbierta(false);
        }}
      />
    </div>
  );
}
