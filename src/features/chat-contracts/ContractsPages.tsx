import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { useAuth } from "../../context/AuthContext";
import {
  approveDelivery,
  cancelContract,
  getContract,
  getContractDeliveries,
  getContractDisputes,
  getContractRatings,
  getContracts,
  openDispute,
  rateContract,
  rejectDelivery,
  submitDelivery,
  updateDelivery,
} from "../../infrastructure/api/apiContratos";
import type { Calificacion, Contrato, DisputaContrato, EntregaContrato, RespuestaListadoCalificaciones } from "../../infrastructure/api/apiContratos";
import { consultarPagoContrato, iniciarPagoContrato } from "../../infrastructure/api/apiPagos";
import type { PagoEscrow } from "../../infrastructure/api/apiPagos";
import { errorMessage, formatDate, formatMoney, isActive, isCancelled, isCompleted, isPendingPayment, pagoEstadoLabel, statusLabel } from "./chatContractsUtils";
import "./chat-contracts.css";

function contractStateDescription(contract: Contrato): string {
  if (isActive(contract.estado)) return "En curso";
  if (isCompleted(contract.estado)) return "Trabajo completado";
  if (isCancelled(contract.estado)) return "Contrato cancelado";
  return statusLabel(contract.estado);
}

function Counterparty({ contract }: { contract: Contrato }) {
  const counterpart = contract.contraparte ?? contract.cliente ?? contract.freelancer;
  return <p className="cc-muted">{counterpart ? `Con ${counterpart.nombre}` : "Participantes del contrato"}</p>;
}

