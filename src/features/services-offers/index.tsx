import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import type { Habilidad } from "../../infrastructure/api/apiCatalogos";
import type { Categoria } from "../../core/domain/entities/categoria";
import type { DatosOferta, EstadoOferta, Oferta } from "../../core/domain/entities/oferta";
import { useInternalSearch } from "../layout/InternalSearchContext";
import { Badge } from "../../components/ui/Badge";
import { buttonClassName } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { ServiceCard } from "../../components/ui/ServiceCard";
import "./services-offers.css";

const PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;
type CatalogSkill = Habilidad;

export function useCatalogs(token: string) {
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

/**
 * El backend exige rol freelancer (2) para publicar servicios. Si llega un 403
 * mostramos la causa real en lugar del mensaje genérico del servidor.
 */
function serviceErrorMessage(error: unknown): string {
  const status = (error as { status?: number } | null)?.status;
  if (status === 403) {
    return "El servidor rechazó la publicación porque tu cuenta no tiene el rol de freelancer. Inicia sesión con tu cuenta de freelancer o revisa el rol de tu perfil.";
  }
  return errorMessage(error);
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
  const { user, token, cargando, refrescarSesion, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState("");
  if (cargando) return <div className="so-page"><p role="status">Comprobando tu sesión…</p></div>;
  if (!user || !token) {
    return <div className="so-page"><div className="so-alert" role="alert">Inicia sesión para continuar.</div></div>;
  }
  if (user.rol !== role) {
    const rolActual = user.rol === "freelancer" ? "freelancer" : "cliente";
    const destino = user.rol === "freelancer" ? "servicios" : "proyectos";
    const onRefresh = async () => {
      setRefreshing(true);
      setRefreshError("");
      try {
        await refrescarSesion();
      } catch (e) {
        setRefreshError(e instanceof Error ? e.message : "No se pudo actualizar la sesión.");
      } finally {
        setRefreshing(false);
      }
    };
    return (
      <div className="so-page">
        <div className="so-alert" role="alert">
          <p>
            Tu sesión actual indica el rol <strong>{rolActual}</strong>, por eso no puedes entrar a esta sección de{" "}
            {role === "cliente" ? "clientes" : "freelancers"}.
          </p>
          <p>
            Si tu cuenta tiene el rol correcto, actualiza la sesión (puede estar desactualizada). Si no, cierra sesión y entra con la cuenta correcta.
          </p>
          {refreshError ? <p className="so-inline-error" role="alert">{refreshError}</p> : null}
          <div className="so-form__actions">
            <button className="so-button so-button--outline" type="button" disabled={refreshing} onClick={onRefresh}>
              {refreshing ? "Actualizando…" : "Actualizar sesión"}
            </button>
            <button className="so-button so-button--quiet" type="button" onClick={() => navigate(user.rol === "freelancer" ? "/dashboard/freelancer" : "/dashboard/cliente")}>
              Ir a mi panel
            </button>
            <button className="so-button so-button--quiet" type="button" onClick={() => { cerrarSesion(); navigate("/login", { replace: true }); }}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    );
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
    <div className="so-page">
      <header className="so-heading">
        <p className="so-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      {children}
    </div>
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

function DiscoveryCategoryChips({
  categories,
  selected,
  onChange,
}: {
  categories: Categoria[];
  selected: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="so-discovery-categories" role="group" aria-label="Filtrar por categoría">
      <button
        className={selected === "" ? "is-active" : undefined}
        type="button"
        aria-pressed={selected === ""}
        onClick={() => onChange("")}
      >
        Todas
      </button>
      {categories.map((category) => (
        <button
          className={selected === String(category.id) ? "is-active" : undefined}
          key={category.id}
          type="button"
          aria-pressed={selected === String(category.id)}
          onClick={() => onChange(String(category.id))}
        >
          {category.nombre}
        </button>
      ))}
    </div>
  );
}

function DiscoverySkeletons({ label }: { label: string }) {
  return (
    <>
      <p className="so-discovery-status" role="status">{label}</p>
      <div className="so-discovery-grid" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <article className="so-discovery-card so-discovery-card--skeleton" key={index}>
            <div className="so-discovery-card__image" />
            <div className="so-discovery-card__body">
              <span className="so-skeleton-line so-skeleton-line--short" />
              <span className="so-skeleton-line" />
              <span className="so-skeleton-line so-skeleton-line--wide" />
              <span className="so-skeleton-line so-skeleton-line--button" />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function DiscoveryEmpty({
  emptyTitle,
  emptyMessage,
  filteredTitle,
  filteredMessage,
  filtered,
  onClear,
  onRefresh,
}: {
  emptyTitle: string;
  emptyMessage: string;
  filteredTitle: string;
  filteredMessage: string;
  filtered: boolean;
  onClear: () => void;
  onRefresh?: () => void;
}) {
  return (
    <EmptyState
      title={filtered ? filteredTitle : emptyTitle}
      description={filtered ? filteredMessage : emptyMessage}
      actionLabel={filtered ? "Limpiar filtros" : onRefresh ? "Actualizar" : undefined}
      onAction={filtered ? onClear : onRefresh}
      secondary={
        filtered && onRefresh ? (
          <button className={buttonClassName({ variant: "secondary", size: "sm" })} type="button" onClick={onRefresh}>
            Actualizar
          </button>
        ) : undefined
      }
    />
  );
}

function ProjectDiscoveryCard({
  offer,
  onOpen,
}: {
  offer: OfertaMarketplace;
  onOpen: () => void;
}) {
  return (
    <ServiceCard
      title={offer.titulo}
      description={offer.descripcion}
      category={offer.categoria?.nombre}
      imageUrl={offer.imagenUrl}
      authorName={offer.cliente.nombre}
      authorPhoto={offer.cliente.fotoPerfil}
      authorTitle={offer.cliente.nombreEmpresa ?? "Cliente"}
      showRating={false}
      price={offer.presupuesto}
      pricePrefix="Presupuesto"
      priceFallback="Por definir"
      eyebrow={offer.categoria?.nombre ?? "Proyecto"}
      onCta={onOpen}
      ctaLabel="Ver proyecto"
      footer={
        <div className="so-card-footer">
          <Badge tone="blue">{statusLabel(offer.estado)}</Badge>
          {offer.plazoDias !== null ? <span className="so-muted">{offer.plazoDias} días de plazo</span> : null}
        </div>
      }
    />
  );
}

function ServiceDiscoveryCard({
  service,
  onOpen,
}: {
  service: Servicio;
  onOpen: () => void;
}) {
  const activo = service.estado?.toLowerCase() === "activo";

  return (
    <ServiceCard
      title={service.titulo}
      description={service.descripcion}
      category={service.categoria?.nombre}
      imageUrl={service.imagenUrl}
      authorName={service.freelancer?.nombre}
      authorPhoto={service.freelancer?.fotoPerfil}
      authorTitle={service.freelancer?.tituloProfesional}
      rating={service.freelancer?.calificacionPromedio}
      price={service.precio}
      pricePrefix="Desde"
      eyebrow={service.categoria?.nombre ?? "Servicio"}
      onCta={onOpen}
      ctaDisabled={!activo}
      ctaLabel={activo ? "Ver servicio" : "No disponible"}
      footer={<Badge tone={activo ? "green" : "neutral"}>{statusLabel(service.estado)}</Badge>}
    />
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

function ListingPreview({
  kind,
  title,
  description,
  amountLabel,
  amount,
  imageUrl,
}: {
  kind: "proyecto" | "servicio";
  title: string;
  description: string;
  amountLabel: string;
  amount: string;
  imageUrl: string;
}) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const imageFailed = failedImageUrl === imageUrl.trim();
  const hasImage = Boolean(imageUrl.trim() && validImageUrl(imageUrl) && !imageFailed);

  return (
    <aside className="so-form-preview" aria-label={`Vista previa del ${kind}`}>
      <h2>Vista previa</h2>
      <article className="so-preview-card">
        <div className="so-preview-card__image">
          {hasImage ? (
            <img src={imageUrl.trim()} alt="" onError={() => setFailedImageUrl(imageUrl.trim())} />
          ) : (
            <span>
              {imageUrl.trim() && !validImageUrl(imageUrl)
                ? "Ingresa una URL válida para ver la imagen."
                : imageFailed
                  ? "No se pudo cargar esta imagen."
                  : "La imagen aparecerá aquí."}
            </span>
          )}
        </div>
        <div className="so-preview-card__content">
          <span className="so-badge">{kind === "proyecto" ? "Proyecto" : "Servicio"}</span>
          <h3>{title.trim() || `Título del ${kind}`}</h3>
          <p>{description.trim() || "La descripción aparecerá aquí."}</p>
          <div className="so-preview-card__amount">
            <span>{amountLabel}</span>
            <strong>{amount}</strong>
          </div>
        </div>
      </article>
    </aside>
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

export function OfferForm({
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
        if (Object.keys(changed).length === 0) {
          onSaved(initial);
          return;
        }
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

  const budgetPreview = values.presupuesto.trim() && Number.isFinite(Number(values.presupuesto))
    ? money(Number(values.presupuesto))
    : "Pendiente";

  return (
    <form className="so-form" onSubmit={submit} noValidate>
      <div className="so-form-layout">
        <div className="so-form-main">
          <section className="so-form-section">
            <header className="so-form-section__heading">
              <h2>Sobre el proyecto</h2>
              <p>Explica con claridad qué trabajo necesitas.</p>
            </header>
            <div className="so-form__grid">
              <label className="so-field so-field--wide">
                <span>Título <small>5–200 caracteres</small></span>
                <input
                  value={values.titulo}
                  minLength={5}
                  maxLength={200}
                  required
                  aria-invalid={values.titulo.length > 0 && (values.titulo.trim().length < 5 || values.titulo.trim().length > 200)}
                  onChange={(event) => set("titulo", event.target.value)}
                />
                <small className="ui-help">{values.titulo.length}/200 caracteres</small>
              </label>
              <label className="so-field so-field--wide">
                <span>Descripción <small>10–5000 caracteres</small></span>
                <textarea
                  value={values.descripcion}
                  minLength={10}
                  maxLength={5000}
                  required
                  rows={6}
                  aria-invalid={values.descripcion.length > 0 && (values.descripcion.trim().length < 10 || values.descripcion.trim().length > 5000)}
                  onChange={(event) => set("descripcion", event.target.value)}
                />
                <small className="ui-help">{values.descripcion.length}/5000 caracteres</small>
              </label>
            </div>
          </section>

          <section className="so-form-section">
            <header className="so-form-section__heading">
              <h2>Presupuesto y requisitos</h2>
              <p>Define el plazo y la experiencia que necesitas.</p>
            </header>
            <div className="so-form__grid">
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
            </div>
          </section>

          <section className="so-form-section">
            <header className="so-form-section__heading">
              <h2>Imagen del proyecto</h2>
              <p>Usa una URL pública de imagen para que tu publicación destaque.</p>
            </header>
            <div className="so-form__grid">
              <label className="so-field so-field--wide">
                <span>URL de imagen <small>El backend guarda una URL; no admite subida de archivos.</small></span>
                <input type="url" inputMode="url" placeholder="https://…" value={values.imagenUrl} onChange={(event) => set("imagenUrl", event.target.value)} />
              </label>
            </div>
          </section>

          {error && <p className="so-inline-error" role="alert">{error}</p>}
          <div className="so-form__actions">
            {onCancel && <button className="so-button so-button--quiet" type="button" disabled={saving} onClick={onCancel}>Cancelar</button>}
            <button className="so-button so-button--action" type="submit" disabled={saving}>
              {saving ? "Guardando…" : editing ? "Guardar cambios" : "Publicar proyecto"}
            </button>
          </div>
        </div>
        <ListingPreview
          kind="proyecto"
          title={values.titulo}
          description={values.descripcion}
          amountLabel="Presupuesto"
          amount={budgetPreview}
          imageUrl={values.imagenUrl}
        />
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
        {market && (
          <div>
            <dt>Cliente</dt>
            <dd>
              <Link className="so-profile-link" to={`/perfil/${market.cliente.id}?proyectoId=${offer.id}`}>
                {market.cliente.nombre}
              </Link>
            </dd>
          </div>
        )}
      </dl>
      {offer.habilidades?.length > 0 && <div className="so-tags" aria-label="Habilidades">{offer.habilidades.map((item) => <span key={item.id}>{item.nombre}</span>)}</div>}
      {offer.imagenUrl && <img className="so-cover" src={offer.imagenUrl} alt={`Imagen de ${offer.titulo}`} />}
      {children}
    </article>
  );
}

function ProposalCards({
  proposals,
  projectId,
  busyId,
  onAccept,
  onReject,
  onChat,
}: {
  proposals: Propuesta[];
  projectId?: number;
  busyId: number | null;
  onAccept?: (proposal: Propuesta) => void;
  onReject?: (proposal: Propuesta) => void;
  onChat?: (proposal: Propuesta) => void;
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
                <div>
                  <h3>
                    {projectId ? (
                      <Link className="so-profile-link" to={`/perfil/${proposal.freelancer.id}?proyectoId=${projectId}`}>
                        {proposal.freelancer.nombre}
                      </Link>
                    ) : proposal.freelancer.nombre}
                  </h3>
                  <span className="so-muted">{proposal.freelancer.calificacionPromedio ? `★ ${proposal.freelancer.calificacionPromedio.toFixed(1)}` : "Nuevo freelancer"}</span>
                </div>
              </div>
              <span className="so-badge">{statusLabel(proposal.estado)}</span>
            </div>
            <p>{proposal.mensaje || "Sin mensaje adicional."}</p>
            <div className="so-card__meta"><strong>{money(proposal.montoPropuesto)}</strong><span>Enviada {date(proposal.fechaEnvio)}</span></div>
            {onChat && (
              <button className="so-button so-button--outline" type="button" disabled={busyId !== null} onClick={() => onChat(proposal)}>
                Abrir chat
              </button>
            )}
            {pending && onAccept && onReject && (
              <div className="so-form__actions">
                <button className="so-button so-button--action" type="button" disabled={busyId !== null} onClick={() => onAccept(proposal)}>
                  {busyId === proposal.id ? "Procesando…" : "Aceptar"}
                </button>
                <button className="so-button so-button--quiet" type="button" disabled={busyId !== null} onClick={() => onReject(proposal)}>Rechazar</button>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

export function ClientOffers({ token, onContractPath }: { token: string; onContractPath?: (path: string) => void }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("offers");
  const [offers, setOffers] = useState<Oferta[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { query, setQuery } = useInternalSearch();
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
    setPage(1);
  }, [query]);

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
        const contractId = accepted.contrato && typeof accepted.contrato === "object" && "id" in accepted.contrato
          ? Number(accepted.contrato.id)
          : NaN;
        const path = Number.isInteger(contractId) && contractId > 0 ? `/contracts/${contractId}` : "/contracts";
        window.dispatchEvent(new CustomEvent("services-offers:contract-path", {
          detail: { path, contractId: Number.isInteger(contractId) && contractId > 0 ? contractId : undefined, offerId: selected.id, proposalId: proposal.id, contract: accepted.contrato },
        }));
        if (onContractPath) onContractPath(path);
        else navigate(path);
      } else {
        await rejectProposal(token, selected.id, proposal.id);
        setProposals((current) => current.map((item) => item.id === proposal.id ? { ...item, estado: "rechazada" } : item));
        setReload((value) => value + 1);
      }
    } catch (reason) {
      setActionError(errorMessage(reason));
    } finally {
      setBusyId(null);
    }
  }

  async function handleChatProposal(proposal: Propuesta) {
    if (!selected) return;
    setActionError("");
    setBusyId(proposal.id);
    try {
      const result = await createConversation(token, {
        proyectoId: selected.id,
        freelancerId: proposal.freelancer.id,
      });
      navigate(`/chat/${result.conversacion.id}`);
    } catch (reason) {
      setActionError(errorMessage(reason));
    } finally {
      setBusyId(null);
    }
  }

  const filteredCount = proposalsCount || proposals.length;

  return (
    <PageShell eyebrow="Espacio cliente" title="Mis proyectos" description="Publica proyectos y gestiona las propuestas que recibes.">
      <Tabs active={tab} onChange={setTab} items={[{ id: "offers", label: "Mis proyectos" }, { id: "create", label: "Crear proyecto" }]} />
      {tab === "offers" && (
        <Panel id="offers" active={tab}>
          {selected ? (
            <div className="so-stack">
              {actionError && <Notice error={actionError} retry={() => setReload((value) => value + 1)} />}
              {editing ? (
                <section className="so-surface">
                  <h2>Editar proyecto</h2>
                  {catalogs.error ? <Notice error={catalogs.error} retry={catalogs.retry} /> : catalogs.loading ? <p role="status">Cargando categorías y habilidades…</p> : (
                    <OfferForm token={token} categories={catalogs.categories} skills={catalogs.skills} initial={selected} onCancel={() => setEditing(false)} onSaved={(saved) => { setSelected(saved); setEditing(false); setReload((value) => value + 1); }} />
                  )}
                </section>
              ) : (
                <>
                  <OfferDetails offer={selected} onBack={() => setSelected(null)}>
                    <div className="so-form__actions">
                      <button className="so-button so-button--outline" type="button" onClick={() => setEditing(true)} disabled={selected.estado === "completado" || selected.estado === "cancelado"}>Editar proyecto</button>
                      {selected.estado === "abierto" && <button className="so-button so-button--danger" type="button" disabled={busyId !== null} onClick={() => updateStatus("cancelado")}>Cancelar proyecto</button>}
                      {selected.estado === "en_progreso" && <>
                        <button className="so-button so-button--action" type="button" disabled={busyId !== null} onClick={() => updateStatus("completado")}>Marcar completado</button>
                        <button className="so-button so-button--danger" type="button" disabled={busyId !== null} onClick={() => updateStatus("cancelado")}>Cancelar proyecto</button>
                      </>}
                    </div>
                  </OfferDetails>
                  <section className="so-surface">
                    <div className="so-section-title"><div><h2>Propuestas recibidas</h2><p>{filteredCount} en total</p></div></div>
                    {proposalsLoading ? <p role="status">Cargando propuestas…</p> : <ProposalCards proposals={proposals} projectId={selected.id} busyId={busyId} onAccept={(proposal) => handleProposal(proposal, "accept")} onReject={(proposal) => handleProposal(proposal, "reject")} onChat={(proposal) => void handleChatProposal(proposal)} />}
                  </section>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="so-filterbar">
                <label className="so-field so-search"><span>Buscar proyectos</span><input type="search" value={query} placeholder="Título o descripción" onChange={(event) => { setPage(1); setQuery(event.target.value); }} /></label>
                <label className="so-field"><span>Estado</span><select value={status} onChange={(event) => { setPage(1); setStatus(event.target.value); }}>
                  <option value="">Todos los estados</option><option value="abierto">Abierto</option><option value="en_progreso">En progreso</option><option value="completado">Completado</option><option value="cancelado">Cancelado</option>
                </select></label>
              </div>
              {error && <Notice error={error} retry={() => setReload((value) => value + 1)} />}
              {detailLoading && <p role="status">Cargando los detalles de la oferta…</p>}
              {loading ? <p className="so-loading" role="status">Cargando tus proyectos…</p> : offers.length === 0 ? (
                <EmptyState
                  title={query || status ? "No encontramos proyectos" : "Aún no tienes proyectos"}
                  description={query || status ? "Prueba con otro término o cambia el estado." : "Publica tu primer proyecto y empieza a recibir propuestas de freelancers."}
                  actionLabel={query || status ? "Limpiar filtros" : "Crear proyecto"}
                  onAction={query || status ? () => { setQuery(""); setStatus(""); setPage(1); } : () => setTab("create")}
                />
              ) : (
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
            <h2>Publica un proyecto</h2>
            <p className="so-muted">Describe el trabajo, el presupuesto y el plazo para recibir propuestas a medida.</p>
            {catalogs.error ? <Notice error={catalogs.error} retry={catalogs.retry} /> : catalogs.loading ? <p role="status">Cargando categorías y habilidades…</p> : (
              <OfferForm token={token} categories={catalogs.categories} skills={catalogs.skills} onSaved={(saved) => { setTab("offers"); setSelected(saved); setReload((value) => value + 1); }} />
            )}
          </section>
        </Panel>
      )}
    </PageShell>
  );
}

export function FreelancerMarketplace({ token }: { token: string }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("market");
  const [items, setItems] = useState<OfertaMarketplace[]>([]);
  const [selected, setSelected] = useState<OfertaMarketplace | null>(null);
  const [proposals, setProposals] = useState<Propuesta[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { query, setQuery } = useInternalSearch();
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [sending, setSending] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [sendError, setSendError] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [submittedIds, setSubmittedIds] = useState<number[]>([]);
  const [myProposalList, setMyProposalList] = useState<Propuesta[]>([]);
  const [myLoading, setMyLoading] = useState(false);
  const [myError, setMyError] = useState("");
  const [myReload, setMyReload] = useState(0);
  const catalogs = useCatalogs(token);

  useEffect(() => {
    setPage(1);
  }, [query]);
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
          .map((item) => item.proyecto?.id)
          .filter((id): id is number => typeof id === "number");
        const pendingIds = result.propuestas
          .filter((item) => item.estado.toLowerCase() === "pendiente")
          .map((item) => item.proyecto?.id)
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

  async function startProjectChat() {
    if (!selected || chatLoading) return;
    setChatLoading(true);
    setSendError("");
    try {
      const result = await createConversation(token, { proyectoId: selected.id });
      navigate(`/chat/${result.conversacion.id}`);
    } catch (reason) {
      setSendError(errorMessage(reason));
    } finally {
      setChatLoading(false);
    }
  }

  const pendingOfferIds = useMemo(() => new Set([
    ...submittedIds,
    ...myProposalList.filter((item) => item.estado.toLowerCase() === "pendiente").map((item) => item.proyecto?.id).filter((id): id is number => typeof id === "number"),
  ]), [submittedIds, myProposalList]);

  return (
    <PageShell eyebrow="Espacio freelancer" title="Explorar proyectos" description="Encuentra proyectos abiertos y da seguimiento a tus propuestas.">
      <Tabs active={tab} onChange={setTab} items={[{ id: "market", label: "Proyectos abiertos" }, { id: "mine", label: "Mis propuestas" }]} />
      <Panel id="market" active={tab}>
        {selected ? (
          <OfferDetails offer={selected} onBack={() => setSelected(null)}>
            <div className="so-form__actions">
              <button className="so-button so-button--outline" type="button" disabled={chatLoading} onClick={() => void startProjectChat()}>
                {chatLoading ? "Abriendo chat…" : "Abrir chat del proyecto"}
              </button>
            </div>
            {sendError && <p className="so-inline-error" role="alert">{sendError}</p>}
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
                  <button type="submit" className="so-button so-button--action" disabled={sending || myLoading || Boolean(myError)}>{sending ? "Enviando…" : "Enviar propuesta"}</button>
                </form>
              )}
            </section>
          </OfferDetails>
        ) : (
          <>
            <div className="so-discovery-controls">
              <label className="so-field so-discovery-search">
                <span>Buscar proyectos</span>
                <input
                  type="search"
                  placeholder="Título, descripción o habilidad"
                  value={query}
                  onChange={(event) => { setPage(1); setQuery(event.target.value); }}
                />
              </label>
              <DiscoveryCategoryChips
                categories={catalogs.categories}
                selected={categoryId}
                onChange={(value) => { setPage(1); setCategoryId(value); }}
              />
            </div>
            {catalogs.error && <Notice error={`No se pudieron cargar las categorías y habilidades: ${catalogs.error}`} retry={catalogs.retry} />}
            {detailLoading && <p className="so-discovery-status" role="status">Cargando los detalles del proyecto…</p>}
            {error ? (
              <Notice error={`No se pudieron cargar los proyectos: ${error}`} retry={() => setReload((value) => value + 1)} />
            ) : loading ? (
              <DiscoverySkeletons label="Buscando proyectos disponibles…" />
            ) : items.length === 0 ? (
              <DiscoveryEmpty
                emptyTitle="Aún no hay proyectos"
                emptyMessage="Vuelve pronto para descubrir nuevas oportunidades."
                filteredTitle="No encontramos proyectos para esos filtros"
                filteredMessage="Prueba con otra búsqueda o categoría."
                filtered={Boolean(query.trim() || categoryId)}
                onClear={() => { setPage(1); setQuery(""); setCategoryId(""); }}
                onRefresh={() => { setPage(1); setReload((value) => value + 1); }}
              />
            ) : (
              <section className="so-discovery-grid" aria-label="Proyectos disponibles">
                {items.map((offer) => (
                  <ProjectDiscoveryCard key={offer.id} offer={offer} onOpen={() => void openMarketOffer(offer)} />
                ))}
              </section>
            )}
            {!error && !loading && <Pager page={page} total={total} onChange={setPage} />}
          </>
        )}
      </Panel>
      <Panel id="mine" active={tab}>
        {myError && <Notice error={myError} retry={() => setMyReload((value) => value + 1)} />}
        {myLoading ? <p className="so-loading" role="status">Cargando tus propuestas…</p> : myProposalList.length === 0 ? (
          <EmptyState
            title="Aún no has enviado propuestas"
            description="Cuando postules a un proyecto, tus propuestas aparecerán aquí para que puedas hacer seguimiento."
            actionLabel="Explorar proyectos"
            onAction={() => setTab("market")}
          />
        ) : (
          <div className="so-list">{myProposalList.map((proposal) => (
            <article className="so-card" key={proposal.id}>
              <div className="so-card__top"><span className="so-badge">{statusLabel(proposal.estado)}</span><span className="so-muted">{date(proposal.fechaEnvio)}</span></div>
              <h3>{proposal.proyecto?.titulo ?? `Oferta #${proposal.proyecto?.id ?? "—"}`}</h3>
              <p>{proposal.mensaje || "Sin mensaje adicional."}</p>
              <div className="so-card__meta"><strong>{money(proposal.montoPropuesto)}</strong></div>
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
    categoriaId: service?.categoria?.id ? String(service.categoria.id) : "",
    imagenUrl: service?.imagenUrl ?? "",
  };
}

export function ServiceForm({
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
        if (Object.keys(changed).length === 0) {
          onSaved(initial);
          return;
        }
        const response = await updateService(token, initial.id, changed);
        saved = response.servicio;
      } else {
        const response = await createService(token, payload);
        saved = response.servicio;
      }
      onSaved(saved);
    } catch (reason) {
      setError(serviceErrorMessage(reason));
    } finally {
      setSaving(false);
    }
  }

  const pricePreview = values.precio.trim() && Number.isFinite(Number(values.precio))
    ? money(Number(values.precio))
    : "Pendiente";

  return (
    <form className="so-form" onSubmit={submit} noValidate>
      <div className="so-form-layout">
        <div className="so-form-main">
          <section className="so-form-section">
            <header className="so-form-section__heading">
              <h2>Detalles del servicio</h2>
              <p>Presenta de forma directa lo que ofreces.</p>
            </header>
            <div className="so-form__grid">
              <label className="so-field so-field--wide">
                <span>Título <small>5–150 caracteres</small></span>
                <input
                  value={values.titulo}
                  minLength={5}
                  maxLength={150}
                  required
                  aria-invalid={values.titulo.length > 0 && (values.titulo.trim().length < 5 || values.titulo.trim().length > 150)}
                  onChange={(event) => set("titulo", event.target.value)}
                />
                <small className="ui-help">{values.titulo.length}/150 caracteres</small>
              </label>
              <label className="so-field so-field--wide">
                <span>Descripción <small>10–5000 caracteres</small></span>
                <textarea
                  rows={6}
                  minLength={10}
                  maxLength={5000}
                  required
                  value={values.descripcion}
                  aria-invalid={values.descripcion.length > 0 && (values.descripcion.trim().length < 10 || values.descripcion.trim().length > 5000)}
                  onChange={(event) => set("descripcion", event.target.value)}
                />
                <small className="ui-help">{values.descripcion.length}/5000 caracteres</small>
              </label>
              <label className="so-field">
                <span>Precio (USD)</span>
                <input type="number" min="0.01" step="0.01" required value={values.precio} onChange={(event) => set("precio", event.target.value)} />
              </label>
              <CatalogFields categories={categories} skills={[]} categoryId={values.categoriaId} onCategoryChange={(value) => set("categoriaId", value)} includeSkills={false} />
            </div>
          </section>

          <section className="so-form-section">
            <header className="so-form-section__heading">
              <h2>Imagen del servicio</h2>
              <p>Usa una URL pública de imagen para mostrar tu trabajo.</p>
            </header>
            <div className="so-form__grid">
              <label className="so-field so-field--wide">
                <span>URL de imagen <small>El backend guarda una URL; no admite subida de archivos.</small></span>
                <input type="url" inputMode="url" placeholder="https://…" value={values.imagenUrl} onChange={(event) => set("imagenUrl", event.target.value)} />
              </label>
            </div>
          </section>

          {error && <p className="so-inline-error" role="alert">{error}</p>}
          <div className="so-form__actions">
            {onCancel && <button className="so-button so-button--quiet" type="button" disabled={saving} onClick={onCancel}>Cancelar</button>}
            <button className="so-button so-button--action" type="submit" disabled={saving}>{saving ? "Guardando…" : initial ? "Guardar cambios" : "Publicar servicio"}</button>
          </div>
        </div>
        <ListingPreview
          kind="servicio"
          title={values.titulo}
          description={values.descripcion}
          amountLabel="Precio"
          amount={pricePreview}
          imageUrl={values.imagenUrl}
        />
      </div>
    </form>
  );
}

export function FreelancerServices({ token }: { token: string }) {
  const [tab, setTab] = useState("services");
  const [services, setServices] = useState<Servicio[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const { query, setQuery } = useInternalSearch();
  const [editing, setEditing] = useState<Servicio | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [reload, setReload] = useState(0);
  const catalogs = useCatalogs(token);

  useEffect(() => {
    setPage(1);
  }, [query]);

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
    <PageShell eyebrow="Espacio freelancer" title="Mis servicios" description="Publica tus servicios y controla cuándo están disponibles.">
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
            {loading ? <p className="so-loading" role="status">Cargando tus servicios…</p> : services.length === 0 ? (
              <EmptyState
                title={query || status ? "No encontramos servicios" : "Aún no tienes servicios"}
                description={query || status ? "Prueba con otro término o cambia el estado." : "Publica tu primer servicio para que los clientes puedan encontrarte y contactarte."}
                actionLabel={query || status ? "Limpiar filtros" : "Crear servicio"}
                onAction={query || status ? () => { setQuery(""); setStatus(""); setPage(1); } : () => setTab("create")}
              />
            ) : (
              <div className="so-list">{services.map((service) => (
                <article className="so-card" key={service.id}>
                  <div className="so-card__top"><span className="so-badge">{statusLabel(service.estado)}</span><span className="so-muted">{service.categoria?.nombre ?? "Sin categoría"}</span></div>
                  <h3>{service.titulo}</h3><p className="so-clamp">{service.descripcion}</p>
                  <div className="so-card__meta"><strong>{money(service.precio)}</strong></div>
                  <div className="so-form__actions">
                    {service.estado !== "eliminado" && <>
                      <button className="so-button so-button--outline" type="button" onClick={() => setEditing(service)}>Editar</button>
                      {service.estado === "activo"
                        ? <button className="so-button so-button--quiet" type="button" disabled={busyId === service.id} onClick={() => void changeStatus(service, "pausado")}>Pausar</button>
                        : <button className="so-button so-button--action" type="button" disabled={busyId === service.id} onClick={() => void changeStatus(service, "activo")}>Activar</button>}
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

export function ClientServices({ token }: { token: string }) {
  const navigate = useNavigate();
  const [services, setServices] = useState<Servicio[]>([]);
  const [selected, setSelected] = useState<Servicio | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { query, setQuery } = useInternalSearch();
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [reload, setReload] = useState(0);
  const catalogs = useCatalogs(token);

  useEffect(() => {
    setPage(1);
  }, [query]);

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
    <PageShell eyebrow="Explorar talento" title="Encuentra talento verificado" description="Talento con portafolio, servicios claros y conversación directa desde cada perfil.">
      {selected ? (
        <div className="service-detail">
          {actionError && <Notice error={actionError} />}
          <nav className="service-breadcrumbs" aria-label="Migas de pan">
            <button type="button" onClick={() => setSelected(null)}>Explorar talento</button>
            <span aria-hidden="true">/</span>
            <span>{selected.categoria?.nombre ?? "Servicio"}</span>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{selected.titulo}</span>
          </nav>
          {detailLoading ? <p className="so-loading" role="status">Cargando los detalles del servicio…</p> : (
            <div className="service-detail__layout">
              <div className="service-detail__main">
                <header className="service-detail__title">
                  <div className="service-detail__badges">
                    <Badge tone={selected.estado?.toLowerCase() === "activo" ? "green" : "neutral"}>{statusLabel(selected.estado)}</Badge>
                    <Badge tone="blue">{selected.categoria?.nombre ?? "Sin categoría"}</Badge>
                  </div>
                  <h1>{selected.titulo}</h1>
                  <div className="service-detail__author">
                    <span className="marketplace-card__avatar">
                      {selected.freelancer?.fotoPerfil
                        ? <img src={selected.freelancer.fotoPerfil} alt="" />
                        : selected.freelancer?.nombre?.charAt(0).toLocaleUpperCase() ?? "F"}
                    </span>
                    <div>
                      <strong>{selected.freelancer?.nombre ?? "Freelancer"}</strong>
                      <small>{selected.freelancer?.tituloProfesional ?? "Talento First Gig"}</small>
                    </div>
                    <Badge tone="blue">Perfil público</Badge>
                    {selected.freelancer?.calificacionPromedio > 0 ? (
                      <span className="service-detail__rating">★ {selected.freelancer.calificacionPromedio.toFixed(1)}</span>
                    ) : (
                      <span className="service-detail__rating">Nuevo</span>
                    )}
                  </div>
                </header>

                <div className="service-gallery">
                  {selected.imagenUrl ? (
                    <img src={selected.imagenUrl} alt={`Imagen de ${selected.titulo}`} />
                  ) : (
                    <div className="service-gallery__placeholder">
                      <span>Portafolio First Gig</span>
                      <strong>{selected.categoria?.nombre ?? "Servicio profesional"}</strong>
                    </div>
                  )}
                </div>

                <section className="service-panel">
                  <h2>Descripción del servicio</h2>
                  <p>{selected.descripcion}</p>
                </section>

                <section className="service-panel">
                  <h2>Sobre el freelancer</h2>
                  <div className="service-freelancer">
                    <span className="service-freelancer__avatar">
                      {selected.freelancer?.fotoPerfil
                        ? <img src={selected.freelancer.fotoPerfil} alt="" />
                        : selected.freelancer?.nombre?.charAt(0).toLocaleUpperCase() ?? "F"}
                    </span>
                    <div>
                      <strong>{selected.freelancer?.nombre ?? "Freelancer"}</strong>
                      <p>{selected.freelancer?.tituloProfesional ?? "Perfil profesional en First Gig"}</p>
                      <Link className={buttonClassName({ variant: "secondary", size: "sm" })} to={`/perfil/${selected.freelancer.id}?servicioId=${selected.id}`}>
                        Ver portafolio completo
                      </Link>
                    </div>
                  </div>
                </section>

                <section className="service-panel">
                  <h2>Reseñas</h2>
                  {selected.freelancer?.calificacionPromedio > 0 ? (
                    <div className="service-reviews">
                      <strong>{selected.freelancer.calificacionPromedio.toFixed(1)}</strong>
                      <div>
                        <span className="service-reviews__stars">★★★★★</span>
                        <p>Calificación promedio del perfil. Las reseñas individuales se mostrarán cuando el backend las exponga.</p>
                      </div>
                    </div>
                  ) : (
                    <p className="so-muted">Este freelancer aún no tiene reseñas públicas. Puedes revisar su perfil y contactarlo para conocer más sobre su trabajo.</p>
                  )}
                </section>
              </div>

              <aside className="service-pricing" aria-label="Resumen del servicio">
                <div className="service-packages" role="tablist" aria-label="Paquetes">
                  <button type="button" role="tab" aria-selected="true" className="is-active">Básico</button>
                  <button type="button" role="tab" aria-selected="false" disabled title="El backend aún no maneja paquetes">Estándar</button>
                  <button type="button" role="tab" aria-selected="false" disabled title="El backend aún no maneja paquetes">Premium</button>
                </div>
                <p className="service-pricing__price"><small>Desde</small><strong>{money(selected.precio)}</strong></p>
                <dl className="service-pricing__facts">
                  <div><dt>Tiempo de entrega</dt><dd>A convenir</dd></div>
                  <div><dt>Revisiones</dt><dd>A convenir</dd></div>
                  <div><dt>Categoría</dt><dd>{selected.categoria?.nombre ?? "Sin categoría"}</dd></div>
                </dl>
                <button
                  className={buttonClassName({ variant: "action", block: true })}
                  type="button"
                  disabled={creatingConversation || selected.estado?.toLowerCase() !== "activo"}
                  onClick={() => void startConversation()}
                >
                  {creatingConversation ? "Abriendo conversación…" : "Continuar"}
                </button>
                <button
                  className={buttonClassName({ variant: "secondary", block: true })}
                  type="button"
                  disabled={creatingConversation || selected.estado?.toLowerCase() !== "activo"}
                  onClick={() => void startConversation()}
                >
                  Contactar
                </button>
                {selected.estado?.toLowerCase() !== "activo" && <p className="so-muted">Este servicio no está disponible para nuevos contactos.</p>}
                <p className="service-pricing__note">El backend actual maneja un precio único. Los paquetes Estándar y Premium se habilitarán cuando existan en la API.</p>
              </aside>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="so-discovery-controls">
            <label className="so-field so-discovery-search">
              <span>Buscar talento</span>
              <input
                type="search"
                placeholder="Servicio, descripción o categoría"
                value={query}
                onChange={(event) => { setPage(1); setQuery(event.target.value); }}
              />
            </label>
            <DiscoveryCategoryChips
              categories={catalogs.categories}
              selected={categoryId}
              onChange={(value) => { setPage(1); setCategoryId(value); }}
            />
          </div>
          {catalogs.error && <Notice error={`No se pudieron cargar las categorías y habilidades: ${catalogs.error}`} retry={catalogs.retry} />}
          {detailLoading && <p className="so-discovery-status" role="status">Cargando los detalles del servicio…</p>}
          {error ? (
            <Notice error={`No se pudieron cargar los servicios: ${error}`} retry={() => setReload((value) => value + 1)} />
          ) : loading ? (
            <DiscoverySkeletons label="Buscando servicios disponibles…" />
          ) : services.length === 0 ? (
            <DiscoveryEmpty
              emptyTitle="Aún no hay servicios publicados"
              emptyMessage="Vuelve pronto para descubrir nuevos servicios."
              filteredTitle="No encontramos servicios para esos filtros"
              filteredMessage="Prueba con otra búsqueda o categoría."
              filtered={Boolean(query.trim() || categoryId)}
              onClear={() => { setPage(1); setQuery(""); setCategoryId(""); }}
              onRefresh={() => { setPage(1); setReload((value) => value + 1); }}
            />
          ) : (
            <section className="so-discovery-grid" aria-label="Servicios disponibles">
              {services.map((service) => (
                <ServiceDiscoveryCard key={service.id} service={service} onOpen={() => void openService(service)} />
              ))}
            </section>
          )}
          {!error && !loading && <Pager page={page} total={total} onChange={setPage} />}
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
