import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createConversation } from "../../infrastructure/api/apiChat";
import { getPublicProfile } from "../../infrastructure/api/apiPerfiles";
import type { PerfilPublico } from "../../infrastructure/api/apiPerfiles";
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

  const servicioId = Number(searchParams.get("servicioId"));
  const proyectoId = Number(searchParams.get("proyectoId"));
  const esPropio = user?.id !== undefined && String(user.id) === String(userId);
  const esFreelancer = Number(profile?.rolId) === 2;
  const esCliente = Number(profile?.rolId) === 3;

  const contextoChat = (() => {
    if (user?.rol === "cliente" && esFreelancer && Number.isInteger(servicioId) && servicioId > 0) {
      return { servicioId };
    }
    if (Number.isInteger(proyectoId) && proyectoId > 0) {
      if (user?.rol === "cliente" && esFreelancer) {
        return { proyectoId, freelancerId: userId };
      }
      if (user?.rol === "freelancer" && esCliente) return { proyectoId };
    }
    return null;
  })();

  const iniciarChat = async () => {
    if (!token || !contextoChat || chatLoading) return;
    setChatLoading(true);
    setChatError("");
    try {
      const result = await createConversation(token, contextoChat);
      navigate(`/chat/${result.conversacion.id}`);
    } catch (reason) {
      setChatError(errorMessage(reason));
    } finally {
      setChatLoading(false);
    }
  };

  const rutaExplorar = user?.rol === "freelancer" ? "/dashboard/freelancer/ofertas" : "/servicios";

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
      <header className="profile-heading">
        <Link className="profile-back-link" to={rutaExplorar}>← Volver a explorar</Link>
        <p className="profile-eyebrow">PERFIL PÚBLICO</p>
        <h1>{profile.nombre}</h1>
        <p>{profile.rolNombre} en FirstGig · Miembro desde {fechaRegistro(profile.fechaRegistro)}</p>
      </header>

      <div className="profile-public__layout">
        <div className="profile-public__main">
          <section className="profile-card profile-public__card">
            <div className="profile-public__identity">
              {profile.fotoPerfil ? (
                <img className="profile-public__avatar" src={profile.fotoPerfil} alt="" />
              ) : (
                <span className="profile-public__avatar profile-public__avatar--initial" aria-hidden="true">
                  {profile.nombre.charAt(0).toLocaleUpperCase()}
                </span>
              )}
              <div>
                <h2>{profile.nombre}</h2>
                <p>{profile.rolNombre}</p>
              </div>
            </div>

            {esFreelancer && profile.freelancer && (
              <>
                {profile.freelancer.tituloProfesional && <h3>{profile.freelancer.tituloProfesional}</h3>}
                {profile.freelancer.biografia && <p className="profile-public__bio">{profile.freelancer.biografia}</p>}
                {profile.freelancer.calificacionPromedio > 0 && (
                  <p className="profile-public__rating">★ {profile.freelancer.calificacionPromedio.toFixed(1)}</p>
                )}
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
              </>
            )}

            {esCliente && profile.cliente && (
              <>
                {profile.cliente.nombreEmpresa && <h3>{profile.cliente.nombreEmpresa}</h3>}
                <p className="profile-public__bio">{profile.cliente.descripcion || "Este cliente todavía no ha añadido una descripción."}</p>
                <p className="profile-muted">Tipo de cliente: {profile.cliente.tipoCliente === "empresa" ? "Empresa" : "Persona"}.</p>
              </>
            )}
          </section>
        </div>

        <aside className="profile-public__aside">
          <section className="profile-card profile-public__contact">
            <p className="profile-eyebrow">CONTACTO</p>
            <h2>Conversar desde el contexto</h2>
            <p>
              {contextoChat
                ? "El chat conservará el servicio o proyecto desde el que llegaste."
                : "Abre una conversación desde un servicio o proyecto para compartir el contexto correcto."}
            </p>
            {chatError && <p className="profile-message profile-message--error" role="alert">{chatError}</p>}
            {!esPropio && (
              <button
                className="profile-save"
                type="button"
                disabled={!contextoChat || chatLoading}
                onClick={() => void iniciarChat()}
              >
                {chatLoading ? "Abriendo chat…" : "Abrir chat"}
              </button>
            )}
            {!contextoChat && !esPropio && (
              <Link className="profile-back-link" to={rutaExplorar}>Buscar un servicio o proyecto</Link>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
