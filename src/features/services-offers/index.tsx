import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  acceptProposal,
  changeOfferStatus,
  createOffer,
  getMarketOffer,
  getMarketOffers,
  getMyOffer,
  getMyOffers,
  getMyProposals,
  getOfferProposals,
  rejectProposal,
  sendProposal,
  updateOffer,
} from "../../infrastructure/api/apiOfertas";
import type { OfertaMarketplace, Propuesta } from "../../infrastructure/api/apiOfertas";
import {
  changeServiceStatus,
  createService,
  getService,
  getMyServices,
  listServices,
  updateService,
} from "../../infrastructure/api/apiServicios";
import type { DatosActualizacionServicio, Servicio } from "../../infrastructure/api/apiServicios";
import { createConversation } from "../../infrastructure/api/apiChat";
import { getCategories, getSkills } from "../../infrastructure/api/apiCatalogos";
import type { Categoria } from "../../core/domain/entities/categoria";
import type { DatosOferta, EstadoOferta, Oferta } from "../../core/domain/entities/oferta";
import "./services-offers.css";

const PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;
type CatalogSkill = { id: number; nombre: string; categoriaId?: number };

function useCatalogs(token: string) {
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [skills, setSkills] = useState<CatalogSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([getCategories(token), getSkills(token)])
      .then(([nextCategories, nextSkills]) => {
        if (!active) return;
        setCategories(nextCategories);
        setSkills(nextSkills);
      })
      .catch((reason: unknown) => {
        if (active) setError(errorMessage(reason));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token, reload]);

  return {
    categories,
    skills,
    loading,
    error,
    retry: () => setReload((value) => value + 1),
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Ocurrió un error inesperado. Inténtalo de nuevo.";
}

function money(value: number | null | undefined): string {
  if (value === null || value === undefined) return "Por definir";
  return new Intl.NumberFormat("es", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}

function date(value: string | undefined): string {
  if (!value) return "Sin fecha";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString("es");
}

function statusLabel(status: string | undefined): string {
  const labels: Record<string, string> = {
    abierto: "Abierta",
    en_progreso: "En progreso",
    completado: "Completada",
    cancelado: "Cancelada",
    activo: "Activo",
    pausado: "Pausado",
    eliminado: "Eliminado",
    pendiente: "Pendiente",
    aceptada: "Aceptada",
    rechazada: "Rechazada",
  };
  return labels[(status ?? "").toLowerCase()] ?? status ?? "Sin estado";
}

function validImageUrl(value: string): boolean {
  if (!value.trim()) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function AuthGate({ role, children }: { role: "cliente" | "freelancer"; children: (token: string) => ReactNode }) {
  const { user, token, cargando } = useAuth();
  if (cargando) return <main className="so-page"><p role="status">Comprobando tu sesión…</p></main>;
  if (!user || !token) {
    return <main className="so-page"><div className="so-alert" role="alert">Inicia sesión para continuar.</div></main>;
  }
  if (user.rol !== role) {
    return <main className="so-page"><div className="so-alert" role="alert">Esta sección solo está disponible para {role === "cliente" ? "clientes" : "freelancers"}.</div></main>;
  }
  return <>{children(token)}</>;
}

function PageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="so-page">
      <header className="so-heading">
        <p className="so-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      {children}
    </main>
  );
}

function Notice({ error, retry }: { error: string; retry?: () => void }) {
  return (
    <div className="so-alert" role="alert">
      <span>{error}</span>
      {retry && <button className="so-button so-button--quiet" type="button" onClick={retry}>Reintentar</button>}
    </div>
  );
}

function Tabs({
  items,
  active,
  onChange,
}: {
  items: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="so-tabs" role="tablist" aria-label="Secciones">
      {items.map((item) => (
        <button
          key={item.id}
          id={`tab-${item.id}`}
          role="tab"
          type="button"
          aria-selected={active === item.id}
          aria-controls={`panel-${item.id}`}
          className={active === item.id ? "so-tab is-active" : "so-tab"}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function Panel({ id, active, children }: { id: string; active: string; children: ReactNode }) {
  return <section id={`panel-${id}`} role="tabpanel" aria-labelledby={`tab-${id}`} hidden={id !== active}>{children}</section>;
}

function Pager({
  page,
  total,
  limit = PAGE_SIZE,
  onChange,
}: {
  page: number;
  total: number;
  limit?: number;
  onChange: (nextPage: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / Math.min(limit, MAX_PAGE_SIZE)));
  if (pages <= 1) return null;
  return (
    <nav className="so-pager" aria-label="Paginación">
      <button className="so-button so-button--quiet" type="button" disabled={page <= 1} onClick={() => onChange(page - 1)}>Anterior</button>
      <span>Página {page} de {pages}</span>
      <button className="so-button so-button--quiet" type="button" disabled={page >= pages} onClick={() => onChange(page + 1)}>Siguiente</button>
    </nav>
  );
}

function CatalogFields({
  categories,
  skills,
  categoryId,
  onCategoryChange,
  skillIds,
  onSkillChange,
  includeSkills = true,
}: {
  categories: Categoria[];
  skills: CatalogSkill[];
  categoryId: string;
  onCategoryChange: (value: string) => void;
  skillIds?: number[];
  onSkillChange?: (values: number[]) => void;
  includeSkills?: boolean;
}) {
  return (
    <>
      <label className="so-field">
        <span>Categoría</span>
        <select value={categoryId} onChange={(event) => onCategoryChange(event.target.value)}>
          <option value="">Sin categoría</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.nombre}</option>)}
        </select>
      </label>
      {includeSkills && onSkillChange && (
        <label className="so-field">
          <span>Habilidades <small>(puedes seleccionar varias)</small></span>
          <select
            multiple
            value={(skillIds ?? []).map(String)}
            onChange={(event) => onSkillChange(Array.from(event.currentTarget.selectedOptions, (option) => Number(option.value)))}
            className="so-multiselect"
          >
            {skills.map((skill) => <option key={skill.id} value={skill.id}>{skill.nombre}</option>)}
          </select>
        </label>
      )}
    </>
  );
}

interface OfferFormValues {
  titulo: string;
  descripcion: string;
  presupuesto: string;
  plazoDias: string;
  categoriaId: string;
  habilidadIds: number[];
  imagenUrl: string;
}

function offerValues(offer?: Oferta): OfferFormValues {
  return {
    titulo: offer?.titulo ?? "",
    descripcion: offer?.descripcion ?? "",
    presupuesto: offer?.presupuesto === null || offer?.presupuesto === undefined ? "" : String(offer.presupuesto),
    plazoDias: offer?.plazoDias === null || offer?.plazoDias === undefined ? "" : String(offer.plazoDias),
    categoriaId: offer?.categoria?.id ? String(offer.categoria.id) : "",
    habilidadIds: offer?.habilidades?.map((skill) => skill.id) ?? [],
    imagenUrl: offer?.imagenUrl ?? "",
  };
}

function OfferForm({
  token,
  categories,
  skills,
  initial,
  onSaved,
  onCancel,
}: {
  token: string;
  categories: Categoria[];
  skills: CatalogSkill[];
  initial?: Oferta;
  onSaved: (offer: Oferta) => void;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState(() => offerValues(initial));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const editing = Boolean(initial);
  const set = (key: keyof OfferFormValues, value: string | number[]) => setValues((old) => ({ ...old, [key]: value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const budget = Number(values.presupuesto);
    const deadline = Number(values.plazoDias);
    if (values.titulo.trim().length < 5 || values.titulo.trim().length > 200) return setError("El título debe tener entre 5 y 200 caracteres.");
    if (values.descripcion.trim().length < 10 || values.descripcion.trim().length > 5000) return setError("La descripción debe tener entre 10 y 5000 caracteres.");
    if (!values.presupuesto || !Number.isFinite(budget) || budget < 0) return setError("Ingresa un presupuesto válido de 0 o más.");
    if (!values.plazoDias || !Number.isInteger(deadline) || deadline < 1) return setError("El plazo debe ser de al menos 1 día.");
    if (!validImageUrl(values.imagenUrl)) return setError("La imagen debe ser una URL http o https válida. No hay carga de archivos disponible.");

    const payload: DatosOferta = {
      titulo: values.titulo.trim(),
      descripcion: values.descripcion.trim(),
      presupuesto: budget,
      plazoDias: deadline,
      categoriaId: values.categoriaId ? Number(values.categoriaId) : null,
      habilidadIds: values.habilidadIds,
      imagenUrl: values.imagenUrl.trim() || null,
    };
    setSaving(true);
    try {
      let saved: Oferta;
      if (initial) {
        const previous = offerValues(initial);
        const changed: DatosOferta = {};
        if (payload.titulo !== previous.titulo) changed.titulo = payload.titulo;
        if (payload.descripcion !== previous.descripcion) changed.descripcion = payload.descripcion;
        if (payload.presupuesto !== initial.presupuesto) changed.presupuesto = payload.presupuesto;
        if (payload.plazoDias !== initial.plazoDias) changed.plazoDias = payload.plazoDias;
        if (payload.categoriaId !== (previous.categoriaId ? Number(previous.categoriaId) : null)) changed.categoriaId = payload.categoriaId;
        if (JSON.stringify(payload.habilidadIds) !== JSON.stringify(previous.habilidadIds)) changed.habilidadIds = payload.habilidadIds;
        if (payload.imagenUrl !== (previous.imagenUrl || null)) changed.imagenUrl = payload.imagenUrl;
        const response = await updateOffer(token, initial.id, changed);
        saved = response.oferta;
      } else {
        const response = await createOffer(token, payload);
        saved = response.oferta;
      }
      onSaved(saved);
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="so-form" onSubmit={submit} noValidate>
      <div className="so-form__grid">
        <label className="so-field so-field--wide">
          <span>Título <small>5–200 caracteres</small></span>
          <input value={values.titulo} minLength={5} maxLength={200} required onChange={(event) => set("titulo", event.target.value)} />
        </label>
        <label className="so-field so-field--wide">
          <span>Descripción <small>10–5000 caracteres</small></span>
          <textarea value={values.descripcion} minLength={10} maxLength={5000} required rows={6} onChange={(event) => set("descripcion", event.target.value)} />
        </label>
        <label className="so-field">
          <span>Presupuesto (USD)</span>
          <input type="number" min="0" step="0.01" value={values.presupuesto} required onChange={(event) => set("presupuesto", event.target.value)} />
        </label>
        <label className="so-field">
          <span>Plazo (días)</span>
          <input type="number" min="1" step="1" value={values.plazoDias} required onChange={(event) => set("plazoDias", event.target.value)} />
        </label>
        <CatalogFields
          categories={categories}
          skills={skills}
          categoryId={values.categoriaId}
          onCategoryChange={(value) => set("categoriaId", value)}
          skillIds={values.habilidadIds}
          onSkillChange={(value) => set("habilidadIds", value)}
        />
        <label className="so-field so-field--wide">
          <span>URL de imagen <small>opcional; no se pueden subir archivos</small></span>
          <input type="url" inputMode="url" placeholder="https://…" value={values.imagenUrl} onChange={(event) => set("imagenUrl", event.target.value)} />
        </label>
      </div>
      {error && <p className="so-inline-error" role="alert">{error}</p>}
      <div className="so-form__actions">
        {onCancel && <button className="so-button so-button--quiet" type="button" disabled={saving} onClick={onCancel}>Cancelar</button>}
        <button className="so-button so-button--primary" type="submit" disabled={saving}>
          {saving ? "Guardando…" : editing ? "Guardar cambios" : "Publicar oferta"}
        </button>
      </div>
    </form>
  );
}

function OfferCard({ offer, onOpen }: { offer: Oferta; onOpen: () => void }) {
  return (
    <article className="so-card">
      <div className="so-card__top">
        <span className="so-badge">{statusLabel(offer.estado)}</span>
        <span className="so-muted">{date(offer.fechaPublicacion)}</span>
      </div>
      <h3>{offer.titulo}</h3>
      <p className="so-clamp">{offer.descripcion}</p>
      <div className="so-card__meta">
        <span>{money(offer.presupuesto)}</span>
        <span>{offer.plazoDias ? `${offer.plazoDias} días` : "Plazo por definir"}</span>
        <span>{offer.totalPropuestas ?? 0} propuestas</span>
      </div>
      <button type="button" className="so-button so-button--outline" onClick={onOpen}>Ver detalles</button>
    </article>
  );
}

function OfferDetails({
  offer,
  onBack,
  children,
}: {
  offer: Oferta | OfertaMarketplace;
  onBack: () => void;
  children?: ReactNode;
}) {
  const market = "cliente" in offer ? offer as OfertaMarketplace : undefined;
  return (
    <article className="so-detail">
      <button type="button" className="so-button so-button--quiet" onClick={onBack}>← Volver a la lista</button>
      <div className="so-detail__head">
        <div>
          <span className="so-badge">{statusLabel(offer.estado)}</span>
          <h2>{offer.titulo}</h2>
        </div>
        <strong className="so-price">{money(offer.presupuesto)}</strong>
      </div>
      <p className="so-detail__description">{offer.descripcion}</p>
      <dl className="so-facts">
        <div><dt>Plazo</dt><dd>{offer.plazoDias ? `${offer.plazoDias} días` : "Por definir"}</dd></div>
        <div><dt>Categoría</dt><dd>{offer.categoria?.nombre ?? "Sin categoría"}</dd></div>
        <div><dt>Publicada</dt><dd>{date(offer.fechaPublicacion)}</dd></div>
        {market && <div><dt>Cliente</dt><dd>{market.cliente.nombre}</dd></div>}
      </dl>
      {offer.habilidades?.length > 0 && <div className="so-tags" aria-label="Habilidades">{offer.habilidades.map((item) => <span key={item.id}>{item.nombre}</span>)}</div>}
      {offer.imagenUrl && <img className="so-cover" src={offer.imagenUrl} alt={`Imagen de ${offer.titulo}`} />}
      {children}
    </article>
  );
}

function ProposalCards({
  proposals,
  busyId,
  onAccept,
  onReject,
}: {
  proposals: Propuesta[];
  busyId: number | null;
  onAccept?: (proposal: Propuesta) => void;
  onReject?: (proposal: Propuesta) => void;
}) {
  if (proposals.length === 0) return <p className="so-empty">Todavía no hay propuestas para mostrar.</p>;
  return (
    <div className="so-list">
      {proposals.map((proposal) => {
        const pending = proposal.estado.toLowerCase() === "pendiente";
        return (
          <article className="so-card so-proposal" key={proposal.id}>
            <div className="so-card__top">
              <div className="so-person">
                {proposal.freelancer.fotoPerfil && <img src={proposal.freelancer.fotoPerfil} alt="" />}
                <div><h3>{proposal.freelancer.nombre}</h3><span className="so-muted">{proposal.freelancer.calificacionPromedio ? `★ ${proposal.freelancer.calificacionPromedio.toFixed(1)}` : "Nuevo freelancer"}</span></div>
              </div>
              <span className="so-badge">{statusLabel(proposal.estado)}</span>
            </div>
            <p>{proposal.mensaje || "Sin mensaje adicional."}</p>
            <div className="so-card__meta"><strong>{money(proposal.monto)}</strong><span>Enviada {date(proposal.fecha)}</span></div>
            {pending && onAccept && onReject && (
              <div className="so-form__actions">
                <button className="so-button so-button--primary" type="button" disabled={busyId === proposal.id} onClick={() => onAccept(proposal)}>
                  {busyId === proposal.id ? "Procesando…" : "Aceptar"}
                </button>
                <button className="so-button so-button--quiet" type="button" disabled={busyId === proposal.id} onClick={() => onReject(proposal)}>Rechazar</button>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

function ClientOffers({ token, onContractPath }: { token: string; onContractPath?: (path: string) => void }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("offers");
  const [offers, setOffers] = useState<Oferta[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<Oferta | null>(null);
  const [editing, setEditing] = useState(false);
  const [proposals, setProposals] = useState<Propuesta[]>([]);
  const [proposalsCount, setProposalsCount] = useState(0);
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [reload, setReload] = useState(0);
  const catalogs = useCatalogs(token);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getMyOffers(token, { page, limit: Math.min(PAGE_SIZE, MAX_PAGE_SIZE), estado: status || undefined, texto: query.trim() || undefined })
      .then((result) => {
        if (!active) return;
        setOffers(result.items);
        setTotal(result.total);
      })
      .catch((reason: unknown) => { if (active) setError(errorMessage(reason)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token, page, status, query, reload]);

  useEffect(() => {
    if (!selected || editing) {
      setProposals([]);
      setProposalsCount(0);
      setProposalsLoading(false);
      return;
    }
    let active = true;
    setProposalsLoading(true);
    getOfferProposals(token, selected.id)
      .then((result) => {
        if (active) {
          setProposals(result.propuestas);
          setProposalsCount(result.total);
        }
      })
      .catch((reason: unknown) => { if (active) setActionError(errorMessage(reason)); })
      .finally(() => { if (active) setProposalsLoading(false); });
    return () => { active = false; };
  }, [token, selected, editing, reload]);

  async function openOffer(offer: Oferta) {
    setActionError("");
    setEditing(false);
    setDetailLoading(true);
    try {
      setSelected(await getMyOffer(token, offer.id));
    } catch (reason) {
      setActionError(errorMessage(reason));
    } finally {
      setDetailLoading(false);
    }
  }

  async function updateStatus(next: EstadoOferta) {
    if (!selected) return;
    setActionError("");
    setBusyId(-1);
    try {
      const response = await changeOfferStatus(token, selected.id, next);
      setSelected(response.oferta);
      setReload((value) => value + 1);
    } catch (reason) {
      setActionError(errorMessage(reason));
    } finally {
      setBusyId(null);
    }
  }

  async function handleProposal(proposal: Propuesta, action: "accept" | "reject") {
    if (!selected) return;
    setActionError("");
    setBusyId(proposal.id);
    try {
      if (action === "accept") {
        const accepted = await acceptProposal(token, selected.id, proposal.id);
        const [proposalResult, offerResult, listResult] = await Promise.allSettled([
          getOfferProposals(token, selected.id),
          getMyOffer(token, selected.id),
          getMyOffers(token, { page, limit: Math.min(PAGE_SIZE, MAX_PAGE_SIZE), estado: status || undefined, texto: query.trim() || undefined }),
        ]);
        if (proposalResult.status === "fulfilled") {
          setProposals(proposalResult.value.propuestas);
          setProposalsCount(proposalResult.value.total);
        }
        if (offerResult.status === "fulfilled") setSelected(offerResult.value);
        if (listResult.status === "fulfilled") {
          setOffers(listResult.value.items);
          setTotal(listResult.value.total);
        }
        if ([proposalResult, offerResult, listResult].some((result) => result.status === "rejected")) {
          setActionError("La propuesta se aceptó, pero no se pudo actualizar toda la información. Actualiza la lista para ver los cambios.");
        }
        const contractId = accepted.contrato && typeof accepted.contrato === "object" && "id" in accepted.contrato
          ? Number(accepted.contrato.id)
          : NaN;
        const path = Number.isInteger(contractId) && contractId > 0 ? `/contracts/${contractId}` : "/contracts";
        onContractPath?.(path);
        window.dispatchEvent(new CustomEvent("services-offers:contract-path", {
          detail: { path, contractId: Number.isInteger(contractId) && contractId > 0 ? contractId : undefined, offerId: selected.id, proposalId: proposal.id, contract: accepted.contrato },
        }));
        navigate(path);
      } else {
        await rejectProposal(token, selected.id, proposal.id);
        const result = await getOfferProposals(token, selected.id);
        setProposals(result.propuestas);
        setProposalsCount(result.total);
        setReload((value) => value + 1);
      }
    } catch (reason) {
      setActionError(errorMessage(reason));
    } finally {
      setBusyId(null);
    }
  }

  const filteredCount = proposalsCount || proposals.length;

  return (
    <PageShell eyebrow="Espacio cliente" title="Servicios y ofertas" description="Publica trabajos y gestiona las propuestas que recibes.">
      <Tabs active={tab} onChange={setTab} items={[{ id: "offers", label: "Mis ofertas" }, { id: "create", label: "Crear oferta" }]} />
      {tab === "offers" && (
        <Panel id="offers" active={tab}>
          {selected ? (
            <div className="so-stack">
              {actionError && <Notice error={actionError} retry={() => setReload((value) => value + 1)} />}
              {editing ? (
                <section className="so-surface">
                  <h2>Editar oferta</h2>
                  {catalogs.error ? <Notice error={catalogs.error} retry={catalogs.retry} /> : catalogs.loading ? <p role="status">Cargando categorías y habilidades…</p> : (
                    <OfferForm token={token} categories={catalogs.categories} skills={catalogs.skills} initial={selected} onCancel={() => setEditing(false)} onSaved={(saved) => { setSelected(saved); setEditing(false); setReload((value) => value + 1); }} />
                  )}
                </section>
              ) : (
                <>
                  <OfferDetails offer={selected} onBack={() => setSelected(null)}>
                    <div className="so-form__actions">
                      <button className="so-button so-button--outline" type="button" onClick={() => setEditing(true)} disabled={selected.estado === "completado" || selected.estado === "cancelado"}>Editar oferta</button>
                      {selected.estado === "abierto" && <button className="so-button so-button--danger" type="button" disabled={busyId !== null} onClick={() => updateStatus("cancelado")}>Cancelar oferta</button>}
                      {selected.estado === "en_progreso" && <>
                        <button className="so-button so-button--primary" type="button" disabled={busyId !== null} onClick={() => updateStatus("completado")}>Marcar completada</button>
                        <button className="so-button so-button--danger" type="button" disabled={busyId !== null} onClick={() => updateStatus("cancelado")}>Cancelar oferta</button>
                      </>}
                    </div>
                  </OfferDetails>
                  <section className="so-surface">
                    <div className="so-section-title"><div><h2>Propuestas recibidas</h2><p>{filteredCount} en total</p></div></div>
                    {proposalsLoading ? <p role="status">Cargando propuestas…</p> : <ProposalCards proposals={proposals} busyId={busyId} onAccept={(proposal) => handleProposal(proposal, "accept")} onReject={(proposal) => handleProposal(proposal, "reject")} />}
                  </section>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="so-filterbar">
                <label className="so-field so-search"><span>Buscar ofertas</span><input type="search" value={query} placeholder="Título o descripción" onChange={(event) => { setPage(1); setQuery(event.target.value); }} /></label>
                <label className="so-field"><span>Estado</span><select value={status} onChange={(event) => { setPage(1); setStatus(event.target.value); }}>
                  <option value="">Todos los estados</option><option value="abierto">Abierta</option><option value="en_progreso">En progreso</option><option value="completado">Completada</option><option value="cancelado">Cancelada</option>
                </select></label>
              </div>
              {error && <Notice error={error} retry={() => setReload((value) => value + 1)} />}
              {detailLoading && <p role="status">Cargando los detalles de la oferta…</p>}
              {loading ? <p className="so-loading" role="status">Cargando tus ofertas…</p> : offers.length === 0 ? <p className="so-empty">No encontramos ofertas. Prueba otro filtro o crea una oferta nueva.</p> : (
                <div className="so-list">{offers.map((offer) => <OfferCard key={offer.id} offer={offer} onOpen={() => void openOffer(offer)} />)}</div>
              )}
              <Pager page={page} total={total} onChange={setPage} />
            </>
          )}
        </Panel>
      )}
      {tab === "create" && (
        <Panel id="create" active={tab}>
          <section className="so-surface">
            <h2>Publica una oferta</h2>
            <p className="so-muted">Describe el trabajo, el presupuesto y el plazo para recibir propuestas adecuadas.</p>
            {catalogs.error ? <Notice error={catalogs.error} retry={catalogs.retry} /> : catalogs.loading ? <p role="status">Cargando categorías y habilidades…</p> : (
              <OfferForm token={token} categories={catalogs.categories} skills={catalogs.skills} onSaved={(saved) => { setTab("offers"); setSelected(saved); setReload((value) => value + 1); }} />
            )}
          </section>
        </Panel>
      )}
    </PageShell>
  );
}

function FreelancerMarketplace({ token }: { token: string }) {
  const [tab, setTab] = useState("market");
  const [items, setItems] = useState<OfertaMarketplace[]>([]);
  const [selected, setSelected] = useState<OfertaMarketplace | null>(null);
  const [proposals, setProposals] = useState<Propuesta[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [submittedIds, setSubmittedIds] = useState<number[]>([]);
  const [myProposalList, setMyProposalList] = useState<Propuesta[]>([]);
  const [myLoading, setMyLoading] = useState(false);
  const [myError, setMyError] = useState("");
  const [myReload, setMyReload] = useState(0);
  const catalogs = useCatalogs(token);
  const { user } = useAuth();
  const storageKey = `first_gig_pending_proposals_${user?.id ?? user?.email ?? "freelancer"}`;

  useEffect(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) ?? "[]") as number[];
      setSubmittedIds(Array.isArray(parsed) ? parsed.filter(Number.isInteger) : []);
    } catch {
      setSubmittedIds([]);
    }
  }, [storageKey]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getMarketOffers(token, {
      page,
      limit: Math.min(PAGE_SIZE, MAX_PAGE_SIZE),
      categoriaId: categoryId ? Number(categoryId) : undefined,
      q: query.trim() || undefined,
    })
      .then((result) => {
        if (active) {
          setItems(result.items as OfertaMarketplace[]);
          setTotal(result.total);
        }
      })
      .catch((reason: unknown) => { if (active) setError(errorMessage(reason)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token, page, categoryId, query, reload]);

  useEffect(() => {
    let active = true;
    setMyLoading(true);
    setMyError("");
    getMyProposals(token)
      .then((result) => {
        if (!active) return;
        setMyProposalList(result.propuestas);
        const identifiedIds = result.propuestas
          .map((item) => item.ofertaId ?? item.proyecto?.id)
          .filter((id): id is number => typeof id === "number");
        const pendingIds = result.propuestas
          .filter((item) => item.estado.toLowerCase() === "pendiente")
          .map((item) => item.ofertaId ?? item.proyecto?.id)
          .filter((id): id is number => typeof id === "number");
        setSubmittedIds((current) => {
          const next = Array.from(new Set([
            ...pendingIds,
            ...current.filter((id) => !identifiedIds.includes(id)),
          ]));
          try {
            localStorage.setItem(storageKey, JSON.stringify(next));
          } catch {
            // The in-memory guard still prevents a duplicate for this page session.
          }
          return next;
        });
      })
      .catch((reason: unknown) => { if (active) setMyError(errorMessage(reason)); })
      .finally(() => { if (active) setMyLoading(false); });
    return () => { active = false; };
  }, [token, myReload]);

  async function openMarketOffer(offer: OfertaMarketplace) {
    setSendError("");
    setAmount("");
    setMessage("");
    setDetailLoading(true);
    try {
      const detail = await getMarketOffer(token, offer.id);
      setSelected(detail);
      setProposals([]);
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setDetailLoading(false);
    }
  }

  async function submitProposal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    if (myLoading || myError) {
      setSendError("No se pudieron comprobar tus propuestas anteriores. Vuelve a intentarlo antes de enviar.");
      return;
    }
    const numericAmount = Number(amount);
    const localPending = submittedIds.includes(selected.id);
    const serverPending = proposals.some((proposal) => proposal.estado.toLowerCase() === "pendiente");
    if (localPending || serverPending) {
      setSendError("Ya enviaste una propuesta pendiente para esta oferta.");
      return;
    }
    if (!amount || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setSendError("Ingresa un monto propuesto mayor que 0.");
      return;
    }
    setSending(true);
    setSendError("");
    try {
      await sendProposal(token, selected.id, { montoPropuesto: numericAmount, mensaje: message.trim() || undefined });
      const next = Array.from(new Set([...submittedIds, selected.id]));
      setSubmittedIds(next);
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // The in-memory guard still prevents a duplicate for this page session.
      }
      setMyReload((value) => value + 1);
      setSelected(null);
    } catch (reason) {
      setSendError(errorMessage(reason));
    } finally {
      setSending(false);
    }
  }

  const pendingOfferIds = useMemo(() => new Set([
    ...submittedIds,
    ...myProposalList.filter((item) => item.estado.toLowerCase() === "pendiente").map((item) => item.ofertaId ?? item.proyecto?.id).filter((id): id is number => typeof id === "number"),
  ]), [submittedIds, myProposalList]);

  return (
    <PageShell eyebrow="Espacio freelancer" title="Encuentra tu próximo proyecto" description="Explora ofertas abiertas y da seguimiento a tus propuestas.">
      <Tabs active={tab} onChange={setTab} items={[{ id: "market", label: "Marketplace" }, { id: "mine", label: "Mis propuestas" }]} />
      <Panel id="market" active={tab}>
        {selected ? (
          <OfferDetails offer={selected} onBack={() => setSelected(null)}>
            <section className="so-surface so-proposal-form">
              <h3>Enviar una propuesta</h3>
              {pendingOfferIds.has(selected.id) ? (
                <p className="so-inline-success" role="status">Ya tienes una propuesta pendiente para esta oferta.</p>
              ) : (
                <form className="so-form" onSubmit={submitProposal} noValidate>
                  {myLoading && <p className="so-muted" role="status">Comprobando tus propuestas anteriores…</p>}
                  {myError && <div className="so-inline-error" role="alert">{myError} <button type="button" className="so-button so-button--quiet" onClick={() => setMyReload((value) => value + 1)}>Reintentar</button></div>}
                  <label className="so-field"><span>Monto propuesto (USD)</span><input type="number" min="0.01" step="0.01" required value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
                  <label className="so-field"><span>Mensaje <small>opcional</small></span><textarea rows={4} value={message} onChange={(event) => setMessage(event.target.value)} /></label>
                  {sendError && <p className="so-inline-error" role="alert">{sendError}</p>}
                  <button type="submit" className="so-button so-button--primary" disabled={sending || myLoading || Boolean(myError)}>{sending ? "Enviando…" : "Enviar propuesta"}</button>
                </form>
              )}
            </section>
          </OfferDetails>
        ) : (
          <>
            <div className="so-filterbar">
              <label className="so-field so-search"><span>Buscar proyectos</span><input type="search" placeholder="Palabras clave" value={query} onChange={(event) => { setPage(1); setQuery(event.target.value); }} /></label>
              <label className="so-field"><span>Categoría</span><select value={categoryId} onChange={(event) => { setPage(1); setCategoryId(event.target.value); }}>
                <option value="">Todas las categorías</option>{catalogs.categories.map((category) => <option key={category.id} value={category.id}>{category.nombre}</option>)}
              </select></label>
            </div>
            {catalogs.error && <Notice error={catalogs.error} retry={catalogs.retry} />}
            {error && <Notice error={error} retry={() => setReload((value) => value + 1)} />}
            {detailLoading && <p role="status">Cargando los detalles de la oferta…</p>}
            {loading ? <p className="so-loading" role="status">Buscando ofertas abiertas…</p> : items.length === 0 ? <p className="so-empty">No hay ofertas abiertas que coincidan con tu búsqueda.</p> : (
              <div className="so-list">{items.map((offer) => <OfferCard key={offer.id} offer={offer} onOpen={() => void openMarketOffer(offer)} />)}</div>
            )}
            <Pager page={page} total={total} onChange={setPage} />
          </>
        )}
      </Panel>
      <Panel id="mine" active={tab}>
        {myError && <Notice error={myError} retry={() => setMyReload((value) => value + 1)} />}
        {myLoading ? <p className="so-loading" role="status">Cargando tus propuestas…</p> : myProposalList.length === 0 ? <p className="so-empty">Aún no has enviado propuestas.</p> : (
          <div className="so-list">{myProposalList.map((proposal) => (
            <article className="so-card" key={proposal.id}>
              <div className="so-card__top"><span className="so-badge">{statusLabel(proposal.estado)}</span><span className="so-muted">{date(proposal.fecha)}</span></div>
              <h3>{proposal.proyecto?.titulo ?? `Oferta #${proposal.ofertaId ?? proposal.proyecto?.id ?? "—"}`}</h3>
              <p>{proposal.mensaje || "Sin mensaje adicional."}</p>
              <div className="so-card__meta"><strong>{money(proposal.monto)}</strong></div>
            </article>
          ))}</div>
        )}
      </Panel>
    </PageShell>
  );
}

interface ServiceFormValues {
  titulo: string;
  descripcion: string;
  precio: string;
  categoriaId: string;
  imagenUrl: string;
}

function serviceValues(service?: Servicio): ServiceFormValues {
  return {
    titulo: service?.titulo ?? "",
    descripcion: service?.descripcion ?? "",
    precio: service ? String(service.precio) : "",
    categoriaId: service?.categoriaId ? String(service.categoriaId) : "",
    imagenUrl: service?.imagenUrl ?? "",
  };
}

function ServiceForm({
  token,
  categories,
  initial,
  onSaved,
  onCancel,
}: {
  token: string;
  categories: Categoria[];
  initial?: Servicio;
  onSaved: (service: Servicio) => void;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState(() => serviceValues(initial));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (key: keyof ServiceFormValues, value: string) => setValues((old) => ({ ...old, [key]: value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const price = Number(values.precio);
    if (values.titulo.trim().length < 5 || values.titulo.trim().length > 150) return setError("El título debe tener entre 5 y 150 caracteres.");
    if (values.descripcion.trim().length < 10 || values.descripcion.trim().length > 5000) return setError("La descripción debe tener entre 10 y 5000 caracteres.");
    if (!values.precio || !Number.isFinite(price) || price <= 0) return setError("El precio debe ser mayor que 0.");
    if (!validImageUrl(values.imagenUrl)) return setError("La imagen debe ser una URL http o https válida. No hay carga de archivos disponible.");
    setSaving(true);
    setError("");
    try {
      const payload = {
        titulo: values.titulo.trim(),
        descripcion: values.descripcion.trim(),
        precio: price,
        categoriaId: values.categoriaId ? Number(values.categoriaId) : null,
        imagenUrl: values.imagenUrl.trim() || null,
      };
      let saved: Servicio;
      if (initial) {
        const previous = serviceValues(initial);
        const changed: DatosActualizacionServicio = {};
        if (payload.titulo !== previous.titulo) changed.titulo = payload.titulo;
        if (payload.descripcion !== previous.descripcion) changed.descripcion = payload.descripcion;
        if (payload.precio !== Number(previous.precio)) changed.precio = payload.precio;
        if (String(payload.categoriaId ?? "") !== previous.categoriaId) changed.categoriaId = payload.categoriaId;
        if (payload.imagenUrl !== (previous.imagenUrl || null)) changed.imagenUrl = payload.imagenUrl;
        const response = await updateService(token, initial.id, changed);
        saved = response.servicio;
      } else {
        const response = await createService(token, payload);
        saved = response.servicio;
      }
      onSaved(saved);
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="so-form" onSubmit={submit} noValidate>
      <div className="so-form__grid">
        <label className="so-field so-field--wide"><span>Título <small>5–150 caracteres</small></span><input value={values.titulo} minLength={5} maxLength={150} required onChange={(event) => set("titulo", event.target.value)} /></label>
        <label className="so-field so-field--wide"><span>Descripción <small>10–5000 caracteres</small></span><textarea rows={6} minLength={10} maxLength={5000} required value={values.descripcion} onChange={(event) => set("descripcion", event.target.value)} /></label>
        <label className="so-field"><span>Precio (USD)</span><input type="number" min="0.01" step="0.01" required value={values.precio} onChange={(event) => set("precio", event.target.value)} /></label>
        <CatalogFields categories={categories} skills={[]} categoryId={values.categoriaId} onCategoryChange={(value) => set("categoriaId", value)} includeSkills={false} />
        <label className="so-field so-field--wide"><span>URL de imagen <small>opcional; no se pueden subir archivos</small></span><input type="url" inputMode="url" placeholder="https://…" value={values.imagenUrl} onChange={(event) => set("imagenUrl", event.target.value)} /></label>
      </div>
      {error && <p className="so-inline-error" role="alert">{error}</p>}
      <div className="so-form__actions">
        {onCancel && <button className="so-button so-button--quiet" type="button" disabled={saving} onClick={onCancel}>Cancelar</button>}
        <button className="so-button so-button--primary" type="submit" disabled={saving}>{saving ? "Guardando…" : initial ? "Guardar cambios" : "Publicar servicio"}</button>
      </div>
    </form>
  );
}

function FreelancerServices({ token }: { token: string }) {
  const [tab, setTab] = useState("services");
  const [services, setServices] = useState<Servicio[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Servicio | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [reload, setReload] = useState(0);
  const catalogs = useCatalogs(token);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getMyServices(token, { page, limit: Math.min(PAGE_SIZE, MAX_PAGE_SIZE), estado: status || undefined, q: query.trim() || undefined })
      .then((result) => {
        if (active) {
          setServices(result.items);
          setTotal(result.total);
        }
      })
      .catch((reason: unknown) => { if (active) setError(errorMessage(reason)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token, page, status, query, reload]);

  async function changeStatus(service: Servicio, next: "activo" | "pausado" | "eliminado") {
    setBusyId(service.id);
    setError("");
    try {
      await changeServiceStatus(token, service.id, next);
      setReload((value) => value + 1);
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <PageShell eyebrow="Espacio freelancer" title="Tus servicios" description="Publica tus servicios y controla cuándo están disponibles.">
      <Tabs active={tab} onChange={setTab} items={[{ id: "services", label: "Mis servicios" }, { id: "create", label: "Crear servicio" }]} />
      <Panel id="services" active={tab}>
        {editing ? (
          <section className="so-surface">
            <h2>Editar servicio</h2>
            {catalogs.error ? <Notice error={catalogs.error} retry={catalogs.retry} /> : catalogs.loading ? <p role="status">Cargando categorías…</p> : (
              <ServiceForm token={token} categories={catalogs.categories} initial={editing} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); setReload((value) => value + 1); }} />
            )}
          </section>
        ) : (
          <>
            <div className="so-filterbar">
              <label className="so-field so-search"><span>Buscar servicios</span><input type="search" placeholder="Nombre del servicio" value={query} onChange={(event) => { setPage(1); setQuery(event.target.value); }} /></label>
              <label className="so-field"><span>Estado</span><select value={status} onChange={(event) => { setPage(1); setStatus(event.target.value); }}>
                <option value="">Todos los estados</option><option value="activo">Activo</option><option value="pausado">Pausado</option><option value="eliminado">Eliminado</option>
              </select></label>
            </div>
            {error && <Notice error={error} retry={() => setReload((value) => value + 1)} />}
            {loading ? <p className="so-loading" role="status">Cargando tus servicios…</p> : services.length === 0 ? <p className="so-empty">No hay servicios para mostrar.</p> : (
              <div className="so-list">{services.map((service) => (
                <article className="so-card" key={service.id}>
                  <div className="so-card__top"><span className="so-badge">{statusLabel(service.estado)}</span><span className="so-muted">{service.categoriaId ? `Categoría #${service.categoriaId}` : "Sin categoría"}</span></div>
                  <h3>{service.titulo}</h3><p className="so-clamp">{service.descripcion}</p>
                  <div className="so-card__meta"><strong>{money(service.precio)}</strong></div>
                  <div className="so-form__actions">
                    {service.estado !== "eliminado" && <>
                      <button className="so-button so-button--outline" type="button" onClick={() => setEditing(service)}>Editar</button>
                      {service.estado === "activo"
                        ? <button className="so-button so-button--quiet" type="button" disabled={busyId === service.id} onClick={() => void changeStatus(service, "pausado")}>Pausar</button>
                        : <button className="so-button so-button--primary" type="button" disabled={busyId === service.id} onClick={() => void changeStatus(service, "activo")}>Activar</button>}
                      <button className="so-button so-button--danger" type="button" disabled={busyId === service.id} onClick={() => void changeStatus(service, "eliminado")}>Eliminar</button>
                    </>}
                  </div>
                </article>
              ))}</div>
            )}
            <Pager page={page} total={total} onChange={setPage} />
          </>
        )}
      </Panel>
      <Panel id="create" active={tab}>
        <section className="so-surface">
          <h2>Publica un servicio</h2>
          <p className="so-muted">Presenta con claridad qué ofreces y cuánto cuesta.</p>
          {catalogs.error ? <Notice error={catalogs.error} retry={catalogs.retry} /> : catalogs.loading ? <p role="status">Cargando categorías…</p> : (
            <ServiceForm token={token} categories={catalogs.categories} onSaved={() => { setTab("services"); setPage(1); setReload((value) => value + 1); }} />
          )}
        </section>
      </Panel>
    </PageShell>
  );
}

function ClientServices({ token }: { token: string }) {
  const navigate = useNavigate();
  const [services, setServices] = useState<Servicio[]>([]);
  const [selected, setSelected] = useState<Servicio | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [reload, setReload] = useState(0);
  const catalogs = useCatalogs(token);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    listServices(token, {
      page,
      limit: Math.min(PAGE_SIZE, MAX_PAGE_SIZE),
      categoriaId: categoryId ? Number(categoryId) : undefined,
      q: query.trim() || undefined,
    })
      .then((result) => {
        if (active) {
          setServices(result.items);
          setTotal(result.total);
        }
      })
      .catch((reason: unknown) => { if (active) setError(errorMessage(reason)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token, page, categoryId, query, reload]);

  async function openService(service: Servicio) {
    setActionError("");
    setDetailLoading(true);
    try {
      setSelected(await getService(token, service.id));
    } catch (reason) {
      setActionError(errorMessage(reason));
    } finally {
      setDetailLoading(false);
    }
  }

  async function startConversation() {
    if (!selected || creatingConversation) return;
    setCreatingConversation(true);
    setActionError("");
    try {
      const result = await createConversation(token, { servicioId: selected.id });
      navigate(`/chat/${result.conversacion.id}`);
    } catch (reason) {
      setActionError(errorMessage(reason));
    } finally {
      setCreatingConversation(false);
    }
  }

  return (
    <PageShell eyebrow="Explora servicios" title="Encuentra el servicio ideal" description="Busca servicios publicados por freelancers y contacta directamente para conversar.">
      {selected ? (
        <div className="so-stack">
          {actionError && <Notice error={actionError} />}
          {detailLoading ? <p className="so-loading" role="status">Cargando los detalles del servicio…</p> : (
            <article className="so-detail">
              <button type="button" className="so-button so-button--quiet" onClick={() => setSelected(null)}>← Volver a servicios</button>
              <div className="so-detail__head">
                <div><span className="so-badge">{statusLabel(selected.estado)}</span><h2>{selected.titulo}</h2></div>
                <strong className="so-price">{money(selected.precio)}</strong>
              </div>
              <p className="so-detail__description">{selected.descripcion}</p>
              <dl className="so-facts">
                <div><dt>Categoría</dt><dd>{selected.categoriaId ? catalogs.categories.find((category) => category.id === selected.categoriaId)?.nombre ?? `Categoría #${selected.categoriaId}` : "Sin categoría"}</dd></div>
                {selected.freelancer?.nombre && <div><dt>Freelancer</dt><dd>{selected.freelancer.nombre}</dd></div>}
                {selected.freelancer?.calificacionPromedio !== undefined && <div><dt>Calificación</dt><dd>★ {selected.freelancer.calificacionPromedio.toFixed(1)}</dd></div>}
              </dl>
              {selected.imagenUrl && <img className="so-cover" src={selected.imagenUrl} alt={`Imagen de ${selected.titulo}`} />}
              <div className="so-form__actions">
                <button className="so-button so-button--primary" type="button" disabled={creatingConversation || selected.estado?.toLowerCase() !== "activo"} onClick={() => void startConversation()}>
                  {creatingConversation ? "Abriendo conversación…" : "Contactar al freelancer"}
                </button>
              </div>
              {selected.estado?.toLowerCase() !== "activo" && <p className="so-muted">Este servicio no está disponible para nuevos contactos.</p>}
            </article>
          )}
        </div>
      ) : (
        <>
          <div className="so-filterbar">
            <label className="so-field so-search"><span>Buscar servicios</span><input type="search" placeholder="Palabras clave" value={query} onChange={(event) => { setPage(1); setQuery(event.target.value); }} /></label>
            <label className="so-field"><span>Categoría</span><select value={categoryId} onChange={(event) => { setPage(1); setCategoryId(event.target.value); }}>
              <option value="">Todas las categorías</option>{catalogs.categories.map((category) => <option key={category.id} value={category.id}>{category.nombre}</option>)}
            </select></label>
          </div>
          {catalogs.error && <Notice error={catalogs.error} retry={catalogs.retry} />}
          {error && <Notice error={error} retry={() => setReload((value) => value + 1)} />}
          {detailLoading && <p role="status">Abriendo detalles del servicio…</p>}
          {loading ? <p className="so-loading" role="status">Cargando servicios…</p> : services.length === 0 ? <p className="so-empty">No encontramos servicios para estos filtros.</p> : (
            <div className="so-list">{services.map((service) => (
              <article className="so-card" key={service.id}>
                <div className="so-card__top"><span className="so-badge">{statusLabel(service.estado)}</span>{service.categoriaId && <span className="so-muted">{catalogs.categories.find((category) => category.id === service.categoriaId)?.nombre ?? `Categoría #${service.categoriaId}`}</span>}</div>
                <h3>{service.titulo}</h3>
                <p className="so-clamp">{service.descripcion}</p>
                {service.freelancer?.nombre && <span className="so-muted">Por {service.freelancer.nombre}</span>}
                <div className="so-card__meta"><strong>{money(service.precio)}</strong></div>
                <button className="so-button so-button--outline" type="button" disabled={service.estado?.toLowerCase() !== "activo"} onClick={() => void openService(service)}>Ver servicio</button>
              </article>
            ))}</div>
          )}
          <Pager page={page} total={total} onChange={setPage} />
        </>
      )}
    </PageShell>
  );
}

export function ClientServicesOffersPage({ onContractPath }: { onContractPath?: (path: string) => void } = {}) {
  return <AuthGate role="cliente">{(token) => <ClientOffers token={token} onContractPath={onContractPath} />}</AuthGate>;
}

export function ClientServicesPage() {
  return <AuthGate role="cliente">{(token) => <ClientServices token={token} />}</AuthGate>;
}

export function FreelancerMarketplacePage() {
  return <AuthGate role="freelancer">{(token) => <FreelancerMarketplace token={token} />}</AuthGate>;
}

export function FreelancerServicesPage() {
  return <AuthGate role="freelancer">{(token) => <FreelancerServices token={token} />}</AuthGate>;
}

export function ServicesOffersPage() {
  const { user, cargando, token } = useAuth();
  if (cargando) return <main className="so-page"><p role="status">Comprobando tu sesión…</p></main>;
  if (!token || !user) return <main className="so-page"><div className="so-alert" role="alert">Inicia sesión para ver los servicios y ofertas.</div></main>;
  if (user?.rol === "cliente") return <ClientServicesOffersPage />;
  if (user?.rol === "freelancer") return <FreelancerMarketplacePage />;
  return <main className="so-page"><div className="so-alert" role="alert">Inicia sesión para ver los servicios y ofertas.</div></main>;
}
