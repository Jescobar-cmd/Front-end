import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import {
  acceptChatOffer,
  counterChatOffer,
  rejectChatOffer,
  type Mensaje,
} from "../../infrastructure/api/apiChat";
import {
  errorMessage,
  formatDate,
  formatMoney,
  isPending,
  statusLabel,
} from "./chatContractsUtils";

interface ChatOfferCardProps {
  message: Mensaje;
  isOwn: boolean;
  token: string | null;
  onChanged: () => void;
}

function isExpired(value: string | null): boolean {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.getTime() < Date.now();
}

export function ChatOfferCard({ message, isOwn, token, onChanged }: ChatOfferCardProps) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState<"accept" | "reject" | "counter" | null>(null);
  const [error, setError] = useState("");
  const [counterOpen, setCounterOpen] = useState(false);
  const [confirmAcceptOpen, setConfirmAcceptOpen] = useState(false);
  const [counterAmount, setCounterAmount] = useState("");
  const [counterDescription, setCounterDescription] = useState("");
  const offer = message.oferta;

  if (!offer) return null;

  const pending = isPending(offer.estado);
  const expired = pending && isExpired(offer.fechaExpiracion);
  const canRespond = pending && !expired && !isOwn && Boolean(token);
  const visibleState = expired ? "expirada" : offer.estado;

  const accept = async () => {
    if (!token || busy) return;
    setBusy("accept");
    setError("");
    try {
      const result = await acceptChatOffer(token, offer.id);
      onChanged();
      setConfirmAcceptOpen(false);
      navigate(result.contrato?.id ? `/contracts/${result.contrato.id}` : "/contracts");
    } catch (cause) {
      setError(errorMessage(cause, "No se pudo aceptar la oferta."));
    } finally {
      setBusy(null);
    }
  };

  const reject = async () => {
    if (!token || busy) return;
    setBusy("reject");
    setError("");
    try {
      await rejectChatOffer(token, offer.id);
      onChanged();
    } catch (cause) {
      setError(errorMessage(cause, "No se pudo rechazar la oferta."));
    } finally {
      setBusy(null);
    }
  };

  const counter = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || busy) return;
    const amount = Number(counterAmount.replace(",", "."));
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Ingresa un monto mayor que 0.");
      return;
    }

    setBusy("counter");
    setError("");
    try {
      await counterChatOffer(token, offer.id, {
        monto: amount,
        descripcion: counterDescription.trim() || undefined,
      });
      setCounterOpen(false);
      setCounterAmount("");
      setCounterDescription("");
      onChanged();
    } catch (cause) {
      setError(errorMessage(cause, "No se pudo enviar la contraoferta."));
    } finally {
      setBusy(null);
    }
  };

  return (
    <article className={`cc-offer-card cc-offer-card--chat${expired ? " is-expired" : ""}`}>
      <div className="cc-offer-heading">
        <span className="cc-offer-kind">{isOwn ? "Tu oferta" : "Oferta recibida"}</span>
        <span
          className={`cc-status cc-status--${visibleState}${
            visibleState === "aceptada" ? " cc-status-active" : ""
          }`}
        >
          {statusLabel(visibleState)}
        </span>
      </div>

      <p className="cc-offer-amount">{formatMoney(offer.monto)}</p>
      {offer.descripcion && <p className="cc-offer-description">{offer.descripcion}</p>}
      {offer.fechaExpiracion && (
        <p className="cc-offer-meta">
          {expired ? "Venció el " : "Vence el "}
          {formatDate(offer.fechaExpiracion)}
        </p>
      )}

      {pending && !expired && isOwn && (
        <p className="cc-offer-meta">Esperando la respuesta del otro participante.</p>
      )}
      {offer.estado === "aceptada" && (
        <p className="cc-offer-meta">Oferta aceptada. El contrato ya está disponible.</p>
      )}
      {offer.estado === "rechazada" && <p className="cc-offer-meta">Oferta rechazada.</p>}
      {offer.estado === "contraofertada" && (
        <p className="cc-offer-meta">Esta oferta recibió una contraoferta.</p>
      )}
      {expired && <p className="cc-offer-meta">Esta oferta venció sin respuesta.</p>}

      {canRespond && (
        <div className="cc-offer-actions">
          <button
            className="cc-primary-button"
            type="button"
            onClick={() => {
              setError("");
              setConfirmAcceptOpen(true);
            }}
            disabled={busy !== null}
          >
            Aceptar
          </button>
          <button
            className="cc-secondary-button"
            type="button"
            onClick={() => void reject()}
            disabled={busy !== null}
          >
            {busy === "reject" ? "Rechazando…" : "Rechazar"}
          </button>
          <button
            className="cc-text-button"
            type="button"
            onClick={() => {
              setCounterOpen((current) => !current);
              setCounterAmount(String(offer.monto));
              setError("");
            }}
            disabled={busy !== null}
            aria-expanded={counterOpen}
          >
            {counterOpen ? "Cancelar contraoferta" : "Contraofertar"}
          </button>
        </div>
      )}

      {counterOpen && canRespond && (
        <form className="cc-offer-counter" onSubmit={(event) => void counter(event)}>
          <label>
            <span>Nuevo monto</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              value={counterAmount}
              onChange={(event) => setCounterAmount(event.target.value)}
              disabled={busy !== null}
              required
            />
          </label>
          <label>
            <span>Detalle (opcional)</span>
            <input
              type="text"
              maxLength={1000}
              value={counterDescription}
              onChange={(event) => setCounterDescription(event.target.value)}
              disabled={busy !== null}
              placeholder="Qué incluye tu propuesta"
            />
          </label>
          <button className="cc-primary-button" type="submit" disabled={busy !== null}>
            {busy === "counter" ? "Enviando…" : "Enviar contraoferta"}
          </button>
        </form>
      )}

      {error && (
        <p className="cc-chat-status cc-chat-status--error" role="alert">
          {error}
        </p>
      )}
      <ConfirmDialog
        open={confirmAcceptOpen}
        title="Aceptar oferta"
        description={`¿Quieres aceptar la oferta de ${formatMoney(offer.monto)}? El sistema creará el contrato y te llevará a su detalle.`}
        confirmLabel="Aceptar oferta"
        loading={busy === "accept"}
        onConfirm={() => void accept()}
        onCancel={() => setConfirmAcceptOpen(false)}
      >
        {confirmAcceptOpen && error ? <p role="alert">{error}</p> : null}
      </ConfirmDialog>
    </article>
  );
}
