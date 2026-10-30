import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  acceptChatOffer,
  counterChatOffer,
  createConversation,
  getConversation,
  getConversations,
  getMessages,
  markRead,
  rejectChatOffer,
  sendChatOffer,
  sendMessage,
} from "../../infrastructure/api/apiChat";
import type { Conversacion, DatosConversacion, Mensaje } from "../../infrastructure/api/apiChat";
import { errorMessage, formatDate, formatMoney, isPending, statusLabel } from "./chatContractsUtils";
import "./chat-contracts.css";

type ContextKind = "service" | "project-freelancer" | "project";

export interface ChatPageProps {
  isProjectClosed?: (projectId: number) => boolean;
}

export interface ConversationDetailPageProps extends ChatPageProps {
  conversationId?: number;
  canRespondToOffer?: (
    message: Mensaje,
    conversation: Conversacion,
    userId: number | string | undefined,
  ) => boolean;
}

interface OfferFields {
  amount: string;
  description: string;
  expiresAt: string;
}

const EMPTY_OFFER: OfferFields = { amount: "", description: "", expiresAt: "" };

function parseId(value: string | undefined): number | undefined {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function offerPayload(fields: OfferFields): { monto: number; descripcion?: string; fechaExpiracion?: string } {
  const amount = Number(fields.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Ingresa un monto mayor que cero.");
  if (fields.expiresAt) {
    const expiration = new Date(fields.expiresAt);
    if (Number.isNaN(expiration.getTime()) || expiration.getTime() <= Date.now()) {
      throw new Error("La fecha de expiración debe ser futura.");
    }
    return {
      monto: amount,
      ...(fields.description.trim() ? { descripcion: fields.description.trim() } : {}),
      fechaExpiracion: expiration.toISOString(),
    };
  }
  return {
    monto: amount,
    ...(fields.description.trim() ? { descripcion: fields.description.trim() } : {}),
  };
}

export function ChatPage({ isProjectClosed }: ChatPageProps) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [kind, setKind] = useState<ContextKind>("service");
  const [serviceId, setServiceId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [freelancerId, setFreelancerId] = useState("");

  const refresh = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const result = await getConversations(token);
      setConversations(result.conversaciones);
    } catch (requestError) {
      setError(errorMessage(requestError, "No se pudieron cargar las conversaciones."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // Load once when the authenticated session becomes available.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const create = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    const context: DatosConversacion = {};
    if (kind === "service") {
      const id = parseId(serviceId);
      if (!id) return setError("Ingresa un ID de servicio válido.");
      context.servicioId = id;
    } else {
      const project = parseId(projectId);
      if (!project) return setError("Ingresa un ID de proyecto válido.");
      if (isProjectClosed?.(project)) return setError("Este proyecto está cerrado y no admite nuevas conversaciones.");
      context.proyectoId = project;
      if (kind === "project-freelancer") {
        const freelancer = parseId(freelancerId);
        if (!freelancer) return setError("Ingresa un ID de freelancer válido.");
        context.freelancerId = freelancer;
      }
    }

    setCreating(true);
    setError("");
    try {
      const result = await createConversation(token, context);
      await refresh();
      navigate(`/chat/${result.conversacion.id}`);
    } catch (requestError) {
      setError(errorMessage(requestError, "No se pudo crear la conversación."));
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="cc-page">
      <header className="cc-header">
        <div>
          <p className="cc-eyebrow">MENSAJES</p>
          <h1>Conversaciones</h1>
          <p className="cc-subtitle">Coordina el trabajo y acuerda los detalles de forma directa.</p>
        </div>
        <Link className="cc-link-button cc-secondary-button" to="/contracts">Mis contratos</Link>
      </header>

      <div className="cc-chat-grid">
        <section className="cc-panel" aria-labelledby="cc-conversations-title">
          <div className="cc-panel-heading">
            <h2 id="cc-conversations-title">Tu actividad</h2>
            <button type="button" className="cc-text-button" onClick={() => void refresh()} disabled={loading}>
              Actualizar
            </button>
          </div>
          {error && <p className="cc-alert" role="alert">{error}</p>}
          {loading ? <p className="cc-muted">Cargando conversaciones…</p> : conversations.length === 0 ? (
            <p className="cc-empty">Todavía no tienes conversaciones.</p>
          ) : (
            <ul className="cc-conversation-list">
              {conversations.map((conversation) => (
                <li key={conversation.id}>
                  <Link className="cc-conversation-link" to={`/chat/${conversation.id}`}>
                    <span className="cc-avatar" aria-hidden="true">{conversation.contraparte.nombre.slice(0, 1).toLocaleUpperCase()}</span>
                    <span className="cc-conversation-copy">
                      <strong>{conversation.contraparte.nombre}</strong>
                      <span>{conversation.ultimoMensaje?.contenido ?? "Inicia una conversación"}</span>
                      <small>{conversation.ultimoMensaje ? formatDate(conversation.ultimoMensaje.fechaEnvio) : "Sin mensajes"}</small>
                    </span>
                    {!!conversation.noLeidos && <span className="cc-unread">{conversation.noLeidos}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="cc-panel" aria-labelledby="cc-new-conversation-title">
          <p className="cc-eyebrow">NUEVO CONTACTO</p>
          <h2 id="cc-new-conversation-title">Crear conversación</h2>
          <p className="cc-muted">Elige uno de los contextos admitidos por First Gig.</p>
          <form className="cc-form" onSubmit={create}>
            <label>
              Contexto
              <select value={kind} onChange={(event) => setKind(event.target.value as ContextKind)}>
                <option value="service">Servicio</option>
                <option value="project-freelancer">Proyecto con freelancer</option>
                <option value="project">Proyecto</option>
              </select>
            </label>
            {kind === "service" ? (
              <label>
                ID del servicio
                <input type="number" min="1" step="1" required value={serviceId} onChange={(event) => setServiceId(event.target.value)} />
              </label>
            ) : (
              <>
                <label>
                  ID del proyecto
                  <input type="number" min="1" step="1" required value={projectId} onChange={(event) => setProjectId(event.target.value)} />
                </label>
                {kind === "project-freelancer" && (
                  <label>
                    ID del freelancer
                    <input type="number" min="1" step="1" required value={freelancerId} onChange={(event) => setFreelancerId(event.target.value)} />
                  </label>
                )}
                {parseId(projectId) && isProjectClosed?.(Number(projectId)) && (
                  <p className="cc-alert" role="status">Este proyecto está cerrado.</p>
                )}
              </>
            )}
            {error && <p className="cc-alert" role="alert">{error}</p>}
            <button className="cc-primary-button" type="submit" disabled={creating || (!!parseId(projectId) && !!isProjectClosed?.(Number(projectId)) && kind !== "service")}>
              {creating ? "Creando…" : "Crear conversación"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

export function ConversationDetailPage({
  conversationId,
  isProjectClosed,
  canRespondToOffer,
}: ConversationDetailPageProps) {
  const { token, user } = useAuth();
  const routeParams = useParams();
  const id = conversationId ?? parseId(routeParams.conversationId);
  const canRespond = canRespondToOffer ?? ((
    message: Mensaje,
    _conversation: Conversacion,
    userId: number | string | undefined,
  ) => String(message.emisorId) !== String(userId));
  const [conversation, setConversation] = useState<Conversacion | null>(null);
  const [messages, setMessages] = useState<Mensaje[]>([]);
  const [messageText, setMessageText] = useState("");
  const [offer, setOffer] = useState<OfferFields>(EMPTY_OFFER);
  const [counterOffers, setCounterOffers] = useState<Record<number, OfferFields>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pollError, setPollError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const cursorRef = useRef<number | null>(null);
  const latestMessageRef = useRef<number | null>(null);

  useEffect(() => {
    if (!token || !id) {
      setLoading(false);
      setError("No se encontró el ID de la conversación.");
      return;
    }
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    let inFlight = false;
    let failures = 0;
    let needsInitial = true;
    cursorRef.current = null;
    latestMessageRef.current = null;
    setLoading(true);
    setError("");
    setPollError("");

    const poll = async (initial: boolean) => {
      if (inFlight || stopped) return;
      inFlight = true;
      let readFailed = false;
      try {
        if (initial) {
          const [details, result] = await Promise.all([getConversation(token, id), getMessages(token, id)]);
          if (stopped) return;
          setConversation(details);
          setMessages(result.mensajes);
          cursorRef.current = result.ultimoId;
          needsInitial = false;
          const latest = result.mensajes.length ? result.mensajes[result.mensajes.length - 1].id : null;
          latestMessageRef.current = latest;
          setLoading(false);
          if (latest !== null) {
            try {
              await markRead(token, id);
            } catch (readError) {
              readFailed = true;
              setPollError(errorMessage(readError, "No se pudo marcar la conversación como leída."));
            }
          }
        } else {
          const result = await getMessages(token, id, cursorRef.current ?? undefined);
          if (stopped) return;
          cursorRef.current = result.ultimoId;
          if (result.mensajes.length) {
            setMessages((current) => {
              const known = new Set(current.map((message) => message.id));
              return [...current, ...result.mensajes.filter((message) => !known.has(message.id))];
            });
            const latest = result.mensajes[result.mensajes.length - 1].id;
            latestMessageRef.current = latest;
            try {
              await markRead(token, id);
            } catch (readError) {
              readFailed = true;
              setPollError(errorMessage(readError, "No se pudo marcar la conversación como leída."));
            }
          }
        }
        failures = 0;
        if (!stopped && !readFailed) setPollError("");
      } catch (requestError) {
        failures += 1;
        if (initial) {
          setLoading(false);
          setError(errorMessage(requestError, "No se pudo cargar la conversación."));
        } else {
          failures += 1;
          setPollError(errorMessage(requestError, "No se pudieron actualizar los mensajes."));
        }
      } finally {
        inFlight = false;
        if (!stopped) {
          const delay = failures ? Math.min(30_000, 4_000 * (2 ** Math.min(failures - 1, 3))) : 4_000;
          timer = setTimeout(() => void poll(needsInitial), delay);
        }
      }
    };

    void poll(true);
    const onFocus = () => {
      if (document.visibilityState === "visible" && latestMessageRef.current !== null) {
        void markRead(token, id).catch((readError) => {
          setPollError(errorMessage(readError, "No se pudo marcar la conversación como leída."));
        });
      }
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      stopped = true;
      clearTimeout(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [token, id, refreshKey]);

  const submitMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !id || !messageText.trim()) return;
    setBusy(true);
    setError("");
    try {
      await sendMessage(token, id, { contenido: messageText.trim() });
      setMessageText("");
      setRefreshKey((key) => key + 1);
    } catch (requestError) {
      setError(errorMessage(requestError, "No se pudo enviar el mensaje."));
    } finally {
      setBusy(false);
    }
  };

  const submitOffer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !id) return;
    setBusy(true);
    setError("");
    try {
      await sendChatOffer(token, id, offerPayload(offer));
      setOffer(EMPTY_OFFER);
      setRefreshKey((key) => key + 1);
    } catch (requestError) {
      setError(errorMessage(requestError, "No se pudo enviar la oferta."));
    } finally {
      setBusy(false);
    }
  };

  const respond = async (message: Mensaje, action: "accept" | "reject" | "counter") => {
    if (!token || !message.oferta) return;
    setBusy(true);
    setError("");
    try {
      if (action === "accept") await acceptChatOffer(token, message.oferta.id);
      if (action === "reject") await rejectChatOffer(token, message.oferta.id);
      if (action === "counter") {
        await counterChatOffer(token, message.oferta.id, offerPayload(counterOffers[message.id] ?? EMPTY_OFFER));
      }
      setRefreshKey((key) => key + 1);
    } catch (requestError) {
      setError(errorMessage(requestError, "No se pudo actualizar la oferta."));
    } finally {
      setBusy(false);
    }
  };

  if (!id) return <main className="cc-page"><p className="cc-alert" role="alert">No se encontró el ID de la conversación.</p></main>;
  return (
    <main className="cc-page">
      <header className="cc-header">
        <div>
          <Link className="cc-back-link" to="/chat">← Conversaciones</Link>
          <p className="cc-eyebrow">CHAT DIRECTO</p>
          <h1>{conversation?.contraparte.nombre ?? "Conversación"}</h1>
          <p className="cc-subtitle">Mensajes sincronizados automáticamente cada 4 segundos.</p>
        </div>
        <Link className="cc-link-button cc-secondary-button" to="/contracts">Mis contratos</Link>
      </header>
      {error && <p className="cc-alert" role="alert">{error}</p>}
      {loading ? <section className="cc-panel"><p className="cc-muted">Cargando conversación…</p></section> : (
        <section className="cc-panel cc-chat-detail">
          {pollError && <p className="cc-inline-alert" role="status">{pollError}</p>}
          {conversation?.contexto && (
            <p className="cc-context-label">
              {conversation.contexto.tipo}
              {conversation.contexto.titulo ? ` · ${conversation.contexto.titulo}` : ""}
              {conversation.contexto.id ? ` (#${conversation.contexto.id})` : ""}
            </p>
          )}
          <div className="cc-message-list" aria-live="polite">
            {messages.length === 0 ? <p className="cc-empty">Aún no hay mensajes. Puedes comenzar aquí.</p> : messages.map((message) => (
              <article className="cc-message" key={message.id}>
                <div className="cc-message-meta"><span>Mensaje</span><time>{formatDate(message.fechaEnvio)}</time></div>
                {message.contenido && <p>{message.contenido}</p>}
                {message.oferta && (
                  <div className="cc-offer-card">
                    <div className="cc-offer-heading"><strong>Propuesta · {formatMoney(message.oferta.monto)}</strong><span className="cc-status">{statusLabel(message.oferta.estado)}</span></div>
                    {message.oferta.descripcion && <p>{message.oferta.descripcion}</p>}
                    {message.oferta.fechaExpiracion && <small>Vence: {formatDate(message.oferta.fechaExpiracion)}</small>}
                    {isPending(message.oferta.estado) && canRespond(message, conversation!, user?.id) && (
                      <div className="cc-offer-actions">
                        <button className="cc-primary-button" type="button" disabled={busy} onClick={() => void respond(message, "accept")}>Aceptar</button>
                        <button className="cc-danger-button" type="button" disabled={busy} onClick={() => void respond(message, "reject")}>Rechazar</button>
                        <form className="cc-counter-form" onSubmit={(event) => { event.preventDefault(); void respond(message, "counter"); }}>
                          <label>
                            Contraoferta
                            <input type="number" min="0.01" step="0.01" required value={counterOffers[message.id]?.amount ?? ""} onChange={(event) => setCounterOffers((current) => ({ ...current, [message.id]: { ...(current[message.id] ?? EMPTY_OFFER), amount: event.target.value } }))} placeholder="Monto" />
                          </label>
                          <input aria-label="Descripción de la contraoferta" maxLength={1000} value={counterOffers[message.id]?.description ?? ""} onChange={(event) => setCounterOffers((current) => ({ ...current, [message.id]: { ...(current[message.id] ?? EMPTY_OFFER), description: event.target.value } }))} placeholder="Descripción opcional" />
                          <input aria-label="Expiración opcional de la contraoferta" type="datetime-local" value={counterOffers[message.id]?.expiresAt ?? ""} onChange={(event) => setCounterOffers((current) => ({ ...current, [message.id]: { ...(current[message.id] ?? EMPTY_OFFER), expiresAt: event.target.value } }))} />
                          <button className="cc-secondary-button" type="submit" disabled={busy}>Enviar contraoferta</button>
                        </form>
                      </div>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
          <form className="cc-composer" onSubmit={submitMessage}>
            <label className="cc-visually-hidden" htmlFor="cc-message">Escribe un mensaje</label>
            <textarea id="cc-message" rows={3} maxLength={5000} value={messageText} onChange={(event) => setMessageText(event.target.value)} placeholder="Escribe un mensaje…" required />
            <button className="cc-primary-button" type="submit" disabled={busy || !messageText.trim()}>Enviar mensaje</button>
          </form>
          <details className="cc-offer-details">
            <summary>Enviar una propuesta</summary>
            <form className="cc-form cc-offer-form" onSubmit={submitOffer}>
              <label>
                Monto
                <input type="number" min="0.01" step="0.01" required value={offer.amount} onChange={(event) => setOffer({ ...offer, amount: event.target.value })} />
              </label>
              <label>
                Descripción <span className="cc-muted">(opcional)</span>
                <textarea rows={2} maxLength={1000} value={offer.description} onChange={(event) => setOffer({ ...offer, description: event.target.value })} />
              </label>
              <label>
                Expiración <span className="cc-muted">(opcional, debe ser futura)</span>
                <input type="datetime-local" value={offer.expiresAt} onChange={(event) => setOffer({ ...offer, expiresAt: event.target.value })} />
              </label>
              <button className="cc-secondary-button" type="submit" disabled={busy}>Enviar propuesta</button>
            </form>
          </details>
          {conversation?.contexto?.tipo === "proyecto" && conversation.contexto.id && isProjectClosed?.(conversation.contexto.id) && (
            <p className="cc-inline-alert">El proyecto está cerrado. No se puede iniciar una nueva conversación para este proyecto.</p>
          )}
        </section>
      )}
    </main>
  );
}
