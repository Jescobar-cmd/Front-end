import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getConversations,
  getConversation,
  getMessages,
  sendMessage,
  markRead,
  type Conversacion,
  type Mensaje,
} from "../../infrastructure/api/apiChat";
import { ChatAvatar } from "./ChatAvatar";
import { ChatContextPanel } from "./ChatContextPanel";
import { ChatOfferCard } from "./ChatOfferCard";
import { roleLabel } from "./chatContractsUtils";
import "./chat-contracts.css";

const MAX_MESSAGE_LENGTH = 2000;

export interface ChatPageProps {
  isProjectClosed?: (projectId: number) => boolean;
}

export interface ConversationDetailPageProps extends ChatPageProps {
  conversationId?: number;
}

function parseId(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function formatTime(value: string | Date): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(value: string | Date): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es", { day: "2-digit", month: "short" });
}

function useConversationList(token?: string | null) {
  const [conversations, setConversations] = useState<Conversacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!token) {
      setConversations([]);
      setError("Tu sesión no está disponible. Inicia sesión para ver tus conversaciones.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await getConversations(token);
      setConversations(response.conversaciones);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudieron cargar las conversaciones. Inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { conversations, loading, error, refresh };
}

function ConversationListPanel({
  conversations,
  loading,
  error,
  onRefresh,
  selectedId,
  explorePath,
}: {
  conversations: Conversacion[];
  loading: boolean;
  error: string;
  onRefresh: () => void;
  selectedId?: number;
  explorePath: string;
}) {
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filteredConversations = conversations.filter((conversation) => {
    const name = conversation.contraparte.nombre.toLocaleLowerCase();
    const preview = conversation.ultimoMensaje?.contenido.toLocaleLowerCase() ?? "";
    return name.includes(normalizedSearch) || preview.includes(normalizedSearch);
  });

  return (
    <aside className="cc-panel cc-conversation-sidebar" aria-label="Lista de conversaciones">
      <div className="cc-conversation-sidebar__heading">
        <h2>Conversaciones</h2>
        <button
          className="cc-quiet-button"
          type="button"
          onClick={onRefresh}
          disabled={loading}
          aria-label="Actualizar conversaciones"
        >
          Actualizar
        </button>
      </div>

      <label className="cc-conversation-search">
        <span className="cc-visually-hidden">Buscar conversaciones</span>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre o mensaje"
          aria-label="Buscar conversaciones"
        />
      </label>

      {error ? (
        <div className="cc-conversation-state" role="alert">
          <p>{error}</p>
          <button className="cc-primary-button" type="button" onClick={onRefresh}>
            Reintentar
          </button>
        </div>
      ) : loading ? (
        <div className="cc-conversation-state" role="status">
          Cargando conversaciones…
        </div>
      ) : conversations.length === 0 ? (
        <div className="cc-conversation-state">
          <p>Aún no tienes conversaciones. Inicia una desde un perfil o servicio.</p>
          <Link className="cc-inline-link" to={explorePath}>
            {explorePath === "/talento" ? "Explorar talento" : "Explorar proyectos"}
          </Link>
        </div>
      ) : filteredConversations.length === 0 ? (
        <div className="cc-conversation-state" role="status">
          No hay conversaciones que coincidan con la búsqueda.
        </div>
      ) : (
        <nav className="cc-conversation-list" aria-label="Conversaciones">
          {filteredConversations.map((conversation) => {
            const lastMessage = conversation.ultimoMensaje;
            const preview = lastMessage
              ? lastMessage.contenido.trim() || "Conversación activa"
              : "Aún no hay mensajes";
            return (
              <Link
                className={`cc-conversation-link${selectedId === conversation.id ? " is-active" : ""}`}
                key={conversation.id}
                to={`/chat/${conversation.id}`}
                aria-current={selectedId === conversation.id ? "page" : undefined}
              >
                <ChatAvatar
                  className="cc-avatar"
                  name={conversation.contraparte.nombre}
                  photo={conversation.contraparte.fotoPerfil}
                />
                <span className="cc-conversation-copy">
                  <strong>{conversation.contraparte.nombre}</strong>
                  <small className="cc-conversation-role">
                    {roleLabel(conversation.contraparte.rol)}
                  </small>
                  <span>{preview}</span>
                </span>
                <span className="cc-conversation-meta">
                  {lastMessage ? formatDate(lastMessage.fechaEnvio) : ""}
                  {(conversation.noLeidos ?? 0) > 0 && (
                    <span className="cc-unread-count" aria-label={`${conversation.noLeidos} sin leer`}>
                      {conversation.noLeidos}
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
        </nav>
      )}
    </aside>
  );
}

function ConversationPlaceholder() {
  return (
    <section className="cc-panel cc-chat-placeholder" aria-label="Vista de conversación">
      <span className="cc-chat-placeholder__mark" aria-hidden="true">
        ✉
      </span>
      <h2>Elige una conversación</h2>
      <p>Selecciona una conversación para leer y enviar mensajes. Las conversaciones se crean desde el perfil de un freelancer o desde una propuesta.</p>
    </section>
  );
}

export function ChatPage() {
  const { user, token } = useAuth();
  const list = useConversationList(token);
  const explorePath = user?.rol === "cliente" ? "/talento" : "/dashboard/freelancer/ofertas";

  return (
    <div className="cc-page cc-chat-page">
      <header className="cc-chat-page__heading">
        <div>
          <h1>Mensajes</h1>
          <p>Tus conversaciones, en un solo lugar.</p>
        </div>
      </header>
      <div className="cc-chat-workspace cc-chat-workspace--list">
        <ConversationListPanel
          conversations={list.conversations}
          loading={list.loading}
          error={list.error}
          onRefresh={() => void list.refresh()}
          explorePath={explorePath}
        />
        <ConversationPlaceholder />
      </div>
    </div>
  );
}

export function ConversationDetailPage({
  conversationId,
}: ConversationDetailPageProps) {
  const params = useParams();
  const id = conversationId ?? parseId(params.conversationId);
  const { user, token } = useAuth();
  const list = useConversationList(token);
  const [conversation, setConversation] = useState<Conversacion | null>(null);
  const [messages, setMessages] = useState<Mensaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [pollError, setPollError] = useState("");
  const [sendError, setSendError] = useState("");
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [contextVersion, setContextVersion] = useState(0);
  const messageListRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<number | undefined>(undefined);
  const latestMessageRef = useRef<number | undefined>(undefined);
  const explorePath = user?.rol === "cliente" ? "/talento" : "/dashboard/freelancer/ofertas";

  useEffect(() => {
    if (!token || !id) {
      setLoadError("No se pudo identificar la conversación. Vuelve a la lista e inténtalo de nuevo.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let inFlight = false;
    let failures = 0;
    let needsInitial = true;
    let hasLoadedConversation = false;

    const poll = async (initial: boolean) => {
      if (cancelled || inFlight) return;
      inFlight = true;
      let readFailed = false;
      try {
        if (initial) {
          const [detail, page] = await Promise.all([
            getConversation(token, id),
            getMessages(token, id, undefined, 50),
          ]);
          if (cancelled) return;
          setConversation(detail);
          setMessages(page.mensajes);
          cursorRef.current = page.ultimoId ?? undefined;
          latestMessageRef.current = page.ultimoId ?? undefined;
          setLoadError("");
          setLoading(false);
          needsInitial = false;
          hasLoadedConversation = true;
          if (
            page.mensajes.some(
              (message) => String(message.emisorId) !== String(user?.id) && !message.leido
            )
          ) {
            try {
              await markRead(token, id);
            } catch (cause) {
              readFailed = true;
              setPollError(
                cause instanceof Error
                  ? cause.message
                  : "No se pudieron marcar los mensajes como leídos."
              );
            }
          }
        } else {
          const page = await getMessages(token, id, cursorRef.current, 50);
          if (cancelled) return;
          if (page.mensajes.length > 0) {
            setMessages((current) => [...current, ...page.mensajes]);
            cursorRef.current = page.ultimoId ?? cursorRef.current;
            latestMessageRef.current = page.ultimoId ?? latestMessageRef.current;
            if (page.mensajes.some((message) => String(message.emisorId) !== String(user?.id))) {
              try {
                await markRead(token, id);
              } catch (cause) {
                readFailed = true;
                setPollError(
                  cause instanceof Error
                    ? cause.message
                    : "No se pudieron marcar los mensajes como leídos."
                );
              }
            }
          }
        }
        failures = 0;
        if (!readFailed) setPollError("");
      } catch (cause) {
        if (cancelled) return;
        if (initial && !hasLoadedConversation) {
          setLoadError(
            cause instanceof Error
              ? cause.message
              : "No se pudo cargar la conversación. Inténtalo de nuevo."
          );
        } else {
          failures += 1;
          setPollError(
            cause instanceof Error
              ? cause.message
              : "No se pudieron actualizar los mensajes. Reintentando…"
          );
        }
      } finally {
        inFlight = false;
        if (!cancelled) {
          const delay = failures > 0 ? Math.min(30000, 2000 * 2 ** (failures - 1)) : 4000;
          timer = setTimeout(() => void poll(needsInitial), delay);
        }
      }
    };

    const onFocus = () => {
      if (document.visibilityState === "visible" && latestMessageRef.current) {
        void markRead(token, id).catch((cause: unknown) => {
          setPollError(
            cause instanceof Error
              ? cause.message
              : "No se pudieron marcar los mensajes como leídos."
          );
        });
      }
    };

    void poll(true);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [token, id, refreshKey, user?.id]);

  useEffect(() => {
    const messageList = messageListRef.current;
    if (messageList) messageList.scrollTop = messageList.scrollHeight;
  }, [messages]);

  const submitMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = messageText.trim();
    if (!content || !token || !id || sending) return;
    if (content.length > MAX_MESSAGE_LENGTH) {
      setSendError(`El mensaje no puede superar los ${MAX_MESSAGE_LENGTH} caracteres.`);
      return;
    }

    setSending(true);
    setSendError("");
    try {
      const sentMessage = await sendMessage(token, id, { contenido: content });
      setMessages((current) =>
        current.some((message) => message.id === sentMessage.id)
          ? current
          : [...current, sentMessage]
      );
      cursorRef.current = Math.max(cursorRef.current ?? 0, sentMessage.id);
      latestMessageRef.current = cursorRef.current;
      setMessageText("");
      void list.refresh();
    } catch (cause) {
      setSendError(
        cause instanceof Error
          ? cause.message
          : "No se pudo enviar el mensaje. Inténtalo de nuevo."
      );
    } finally {
      setSending(false);
    }
  };

  const handleOfferChanged = useCallback(() => {
    setRefreshKey((current) => current + 1);
    setContextVersion((current) => current + 1);
    void list.refresh();
  }, [list.refresh]);

  const handleOfferSent = (sentMessage: Mensaje) => {
    setMessages((current) =>
      current.some((message) => message.id === sentMessage.id)
        ? current
        : [...current, sentMessage]
    );
    cursorRef.current = Math.max(cursorRef.current ?? 0, sentMessage.id);
    latestMessageRef.current = cursorRef.current;
    handleOfferChanged();
  };

  const visibleMessages = messages.filter(
    (message) =>
      Boolean(message.oferta) ||
      (message.tipo.toLocaleLowerCase() === "texto" && message.contenido.trim())
  );
  const ownParticipant = conversation
    ? Object.values(conversation.participantes ?? {}).find(
        (participant) => String(participant.id) === String(user?.id)
      )
    : undefined;
  const conversationContext = conversation
    ? conversation.contexto.tipo === "proyecto"
      ? "Proyecto"
      : conversation.contexto.tipo === "servicio"
        ? "Servicio"
        : "Contacto directo"
    : "";

  return (
    <div className="cc-page cc-chat-page">
      <header className="cc-chat-page__heading">
        <div>
          <Link className="cc-inline-link cc-chat-back" to="/chat">
            ← Volver a conversaciones
          </Link>
          <h1>Mensajes</h1>
        </div>
      </header>

      <div
        className={`cc-chat-workspace cc-chat-workspace--detail${
          conversation ? " cc-chat-workspace--context" : ""
        }`}
      >
        <ConversationListPanel
          conversations={list.conversations}
          loading={list.loading}
          error={list.error}
          onRefresh={() => void list.refresh()}
          selectedId={id}
          explorePath={explorePath}
        />

        <section className="cc-panel cc-message-panel" aria-label="Conversación">
          {loading && !conversation ? (
            <div className="cc-conversation-state" role="status">
              Cargando conversación…
            </div>
          ) : loadError ? (
            <div className="cc-conversation-state" role="alert">
              <p>{loadError}</p>
              <button
                className="cc-primary-button"
                type="button"
                onClick={() => {
                  setLoading(true);
                  setLoadError("");
                  setRefreshKey((current) => current + 1);
                }}
              >
                Reintentar
              </button>
            </div>
          ) : conversation ? (
            <>
              <header className="cc-message-panel__header">
                <ChatAvatar
                  className="cc-avatar"
                  name={conversation.contraparte.nombre}
                  photo={conversation.contraparte.fotoPerfil}
                />
                <div>
                  <h2>{conversation.contraparte.nombre}</h2>
                  <span className="cc-conversation-role">
                    {roleLabel(conversation.contraparte.rol)}
                  </span>
                  <p>
                    {conversationContext}
                    {conversation.contexto.titulo ? ` · ${conversation.contexto.titulo}` : ""}
                  </p>
                </div>
              </header>

              {pollError && (
                <p className="cc-chat-status" role="status">
                  {pollError}
                </p>
              )}

              <div
                className="cc-message-list"
                ref={messageListRef}
                role="log"
                aria-live="polite"
                aria-relevant="additions text"
                aria-label="Mensajes de la conversación"
              >
                {visibleMessages.length === 0 ? (
                  <div className="cc-message-empty">
                    <p>Aún no hay mensajes. Escribe el primero.</p>
                  </div>
                ) : (
                  visibleMessages.map((message) => {
                    const isOwn = String(message.emisorId) === String(user?.id);
                    const senderName = isOwn
                      ? ownParticipant?.nombre ?? user?.nombre ?? "Tú"
                      : conversation.contraparte.nombre;
                    const senderPhoto = isOwn
                      ? ownParticipant?.fotoPerfil
                      : conversation.contraparte.fotoPerfil;
                    const senderRole = isOwn ? roleLabel(user?.rol) : roleLabel(conversation.contraparte.rol);
                    return (
                      <article
                        className={`cc-message-row${isOwn ? " is-own" : ""}`}
                        key={message.id}
                      >
                        {!isOwn && (
                          <ChatAvatar
                            className="cc-message-avatar"
                            name={senderName}
                            photo={senderPhoto}
                          />
                        )}
                        <div
                          className={`cc-message-content${
                            message.oferta ? " cc-message-content--offer" : ""
                          }`}
                        >
                          <div className="cc-message-meta">
                            <span>{senderName}</span>
                            <span className="cc-message-role">{senderRole}</span>
                            <time dateTime={message.fechaEnvio}>
                              {formatTime(message.fechaEnvio)}
                            </time>
                          </div>
                          {message.oferta ? (
                            <ChatOfferCard
                              message={message}
                              isOwn={isOwn}
                              token={token}
                              onChanged={handleOfferChanged}
                            />
                          ) : (
                            <p className="cc-message-bubble">{message.contenido}</p>
                          )}
                        </div>
                        {isOwn && (
                          <ChatAvatar
                            className="cc-message-avatar"
                            name={senderName}
                            photo={senderPhoto}
                          />
                        )}
                      </article>
                    );
                  })
                )}
              </div>

              <form className="cc-message-composer" onSubmit={submitMessage}>
                {sendError && (
                  <p className="cc-chat-status cc-chat-status--error" role="alert">
                    {sendError}
                  </p>
                )}
                <label className="cc-visually-hidden" htmlFor="cc-message-input">
                  Escribe tu mensaje
                </label>
                <textarea
                  id="cc-message-input"
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  placeholder="Escribe tu mensaje…"
                  maxLength={MAX_MESSAGE_LENGTH}
                  rows={2}
                  disabled={!token || sending}
                />
                <div className="cc-message-composer__footer">
                  <span>
                    {messageText.length}/{MAX_MESSAGE_LENGTH}
                  </span>
                  <button
                    className="cc-primary-button"
                    type="submit"
                    disabled={!messageText.trim() || sending || !token}
                  >
                    {sending ? "Enviando…" : "Enviar"}
                  </button>
                </div>
              </form>
            </>
          ) : null}
        </section>

        {conversation && (
          <ChatContextPanel
            token={token}
            conversation={conversation}
            refreshKey={contextVersion}
            onOfferSent={handleOfferSent}
          />
        )}
      </div>
    </div>
  );
}
