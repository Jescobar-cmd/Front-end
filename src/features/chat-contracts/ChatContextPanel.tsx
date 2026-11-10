import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { Oferta } from "../../core/domain/entities/oferta";
import type { ApiError } from "../../infrastructure/api/client";
import { getContracts, type Contrato } from "../../infrastructure/api/apiContratos";
import { getMarketOffer, getMyOffer } from "../../infrastructure/api/apiOfertas";
import { getPublicProfile, type PerfilPublico } from "../../infrastructure/api/apiPerfiles";
import { getService, type Servicio } from "../../infrastructure/api/apiServicios";
import {
  sendChatOffer,
  type ContextoConversacion,
  type Conversacion,
  type Mensaje,
} from "../../infrastructure/api/apiChat";

import {
  errorMessage,
  formatDate,
  formatMoney,
  isActive,
  roleLabel,
  statusLabel,
} from "./chatContractsUtils";

interface ChatContextPanelProps {
  token: string | null;
  conversation: Conversacion;
  refreshKey: number;
  onOfferSent: (message: Mensaje) => void;
}

function findContract(
  contracts: Contrato[],
  contextType: ContextoConversacion["tipo"],
  contextId: number | null,
  userId: number | string | undefined,
  counterpartId: number,
): Contrato | null {
  if (!userId) return null;
  const involved = contracts.filter((contract) => {
    const ids = [String(contract.cliente.id), String(contract.freelancer.id)];
    return ids.includes(String(userId)) && ids.includes(String(counterpartId));
  });
  const matching = involved.filter((contract) => {
    if (contextType === "proyecto" && contextId) return contract.proyectoId === contextId;
    if (contextType === "servicio" && contextId) return contract.servicioId === contextId;
    return contract.contexto.tipo === "ninguno";
  });
  return matching.sort((a, b) => b.id - a.id)[0] ?? null;
}

function contextTitle(context: ContextoConversacion): string {
  if (context.titulo) return context.titulo;
  if (context.tipo === "proyecto") return "Proyecto";
  if (context.tipo === "servicio") return "Servicio";
  return "Contacto directo";
}

