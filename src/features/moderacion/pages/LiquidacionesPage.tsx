import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Select";
import { useAuth } from "../../../context/AuthContext";
import { moderacionApi } from "../../../infrastructure/api/apiModeracion";
import type {
  EstadoLiquidacion,
  Liquidacion,
} from "../../../infrastructure/api/apiModeracion";
import { DataTable } from "../components/DataTable";
import type { ColumnaTabla } from "../components/DataTable";
import { EstadoBadge } from "../components/EstadoBadge";
import { ListToolbar } from "../components/ListToolbar";
import { PageHeader } from "../components/PageHeader";
import { Pagination } from "../components/Pagination";
import { PanelDialog } from "../components/PanelDialog";
import { useToast } from "../components/Toast";
import { useTemporaryLock } from "../hooks/useTemporaryLock";
import { useModeracionPanel } from "../ModeracionContext";
import {
  esApiError,
  erroresPorCampo,
  formatearFechaHora,
  formatearMoneda,
  mensajeError,
} from "../utils";

const LIMITE = 20;

const OPCIONES_ESTADO = [
  { value: "solicitada", label: "Solicitadas" },
  { value: "pendiente", label: "Pendientes" },
  { value: "pagada", label: "Pagadas" },
  { value: "rechazada", label: "Rechazadas" },
  { value: "todas", label: "Todas las liquidaciones" },
];

type EstadoFiltro = EstadoLiquidacion | "";
type Modo = "pagar" | "rechazar";