export function ContractsPage() {
  const { token, user } = useAuth();
  const [contracts, setContracts] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [contractToCancel, setContractToCancel] = useState<Contrato | null>(null);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    getContracts(token).then((result) => {
      if (!cancelled) setContracts(result.contratos);
    }).catch((requestError: unknown) => {
      if (!cancelled) setError(errorMessage(requestError, "No se pudieron cargar los contratos."));
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [token, refreshKey]);

  const changeState = async (contract: Contrato, action: "cancel"): Promise<boolean> => {
    if (!token || !isPendingPayment(contract.estado)) return false;
    setBusyId(contract.id);
    setError("");
    try {
      await cancelContract(token, contract.id);
      setRefreshKey((key) => key + 1);
      return true;
    } catch (requestError) {
      setError(errorMessage(requestError, "No se pudo actualizar el contrato."));
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const confirmCancel = async () => {
    if (!contractToCancel) return;
    if (await changeState(contractToCancel, "cancel")) setContractToCancel(null);
  };

  return (
    <main className="cc-page">
      <header className="cc-header">
        <div>
          <p className="cc-eyebrow">TRABAJO Y CONFIANZA</p>
          <h1>Contratos</h1>
          <p className="cc-subtitle">Consulta acuerdos, estados y calificaciones.</p>
        </div>
        <div className="cc-actions">
          <Link className="cc-link-button cc-secondary-button" to="/facturas">Facturas</Link>
          <Link className="cc-link-button cc-secondary-button" to="/chat">Ir al chat</Link>
        </div>
      </header>
      {error && <p className="cc-alert" role="alert">{error}</p>}
      {loading ? <section className="cc-panel"><p className="cc-muted">Cargando contratos…</p></section> : contracts.length === 0 ? (
        <EmptyState
          title="Aún no tienes contratos"
          description="Los contratos aparecen cuando se acepta una propuesta. Mientras tanto, explora oportunidades o revisa tus conversaciones."
          actionLabel={user?.rol === "freelancer" ? "Explorar proyectos" : "Explorar talento"}
          to={user?.rol === "freelancer" ? "/dashboard/freelancer/ofertas" : "/talento"}
          secondary={<Link className="cc-link-button cc-secondary-button" to="/chat">Ir a mensajes</Link>}
        />
      ) : (
        <div className="cc-contract-list">
          {contracts.map((contract) => (
            <article className="cc-panel cc-contract-card" key={contract.id}>
              <div className="cc-contract-heading">
                <div>
                  <p className="cc-eyebrow">CONTRATO #{contract.id}</p>
                  <h2>{formatMoney(contract.montoAcordado)}</h2>
                  <Counterparty contract={contract} />
                </div>
                <span className={`cc-status ${isActive(contract.estado) ? "cc-status-active" : ""}`}>{statusLabel(contract.estado)}</span>
              </div>
              <p>{contractStateDescription(contract)}</p>
              <p className="cc-muted">{contract.contexto?.tipo ?? "Acuerdo"} · Inicio: {formatDate(contract.fechaInicio)}</p>
              <div className="cc-actions">
                <Link className="cc-secondary-button cc-link-button" to={`/contracts/${contract.id}`}>Ver detalle</Link>
                {isPendingPayment(contract.estado) && (
                  <button className="cc-danger-button" type="button" disabled={busyId === contract.id} onClick={() => setContractToCancel(contract)}>Cancelar</button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      <ConfirmDialog
        open={contractToCancel !== null}
        title="Cancelar contrato"
        description={`¿Quieres cancelar el contrato${contractToCancel ? ` #${contractToCancel.id}` : ""}? Esta acción cambiará su estado y no se puede deshacer desde aquí.`}
        confirmLabel="Cancelar contrato"
        tone="danger"
        loading={contractToCancel !== null && busyId === contractToCancel.id}
        onConfirm={() => void confirmCancel()}
        onCancel={() => setContractToCancel(null)}
      />
    </main>
  );
}

interface RatingState extends RespuestaListadoCalificaciones {}

export function ContractDetailPage({ contractId }: { contractId?: number }) {
  const { token, user } = useAuth();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const parsed = Number(params.contractId);
  const id = contractId ?? (Number.isInteger(parsed) && parsed > 0 ? parsed : undefined);
  const [contract, setContract] = useState<Contrato | null>(null);
  const [pago, setPago] = useState<PagoEscrow | null>(null);
  const [ratings, setRatings] = useState<RatingState | null>(null);
  const [entregas, setEntregas] = useState<EntregaContrato[]>([]);
  const [disputas, setDisputas] = useState<DisputaContrato[]>([]);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeMotivo, setDisputeMotivo] = useState("");
  const [disputeDescripcion, setDisputeDescripcion] = useState("");
  const [disputeEvidencia, setDisputeEvidencia] = useState("");
  const [deliveryMensaje, setDeliveryMensaje] = useState("");
  const [deliveryArchivo, setDeliveryArchivo] = useState("");
  const [deliveryEnlace, setDeliveryEnlace] = useState("");
  const [editingEntregaId, setEditingEntregaId] = useState<number | null>(null);
  const [rejectObservacion, setRejectObservacion] = useState("");
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [score, setScore] = useState("5");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [deliveryBusy, setDeliveryBusy] = useState(false);
  const [payBusy, setPayBusy] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Al volver de Mercado Pago la URL trae parámetros de la pasarela
  // (payment_id, collection_id, status...). Mientras el webhook confirma,
  // consultamos el pago cada pocos segundos.
  const volvioDePasarela = ["payment_id", "collection_id", "status", "preference_id"].some(
    (clave) => searchParams.get(clave) !== null,
  );

  useEffect(() => {
    if (!token || !id) {
      setLoading(false);
      setError("No se encontró el ID del contrato.");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError("");
    Promise.all([
      getContract(token, id),
      getContractRatings(token, id),
      consultarPagoContrato(token, id).catch(() => null),
      getContractDeliveries(token, id).catch(() => null),
      getContractDisputes(token, id).catch(() => null),
    ])
      .then(([details, ratingList, pagoContrato, entregasContrato, disputasContrato]) => {
        if (cancelled) return;
        setContract(details);
        setRatings(ratingList);
        setPago(pagoContrato);
        setEntregas(entregasContrato?.entregas ?? []);
        setDisputas(disputasContrato?.disputas ?? []);
      })
      .catch((requestError: unknown) => {
        if (!cancelled) setError(errorMessage(requestError, "No se pudo cargar el contrato."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [token, id, refreshKey]);

  useEffect(() => {
    if (!volvioDePasarela || !token || !id) return;
    let intentos = 0;
    pollRef.current = setInterval(() => {
      intentos += 1;
      consultarPagoContrato(token, id)
        .then((actual) => {
          setPago(actual);
          if (actual && actual.estado !== "pendiente") {
            setRefreshKey((key) => key + 1);
          }
        })
        .catch(() => undefined);
      if (intentos >= 20 && pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [volvioDePasarela, token, id]);

  const changeState = async (action: "cancel"): Promise<boolean> => {
    if (!token || !contract || !isPendingPayment(contract.estado)) return false;
    setBusy(true);
    setError("");
    try {
      await cancelContract(token, contract.id);
      setRefreshKey((key) => key + 1);
      return true;
    } catch (requestError) {
      setError(errorMessage(requestError, "No se pudo actualizar el contrato."));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const confirmCancel = async () => {
    if (await changeState("cancel")) setConfirmCancelOpen(false);
  };

  const esFreelancer = user?.rol === "freelancer";
  const esCliente = user?.rol === "cliente";
  const entregaPendiente = entregas.find((entrega) => entrega.estado === "enviada") ?? null;

  const submitEntrega = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !contract || !isActive(contract.estado) || !esFreelancer) return;
    const datos = {
      ...(deliveryMensaje.trim() ? { mensaje: deliveryMensaje.trim() } : {}),
      ...(deliveryArchivo.trim() ? { archivoUrl: deliveryArchivo.trim() } : {}),
      ...(deliveryEnlace.trim() ? { enlaceUrl: deliveryEnlace.trim() } : {}),
    };
    if (!datos.mensaje && !datos.archivoUrl && !datos.enlaceUrl) {
      setError("Debes enviar un mensaje, un archivo o un enlace de entrega.");
      return;
    }
    setDeliveryBusy(true);
    setError("");
    try {
      if (editingEntregaId !== null) {
        await updateDelivery(token, contract.id, editingEntregaId, datos);
      } else {
        await submitDelivery(token, contract.id, datos);
      }
      setDeliveryMensaje("");
      setDeliveryArchivo("");
      setDeliveryEnlace("");
      setEditingEntregaId(null);
      setRefreshKey((key) => key + 1);
    } catch (requestError) {
      setError(errorMessage(requestError, "No se pudo registrar la entrega."));
    } finally {
      setDeliveryBusy(false);
    }
  };

  const empezarEdicionEntrega = (entrega: EntregaContrato) => {
    setEditingEntregaId(entrega.id);
    setDeliveryMensaje(entrega.mensaje ?? "");
    setDeliveryArchivo(entrega.archivoUrl ?? "");
    setDeliveryEnlace(entrega.enlaceUrl ?? "");
  };

  const resolverEntrega = async (accion: "aprobar" | "rechazar") => {
    if (!token || !contract || !entregaPendiente) return;
    if (accion === "rechazar" && rejectObservacion.trim().length < 3) {
      setError("La observación debe tener al menos 3 caracteres.");
      return;
    }
    setDeliveryBusy(true);
    setError("");
    try {
      if (accion === "aprobar") await approveDelivery(token, contract.id);
      else await rejectDelivery(token, contract.id, rejectObservacion.trim());
      setRejectObservacion("");
      setRejectingId(null);
      setRefreshKey((key) => key + 1);
    } catch (requestError) {
      setError(errorMessage(requestError, "No se pudo actualizar la entrega."));
    } finally {
      setDeliveryBusy(false);
    }
  };

  const disputaAbierta = disputas.some((disputa) => disputa.estado === "abierta" || disputa.estado === "en_revision");

  const enviarDisputa = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !contract || !isActive(contract.estado) || disputaAbierta) return;
    const motivo = disputeMotivo.trim();
    const descripcion = disputeDescripcion.trim();
    if (motivo.length < 3 || motivo.length > 120) {
      setError("El motivo debe tener entre 3 y 120 caracteres.");
      return;
    }
    if (descripcion.length < 10 || descripcion.length > 2000) {
      setError("La descripción debe tener entre 10 y 2000 caracteres.");
      return;
    }
    setDeliveryBusy(true);
    setError("");
    try {
      await openDispute(token, contract.id, {
        motivo,
        descripcion,
        ...(disputeEvidencia.trim() ? { evidenciaUrl: disputeEvidencia.trim() } : {}),
      });
      setDisputeOpen(false);
      setDisputeMotivo("");
      setDisputeDescripcion("");
      setDisputeEvidencia("");
      setRefreshKey((key) => key + 1);
    } catch (requestError) {
      setError(errorMessage(requestError, "No se pudo abrir la disputa."));
    } finally {
      setDeliveryBusy(false);
    }
  };

  const startPayment = async () => {
    if (!token || !contract || !isPendingPayment(contract.estado) || user?.rol !== "cliente") return;
    setPayBusy(true);
    setError("");
    try {
      const preferencia = await iniciarPagoContrato(token, contract.id);
      window.location.href = preferencia.initPoint;
    } catch (requestError) {
      setError(errorMessage(requestError, "No se pudo iniciar el pago."));
      setPayBusy(false);
    }
  };

  const submitRating = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !contract || !ratings || !isCompleted(contract.estado) || ratings.miCalificacion !== null) return;
    const puntuacion = Number(score);
    if (!Number.isInteger(puntuacion) || puntuacion < 1 || puntuacion > 5) {
      setError("La puntuación debe estar entre 1 y 5.");
      return;
    }
    if (comment.length > 1000) {
      setError("El comentario no puede superar 1000 caracteres.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await rateContract(token, contract.id, { puntuacion, ...(comment.trim() ? { comentario: comment.trim() } : {}) });
      setComment("");
      setRefreshKey((key) => key + 1);
    } catch (requestError) {
      setError(errorMessage(requestError, "No se pudo registrar la calificación."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="cc-page">
      <header className="cc-header">
        <div>
          <Link className="cc-back-link" to="/contracts">← Contratos</Link>
          <p className="cc-eyebrow">DETALLE DEL ACUERDO</p>
          <h1>{contract ? `Contrato #${contract.id}` : "Contrato"}</h1>
        </div>
        <Link className="cc-link-button cc-secondary-button" to="/chat">Ir al chat</Link>
      </header>
      {error && <p className="cc-alert" role="alert">{error}</p>}
      {volvioDePasarela && (!pago || pago.estado === "pendiente") && (
        <p className="cc-inline-alert" role="status">Estamos confirmando tu pago con la pasarela…</p>
      )}
      {loading ? <section className="cc-panel"><p className="cc-muted">Cargando contrato…</p></section> : contract && (
        <>
          <section className="cc-panel cc-contract-detail">
            <div className="cc-contract-heading">
              <div><p className="cc-eyebrow">MONTO ACORDADO</p><h2>{formatMoney(contract.montoAcordado)}</h2><Counterparty contract={contract} /></div>
              <span className={`cc-status ${isActive(contract.estado) ? "cc-status-active" : ""}`}>{statusLabel(contract.estado)}</span>
            </div>
            <dl className="cc-definition-list">
              <div><dt>Contexto</dt><dd>{contract.contexto.titulo ?? contract.contexto.tipo}</dd></div>
              {contract.contexto.id && <div><dt>{contract.contexto.tipo === "servicio" ? "Servicio" : "Proyecto"}</dt><dd>#{contract.contexto.id}</dd></div>}
              <div><dt>Fecha de inicio</dt><dd>{formatDate(contract.fechaInicio)}</dd></div>
              <div><dt>Fecha de término</dt><dd>{formatDate(contract.fechaFin)}</dd></div>
              <div><dt>Estado</dt><dd>{contractStateDescription(contract)}</dd></div>
            </dl>
            {isPendingPayment(contract.estado) && (
              <div className="cc-actions">
                <button className="cc-danger-button" type="button" disabled={busy} onClick={() => setConfirmCancelOpen(true)}>Cancelar contrato</button>
              </div>
            )}
          </section>

          {(pago !== null || isPendingPayment(contract.estado)) && (
            <section className="cc-panel" aria-labelledby="cc-payment-title">
              <div className="cc-panel-heading">
                <div><p className="cc-eyebrow">PAGO EN ESCROW</p><h2 id="cc-payment-title">Pago del contrato</h2></div>
                {pago && <span className="cc-status">{pagoEstadoLabel(pago.estado)}</span>}
              </div>
              <dl className="cc-definition-list">
                <div><dt>Monto total</dt><dd>{formatMoney(pago?.monto ?? contract.montoAcordado)}</dd></div>
                {pago?.metodoPago && <div><dt>Método de pago</dt><dd>{pago.metodoPago}</dd></div>}
              </dl>
              {pago?.estado === "retenido" && (
                <p className="cc-muted">El dinero está retenido por FirstGig y se libera cuando el cliente apruebe la entrega.</p>
              )}
              {pago?.estado === "reembolsado" && (
                <p className="cc-muted">Este pago fue reembolsado al cliente.</p>
              )}
              {(pago?.estado === "retenido" || pago?.estado === "liberado") && (
                <p className="cc-muted">
                  <Link to="/facturas">Ver comprobante emitido</Link>
                </p>
              )}
              {isPendingPayment(contract.estado) && user?.rol === "cliente" && (
                <div className="cc-actions">
                  <button className="cc-primary-button" type="button" disabled={payBusy} onClick={() => void startPayment()}>
                    {payBusy ? "Redirigiendo…" : `Pagar ${formatMoney(pago?.monto ?? contract.montoAcordado)}`}
                  </button>
                </div>
              )}
              {isPendingPayment(contract.estado) && user?.rol !== "cliente" && (
                <p className="cc-muted">El cliente debe completar el pago para activar el contrato.</p>
              )}
            </section>
          )}

          {isActive(contract.estado) && (
            <section className="cc-panel" aria-labelledby="cc-deliveries-title">
              <div className="cc-panel-heading">
                <div><p className="cc-eyebrow">TRABAJO ENTREGADO</p><h2 id="cc-deliveries-title">Entregas</h2></div>
                {entregaPendiente && <span className="cc-status">En revisión</span>}
              </div>

              {entregaPendiente && esCliente && (
                <div className="cc-delivery-review">
                  <h3>Entrega pendiente de tu revisión</h3>
                  {entregaPendiente.mensaje && <p>{entregaPendiente.mensaje}</p>}
                  {entregaPendiente.archivoUrl && <p><a href={entregaPendiente.archivoUrl} target="_blank" rel="noreferrer">Ver archivo adjunto</a></p>}
                  {entregaPendiente.enlaceUrl && <p><a href={entregaPendiente.enlaceUrl} target="_blank" rel="noreferrer">Abrir enlace de entrega</a></p>}
                  <p className="cc-muted">Enviada el {formatDate(entregaPendiente.fechaEntrega)}</p>
                  {rejectingId === entregaPendiente.id ? (
                    <div className="cc-form">
                      <label>
                        ¿Qué debe corregir el freelancer? <span className="cc-muted">(obligatorio, máx. 1000)</span>
                        <textarea rows={3} maxLength={1000} value={rejectObservacion} onChange={(event) => setRejectObservacion(event.target.value)} />
                      </label>
                      <div className="cc-actions">
                        <button className="cc-primary-button" type="button" disabled={deliveryBusy} onClick={() => void resolverEntrega("rechazar")}>Confirmar rechazo</button>
                        <button className="cc-secondary-button" type="button" disabled={deliveryBusy} onClick={() => { setRejectingId(null); setRejectObservacion(""); }}>Volver</button>
                      </div>
                    </div>
                  ) : (
                    <div className="cc-actions">
                      <button className="cc-primary-button" type="button" disabled={deliveryBusy} onClick={() => void resolverEntrega("aprobar")}>Aprobar entrega y liberar pago</button>
                      <button className="cc-secondary-button" type="button" disabled={deliveryBusy} onClick={() => setRejectingId(entregaPendiente.id)}>Solicitar cambios</button>
                    </div>
                  )}
                </div>
              )}

              {entregaPendiente && esFreelancer && editingEntregaId === null && (
                <>
                  <p className="cc-muted">Tu entrega está en revisión por el cliente desde el {formatDate(entregaPendiente.fechaEntrega)}.</p>
                  <div className="cc-actions">
                    <button className="cc-secondary-button" type="button" onClick={() => empezarEdicionEntrega(entregaPendiente)}>Editar entrega</button>
                  </div>
                </>
              )}

              {esFreelancer && (!entregaPendiente || editingEntregaId !== null) && (
                <form className="cc-form" onSubmit={submitEntrega}>
                  <h3>{editingEntregaId !== null ? "Editar entrega en revisión" : "Enviar entrega al cliente"}</h3>
                  <label>
                    Mensaje <span className="cc-muted">(opcional)</span>
                    <textarea rows={3} maxLength={2000} value={deliveryMensaje} onChange={(event) => setDeliveryMensaje(event.target.value)} placeholder="Resume lo que estás entregando…" />
                  </label>
                  <label>
                    URL del archivo <span className="cc-muted">(opcional)</span>
                    <input type="url" value={deliveryArchivo} onChange={(event) => setDeliveryArchivo(event.target.value)} placeholder="https://…" />
                  </label>
                  <label>
                    Enlace de entrega <span className="cc-muted">(opcional)</span>
                    <input type="url" value={deliveryEnlace} onChange={(event) => setDeliveryEnlace(event.target.value)} placeholder="https://…" />
                  </label>
                  <div className="cc-form-footer">
                    <span className="cc-muted">{deliveryMensaje.length}/2000</span>
                    <div className="cc-actions">
                      {editingEntregaId !== null && (
                        <button className="cc-secondary-button" type="button" disabled={deliveryBusy} onClick={() => { setEditingEntregaId(null); setDeliveryMensaje(""); setDeliveryArchivo(""); setDeliveryEnlace(""); }}>Cancelar edición</button>
                      )}
                      <button className="cc-primary-button" type="submit" disabled={deliveryBusy}>{deliveryBusy ? "Guardando…" : editingEntregaId !== null ? "Guardar cambios" : "Enviar entrega"}</button>
                    </div>
                  </div>
                </form>
              )}

              {!entregaPendiente && esCliente && entregas.length === 0 && (
                <p className="cc-muted">El freelancer aún no ha enviado la entrega. Te avisaremos cuando la envíe.</p>
              )}

              {entregas.length > 0 && (
                <ul className="cc-rating-list">
                  {entregas.map((entrega) => (
                    <li key={entrega.id}>
                      <div className="cc-rating-heading">
                        <strong>{entrega.estado === "aprobada" ? "Aprobada" : entrega.estado === "rechazada" ? "Cambios solicitados" : "En revisión"}</strong>
                        <time>{formatDate(entrega.fechaEntrega)}</time>
                      </div>
                      {entrega.mensaje && <p>{entrega.mensaje}</p>}
                      {entrega.enlaceUrl && <p><a href={entrega.enlaceUrl} target="_blank" rel="noreferrer">Abrir enlace</a></p>}
                      {entrega.archivoUrl && <p><a href={entrega.archivoUrl} target="_blank" rel="noreferrer">Ver archivo</a></p>}
                      {entrega.estado === "rechazada" && entrega.observacionRevision && <p className="cc-muted">Observación: {entrega.observacionRevision}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {isActive(contract.estado) && (
            <section className="cc-panel" aria-labelledby="cc-disputes-title">
              <div className="cc-panel-heading">
                <div><p className="cc-eyebrow">RESOLUCIÓN DE CONFLICTOS</p><h2 id="cc-disputes-title">Disputas</h2></div>
                {disputaAbierta && <span className="cc-status">En revisión por moderación</span>}
              </div>

              {disputaAbierta ? (
                <p className="cc-muted">Este contrato tiene una disputa abierta. Un moderador de FirstGig la está revisando y te contactará por notificaciones.</p>
              ) : disputeOpen ? (
                <form className="cc-form" onSubmit={enviarDisputa}>
                  <h3>Abrir disputa</h3>
                  <p className="cc-muted">Describe el problema con el otro participante. Un moderador revisará el caso y decidirá la resolución del pago en escrow.</p>
                  <label>
                    Motivo <span className="cc-muted">(3-120 caracteres)</span>
                    <input type="text" required minLength={3} maxLength={120} value={disputeMotivo} onChange={(event) => setDisputeMotivo(event.target.value)} placeholder="Ej. El cliente no aprueba la entrega" />
                  </label>
                  <label>
                    Descripción <span className="cc-muted">(10-2000 caracteres)</span>
                    <textarea rows={4} required minLength={10} maxLength={2000} value={disputeDescripcion} onChange={(event) => setDisputeDescripcion(event.target.value)} placeholder="Explica qué pasó, cuándo y qué esperabas…" />
                  </label>
                  <label>
                    URL de evidencia <span className="cc-muted">(opcional)</span>
                    <input type="url" value={disputeEvidencia} onChange={(event) => setDisputeEvidencia(event.target.value)} placeholder="https://…" />
                  </label>
                  <div className="cc-actions">
                    <button className="cc-primary-button" type="submit" disabled={deliveryBusy}>{deliveryBusy ? "Enviando…" : "Enviar disputa a moderación"}</button>
                    <button className="cc-secondary-button" type="button" disabled={deliveryBusy} onClick={() => setDisputeOpen(false)}>Cancelar</button>
                  </div>
                </form>
              ) : (
                <div className="cc-actions">
                  <button className="cc-secondary-button" type="button" onClick={() => setDisputeOpen(true)}>Solicitar revisión de un moderador</button>
                </div>
              )}

              {disputas.length > 0 && (
                <ul className="cc-rating-list">
                  {disputas.map((disputa) => (
                    <li key={disputa.id}>
                      <div className="cc-rating-heading">
                        <strong>{disputa.motivo}</strong>
                        <time>{formatDate(disputa.fechaApertura)}</time>
                      </div>
                      <p>{disputa.descripcion}</p>
                      <p className="cc-muted">
                        Estado: {disputa.estado === "abierta" ? "Abierta" : disputa.estado === "en_revision" ? "En revisión" : disputa.estado === "resuelta" ? "Resuelta" : "Rechazada"}
                        {disputa.resolucion ? ` · Resolución: ${disputa.resolucion}` : ""}
                      </p>
                      {disputa.evidenciaUrl && <p><a href={disputa.evidenciaUrl} target="_blank" rel="noreferrer">Ver evidencia</a></p>}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          <section className="cc-panel" aria-labelledby="cc-ratings-title">
            <div className="cc-panel-heading"><div><p className="cc-eyebrow">OPINIONES</p><h2 id="cc-ratings-title">Calificaciones</h2></div><span className="cc-muted">{ratings?.total ?? 0}</span></div>
            {!ratings ? <p className="cc-muted">No se pudieron mostrar las calificaciones.</p> : ratings.calificaciones.length === 0 ? (
              <p className="cc-empty">Todavía no hay calificaciones para este contrato.</p>
            ) : (
              <ul className="cc-rating-list">
                {ratings.calificaciones.map((rating: Calificacion) => (
                  <li key={rating.id}>
                    <div className="cc-rating-heading"><strong aria-label={`${rating.puntuacion} de 5 estrellas`}>{"★".repeat(Math.max(0, Math.min(5, rating.puntuacion)))}{"☆".repeat(Math.max(0, 5 - rating.puntuacion))}</strong><time>{formatDate(rating.fecha)}</time></div>
                    {rating.comentario && <p>{rating.comentario}</p>}
                  </li>
                ))}
              </ul>
            )}
            {contract && ratings && isCompleted(contract.estado) && ratings.miCalificacion === null && (
              <form className="cc-form cc-rating-form" onSubmit={submitRating}>
                <h3>Deja tu calificación</h3>
                <label>
                  Puntuación
                  <select value={score} onChange={(event) => setScore(event.target.value)}>
                    <option value="5">5 — Excelente</option>
                    <option value="4">4 — Muy bien</option>
                    <option value="3">3 — Bien</option>
                    <option value="2">2 — Regular</option>
                    <option value="1">1 — Necesita mejorar</option>
                  </select>
                </label>
                <label>
                  Comentario <span className="cc-muted">(opcional, máximo 1000 caracteres)</span>
                  <textarea rows={4} maxLength={1000} value={comment} onChange={(event) => setComment(event.target.value)} />
                </label>
                <div className="cc-form-footer"><span className="cc-muted">{comment.length}/1000</span><button className="cc-primary-button" type="submit" disabled={busy}>Publicar calificación</button></div>
              </form>
            )}
            {ratings?.miCalificacion && <p className="cc-inline-alert">Ya registraste tu calificación para este contrato. No se puede editar.</p>}
            {contract && !isCompleted(contract.estado) && <p className="cc-muted">Podrás calificar cuando el contrato esté completado.</p>}
          </section>
        </>
      )}
      <ConfirmDialog
        open={confirmCancelOpen}
        title="Cancelar contrato"
        description={`¿Quieres cancelar el contrato${contract ? ` #${contract.id}` : ""}? Esta acción cambiará su estado y no se puede deshacer desde aquí.`}
        confirmLabel="Cancelar contrato"
        tone="danger"
        loading={busy}
        onConfirm={() => void confirmCancel()}
        onCancel={() => setConfirmCancelOpen(false)}
      />
    </main>
  );
}
