import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { simularPagoContrato } from "../../infrastructure/api/apiPagos";
import type { PagoEscrow } from "../../infrastructure/api/apiPagos";
import { errorMessage, formatMoney, pagoEstadoLabel } from "./chatContractsUtils";
import "./chat-contracts.css";

type EstadoSimulacion = "procesando" | "exito" | "error";

/**
 * Página de retorno de la pasarela simulada (solo desarrollo).
 * El backend redirige aquí con ?contrato=<id>&preferencia=<id> y este
 * componente confirma el pago de prueba llamando al endpoint /pago/simular.
 */
export function PagoSimuladoPage() {
  const { token } = useAuth();
  const [params] = useSearchParams();
  const contratoId = Number(params.get("contrato"));
  const [estado, setEstado] = useState<EstadoSimulacion>("procesando");
  const [pago, setPago] = useState<PagoEscrow | null>(null);
  const [mensaje, setMensaje] = useState("");
  const intento = useRef(false);

  useEffect(() => {
    if (!token || intento.current) return;
    if (!Number.isInteger(contratoId) || contratoId <= 0) {
      setEstado("error");
      setMensaje("El enlace de pago simulado no es válido.");
      return;
    }
    intento.current = true;
    simularPagoContrato(token, contratoId)
      .then((resultado) => {
        setPago(resultado.pago);
        setEstado("exito");
      })
      .catch((requestError: unknown) => {
        setMensaje(errorMessage(requestError, "No se pudo confirmar el pago simulado."));
        setEstado("error");
      });
  }, [token, contratoId]);

  return (
    <main className="cc-page">
      <section className="cc-panel cc-contract-detail">
        <p className="cc-eyebrow">PAGO SIMULADO</p>
        <h1>{estado === "exito" ? "Pago confirmado" : estado === "error" ? "No se pudo pagar" : "Confirmando pago…"}</h1>
        {estado === "procesando" && <p className="cc-muted">Estamos reteniendo el pago de prueba en FirstGig.</p>}
        {estado === "exito" && pago && (
          <>
            <p>
              Se retuvieron <strong>{formatMoney(pago.monto)}</strong> en escrow.
              El contrato queda activo y el dinero se libera cuando el cliente apruebe la entrega.
            </p>
            <p className="cc-muted">Estado del pago: {pagoEstadoLabel(pago.estado)}</p>
          </>
        )}
        {estado === "error" && <p className="cc-alert" role="alert">{mensaje}</p>}
        <div className="cc-actions">
          {Number.isInteger(contratoId) && contratoId > 0 && (
            <Link className="cc-primary-button cc-link-button" to={`/contracts/${contratoId}`}>
              Ver contrato
            </Link>
          )}
          <Link className="cc-secondary-button cc-link-button" to="/contracts">Volver a contratos</Link>
        </div>
      </section>
    </main>
  );
}
