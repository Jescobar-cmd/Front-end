import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  cancelContract,
  completeContract,
  getContract,
  getContractRatings,
  getContracts,
  rateContract,
} from "../../infrastructure/api/apiContratos";
import type { Calificacion, Contrato, RespuestaListadoCalificaciones } from "../../infrastructure/api/apiContratos";
import { errorMessage, formatDate, formatMoney, isActive, isCancelled, isCompleted, statusLabel } from "./chatContractsUtils";
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
  const { token } = useAuth();
  const [contracts, setContracts] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
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

  const changeState = async (contract: Contrato, action: "complete" | "cancel") => {
    if (!token || !isActive(contract.estado)) return;
    setBusyId(contract.id);
    setError("");
    try {
      if (action === "complete") await completeContract(token, contract.id);
      else await cancelContract(token, contract.id);
      setRefreshKey((key) => key + 1);
    } catch (requestError) {
      setError(errorMessage(requestError, "No se pudo actualizar el contrato."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="cc-page">
      <header className="cc-header">
        <div>
          <p className="cc-eyebrow">TRABAJO Y CONFIANZA</p>
          <h1>Contratos</h1>
          <p className="cc-subtitle">Consulta acuerdos, estados y calificaciones.</p>
        </div>
        <Link className="cc-link-button cc-secondary-button" to="/chat">Ir al chat</Link>
      </header>
      {error && <p className="cc-alert" role="alert">{error}</p>}
      {loading ? <section className="cc-panel"><p className="cc-muted">Cargando contratos…</p></section> : contracts.length === 0 ? (
        <section className="cc-panel cc-empty"><h2>Aún no tienes contratos</h2><p>Los contratos aparecerán cuando se acepte una propuesta.</p></section>
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
                {isActive(contract.estado) && (
                  <>
                    <button className="cc-primary-button" type="button" disabled={busyId === contract.id} onClick={() => void changeState(contract, "complete")}>Completar</button>
                    <button className="cc-danger-button" type="button" disabled={busyId === contract.id} onClick={() => void changeState(contract, "cancel")}>Cancelar</button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

interface RatingState extends RespuestaListadoCalificaciones {}

export function ContractDetailPage({ contractId }: { contractId?: number }) {
  const { token } = useAuth();
  const params = useParams();
  const parsed = Number(params.contractId);
  const id = contractId ?? (Number.isInteger(parsed) && parsed > 0 ? parsed : undefined);
  const [contract, setContract] = useState<Contrato | null>(null);
  const [ratings, setRatings] = useState<RatingState | null>(null);
  const [score, setScore] = useState("5");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!token || !id) {
      setLoading(false);
      setError("No se encontró el ID del contrato.");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError("");
    Promise.all([getContract(token, id), getContractRatings(token, id)])
      .then(([details, ratingList]) => {
        if (cancelled) return;
        setContract(details);
        setRatings(ratingList);
      })
      .catch((requestError: unknown) => {
        if (!cancelled) setError(errorMessage(requestError, "No se pudo cargar el contrato."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [token, id, refreshKey]);

  const changeState = async (action: "complete" | "cancel") => {
    if (!token || !contract || !isActive(contract.estado)) return;
    setBusy(true);
    setError("");
    try {
      if (action === "complete") await completeContract(token, contract.id);
      else await cancelContract(token, contract.id);
      setRefreshKey((key) => key + 1);
    } catch (requestError) {
      setError(errorMessage(requestError, "No se pudo actualizar el contrato."));
    } finally {
      setBusy(false);
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
      {loading ? <section className="cc-panel"><p className="cc-muted">Cargando contrato…</p></section> : contract && (
        <>
          <section className="cc-panel cc-contract-detail">
            <div className="cc-contract-heading">
              <div><p className="cc-eyebrow">MONTO ACORDADO</p><h2>{formatMoney(contract.montoAcordado)}</h2><Counterparty contract={contract} /></div>
              <span className={`cc-status ${isActive(contract.estado) ? "cc-status-active" : ""}`}>{statusLabel(contract.estado)}</span>
            </div>
            <dl className="cc-definition-list">
              <div><dt>Contexto</dt><dd>{contract.contexto?.tipo ?? "Sin especificar"}</dd></div>
              {contract.contexto?.proyectoId && <div><dt>Proyecto</dt><dd>#{contract.contexto.proyectoId}</dd></div>}
              {contract.contexto?.servicioId && <div><dt>Servicio</dt><dd>#{contract.contexto.servicioId}</dd></div>}
              <div><dt>Fecha de inicio</dt><dd>{formatDate(contract.fechaInicio)}</dd></div>
              <div><dt>Fecha de término</dt><dd>{formatDate(contract.fechaFin)}</dd></div>
              <div><dt>Estado</dt><dd>{contractStateDescription(contract)}</dd></div>
            </dl>
            {isActive(contract.estado) && (
              <div className="cc-actions">
                <button className="cc-primary-button" type="button" disabled={busy} onClick={() => void changeState("complete")}>Completar contrato</button>
                <button className="cc-danger-button" type="button" disabled={busy} onClick={() => void changeState("cancel")}>Cancelar contrato</button>
              </div>
            )}
          </section>

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
    </main>
  );
}