export function LiquidacionesPage() {
  const { token } = useAuth();
  const { mostrarToast } = useToast();
  const { recargarContadores } = useModeracionPanel();
  const [searchParams, setSearchParams] = useSearchParams();
  const [liquidaciones, setLiquidaciones] = useState<Liquidacion[]>([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);

  const [seleccionada, setSeleccionada] = useState<Liquidacion | null>(null);
  const [modo, setModo] = useState<Modo>("pagar");
  const [referencia, setReferencia] = useState("");
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const { bloqueado, bloquear } = useTemporaryLock();

  const estadoUrl = searchParams.get("estado") ?? "solicitada";
  const estadoValido = OPCIONES_ESTADO.some((opcion) => opcion.value === estadoUrl);
  const estadoSeleccionado = estadoValido ? estadoUrl : "solicitada";
  const estado: EstadoFiltro = estadoSeleccionado === "todas" ? "" : (estadoSeleccionado as EstadoFiltro);
  const pageParam = Number(searchParams.get("page"));
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  useEffect(() => {
    if (!token) return;
    let activo = true;
    setCargando(true);
    setError("");
    moderacionApi
      .listarLiquidaciones(token, { estado, page, limit: LIMITE })
      .then((resultado) => {
        if (!activo) return;
        setLiquidaciones(resultado.liquidaciones ?? []);
        setTotal(resultado.total ?? 0);
      })
      .catch((reason: unknown) => {
        if (!activo) return;
        setError(mensajeError(reason));
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [token, estado, page, recarga]);

  const cambiarEstado = (nuevo: string) => {
    const params = new URLSearchParams(searchParams);
    if (nuevo) params.set("estado", nuevo);
    else params.delete("estado");
    params.delete("page");
    setSearchParams(params, { replace: true });
  };

  const cambiarPagina = (nuevaPagina: number) => {
    const params = new URLSearchParams(searchParams);
    if (nuevaPagina > 1) params.set("page", String(nuevaPagina));
    else params.delete("page");
    setSearchParams(params);
  };

  const abrir = (liquidacion: Liquidacion, nuevoModo: Modo) => {
    setSeleccionada(liquidacion);
    setModo(nuevoModo);
    setReferencia("");
    setMotivoRechazo("");
    setErrores({});
  };

  const cerrar = () => {
    if (enviando) return;
    setSeleccionada(null);
    setErrores({});
  };

  const enviar = async () => {
    if (!token || !seleccionada) return;
    const nuevosErrores: Record<string, string> = {};

    if (modo === "pagar" && referencia.trim().length > 100) {
      nuevosErrores.referencia = "La referencia no puede exceder 100 caracteres.";
    }
    if (modo === "rechazar") {
      const motivo = motivoRechazo.trim();
      if (!motivo) {
        nuevosErrores.motivoRechazo = "Debes indicar el motivo del rechazo.";
      } else if (motivo.length > 255) {
        nuevosErrores.motivoRechazo = "El motivo no puede exceder 255 caracteres.";
      }
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setEnviando(true);
    setErrores({});
    try {
      const actualizada = await moderacionApi.resolverRetiro(token, seleccionada.id, {
        estado: modo === "pagar" ? "pagada" : "rechazada",
        ...(modo === "pagar" && referencia.trim()
          ? { referencia: referencia.trim() }
          : {}),
        ...(modo === "rechazar" ? { motivoRechazo: motivoRechazo.trim() } : {}),
      });
      setLiquidaciones((actuales) =>
        actuales.map((item) => (item.id === actualizada.id ? actualizada : item)),
      );
      setSeleccionada(null);
      mostrarToast(
        modo === "pagar"
          ? "La liquidación quedó marcada como pagada."
          : "La liquidación fue rechazada y el saldo volverá al freelancer.",
        "success",
      );
      void recargarContadores();
    } catch (reason) {
      if (esApiError(reason) && reason.status === 422) {
        setErrores(erroresPorCampo(reason));
      } else if (esApiError(reason) && reason.status === 409) {
        mostrarToast(mensajeError(reason), "warning");
        setSeleccionada(null);
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

  const columnas: Array<ColumnaTabla<Liquidacion>> = [
    {
      key: "id",
      header: "ID",
      width: "70px",
      render: (liquidacion) => <span className="mod-id">#{liquidacion.id}</span>,
    },
    {
      key: "freelancer",
      header: "Freelancer",
      render: (liquidacion) => (
        <span className="mod-stack-tight">
          <strong>Usuario #{liquidacion.freelancerId}</strong>
          <small className="mod-muted">Liquidación del freelancer</small>
        </span>
      ),
    },
    {
      key: "contrato",
      header: "Contrato",
      width: "100px",
      render: (liquidacion) =>
        liquidacion.contratoId ? <span className="mod-id">#{liquidacion.contratoId}</span> : "—",
    },
    {
      key: "bruto",
      header: "Monto bruto",
      align: "right",
      width: "130px",
      render: (liquidacion) => <span className="mod-amount">{formatearMoneda(liquidacion.montoBruto)}</span>,
    },
    {
      key: "comision",
      header: "Comisión",
      align: "right",
      width: "120px",
      render: (liquidacion) => <span className="mod-amount">{formatearMoneda(liquidacion.comision)}</span>,
    },
    {
      key: "neto",
      header: "Neto",
      align: "right",
      width: "130px",
      render: (liquidacion) => (
        <strong className="mod-amount mod-amount--strong">{formatearMoneda(liquidacion.montoNeto)}</strong>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      width: "120px",
      render: (liquidacion) => <EstadoBadge estado={liquidacion.estado} />,
    },
    {
      key: "fechas",
      header: "Fechas",
      width: "180px",
      render: (liquidacion) => (
        <span className="mod-date-stack">
          <span>Solicitud: {formatearFechaHora(liquidacion.fechaSolicitud ?? liquidacion.fechaCreacion)}</span>
          {liquidacion.fechaPago ? <span>Pago: {formatearFechaHora(liquidacion.fechaPago)}</span> : null}
        </span>
      ),
    },
    {
      key: "acciones",
      header: "Acciones",
      width: "190px",
      align: "right",
      render: (liquidacion) =>
        liquidacion.estado === "solicitada" ? (
          <span className="mod-row-actions">
            <Button variant="secondary" size="sm" onClick={() => abrir(liquidacion, "pagar")}>
              Marcar pagada
            </Button>
            <Button variant="danger" size="sm" onClick={() => abrir(liquidacion, "rechazar")}>
              Rechazar
            </Button>
          </span>
        ) : liquidacion.motivoRechazo ? (
          <span className="mod-muted" title={liquidacion.motivoRechazo}>
            Motivo registrado
          </span>
        ) : liquidacion.referencia ? (
          <span className="mod-muted" title={liquidacion.referencia}>
            Ref. {liquidacion.referencia}
          </span>
        ) : (
          <span className="mod-muted">—</span>
        ),
    },
  ];

  return (
    <div className="mod-page">
      <PageHeader
        eyebrow="Moderación · Liquidaciones"
        title="Retiros y liquidaciones"
        description="Aprueba pagos con referencia o rechaza solicitudes con un motivo. Los montos incluyen la comisión de la plataforma."
      />

      <ListToolbar
        summary={
          cargando
            ? "Cargando liquidaciones…"
            : `${total} ${total === 1 ? "liquidación" : "liquidaciones"}${estado ? "" : " en total"}`
        }
        onRefresh={() => setRecarga((valor) => valor + 1)}
        refreshing={cargando}
      >
        <Select
          label="Estado de la liquidación"
          options={OPCIONES_ESTADO}
          value={estadoSeleccionado}
          onChange={(event) => cambiarEstado(event.target.value)}
        />
      </ListToolbar>

      <DataTable
        caption="Listado de liquidaciones y solicitudes de retiro"
        columns={columnas}
        rows={liquidaciones}
        rowKey={(liquidacion) => liquidacion.id}
        loading={cargando}
        error={error}
        onRetry={() => setRecarga((valor) => valor + 1)}
        emptyTitle="No hay liquidaciones con ese estado"
        emptyDescription="Cambia el filtro para consultar otras solicitudes o vuelve más tarde."
        emptyActionLabel={estado ? "Ver todas" : "Actualizar"}
        onEmptyAction={
          estado ? () => cambiarEstado("todas") : () => setRecarga((valor) => valor + 1)
        }
      />

      <Pagination page={page} total={total} limit={LIMITE} onChange={cambiarPagina} />

      <PanelDialog
        open={Boolean(seleccionada)}
        title={modo === "pagar" ? "Marcar liquidación como pagada" : "Rechazar solicitud de retiro"}
        description={
          seleccionada
            ? `Liquidación #${seleccionada.id} · ${formatearMoneda(seleccionada.montoNeto)} netos para el freelancer.`
            : undefined
        }
        busy={enviando}
        onClose={cerrar}
        footer={
          <Button
            type="submit"
            form="form-liquidacion"
            variant={modo === "rechazar" ? "danger" : "primary"}
            disabled={enviando || bloqueado}
          >
            {enviando
              ? "Guardando…"
              : bloqueado
                ? "Espera un momento…"
                : modo === "pagar"
                  ? "Confirmar pago"
                  : "Rechazar y devolver saldo"}
          </Button>
        }
      >
        <form
          id="form-liquidacion"
          className="mod-form"
          onSubmit={(event) => {
            event.preventDefault();
            void enviar();
          }}
        >
          {modo === "pagar" ? (
            <label className="mod-field" htmlFor="referencia-pago">
              <span className="ui-label">Referencia del pago (opcional)</span>
              <input
                id="referencia-pago"
                className="ui-input"
                type="text"
                maxLength={100}
                value={referencia}
                placeholder="Ej. transferencia bancaria 2026-11-14"
                aria-invalid={errores.referencia ? "true" : undefined}
                aria-describedby={errores.referencia ? "referencia-error" : "referencia-hint"}
                onChange={(event) => {
                  setReferencia(event.target.value);
                  if (errores.referencia) {
                    setErrores((actuales) => {
                      const siguiente = { ...actuales };
                      delete siguiente.referencia;
                      return siguiente;
                    });
                  }
                }}
              />
              <p className="mod-hint" id="referencia-hint">
                Máximo 100 caracteres. Se incluye en la notificación al freelancer.
              </p>
              {errores.referencia ? (
                <p className="ui-error" id="referencia-error" role="alert">
                  {errores.referencia}
                </p>
              ) : null}
            </label>
          ) : (
            <>
              <div className="mod-alert mod-alert--warning" role="note">
                <span>
                  Al rechazar, el saldo vuelve a quedar disponible para el freelancer. Esta acción
                  se notifica y no se puede deshacer desde el panel.
                </span>
              </div>
              <label className="mod-field" htmlFor="motivo-rechazo">
                <span className="ui-label">Motivo del rechazo</span>
                <textarea
                  id="motivo-rechazo"
                  className="mod-textarea"
                  rows={4}
                  maxLength={255}
                  value={motivoRechazo}
                  placeholder="Explica por qué no se puede procesar el retiro."
                  aria-invalid={errores.motivoRechazo ? "true" : undefined}
                  aria-describedby={errores.motivoRechazo ? "motivo-rechazo-error" : "motivo-rechazo-hint"}
                  onChange={(event) => {
                    setMotivoRechazo(event.target.value);
                    if (errores.motivoRechazo) {
                      setErrores((actuales) => {
                        const siguiente = { ...actuales };
                        delete siguiente.motivoRechazo;
                        return siguiente;
                      });
                    }
                  }}
                />
                <p className="mod-hint" id="motivo-rechazo-hint">
                  Obligatorio, máximo 255 caracteres.
                </p>
                {errores.motivoRechazo ? (
                  <p className="ui-error" id="motivo-rechazo-error" role="alert">
                    {errores.motivoRechazo}
                  </p>
                ) : null}
              </label>
            </>
          )}
        </form>
      </PanelDialog>
    </div>
  );
}
