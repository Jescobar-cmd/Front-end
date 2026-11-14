import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { useAuth } from "../../context/AuthContext";
import type {
  PortfolioProject,
  ProfileSectionId,
  ProfesionalProfileData,
  Review,
  ServicePackage,
} from "../../core/domain/entities/perfilProfesional";
import { createConversation } from "../../infrastructure/api/apiChat";
import type { ApiError } from "../../infrastructure/api/client";
import { perfilProfesionalApi } from "../../infrastructure/api/apiPerfilProfesional";
import { PackageCard } from "./PackageCard";
import { PortfolioManager } from "./PortfolioManager";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileSkeleton } from "./ProfileSkeleton";
import { ProfileTabs } from "./ProfileTabs";
import { ProjectDetailModal } from "./ProjectDetailModal";
import { ProjectForm } from "./ProjectForm";
import { ReviewCard } from "./ReviewCard";
import { CloseIcon, ExternalLinkIcon, LockIcon } from "./ProfileIcons";
import type { DatosProyectoPortafolio } from "../../core/domain/entities/perfilProfesional";
import "./profile.css";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Ocurrió un error inesperado.";
}

function statusOf(error: unknown): number | undefined {
  return (error as ApiError | undefined)?.status;
}

function levelLabel(nivel: string | null): string | null {
  if (!nivel) return null;
  const labels: Record<string, string> = {
    basico: "Básico",
    intermedio: "Intermedio",
    avanzado: "Avanzado",
    experto: "Experto",
  };
  return labels[nivel] ?? null;
}

function memberSince(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Fecha no disponible"
    : date.toLocaleDateString("es", { month: "long", year: "numeric" });
}

function socialLinks(profile: ProfesionalProfileData) {
  const enlaces = profile.freelancer?.enlaces ?? {};
  return [
    { label: "LinkedIn", url: enlaces.linkedin },
    { label: "Behance", url: enlaces.behance },
    { label: "GitHub", url: enlaces.github },
    { label: "Instagram", url: enlaces.instagram },
    { label: "Sitio web", url: enlaces.sitioWeb },
  ].filter((link): link is { label: string; url: string } => Boolean(link.url));
}

