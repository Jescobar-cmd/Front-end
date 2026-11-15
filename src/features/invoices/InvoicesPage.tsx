import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../../components/ui/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { listarPagosConFacturas } from "../../infrastructure/api/apiPagos";
import type { PagoConFactura } from "../../infrastructure/api/apiPagos";
import { errorMessage, formatDate, formatMoney } from "../chat-contracts/chatContractsUtils";
import "../chat-contracts/chat-contracts.css";

export function InvoicesPage() {
  const { token, user } = useAuth();
  const [pagos, setPagos] = useState<PagoConFactura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || (user?.rol !== "cliente" && user?.rol !== "freelancer")) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    listarPagosConFacturas(token, user.rol)
      .then((resultado) => { if (!cancelled) setPagos(resultado); })
      .catch((requestError: unknown) => {
        if (!cancelled) setError(errorMessage(requestError, "No se pudieron cargar los comprobantes."));
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [token, user?.rol]);

  const facturas = pagos.filter((pago) => pago.factura?.estado === "emitida_demo");

  return (
    <main className="cc-page">
      <header className="cc-header">
        <div>
          <Link className="cc-back-link" to="/contracts">← Contratos</Link>
          <p className="cc-eyebrow">COMPROBANTES</p>
          <h1>Facturas sandbox</h1>
          <p className="cc-subtitle">Documentos académicos de prueba. No son válidos ante la DIAN.</p>
        </div>
      </header>
      {error && <p className="cc-alert" role="alert">{error}</p>}
      {loading ? <section className="cc-panel"><p className="cc-muted">Cargando comprobantes…</p></section> : facturas.length === 0 ? (
        <EmptyState
          title="Aún no hay facturas emitidas"
          description="Los comprobantes se generan automáticamente cuando Mercado Pago confirma un pago aprobado."
          actionLabel="Ver contratos"
          to="/contracts"
        />
      ) : (
        <div className="cc-contract-list">
          {facturas.map((pago) => {
            const factura = pago.factura!;
            return (
              <article className="cc-panel cc-contract-detail" key={factura.id}>
                <div className="cc-contract-heading">
                  <div>
                    <p className="cc-eyebrow">{factura.numeroFactura ?? "COMPROBANTE"}</p>
                    <h2>{formatMoney(factura.total)}</h2>
                    <p className="cc-muted">Contrato #{pago.contrato.id} · {pago.contrato.titulo}</p>
                  </div>
                  <span className="cc-status cc-status-active">SANDBOX</span>
                </div>
                <dl className="cc-definition-list">
                  <div><dt>Descripción</dt><dd>{factura.descripcion ?? pago.contrato.titulo}</dd></div>
                  <div><dt>Comprador</dt><dd>{factura.compradorNombre ?? "No registrado"}</dd></div>
                  <div><dt>Fecha de emisión</dt><dd>{formatDate(factura.fechaEmision)}</dd></div>
                  <div><dt>Subtotal del servicio</dt><dd>{formatMoney(factura.subtotal)}</dd></div>
                  <div><dt>Comisión cliente</dt><dd>{formatMoney(factura.comisionCliente)}</dd></div>
                  <div><dt>Total pagado</dt><dd>{formatMoney(factura.total)}</dd></div>
                  <div><dt>UUID de demostración</dt><dd>{factura.uuidDemo ?? "Pendiente"}</dd></div>
                </dl>
                <p className="cc-inline-alert" role="note">Comprobante académico emitido en sandbox; no equivale a una factura electrónica validada por DIAN.</p>
                <div className="cc-actions">
                  <Link className="cc-secondary-button cc-link-button" to={`/contracts/${pago.contratoId}`}>Ver contrato</Link>
                  <button className="cc-primary-button" type="button" onClick={() => window.print()}>Imprimir / guardar como PDF</button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