export function ChatContextPanel({
  token,
  conversation,
  refreshKey,
  onOfferSent,
}: ChatContextPanelProps) {
  const { user } = useAuth();
  const contextType = conversation.contexto.tipo;
  const contextId = conversation.contexto.id;
  const counterparty = conversation.contraparte;
  const [project, setProject] = useState<Oferta | null>(null);
  const [service, setService] = useState<Servicio | null>(null);
  const [profile, setProfile] = useState<PerfilPublico | null>(null);
  const [contract, setContract] = useState<Contrato | null>(null);
  const [loadingContext, setLoadingContext] = useState(contextType !== "ninguno");
  const [contextError, setContextError] = useState("");
  const [contextCanRetry, setContextCanRetry] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [expiration, setExpiration] = useState("");
  const [sendingOffer, setSendingOffer] = useState(false);
  const [offerError, setOfferError] = useState("");
  const [offerSuccess, setOfferSuccess] = useState("");

  useEffect(() => {
    setAmount("");
    setDescription("");
    setExpiration("");
    setOfferError("");
    setOfferSuccess("");
  }, [conversation.id]);

  useEffect(() => {
    if (!token) {
      setContextError("Tu sesión no está disponible.");
      setLoadingContext(false);
      return;
    }

    let cancelled = false;
    setLoadingContext(contextType !== "ninguno");
    setContextError("");
    setContextCanRetry(true);
    setProject(null);
    setService(null);
    setProfile(null);
    setContract(null);

    const loadContext = async (): Promise<{
      project: Oferta | null;
      service: Servicio | null;
    }> => {
      if (!contextId) return { project: null, service: null };
      if (contextType === "proyecto") {
        const data =
          user?.rol === "cliente"
            ? await getMyOffer(token, contextId)
            : await getMarketOffer(token, contextId);
        return { project: data, service: null };
      }
      if (contextType === "servicio") {
        const data = await getService(token, contextId);
        return { project: null, service: data };
      }
      return { project: null, service: null };
    };

    void (async () => {
      const [contextResult, profileResult, contractsResult] = await Promise.allSettled([
        loadContext(),
        getPublicProfile(token, counterparty.id),
        getContracts(token),
      ]);
      if (cancelled) return;

      if (contextResult.status === "fulfilled") {
        setProject(contextResult.value.project);
        setService(contextResult.value.service);
      } else {
        const status = (contextResult.reason as ApiError).status;
        const projectClosed = contextType === "proyecto" && status === 404;
        setContextCanRetry(!projectClosed);
        setContextError(
          projectClosed
            ? "El proyecto ya no está abierto en el marketplace. Si ya hay un contrato, lo verás más abajo."
            : errorMessage(
                contextResult.reason,
                "No pudimos cargar los detalles de este contexto."
              )
        );
      }

      if (profileResult.status === "fulfilled") setProfile(profileResult.value);
      if (contractsResult.status === "fulfilled") {
        setContract(
          findContract(
            contractsResult.value.contratos,
            contextType,
            contextId,
            user?.id,
            counterparty.id
          )
        );
      }
      setLoadingContext(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [token, contextType, contextId, counterparty.id, user?.id, user?.rol, refreshKey, reloadKey]);

  const submitOffer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || sendingOffer) return;
    const value = Number(amount.replace(",", "."));
    if (!Number.isFinite(value) || value <= 0) {
      setOfferError("Ingresa un monto mayor que 0.");
      return;
    }

    setSendingOffer(true);
    setOfferError("");
    setOfferSuccess("");
    try {
      const message = await sendChatOffer(token, conversation.id, {
        monto: value,
        descripcion: description.trim() || undefined,
        fechaExpiracion: expiration
          ? new Date(`${expiration}T23:59:59`).toISOString()
          : undefined,
      });
      setAmount("");
      setDescription("");
      setExpiration("");
      setOfferSuccess("Oferta enviada. Aparecerá en la conversación.");
      onOfferSent(message);
    } catch (cause) {
      setOfferError(errorMessage(cause, "No se pudo enviar la oferta."));
    } finally {
      setSendingOffer(false);
    }
  };

  const freelancer = profile?.freelancer;
  const client = profile?.cliente;
  const today = new Date().toISOString().slice(0, 10);
  const hasActiveContract = Boolean(contract && isActive(contract.estado));
  const initial = counterparty.nombre.trim().charAt(0).toLocaleUpperCase() || "?";

  return (
    <aside className="cc-panel cc-context-panel" aria-label="Perfil y contexto de la conversación">
      <header className="cc-context-panel__heading">
        <p className="cc-eyebrow">Perfil</p>
        <h2>{counterparty.nombre}</h2>
      </header>

      <section className="cc-context-person cc-context-card" aria-labelledby="cc-context-person-title">
        <div className="cc-context-person__top">
          <span className="cc-avatar cc-avatar--text" aria-hidden="true">{initial}</span>
          <div>
            <h3 id="cc-context-person-title">{counterparty.nombre}</h3>
            <p className="cc-context-role">{roleLabel(counterparty.rol)}</p>
            <p className="cc-context-role cc-context-role--muted">{contextTitle(conversation.contexto)}</p>
          </div>
        </div>

        {freelancer && (
          <>
            {freelancer.tituloProfesional && (
              <p className="cc-context-role">{freelancer.tituloProfesional}</p>
            )}
            {freelancer.calificacionPromedio > 0 && (
              <p className="cc-context-rating">
                <span aria-hidden="true">★</span> {freelancer.calificacionPromedio.toFixed(1)}
              </p>
            )}
            {freelancer.biografia && <p className="cc-context-bio">{freelancer.biografia}</p>}
            {freelancer.habilidades.length > 0 && (
              <ul className="cc-skill-list" aria-label="Habilidades">
                {freelancer.habilidades.map((skill) => (
                  <li key={skill.id}>{skill.nombre}</li>
                ))}
              </ul>
            )}
          </>
        )}

        {client && (
          <>
            {client.nombreEmpresa && <p className="cc-context-role">{client.nombreEmpresa}</p>}
            <p className="cc-context-role">
              {client.tipoCliente === "empresa" ? "Empresa" : "Cliente particular"}
            </p>
            {client.descripcion && <p className="cc-context-bio">{client.descripcion}</p>}
          </>
        )}

        <Link className="cc-inline-link" to={`/perfil/usuario/${counterparty.id}`}>
          Ver perfil
        </Link>
      </section>

      <section className="cc-context-card" aria-labelledby="cc-context-detail-title">
        <div className="cc-context-card__heading">
          <h3 id="cc-context-detail-title">
            {contextType === "proyecto"
              ? "Proyecto"
              : contextType === "servicio"
                ? "Servicio"
                : "Conversación"}
          </h3>
          {project && <span className="cc-status">{statusLabel(project.estado)}</span>}
          {service && <span className="cc-status">{statusLabel(service.estado)}</span>}
        </div>

        {loadingContext ? (
          <div className="cc-context-skeleton" role="status">
            <span className="cc-visually-hidden">Cargando detalles…</span>
            <span />
            <span />
            <span />
          </div>
        ) : contextError ? (
          <div className="cc-context-error" role="alert">
            <p>{contextError}</p>
            {contextCanRetry && (
              <button
                className="cc-secondary-button"
                type="button"
                onClick={() => setReloadKey((current) => current + 1)}
              >
                Reintentar
              </button>
            )}
          </div>
        ) : project ? (
          <>
            <p className="cc-context-price">
              {project.presupuesto === null
                ? "Presupuesto por definir"
                : formatMoney(project.presupuesto)}
            </p>
            <dl className="cc-context-facts">
              <div>
                <dt>Plazo</dt>
                <dd>{project.plazoDias ? `${project.plazoDias} días` : "Sin plazo"}</dd>
              </div>
              <div>
                <dt>Propuestas</dt>
                <dd>{project.totalPropuestas}</dd>
              </div>
              {project.categoria && (
                <div>
                  <dt>Categoría</dt>
                  <dd>{project.categoria.nombre}</dd>
                </div>
              )}
            </dl>
            <p className="cc-context-description">{project.descripcion}</p>
          </>
        ) : service ? (
          <>
            <p className="cc-context-price">{formatMoney(service.precio)}</p>
            <dl className="cc-context-facts">
              {service.categoria && (
                <div>
                  <dt>Categoría</dt>
                  <dd>{service.categoria.nombre}</dd>
                </div>
              )}
              <div>
                <dt>Publicado</dt>
                <dd>{formatDate(service.fechaCreacion)}</dd>
              </div>
            </dl>
            <p className="cc-context-description">{service.descripcion}</p>
          </>
        ) : (
          <p className="cc-context-description">
            Esta conversación no está vinculada a un proyecto o servicio.
          </p>
        )}
      </section>

      {contract && (
        <section className="cc-context-card cc-context-contract" aria-labelledby="cc-context-contract-title">
          <div className="cc-context-card__heading">
            <h3 id="cc-context-contract-title">Contrato</h3>
            <span className="cc-status cc-status-active">{statusLabel(contract.estado)}</span>
          </div>
          <p className="cc-context-price">{formatMoney(contract.montoAcordado)}</p>
          <dl className="cc-context-facts">
            <div>
              <dt>Inicio</dt>
              <dd>{contract.fechaInicio ? formatDate(contract.fechaInicio) : "Sin fecha"}</dd>
            </div>
            {contract.fechaFin && (
              <div>
                <dt>Fin</dt>
                <dd>{formatDate(contract.fechaFin)}</dd>
              </div>
            )}
          </dl>
          <p className="cc-context-actions">
            <Link className="cc-inline-link" to={`/contracts/${contract.id}`}>
              Ver contrato
            </Link>
            {" · "}
            <Link className="cc-inline-link" to="/contracts">
              Ver todos
            </Link>
          </p>
        </section>
      )}

      <section className="cc-context-card" aria-labelledby="cc-context-offer-title">
        <h3 id="cc-context-offer-title">Enviar oferta</h3>
        {hasActiveContract ? (
          <p className="cc-context-description">
            Ya existe un contrato activo para esta conversación.
          </p>
        ) : (
          <form className="cc-context-form" onSubmit={(event) => void submitOffer(event)}>
            <label>
              <span>Monto (USD)</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                disabled={sendingOffer || !token}
                required
              />
            </label>
            <label>
              <span>Detalle (opcional)</span>
              <textarea
                maxLength={1000}
                rows={3}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={sendingOffer || !token}
                placeholder="Qué incluye tu propuesta"
              />
            </label>
            <label>
              <span>Vence el (opcional)</span>
              <input
                type="date"
                min={today}
                value={expiration}
                onChange={(event) => setExpiration(event.target.value)}
                disabled={sendingOffer || !token}
              />
            </label>
            {offerError && (
              <p className="cc-chat-status cc-chat-status--error" role="alert">
                {offerError}
              </p>
            )}
            {offerSuccess && (
              <p className="cc-chat-status" role="status">
                {offerSuccess}
              </p>
            )}
            <button
              className="cc-primary-button"
              type="submit"
              disabled={sendingOffer || !token || !amount.trim()}
            >
              {sendingOffer ? "Enviando…" : "Enviar oferta"}
            </button>
          </form>
        )}
      </section>
    </aside>
  );
}
