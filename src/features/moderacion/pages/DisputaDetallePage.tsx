import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, buttonClassName } from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Select";
import { useAuth } from "../../../context/AuthContext";
import { moderacionApi } from "../../../infrastructure/api/apiModeracion";
import type {
  DisputaDetalle,
  ResultadoDisputa,
} from "../../../infrastructure/api/apiModeracion";
import { AccountModerationCard } from "../components/AccountModerationCard";
import { Avatar } from "../components/Avatar";
import { EstadoBadge } from "../components/EstadoBadge";
import { PageHeader } from "../components/PageHeader";
import { PanelDialog } from "../components/PanelDialog";
import { useToast } from "../components/Toast";
import { useTemporaryLock } from "../hooks/useTemporaryLock";
import { useModeracionPanel } from "../ModeracionContext";
import {
  esApiError,
  erroresPorCampo,
  etiquetaEstado,
  formatearFechaHora,
  formatearMoneda,
  mensajeError,
} from "../utils";

export function DisputaDetallePage() {
  const { id } = useParams();
  const disputaId = Number(id);
  const { token } = useAuth();
  const { mostrarToast } = useToast();
  const { recargarContadores } = useModeracionPanel();
  const [disputa, setDisputa] = useState<DisputaDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);
  const [marcando, setMarcando] = useState(false);

  const [resolverAbierto, setResolverAbierto] = useState(false);
  const [estadoResolucion, setEstadoResolucion] = useState<"resuelta" | "rechazada">("resuelta");
  const [resultado, setResultado] = useState<ResultadoDisputa | "">("");
  const [resolucion, setResolucion] = useState("");
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const { bloqueado, bloquear } = useTemporaryLock();

  const cargar = useCallback(async () => {
    if (!token || !Number.isInteger(disputaId) || disputaId <= 0) {
      setError("El identificador de la disputa no es válido.");
      setCargando(false);
      return;
    }
    setCargando(true);
    setError("");
    try {
      setDisputa(await moderacionApi.obtenerDisputa(token, disputaId));
    } catch (reason) {
      setError(mensajeError(reason));
    } finally {
      setCargando(false);
    }
  }, [token, disputaId]);

  useEffect(() => {
    void cargar();
  }, [cargar, recarga]);

  const marcarEnRevision = async () => {
    if (!token || !disputa) return;
    setMarcando(true);
    try {
      const actualizada = await moderacionApi.marcarDisputaEnRevision(token, disputa.id);
      setDisputa((actual) => (actual ? { ...actual, ...actualizada } : actual));
      mostrarToast("La disputa quedó marcada en revisión.", "success");
      void recargarContadores();
    } catch (reason) {
      if (esApiError(reason) && reason.status === 409) {
        mostrarToast(mensajeError(reason), "warning");
        setRecarga((valor) => valor + 1);
      } else if (esApiError(reason) && reason.status === 429) {
        mostrarToast("Demasiados intentos. Espera unos segundos antes de reintentar.", "warning");
        bloquear();
      } else {
        mostrarToast(mensajeError(reason), "error");
      }
    } finally {
      setMarcando(false);
    }
  };

  const abrirResolver = () => {
    setEstadoResolucion("resuelta");
    setResultado("");
    setResolucion("");
    setErrores({});
    setResolverAbierto(true);
  };

  const cerrarResolver = () => {
    if (enviando) return;
    setResolverAbierto(false);
  };

  const enviarResolucion = async () => {
    if (!token || !disputa) return;
    const limpio = resolucion.trim();
    const nuevosErrores: Record<string, string> = {};
    if (estadoResolucion === "resuelta" && !resultado) {
      nuevosErrores.resultado =
        "Debes elegir si se reembolsa al cliente o se libera el pago al freelancer.";
    }
    if (limpio.length < 3) {
      nuevosErrores.resolucion = "La resolución debe tener al menos 3 caracteres.";
    } else if (limpio.length > 1000) {
      nuevosErrores.resolucion = "La resolución no puede exceder 1000 caracteres.";
    }
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setEnviando(true);
    setErrores({});
    try {
      const actualizada = await moderacionApi.resolverDisputa(token, disputa.id, {
        estado: estadoResolucion,
        ...(estadoResolucion === "resuelta" && resultado ? { resultado } : {}),
        resolucion: limpio,
      });
      setDisputa((actual) => (actual ? { ...actual, ...actualizada } : actual));
      setResolverAbierto(false);
      mostrarToast("La disputa fue resuelta y el resultado quedó registrado.", "success");
      void recargarContadores();
    } catch (reason) {
      if (esApiError(reason) && reason.status === 422) {
        setErrores(erroresPorCampo(reason));
      } else if (esApiError(reason) && reason.status === 409) {
        mostrarToast(mensajeError(reason), "warning");
        setResolverAbierto(false);
        setRecarga((valor) => valor + 1);
      } else if (esApiError(reason) && reason.status === 429) {
        mostrarToast("Demasiados intentos. Espera unos segundos antes de reintentar.", "warning");
        bloquear();
      } else {
        mostrarToast(mensajeError(reason), "error");
      }
    } finally {
      setEnviando(false);
    }
  };

  if (cargando && !disputa) {
    return (
      <div className="mod-page">
        <PageHeader eyebrow="Moderación · Disputas" title="Cargando disputa…" backTo="/moderacion/disputas" />
        <div className="mod-panel mod-panel--skeleton" aria-hidden="true" />
      </div>
    );
  }

  if (error && !disputa) {
    return (
      <div className="mod-page">
        <PageHeader
          eyebrow="Moderación · Disputas"
          title="No pudimos cargar la disputa"
          description={error}
          backTo="/moderacion/disputas"
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

  if (!disputa) return null;

  const contrato = disputa.contrato;
  const puedeMarcarRevision = disputa.estado === "abierta";
  const puedeResolver = disputa.estado === "abierta" || disputa.estado === "en_revision";
  const evidenciaSegura =
    disputa.evidenciaUrl && /^https?:\/\//i.test(disputa.evidenciaUrl)
      ? disputa.evidenciaUrl
      : null;

  return (
    <div className="mod-page">
      <PageHeader
        eyebrow={`Moderación · Disputa #${disputa.id}`}
        title={disputa.motivo}
        description={`Contrato #${disputa.contratoId} · abierta el ${formatearFechaHora(disputa.fechaApertura)}`}
        backTo="/moderacion/disputas"
        backLabel="Volver a disputas"
        actions={
          puedeResolver ? (
            <>
              {puedeMarcarRevision ? (
                <Button
                  variant="secondary"
                  onClick={() => void marcarEnRevision()}
                  disabled={marcando || bloqueado}
                >
                  {marcando ? "Marcando…" : "Marcar en revisión"}
                </Button>
              ) : null}
              <Button variant="primary" onClick={abrirResolver} disabled={bloqueado}>
                Resolver disputa
              </Button>
            </>
          ) : (
            <EstadoBadge estado={disputa.estado} />
          )
        }
      />

      <div className="mod-detail-grid">
        <div className="mod-detail-main">
          <section className="mod-panel" aria-labelledby="disputa-detalle">
            <div className="mod-panel__head">
              <div>
                <h2 id="disputa-detalle">Conflicto reportado</h2>
                <p>Motivo, descripción y evidencia aportada por la parte que abrió la disputa.</p>
              </div>
              <EstadoBadge estado={disputa.estado} />
            </div>

            <dl className="mod-info">
              <div>
                <dt>Abierta por</dt>
                <dd>Usuario #{disputa.abiertaPorId}</dd>
              </div>
              <div>
                <dt>Última actualización</dt>
                <dd>{formatearFechaHora(disputa.fechaResolucion ?? disputa.fechaApertura)}</dd>
              </div>
              <div className="mod-info__wide">
                <dt>Descripción</dt>
                <dd>{disputa.descripcion || "Sin descripción adicional."}</dd>
              </div>
              <div className="mod-info__wide">
                <dt>Evidencia</dt>
                <dd>
                  {evidenciaSegura ? (
                    <a href={evidenciaSegura} target="_blank" rel="noreferrer noopener">
                      Abrir evidencia en una pestaña nueva ↗
                    </a>
                  ) : (
                    <span className="mod-muted">Sin evidencia adjunta.</span>
                  )}
                </dd>
              </div>
            </dl>

            {disputa.resolucion ? (
              <div className="mod-resolution" role="note">
                <p className="mod-eyebrow">Resolución registrada</p>
                <p>{disputa.resolucion}</p>
                <span className="mod-muted">
                  {disputa.fechaResolucion
                    ? `Resuelta el ${formatearFechaHora(disputa.fechaResolucion)}`
                    : "Fecha de resolución no disponible"}
                </span>
              </div>
            ) : null}
          </section>

          <section className="mod-panel" aria-labelledby="disputa-contrato">
            <div className="mod-panel__head">
              <div>
                <h2 id="disputa-contrato">Contrato asociado</h2>
                <p>Datos económicos y partes vinculadas al acuerdo.</p>
              </div>
              {contrato ? <EstadoBadge estado={contrato.estado} /> : null}
            </div>

            {contrato ? (
              <>
                <dl className="mod-info">
                  <div>
                    <dt>Contrato</dt>
                    <dd>#{contrato.id}</dd>
                  </div>
                  <div>
                    <dt>Monto acordado</dt>
                    <dd className="mod-amount">{formatearMoneda(contrato.montoAcordado)}</dd>
                  </div>
                  <div>
                    <dt>Contexto</dt>
                    <dd>
                      {contrato.contexto.titulo ?? "Sin título"}
                      {contrato.contexto.tipo !== "ninguno" ? (
                        <span className="mod-muted"> · {contrato.contexto.tipo}</span>
                      ) : null}
                    </dd>
                  </div>
                  <div>
                    <dt>Estado del contrato</dt>
                    <dd>{etiquetaEstado(contrato.estado)}</dd>
                  </div>
                  <div>
                    <dt>Inicio</dt>
                    <dd>{formatearFechaHora(contrato.fechaInicio)}</dd>
                  </div>
                  <div>
                    <dt>Fin</dt>
                    <dd>{formatearFechaHora(contrato.fechaFin)}</dd>
                  </div>
                </dl>

                <div className="mod-contract-parties">
                  <div className="mod-person">
                    <span className="mod-eyebrow">Cliente</span>
                    <div className="mod-person__row">
                      <Avatar nombre={contrato.cliente.nombre} fotoPerfil={contrato.cliente.fotoPerfil} />
                      <div>
                        <strong>{contrato.cliente.nombre}</strong>
                        <small>Usuario #{contrato.cliente.id}</small>
                      </div>
                    </div>
                    <AccountModerationCard usuario={{ ...contrato.cliente, rolId: 3 }} compact />
                  </div>

                  <div className="mod-person">
                    <span className="mod-eyebrow">Freelancer</span>
                    <div className="mod-person__row">
                      <Avatar nombre={contrato.freelancer.nombre} fotoPerfil={contrato.freelancer.fotoPerfil} />
                      <div>
                        <strong>{contrato.freelancer.nombre}</strong>
                        <small>Usuario #{contrato.freelancer.id}</small>
                      </div>
                    </div>
                    <AccountModerationCard usuario={{ ...contrato.freelancer, rolId: 2 }} compact />
                  </div>
                </div>
              </>
            ) : (
              <p className="mod-muted">El contrato asociado ya no está disponible.</p>
            )}
          </section>
        </div>

        <aside className="mod-detail-aside">
          <section className="mod-panel" aria-labelledby="disputa-acciones">
            <div className="mod-panel__head">
              <div>
                <h2 id="disputa-acciones">Decisión</h2>
                <p>Antes de resolver, verifica el monto y el estado del contrato.</p>
              </div>
            </div>

            <div className="mod-summary-box">
              <span className="mod-summary-box__label">Monto en disputa</span>
              <strong>{formatearMoneda(contrato?.montoAcordado ?? null)}</strong>
              <span className="mod-muted">
                El resultado económico lo aplica el backend sobre el pago retenido del contrato.
              </span>
            </div>

            {puedeResolver ? (
              <div className="mod-stack">
                {puedeMarcarRevision ? (
                  <Button
                    variant="secondary"
                    block
                    onClick={() => void marcarEnRevision()}
                    disabled={marcando || bloqueado}
                  >
                    {marcando ? "Marcando en revisión…" : "Marcar en revisión"}
                  </Button>
                ) : null}
                <Button variant="primary" block onClick={abrirResolver} disabled={bloqueado}>
                  Resolver con resultado económico
                </Button>
              </div>
            ) : (
              <p className="mod-muted">Esta disputa ya tiene una decisión registrada.</p>
            )}
          </section>

          <Link className={buttonClassName({ variant: "ghost", size: "sm" })} to="/moderacion/disputas">
            ← Volver al listado
          </Link>
        </aside>
      </div>

      <PanelDialog
        open={resolverAbierto}
        title="Resolver disputa"
        description="La decisión se notifica a ambas partes. Si la disputa se resuelve, el resultado económico es obligatorio."
        busy={enviando}
        onClose={cerrarResolver}
        footer={
          <Button
            type="submit"
            form="form-resolver-disputa"
            variant="primary"
            disabled={enviando || bloqueado}
          >
            {enviando ? "Guardando…" : bloqueado ? "Espera un momento…" : "Confirmar decisión"}
          </Button>
        }
      >
        <form
          id="form-resolver-disputa"
          className="mod-form"
          onSubmit={(event) => {
            event.preventDefault();
            void enviarResolucion();
          }}
        >
          <Select
            label="Decisión"
            options={[
              { value: "resuelta", label: "Resuelta (a favor de una de las partes)" },
              { value: "rechazada", label: "Rechazada (sin mérito suficiente)" },
            ]}
            value={estadoResolucion}
            onChange={(event) => {
              const valor = event.target.value === "rechazada" ? "rechazada" : "resuelta";
              setEstadoResolucion(valor);
              if (valor === "rechazada") setResultado("");
            }}
          />

          {estadoResolucion === "resuelta" ? (
            <div className="mod-field">
              <Select
                label="Resultado económico"
                placeholder="Selecciona un resultado"
                options={[
                  { value: "reembolso_cliente", label: "Reembolsar al cliente" },
                  { value: "liberar_freelancer", label: "Liberar el pago al freelancer" },
                ]}
                value={resultado}
                aria-required="true"
                aria-invalid={errores.resultado ? "true" : undefined}
                onChange={(event) => {
                  setResultado(event.target.value as ResultadoDisputa | "");
                  if (errores.resultado) {
                    setErrores((actuales) => {
                      const siguiente = { ...actuales };
                      delete siguiente.resultado;
                      return siguiente;
                    });
                  }
                }}
              />
              {errores.resultado ? (
                <p className="ui-error" role="alert">
                  {errores.resultado}
                </p>
              ) : null}

              <div className="mod-summary-box mod-summary-box--inline" aria-live="polite">
                <span className="mod-summary-box__label">Resumen económico</span>
                {resultado === "reembolso_cliente" ? (
                  <p>
                    Se reembolsará al cliente el pago retenido correspondiente al contrato por{" "}
                    <strong>{formatearMoneda(contrato?.montoAcordado ?? null)}</strong>.
                  </p>
                ) : resultado === "liberar_freelancer" ? (
                  <p>
                    Se liberará el pago retenido al freelancer. El monto del contrato es{" "}
                    <strong>{formatearMoneda(contrato?.montoAcordado ?? null)}</strong> y la
                    plataforma aplicará la comisión configurada.
                  </p>
                ) : (
                  <p className="mod-muted">Elige a quién se asigna el dinero antes de confirmar.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="mod-alert mod-alert--warning" role="note">
              <span>
                Una disputa rechazada no registra resultado económico. Explica en la resolución por
                qué no hay mérito suficiente.
              </span>
            </div>
          )}

          <label className="mod-field" htmlFor="resolucion-disputa">
            <span className="ui-label">Resolución</span>
            <textarea
              id="resolucion-disputa"
              className="mod-textarea"
              rows={5}
              maxLength={1000}
              value={resolucion}
              placeholder="Describe las verificaciones, el criterio aplicado y la decisión final."
              aria-invalid={errores.resolucion ? "true" : undefined}
              aria-describedby={errores.resolucion ? "resolucion-disputa-error" : "resolucion-disputa-hint"}
              onChange={(event) => {
                setResolucion(event.target.value);
                if (errores.resolucion) {
                  setErrores((actuales) => {
                    const siguiente = { ...actuales };
                    delete siguiente.resolucion;
                    return siguiente;
                  });
                }
              }}
            />
          </label>
          <p className="mod-hint" id="resolucion-disputa-hint">
            Entre 3 y 1000 caracteres. {resolucion.trim().length}/1000.
          </p>
          {errores.resolucion ? (
            <p className="ui-error" id="resolucion-disputa-error" role="alert">
              {errores.resolucion}
            </p>
          ) : null}
        </form>
      </PanelDialog>
    </div>
  );
}
