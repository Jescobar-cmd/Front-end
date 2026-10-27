import { useAuth } from "../../context/AuthContext";
import { usePerfilPublico } from "../../features/perfil/hooks/usePerfil";

export function PerfilFreelancer() {
  const { user, token } = useAuth();
  const { perfil, estado, error, recargar } = usePerfilPublico(token, user?.id);

  if (estado.estado === "cargando") {
    return <section className="perfil-page"><p>Cargando tu perfil…</p></section>;
  }

  if (error || !perfil) {
    return (
      <section className="perfil-page">
        <p>No se pudo cargar el perfil: {error ?? "desconocido"}</p>
        <button type="button" onClick={recargar}>Reintentar</button>
      </section>
    );
  }

  const freelancer = perfil.freelancer;

  return (
    <section className="perfil-page">
      <h1>Mi perfil</h1>
      <p>Perfil público de freelancer.</p>
      <div className="perfil-view">
        <p><strong>Nombre:</strong> {perfil.nombre}</p>
        <p><strong>Foto:</strong> {perfil.fotoPerfil ?? "—"}</p>
        <p><strong>Título profesional:</strong> {freelancer?.tituloProfesional ?? "—"}</p>
        <p><strong>Biografía:</strong> {freelancer?.biografia ?? "—"}</p>
        <p><strong>Calificación:</strong> {freelancer?.calificacionPromedio ?? 0}</p>
      </div>
    </section>
  );
}
