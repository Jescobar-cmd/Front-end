import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";
import { Button, buttonClassName } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { ServiceCard } from "../../components/ui/ServiceCard";
import { useAuth } from "../../context/AuthContext";
import { createConversation } from "../../infrastructure/api/apiChat";
import { getPublicProfile } from "../../infrastructure/api/apiPerfiles";
import type { PerfilPublico } from "../../infrastructure/api/apiPerfiles";
import { listServices } from "../../infrastructure/api/apiServicios";
import type { Servicio } from "../../infrastructure/api/apiServicios";
import "./profile.css";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Ocurrió un error inesperado.";
}

function fechaRegistro(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Fecha no disponible" : date.toLocaleDateString("es", { month: "long", year: "numeric" });
}

export function PublicProfilePage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const userId = Number(id);
  const [profile, setProfile] = useState<PerfilPublico | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [services, setServices] = useState<Servicio[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  useEffect(() => {
    let active = true;
    if (!token || !Number.isInteger(userId) || userId <= 0) {
      setError("No se encontró el perfil solicitado.");
      setLoading(false);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    setError("");
    getPublicProfile(token, userId)
      .then((data) => {
        if (active) setProfile(data);
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
  }, [token, userId]);

  useEffect(() => {
    let active = true;
    if (!token || !profile || Number(profile.rolId) !== 2) {
      setServices([]);
      return () => {
        active = false;
      };
    }
    setServicesLoading(true);
    listServices(token, { limit: 50 })
      .then((result) => {
        if (active) {
          setServices(result.items.filter((servicio) => servicio.freelancer?.id === profile.id && servicio.estado?.toLowerCase() !== "eliminado"));
        }
      })
      .catch(() => {
        if (active) setServices([]);
      })
      .finally(() => {
        if (active) setServicesLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token, profile]);

  const servicioId = Number(searchParams.get("servicioId"));
  const proyectoId = Number(searchParams.get("proyectoId"));
  const esPropio = user?.id !== undefined && String(user.id) === String(userId);
  const esFreelancer = Number(profile?.rolId) === 2;
  const esCliente = Number(profile?.rolId) === 3;
  const servicioPortafolio = useMemo(
    () => services.find((servicio) => servicio.estado?.toLowerCase() === "activo") ?? services[0],
    [services],
  );
  const servicioContexto = Number.isInteger(servicioId) && servicioId > 0 ? servicioId : servicioPortafolio?.id;

  const contextoChat = (() => {
    if (user?.rol === "cliente" && esFreelancer && servicioContexto) {
      return { servicioId: servicioContexto };
    }
    if (Number.isInteger(proyectoId) && proyectoId > 0) {
      if (user?.rol === "cliente" && esFreelancer) {
        return { proyectoId, freelancerId: userId };
      }
      if (user?.rol === "freelancer" && esCliente) return { proyectoId };
    }
    return null;
  })();

  const iniciarChatConContexto = async (
    contexto: { servicioId?: number; proyectoId?: number; freelancerId?: number } | null,
  ) => {
    if (!token || !contexto || chatLoading) return;
    setChatLoading(true);
    setChatError("");
    try {
      const result = await createConversation(token, contexto);
      navigate(`/chat/${result.conversacion.id}`);
    } catch (reason) {
      setChatError(errorMessage(reason));
    } finally {
      setChatLoading(false);
    }
  };

  const iniciarChat = () => void iniciarChatConContexto(contextoChat);

  const rutaExplorar = user?.rol === "freelancer" ? "/dashboard/freelancer/ofertas" : "/talento";

  if (loading) {
    return <div className="profile-page"><p className="profile-message" role="status">Cargando perfil…</p></div>;
  }

  if (error || !profile) {
    return (
      <div className="profile-page">
        <div className="profile-message profile-message--error" role="alert">
          {error || "No se encontró el perfil solicitado."}
        </div>
        <Link className="profile-back-link" to={rutaExplorar}>← Volver a explorar</Link>
      </div>
    );
  }

  return (
    <div className="profile-page profile-public">
      <nav className="profile-breadcrumbs" aria-label="Migas de pan">
        <Link to={rutaExplorar}>Explorar talento</Link>
        <span aria-hidden="true">/</span>
        <span>{profile.nombre}</span>
      </nav>

      <header className="profile-public__hero">
        <div className="profile-public__cover" aria-hidden="true" />
        <div className="profile-public__hero-body">
          <div className="profile-public__identity">
            {profile.fotoPerfil ? (
              <img className="profile-public__avatar" src={profile.fotoPerfil} alt="" />
            ) : (
              <span className="profile-public__avatar profile-public__avatar--initial" aria-hidden="true">
                {profile.nombre.charAt(0).toLocaleUpperCase()}
              </span>
            )}
            <div className="profile-public__identity-copy">
              <p className="ui-eyebrow">{profile.rolNombre} · Miembro desde {fechaRegistro(profile.fechaRegistro)}</p>
              <h1>{profile.nombre}</h1>
              <p>{esFreelancer ? profile.freelancer?.tituloProfesional ?? "Talento First Gig" : profile.cliente?.nombreEmpresa ?? "Cliente First Gig"}</p>
              <div className="profile-public__badges">
                <Badge tone="blue">Perfil público</Badge>
                {esFreelancer && profile.freelancer && profile.freelancer.calificacionPromedio > 0 ? (
                  <Badge tone="warning">★ {profile.freelancer.calificacionPromedio.toFixed(1)}</Badge>
                ) : null}
                {esFreelancer ? <Badge tone="blue">Portafolio primero</Badge> : <Badge tone="blue">Cliente</Badge>}
              </div>
            </div>
          </div>
          <div className="profile-public__hero-actions">
            {esPropio ? (
              <Link className={buttonClassName({ variant: "action" })} to={esFreelancer ? "/perfil/freelancer" : "/perfil/cliente"}>
                Editar perfil
              </Link>
            ) : (
              <Button
                variant="action"
                disabled={!contextoChat || chatLoading}
                onClick={() => void iniciarChat()}
              >
                {chatLoading ? "Abriendo chat…" : "Contactar"}
              </Button>
            )}
          </div>
        </div>
      </header>

      {chatError ? <p className="profile-message profile-message--error" role="alert">{chatError}</p> : null}

      <div className="profile-public__layout">
        <div className="profile-public__main">
          {esFreelancer && profile.freelancer ? (
            <section className="profile-public__section">
              <div className="profile-public__section-head">
                <div>
                  <p className="ui-eyebrow">Portafolio</p>
                  <h2>Servicios publicados</h2>
                  <p>El trabajo del freelancer va primero. Explora sus servicios y contacta desde el que te interese.</p>
                </div>
                <Badge tone="blue">{services.length} servicios</Badge>
              </div>
              {servicesLoading ? (
                <div className="dashboard-loading" aria-hidden="true">
                  {Array.from({ length: 3 }, (_, index) => <div className="dashboard-skeleton" key={index} />)}
                </div>
              ) : services.length > 0 ? (
                <div className="dashboard-grid">
                  {services.map((servicio) => (
                    <ServiceCard
                      key={servicio.id}
                      title={servicio.titulo}
                      description={servicio.descripcion}
                      category={servicio.categoria?.nombre}
                      imageUrl={servicio.imagenUrl}
                      authorName={profile.nombre}
                      authorPhoto={profile.fotoPerfil}
                      authorTitle={profile.freelancer?.tituloProfesional}
                      rating={profile.freelancer?.calificacionPromedio}
                      price={servicio.precio}
                      pricePrefix="Desde"
                      onCta={esPropio ? undefined : () => void iniciarChatConContexto({ servicioId: servicio.id })}
                      ctaHref={esPropio ? "/dashboard/freelancer/servicios" : undefined}
                      ctaLabel={esPropio ? "Gestionar" : "Contactar"}
                      ctaDisabled={!esPropio && chatLoading}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title={esPropio ? "Tu portafolio está vacío" : "Portafolio en construcción"}
                  description={
                    esPropio
                      ? "Publica tu primer servicio para que los clientes puedan encontrarte y contactarte."
                      : "Este freelancer todavía no tiene servicios publicados. Vuelve pronto o explora otros perfiles."
                  }
                  actionLabel={esPropio ? "Gestionar mis servicios" : "Explorar talento"}
                  to={esPropio ? "/dashboard/freelancer/servicios" : rutaExplorar}
                />
              )}
            </section>
          ) : null}

          <section className="profile-public__section">
            <div className="profile-public__section-head">
              <div>
                <p className="ui-eyebrow">Sobre {esFreelancer ? "el freelancer" : "el cliente"}</p>
                <h2>Presentación</h2>
              </div>
            </div>
            {esFreelancer && profile.freelancer ? (
              <>
                <p className="profile-public__bio">{profile.freelancer.biografia || "Este freelancer todavía no ha añadido una biografía."}</p>
                <div className="profile-public__skills">
                  <h3>Habilidades</h3>
                  {profile.freelancer.habilidades.length > 0 ? (
                    <ul>
                      {profile.freelancer.habilidades.map((skill) => <li key={skill.id}>{skill.nombre}</li>)}
                    </ul>
                  ) : (
                    <p className="profile-muted">Este freelancer todavía no ha añadido habilidades.</p>
                  )}
                </div>
                {profile.freelancer.calificacionPromedio > 0 ? (
                  <div className="profile-public__reviews">
                    <strong>{profile.freelancer.calificacionPromedio.toFixed(1)}</strong>
                    <div>
                      <span className="service-reviews__stars">★★★★★</span>
                      <p>Calificación promedio del perfil. Las reseñas individuales se mostrarán cuando el backend las exponga.</p>
                    </div>
                  </div>
                ) : null}
              </>
            ) : profile.cliente ? (
              <>
                {profile.cliente.nombreEmpresa ? <h3>{profile.cliente.nombreEmpresa}</h3> : null}
                <p className="profile-public__bio">{profile.cliente.descripcion || "Este cliente todavía no ha añadido una descripción."}</p>
                <p className="profile-muted">Tipo de cliente: {profile.cliente.tipoCliente === "empresa" ? "Empresa" : "Persona"}.</p>
              </>
            ) : null}
          </section>
        </div>

        <aside className="profile-public__aside">
          <section className="profile-public__contact">
            <p className="ui-eyebrow">Contacto</p>
            <h2>{esPropio ? "Tu perfil público" : esFreelancer ? "Hablemos de tu proyecto" : "Contacta a este cliente"}</h2>
            <p>
              {esPropio
                ? "Así ven los demás tu perfil. Puedes editarlo cuando quieras desde este botón."
                : contextoChat
                  ? "La conversación quedará vinculada al servicio o proyecto desde el que llegaste."
                  : "Este perfil todavía no tiene un servicio activo para iniciar una conversación."}
            </p>
            {esPropio ? (
              <Link className={buttonClassName({ variant: "action", block: true })} to={esFreelancer ? "/perfil/freelancer" : "/perfil/cliente"}>
                Editar perfil
              </Link>
            ) : (
              <Button
                variant="action"
                block
                disabled={!contextoChat || chatLoading}
                onClick={() => void iniciarChat()}
              >
                {chatLoading ? "Abriendo chat…" : "Contactar"}
              </Button>
            )}
            {!contextoChat && !esPropio ? (
              <Link className="profile-back-link" to={rutaExplorar}>Explorar otros perfiles</Link>
            ) : null}
            <dl className="profile-public__facts">
              <div><dt>Rol</dt><dd>{profile.rolNombre}</dd></div>
              <div><dt>Miembro desde</dt><dd>{fechaRegistro(profile.fechaRegistro)}</dd></div>
              {esFreelancer ? <div><dt>Servicios</dt><dd>{services.length}</dd></div> : null}
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
