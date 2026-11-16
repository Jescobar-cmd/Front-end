import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { getFreelancerLiquidaciones, solicitarRetiro } from "../../infrastructure/api/apiLiquidaciones";
import type { LiquidacionesFreelancer, Liquidacion } from "../../infrastructure/api/apiLiquidaciones";
import { errorMessage, formatDate, formatMoney } from "./chatContractsUtils";
import "./chat-contracts.css";

function estadoLabel(estado: Liquidacion["estado"]): string {
  const labels: Record<Liquidacion["estado"], string> = {
    pendiente: "Disponible",
    solicitada: "Retiro en proceso",
    pagada: "Pagada",
    rechazada: "Rechazada",
  };
  return labels[estado];
}

function disponibleParaRetiro(liquidacion: Liquidacion, diasValidacion: number): boolean {
  if (liquidacion.estado !== "pendiente") return false;
  if (diasValidacion <= 0) return true;
  const corte = Date.now() - diasValidacion * 24 * 60 * 60 * 1000;
  return new Date(liquidacion.fechaCreacion).getTime() <= corte;
}

export function LiquidacionesFreelancerPage() {
  const { token } = useAuth();
  const [datos, setDatos] = useState<LiquidacionesFreelancer | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    getFreelancerLiquidaciones(token)
      .then((resultado) => {
        if (!cancelled) setDatos(resultado);
      })
      .catch((requestError: unknown) => {
        if (!cancelled) setError(errorMessage(requestError, "No se pudieron cargar tus ganancias."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [token, refreshKey]);

  const confirmarRetiro = async () => {
    if (!token) return;
    setBusy(true);
    setError("");
    setAviso("");
    try {
      const resultado = await solicitarRetiro(token);
      setAviso(
        `Retiro solicitado por ${formatMoney(resultado.total)} en ${resultado.cantidad} liquidación(es). Un moderador lo revisará y te notificaremos cuando sea pagado.`,
      );
      setConfirmOpen(false);
      setRefreshKey((key) => key + 1);
    } catch (requestError) {
      setError(errorMessage(requestError, "No se pudo solicitar el retiro."));
    } finally {
      setBusy(false);
    }
  };

  const resumen = datos?.resumen;
  const hayRetirable = (datos?.liquidaciones ?? []).some((liquidacion) =>
    disponibleParaRetiro(liquidacion, datos?.diasValidacion ?? 3),
  );

  return (
    <main className="cc-page">
      <header className="cc-header">
        <div>
          <p className="cc-eyebrow">TUS GANANCIAS</p>
          <h1>Liquidaciones</h1>
          <p className="cc-subtitle">Saldo disponible, retiros y comprobantes de pago liberado.</p>
        </div>
        <div className="cc-actions">
          <Link className="cc-link-button cc-secondary-button" to="/contracts">Contratos</Link>
          <Link className="cc-link-button cc-secondary-button" to="/facturas">Facturas</Link>
        </div>
      </header>

      {error && <p className="cc-alert" role="alert">{error}</p>}
      {aviso && <p className="cc-inline-alert" role="status">{aviso}</p>}

      {loading ? (
        <section className="cc-panel"><p className="cc-muted">Cargando tus ganancias…</p></section>
      ) : !datos || !resumen ? (
        <EmptyState
          title="Sin información de ganancias"
          description="Cuando un cliente apruebe una entrega, el dinero liberado aparecerá aquí."
          actionLabel="Ver contratos"
          to="/contracts"
        />
      ) : (
        <>
          <section className="cc-panel cc-contract-detail">
            <div className="cc-contract-heading">
              <div>
                <p className="cc-eyebrow">SALDO RETIRABLE</p>
                <h2>{formatMoney(resumen.saldoDisponible)}</h2>
              </div>
              <button
                className="cc-primary-button"
                type="button"
                disabled={!hayRetirable || busy}
                onClick={() => setConfirmOpen(true)}
              >
                Retirar saldo
              </button>
            </div>
            <dl className="cc-definition-list">
              <div><dt>En validación</dt><dd>{formatMoney(resumen.saldoEnValidacion)}</dd></div>
              <div><dt>Retiros en proceso</dt><dd>{formatMoney(resumen.saldoEnProceso)}</dd></div>
              <div><dt>Total pagado</dt><dd>{formatMoney(resumen.totalPagado)}</dd></div>
              <div><dt>Comisiones pagadas</dt><dd>{formatMoney(resumen.comisionTotal)}</dd></div>
            </dl>
            {datos.diasValidacion > 0 && (
              <p className="cc-muted">
                Las ganancias liberadas pasan por un periodo de validación de {datos.diasValidacion} días antes de poder retirarse.
              </p>
            )}
          </section>

          <section className="cc-panel" aria-labelledby="liq-history-title">
            <div className="cc-panel-heading">
              <div><p className="cc-eyebrow">HISTORIAL</p><h2 id="liq-history-title">Liquidaciones</h2></div>
              <span className="cc-muted">{datos.liquidaciones.length}</span>
            </div>
            {datos.liquidaciones.length === 0 ? (
              <p className="cc-empty">Todavía no tienes liquidaciones. Aparecen cuando un cliente aprueba tu entrega.</p>
            ) : (
              <ul className="cc-rating-list">
                {datos.liquidaciones.map((liquidacion) => {
                  const puedeRetirar = disponibleParaRetiro(liquidacion, datos.diasValidacion);
                  const enValidacion =
                    liquidacion.estado === "pendiente" && !puedeRetirar && datos.diasValidacion > 0;
                  return (
                    <li key={liquidacion.id}>
                      <div className="cc-rating-heading">
                        <strong>{formatMoney(liquidacion.montoNeto)}</strong>
                        <span className="cc-status">{estadoLabel(liquidacion.estado)}</span>
                      </div>
                      <p className="cc-muted">
                        Bruto {formatMoney(liquidacion.montoBruto)} · Comisión {formatMoney(liquidacion.comision)}
                        {liquidacion.contratoId ? ` · Contrato #${liquidacion.contratoId}` : ""}
                      </p>
                      <p className="cc-muted">
                        {enValidacion
                          ? `En validación hasta el ${formatDate(new Date(new Date(liquidacion.fechaCreacion).getTime() + datos.diasValidacion * 24 * 60 * 60 * 1000).toISOString())}`
                          : `Registrada el ${formatDate(liquidacion.fechaCreacion)}`}
                        {liquidacion.fechaPago ? ` · Pagada el ${formatDate(liquidacion.fechaPago)}` : ""}
                        {liquidacion.referencia ? ` · Ref. ${liquidacion.referencia}` : ""}
                      </p>
                      {liquidacion.motivoRechazo && <p className="cc-muted">Motivo del rechazo: {liquidacion.motivoRechazo}</p>}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Solicitar retiro"
        description={`¿Deseas solicitar el retiro de tu saldo disponible${resumen ? ` (${formatMoney(resumen.saldoDisponible)})` : ""}? Un moderador revisará la solicitud y te notificaremos cuando el pago sea realizado.`}
        confirmLabel="Solicitar retiro"
        loading={busy}
        onConfirm={() => void confirmarRetiro()}
        onCancel={() => setConfirmOpen(false)}
      />
    </main>
  );
}