export function ProfessionalProfilePage() {
  const { id } = useParams();
  const userId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { token, user, cargando } = useAuth();

  const [profile, setProfile] = useState<ProfesionalProfileData | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioProject[]>([]);
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [portfolioError, setPortfolioError] = useState("");
  const [packagesError, setPackagesError] = useState("");
  const [reviewsError, setReviewsError] = useState("");
  const [reload, setReload] = useState(0);
  const [activeTab, setActiveTab] = useState<ProfileSectionId>("portafolio");
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState("");
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);
  const [projectSaving, setProjectSaving] = useState(false);
  const [projectError, setProjectError] = useState("");
  const [projectToDelete, setProjectToDelete] = useState<PortfolioProject | null>(null);
  const [deletingProject, setDeletingProject] = useState(false);
  const [toast, setToast] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const sectionRefs = useRef<Partial<Record<ProfileSectionId, HTMLElement | null>>>({});
  const serviceIdParam = Number(searchParams.get("servicioId"));

  useEffect(() => {
    if (cargando) return;
    if (!Number.isInteger(userId) || userId <= 0) {
      setError("No se encontró el perfil solicitado.");
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError("");
    setRequiresAuth(false);
    setPortfolioError("");
    setPackagesError("");
    setReviewsError("");
    setProfile(null);
    setPortfolio([]);
    setPackages([]);
    setReviews([]);

    void (async () => {
      try {
        const data = await perfilProfesionalApi.obtenerPerfil(token ?? undefined, userId);
        if (!active) return;
        setProfile(data);

        if (!data.freelancer) {
          if (active) setLoading(false);
          return;
        }

        const [portfolioResult, packagesResult, reviewsResult] = await Promise.allSettled([
          perfilProfesionalApi.listarPortafolio(token ?? undefined, userId, false),
          perfilProfesionalApi.listarPaquetes(token ?? undefined, userId),
          perfilProfesionalApi.listarResenas(token ?? undefined, userId, 20),
        ]);

        if (!active) return;

        if (portfolioResult.status === "fulfilled") setPortfolio(portfolioResult.value);
        else setPortfolioError(errorMessage(portfolioResult.reason));

        if (packagesResult.status === "fulfilled") setPackages(packagesResult.value);
        else setPackagesError(errorMessage(packagesResult.reason));

        if (reviewsResult.status === "fulfilled") setReviews(reviewsResult.value);
        else setReviewsError(errorMessage(reviewsResult.reason));
      } catch (reason) {
        if (!active) return;
        if (statusOf(reason) === 401) setRequiresAuth(true);
        else setError(errorMessage(reason));
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [cargando, token, userId, reload]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const esPropio = Boolean(user?.id !== undefined && profile && String(user.id) === String(profile.id));
  const esFreelancer = Boolean(profile?.freelancer);
  const showServices = esFreelancer;

  const activePackage = useMemo(() => {
    const activos = packages.filter((pkg) => pkg.estado?.toLowerCase() === "activo");
    const solicitado = activos.find((pkg) => pkg.servicioId === serviceIdParam);
    return solicitado ?? activos[0] ?? null;
  }, [packages, serviceIdParam]);

  const contactDisabled = Boolean(
    user && (user.rol !== "cliente" || !activePackage),
  );
  const contactHint = !user
    ? undefined
    : user.rol !== "cliente"
      ? "Solo los clientes pueden iniciar una conversación desde un perfil."
      : !activePackage
        ? "Este freelancer aún no tiene un servicio activo. Podrás contactarlo cuando publique uno o desde una oferta."
        : undefined;

  useEffect(() => {
    if (loading || !profile || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveTab(visible.target.id as ProfileSectionId);
      },
      { rootMargin: "-170px 0px -62% 0px", threshold: [0, 0.2, 0.5, 1] },
    );

    for (const section of Object.values(sectionRefs.current)) {
      if (section) observer.observe(section);
    }

    return () => observer.disconnect();
  }, [loading, profile, packages.length, reviews.length, portfolio.length, showServices]);

  const handleTab = (id: ProfileSectionId) => {
    setActiveTab(id);
    const section = sectionRefs.current[id];
    if (!section) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    section.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  const handleContactFor = async (servicioId?: number) => {
    setContactError("");
    if (!user || !token) {
      navigate(`/login?redirect=${encodeURIComponent(`${location.pathname}${location.search}`)}`);
      return;
    }
    if (user.rol !== "cliente") {
      setContactError("Solo los clientes pueden iniciar una conversación desde un perfil.");
      return;
    }

    const target =
      servicioId !== undefined
        ? packages.find(
            (pkg) => pkg.servicioId === servicioId && pkg.estado?.toLowerCase() === "activo",
          )
        : activePackage;

    if (!target) {
      setContactError("Este freelancer aún no tiene un servicio activo para iniciar la conversación.");
      return;
    }

    setContactLoading(true);
    try {
      const result = await createConversation(token, { servicioId: target.servicioId });
      navigate(`/chat/${result.conversacion.id}`);
    } catch (reason) {
      setContactError(errorMessage(reason));
    } finally {
      setContactLoading(false);
    }
  };

  const handleContact = () => {
    void handleContactFor();
  };

  const openAddProject = () => {
    setEditingProject(null);
    setProjectError("");
    setProjectFormOpen(true);
  };

  const openEditProject = (project: PortfolioProject) => {
    setEditingProject(project);
    setProjectError("");
    setProjectFormOpen(true);
  };

  const closeProjectForm = () => {
    if (projectSaving) return;
    setProjectFormOpen(false);
    setEditingProject(null);
    setProjectError("");
  };

  const saveProject = async (datos: DatosProyectoPortafolio) => {
    if (!token) return;
    setProjectSaving(true);
    setProjectError("");
    try {
      if (editingProject) {
        const updated = await perfilProfesionalApi.actualizarProyecto(token, editingProject.id, datos);
        setPortfolio((current) =>
          current.map((project) =>
            project.id === updated.id ? { ...project, ...updated, orden: project.orden } : project,
          ),
        );
        setToast({ tone: "success", message: "Proyecto actualizado correctamente." });
      } else {
        const created = await perfilProfesionalApi.crearProyecto(token, datos);
        setPortfolio((current) =>
          [created, ...current].map((project, index) => ({ ...project, orden: index })),
        );
        setToast({ tone: "success", message: "Proyecto agregado a tu portafolio." });
      }
      setProjectFormOpen(false);
      setEditingProject(null);
    } catch (reason) {
      setProjectError(errorMessage(reason));
    } finally {
      setProjectSaving(false);
    }
  };

  const requestDeleteProject = (project: PortfolioProject) => {
    setProjectToDelete(project);
  };

  const confirmDeleteProject = async () => {
    if (!token || !projectToDelete) return;
    setDeletingProject(true);
    try {
      await perfilProfesionalApi.eliminarProyecto(token, projectToDelete.id);
      setPortfolio((current) =>
        current
          .filter((item) => item.id !== projectToDelete.id)
          .map((item, index) => ({ ...item, orden: index })),
      );
      setToast({ tone: "success", message: "Proyecto eliminado del portafolio." });
      setProjectToDelete(null);
    } catch (reason) {
      setToast({ tone: "error", message: errorMessage(reason) });
    } finally {
      setDeletingProject(false);
    }
  };

  const registerSection = (id: ProfileSectionId) => (node: HTMLElement | null) => {
    sectionRefs.current[id] = node;
  };

  if (cargando || loading) return <ProfileSkeleton />;

  if (requiresAuth) {
    return (
      <div className="profile-page pp-page">
        <EmptyState
          icon={<LockIcon />}
          title="Inicia sesión para ver este perfil"
          description="Los perfiles, portafolios y reseñas de First Gig están disponibles para usuarios autenticados."
          actionLabel="Iniciar sesión"
          onAction={() =>
            navigate(`/login?redirect=${encodeURIComponent(`${location.pathname}${location.search}`)}`)
          }
          secondary={<Link to="/">Volver al inicio</Link>}
        />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-page pp-page">
        <EmptyState
          title="No pudimos cargar este perfil"
          description={error || "El perfil solicitado no existe o no está disponible."}
          actionLabel="Reintentar"
          onAction={() => setReload((value) => value + 1)}
          secondary={<Link to="/">Volver al inicio</Link>}
        />
      </div>
    );
  }

  const freelancer = profile.freelancer;
  const links = socialLinks(profile);
  const tabs: { id: ProfileSectionId; label: string }[] = [
    { id: "portafolio", label: "Portafolio" },
    ...(showServices ? [{ id: "servicios" as const, label: "Servicios" }] : []),
    { id: "resenas", label: "Reseñas" },
    { id: "sobre-mi", label: "Sobre mí" },
  ];

  if (!esFreelancer) {
    return (
      <div className="profile-page pp-page">
        <ProfileHeader
          profile={profile}
          isOwner={esPropio}
          isFreelancer={false}
          totalResenas={0}
          showServices={false}
          onContact={handleContact}
          onEdit={() => navigate("/perfil/cliente")}
          contactLoading={contactLoading}
          contactDisabled
          contactHint="El contacto con clientes se inicia desde una oferta o propuesta."
        />

        {contactError ? <p className="pp-contact-error" role="alert">{contactError}</p> : null}

        <section className="pp-section" id="sobre-mi">
          <div className="pp-section__head">
            <div>
              <p className="pp-eyebrow">Cliente</p>
              <h2>Sobre {profile.nombre}</h2>
            </div>
          </div>
          <p className="pp-about__description">
            {profile.cliente?.descripcion || "Este cliente aún no ha añadido una descripción."}
          </p>
          <dl className="pp-facts">
            {profile.cliente?.empresa ? (
              <div><dt>Empresa</dt><dd>{profile.cliente.empresa}</dd></div>
            ) : null}
            {profile.cliente?.tipoCliente ? (
              <div>
                <dt>Tipo de cliente</dt>
                <dd>{profile.cliente.tipoCliente === "empresa" ? "Empresa" : "Persona"}</dd>
              </div>
            ) : null}
          </dl>
        </section>
      </div>
    );
  }

  return (
    <div className="profile-page pp-page">
      <ProfileHeader
        profile={profile}
        isOwner={esPropio}
        isFreelancer
        totalResenas={reviews.length || freelancer?.totalResenas || 0}
        showServices={showServices}
        onContact={handleContact}
        onEdit={() => navigate("/perfil/freelancer")}
        contactLoading={contactLoading}
        contactDisabled={contactDisabled}
        contactHint={contactHint}
      />

      {contactError ? <p className="pp-contact-error" role="alert">{contactError}</p> : null}

      <ProfileTabs tabs={tabs} active={activeTab} onSelect={handleTab} />

      <div className="pp-content">
        <section className="pp-section" id="portafolio" ref={registerSection("portafolio")}>
          {esPropio && projectFormOpen ? (
            <ProjectForm
              initial={editingProject}
              saving={projectSaving}
              error={projectError}
              onCancel={closeProjectForm}
              onSubmit={(datos) => void saveProject(datos)}
            />
          ) : null}

          <PortfolioManager
            projects={portfolio}
            isOwner={esPropio}
            loading={false}
            error={portfolioError}
            onAdd={openAddProject}
            onEdit={openEditProject}
            onDelete={requestDeleteProject}
            onOpen={setSelectedProject}
            onRetry={() => setReload((value) => value + 1)}
          />
        </section>

        {showServices ? (
          <section className="pp-section" id="servicios" ref={registerSection("servicios")}>
            <div className="pp-section__head">
              <div>
                <p className="pp-eyebrow">Servicios</p>
                <h2>Cómo puedo ayudarte</h2>
                <p>Elige el punto de partida que mejor se ajuste a tu proyecto.</p>
              </div>
              {esPropio ? (
                <Button variant="secondary" size="sm" onClick={() => navigate("/dashboard/freelancer/servicios")}>
                  Gestionar servicios
                </Button>
              ) : null}
            </div>

            {packagesError ? (
              <div className="pp-inline-error" role="alert">
                <p>No se pudieron cargar los servicios: {packagesError}</p>
                <Button variant="secondary" size="sm" onClick={() => setReload((value) => value + 1)}>
                  Reintentar
                </Button>
              </div>
            ) : packages.length > 0 ? (
              <div className="pp-packages">
                {packages.slice(0, 3).map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    onContact={() => void handleContactFor(pkg.servicioId)}
                    contactDisabled={contactLoading || contactDisabled}
                    manageHref={esPropio ? "/dashboard/freelancer/servicios" : undefined}
                  />
                ))}
              </div>
            ) : esPropio ? (
              <EmptyState
                title="Aún no hay servicios publicados"
                description="Publica tu primer servicio para que los clientes puedan conocerte y contactarte."
                actionLabel="Gestionar mis servicios"
                to="/dashboard/freelancer/servicios"
              />
            ) : (
              <EmptyState
                title="Aún no hay servicios publicados"
                description="Este freelancer todavía no ha publicado servicios. Puedes revisar su portafolio y sus reseñas."
              />
            )}
          </section>
        ) : null}

        <section className="pp-section" id="resenas" ref={registerSection("resenas")}>
          <div className="pp-section__head">
            <div>
              <p className="pp-eyebrow">Reseñas</p>
              <h2>Lo que dicen mis clientes</h2>
              <p>Experiencias reales de quienes ya trabajaron conmigo.</p>
            </div>
            {reviews.length > 0 ? <Badge tone="blue">{reviews.length} reseñas</Badge> : null}
          </div>

          {reviewsError ? (
            <div className="pp-inline-error" role="alert">
              <p>No se pudieron cargar las reseñas: {reviewsError}</p>
              <Button variant="secondary" size="sm" onClick={() => setReload((value) => value + 1)}>
                Reintentar
              </Button>
            </div>
          ) : reviews.length > 0 ? (
            <div className="pp-reviews">
              {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
            </div>
          ) : (
            <EmptyState
              title="Aún no hay reseñas"
              description="Las reseñas aparecerán aquí cuando se cierre y califique un contrato."
            />
          )}
        </section>

        <section className="pp-section" id="sobre-mi" ref={registerSection("sobre-mi")}>
          <div className="pp-section__head">
            <div>
              <p className="pp-eyebrow">Sobre mí</p>
              <h2>Mi experiencia y forma de trabajar</h2>
            </div>
            {esPropio ? (
              <Button variant="secondary" size="sm" onClick={() => navigate("/perfil/freelancer")}>
                Editar perfil
              </Button>
            ) : null}
          </div>

          <div className="pp-about">
            <div className="pp-about__main">
              <p className="pp-about__description">
                {freelancer?.descripcion ||
                  (esPropio
                    ? "Aún no has añadido una descripción. Cuenta tu experiencia, tu proceso y el tipo de proyectos que disfrutas."
                    : "Este freelancer aún no ha añadido una descripción.")}
              </p>

              <div className="pp-about__group">
                <h3>Habilidades</h3>
                {freelancer && freelancer.habilidades.length > 0 ? (
                  <ul className="pp-chips">
                    {freelancer.habilidades.map((skill) => (
                      <li key={skill.id}>
                        {skill.nombre}
                        {levelLabel(skill.nivel) ? <small>{levelLabel(skill.nivel)}</small> : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="pp-muted">Aún no hay habilidades publicadas.</p>
                )}
              </div>

              {freelancer && freelancer.idiomas.length > 0 ? (
                <div className="pp-about__group">
                  <h3>Idiomas</h3>
                  <ul className="pp-chips">
                    {freelancer.idiomas.map((idioma) => <li key={idioma}>{idioma}</li>)}
                  </ul>
                </div>
              ) : null}
            </div>

            <aside className="pp-facts" aria-label="Datos rápidos del perfil">
              <h3>Datos rápidos</h3>
              <dl>
                {freelancer?.ubicacion ? (
                  <div><dt>Ubicación</dt><dd>{freelancer.ubicacion}</dd></div>
                ) : null}
                {freelancer?.remoto ? (
                  <div><dt>Modalidad</dt><dd>Trabajo remoto</dd></div>
                ) : null}
                {freelancer?.disponibilidad ? (
                  <div><dt>Disponibilidad</dt><dd>{freelancer.disponibilidad}</dd></div>
                ) : null}
                {freelancer?.tarifaHora ? (
                  <div>
                    <dt>Tarifa por hora</dt>
                    <dd>
                      {new Intl.NumberFormat("es", {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 2,
                      }).format(freelancer.tarifaHora)}
                    </dd>
                  </div>
                ) : null}
                <div><dt>Miembro desde</dt><dd>{memberSince(profile.fechaRegistro)}</dd></div>
              </dl>
            </aside>
          </div>
        </section>

        <section className="pp-cta" aria-labelledby="pp-cta-title">
          <div className="pp-cta__copy">
            <p className="pp-eyebrow pp-eyebrow--on-accent">¿Listo para empezar?</p>
            <h2 id="pp-cta-title">Cuéntame sobre tu idea.</h2>
            <p>Respondo en menos de 24 horas.</p>
          </div>
          <div className="pp-cta__actions">
            {esPropio ? (
              <Button variant="secondary" onClick={() => navigate("/perfil/freelancer")}>
                Editar perfil
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={handleContact}
                disabled={contactLoading || contactDisabled}
              >
                {contactLoading ? "Abriendo conversación…" : "Contactar"}
              </Button>
            )}
            {links.length > 0 ? (
              <div className="pp-cta__links">
                {links.map((link) => (
                  <a key={link.label} href={link.url} target="_blank" rel="noreferrer">
                    {link.label}
                    <ExternalLinkIcon />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      </div>

      {selectedProject ? (
        <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      ) : null}

      <ConfirmDialog
        open={Boolean(projectToDelete)}
        title="Eliminar proyecto del portafolio"
        description={
          projectToDelete
            ? `¿Eliminar "${projectToDelete.titulo}"? Esta acción no se puede deshacer.`
            : ""
        }
        confirmLabel="Eliminar proyecto"
        cancelLabel="Conservar"
        tone="danger"
        loading={deletingProject}
        onCancel={() => {
          if (!deletingProject) setProjectToDelete(null);
        }}
        onConfirm={() => void confirmDeleteProject()}
      />

      {toast ? (
        <div
          className={`pp-toast pp-toast--${toast.tone}`}
          role={toast.tone === "error" ? "alert" : "status"}
          aria-live={toast.tone === "error" ? "assertive" : "polite"}
        >
          <span>{toast.message}</span>
          <button type="button" aria-label="Cerrar notificación" onClick={() => setToast(null)}>
            <CloseIcon />
          </button>
        </div>
      ) : null}
    </div>
  );
}