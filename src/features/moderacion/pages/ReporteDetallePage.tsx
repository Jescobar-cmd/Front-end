import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, buttonClassName } from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Select";
import { useAuth } from "../../../context/AuthContext";
import { moderacionApi } from "../../../infrastructure/api/apiModeracion";
import type {
  PerfilPublicoModeracion,
  ReporteDetalle,
} from "../../../infrastructure/api/apiModeracion";
import { AccountModerationCard } from "../components/AccountModerationCard";
import { Avatar } from "../components/Avatar";
import { EstadoBadge } from "../components/EstadoBadge";
import { PageHeader } from "../components/PageHeader";
import { PanelDialog } from "../components/PanelDialog";
import { useToast } from "../components/Toast";
import { useTemporaryLock } from "../hooks/useTemporaryLock";
import { esApiError, erroresPorCampo, formatearFechaHora, mensajeError } from "../utils";
import { useModeracionPanel } from "../ModeracionContext";

export function ReporteDetallePage() {
  const { id } = useParams();
  const reporteId = Number(id);
  const { token } = useAuth();
  const { mostrarToast } = useToast();
  const { recargarContadores } = useModeracionPanel();
  const [reporte, setReporte] = useState<ReporteDetalle | null>(null);
  const [perfilReportado, setPerfilReportado] = useState<PerfilPublicoModeracion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);

  const [resolverAbierto, setResolverAbierto] = useState(false);
  const [estadoResolucion, setEstadoResolucion] = useState<"resuelto" | "rechazado">("resuelto");
  const [resolucion, setResolucion] = useState("");
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const { bloqueado, bloquear } = useTemporaryLock();

  const cargar = useCallback(async () => {
    if (!token || !Number.isInteger(reporteId) || reporteId <= 0) {
      setError("El identificador del reporte no es válido.");
      setCargando(false);
      return;
    }
    setCargando(true);
    setError("");
    try {
      const datos = await moderacionApi.obtenerReporte(token, reporteId);
      setReporte(datos);
      if (datos.usuarioReportado) {
        void moderacionApi
          .obtenerPerfilPublico(token, datos.usuarioReportado.id)
          .then(setPerfilReportado)
          .catch(() => setPerfilReportado(null));
      } else {
        setPerfilReportado(null);
      }
    } catch (reason) {
      setError(mensajeError(reason));
    } finally {
      setCargando(false);
    }
  }, [token, reporteId]);

  useEffect(() => {
    void cargar();
  }, [cargar, recarga]);

  const abrirResolver = () => {
    setEstadoResolucion("resuelto");
    setResolucion("");
    setErrores({});
    setResolverAbierto(true);
  };

  const cerrarResolver = () => {
    if (enviando) return;
    setResolverAbierto(false);
  };

  const enviarResolucion = async () => {
    if (!token || !reporte) return;
    const limpio = resolucion.trim();
    if (limpio.length < 3) {
      setErrores({ resolucion: "La resolución debe tener al menos 3 caracteres." });
      return;
    }
    if (limpio.length > 1000) {
      setErrores({ resolucion: "La resolución no puede exceder 1000 caracteres." });
      return;
    }

    setEnviando(true);
    setErrores({});
    try {
      const actualizado = await moderacionApi.resolverReporte(token, reporte.id, {
        estado: estadoResolucion,
        resolucion: limpio,
      });
      setReporte((actual) => (actual ? { ...actual, ...actualizado } : actual));
      setResolverAbierto(false);
      mostrarToast("Reporte resuelto correctamente.", "success");
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

  if (cargando && !reporte) {
    return (
      <div className="mod-page">
        <PageHeader eyebrow="Moderación · Reportes" title="Cargando reporte…" backTo="/moderacion/reportes" />
        <div className="mod-panel mod-panel--skeleton" aria-hidden="true" />
      </div>
    );
  }

  if (error && !reporte) {
    return (
      <div className="mod-page">
        <PageHeader
          eyebrow="Moderación · Reportes"
          title="No pudimos cargar el reporte"
          description={error}
          backTo="/moderacion/reportes"
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

  if (!reporte) return null;

  const puedeResolver = reporte.estado === "pendiente";

  return (
    <div className="mod-page">
      <PageHeader
        eyebrow={`Moderación · Reporte #${reporte.id}`}
        title={reporte.motivo}
        description="Contexto del reporte, partes implicadas y resolución."
        backTo="/moderacion/reportes"
        backLabel="Volver a reportes"
        actions={
          puedeResolver ? (
            <Button variant="primary" onClick={abrirResolver}>
              Resolver reporte
            </Button>
          ) : (
            <EstadoBadge estado={reporte.estado} />
          )
        }
      />

      <div className="mod-detail-grid">
        <section className="mod-panel" aria-labelledby="reporte-contexto">
          <div className="mod-panel__head">
            <div>
              <h2 id="reporte-contexto">Detalle del reporte</h2>
              <p>Información enviada por la persona reportante.</p>
            </div>
            <EstadoBadge estado={reporte.estado} />
          </div>

          <dl className="mod-info">
            <div>
              <dt>Fecha del reporte</dt>
              <dd>{formatearFechaHora(reporte.fecha)}</dd>
            </div>
            <div>
              <dt>Motivo</dt>
              <dd>{reporte.motivo}</dd>
            </div>
            <div className="mod-info__wide">
              <dt>Descripción</dt>
              <dd>{reporte.descripcion || "Sin descripción adicional."}</dd>
            </div>
            {reporte.proyecto ? (
              <div className="mod-info__wide">
                <dt>Proyecto relacionado</dt>
                <dd>
                  {reporte.proyecto.titulo}{" "}
                  <span className="mod-muted">(#{reporte.proyecto.id})</span>
                </dd>
              </div>
            ) : null}
          </dl>

          {reporte.resolucion ? (
            <div className="mod-resolution" role="note">
              <p className="mod-eyebrow">Resolución registrada</p>
              <p>{reporte.resolucion}</p>
              <span className="mod-muted">
                {reporte.fechaResolucion
                  ? `Resuelto el ${formatearFechaHora(reporte.fechaResolucion)}`
                  : "Fecha de resolución no disponible"}
              </span>
            </div>
          ) : null}
        </section>

        <aside className="mod-detail-aside">
          <section className="mod-panel" aria-labelledby="reporte-partes">
            <div className="mod-panel__head">
              <div>
                <h2 id="reporte-partes">Partes implicadas</h2>
                <p>Gestiona el acceso de la cuenta reportada.</p>
              </div>
            </div>

            <div className="mod-people">
              <div className="mod-person">
                <span className="mod-eyebrow">Reportante</span>
                <div className="mod-person__row">
                  <Avatar
                    nombre={reporte.usuarioReporta.nombre}
                    fotoPerfil={reporte.usuarioReporta.fotoPerfil}
                  />
                  <div>
                    <strong>{reporte.usuarioReporta.nombre}</strong>
                    <small>Usuario #{reporte.usuarioReporta.id}</small>
                  </div>
                </div>
              </div>

              <div className="mod-person">
                <span className="mod-eyebrow">Reportado</span>
                {reporte.usuarioReportado ? (
                  <AccountModerationCard
                    usuario={{
                      id: reporte.usuarioReportado.id,
                      nombre: reporte.usuarioReportado.nombre,
                      fotoPerfil: reporte.usuarioReportado.fotoPerfil,
                      rolId: perfilReportado?.rolId,
                      estado: perfilReportado?.estado,
                    }}
                    compact
                  />
                ) : (
                  <p className="mod-muted">Este reporte no señala a un usuario específico.</p>
                )}
              </div>
            </div>
          </section>

          <Link className={buttonClassName({ variant: "ghost", size: "sm" })} to="/moderacion/reportes">
            ← Volver al listado
          </Link>
        </aside>
      </div>

      <PanelDialog
        open={resolverAbierto}
        title="Resolver reporte"
        description="La resolución queda registrada y se notifica a las partes. Escribe una explicación clara de la decisión."
        busy={enviando}
        onClose={cerrarResolver}
        footer={
          <Button
            type="submit"
            form="form-resolver-reporte"
            variant="primary"
            disabled={enviando || bloqueado}
          >
            {enviando ? "Guardando…" : bloqueado ? "Espera un momento…" : "Confirmar resolución"}
          </Button>
        }
      >
        <form
          id="form-resolver-reporte"
          className="mod-form"
          onSubmit={(event) => {
            event.preventDefault();
            void enviarResolucion();
          }}
        >
          <Select
            label="Resultado"
            options={[
              { value: "resuelto", label: "Resuelto (el reporte es válido)" },
              { value: "rechazado", label: "Rechazado (sin mérito suficiente)" },
            ]}
            value={estadoResolucion}
            onChange={(event) =>
              setEstadoResolucion(event.target.value === "rechazado" ? "rechazado" : "resuelto")
            }
          />

          <label className="mod-field" htmlFor="resolucion-reporte">
            <span className="ui-label">Resolución</span>
            <textarea
              id="resolucion-reporte"
              className="mod-textarea"
              rows={5}
              maxLength={1000}
              value={resolucion}
              placeholder="Explica qué verificaste y por qué tomas esta decisión."
              aria-invalid={errores.resolucion ? "true" : undefined}
              aria-describedby={errores.resolucion ? "resolucion-reporte-error" : "resolucion-reporte-hint"}
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
          <p className="mod-hint" id="resolucion-reporte-hint">
            Entre 3 y 1000 caracteres. {resolucion.trim().length}/1000.
          </p>
          {errores.resolucion ? (
            <p className="ui-error" id="resolucion-reporte-error" role="alert">
              {errores.resolucion}
            </p>
          ) : null}
        </form>
      </PanelDialog>
    </div>
  );
}
