import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  createPost,
  deletePost,
  getPost,
  getPosts,
  toggleLike,
} from "../../infrastructure/api/apiPublicaciones";
import type {
  Publicacion,
  DatosPublicacion,
} from "../../infrastructure/api/apiPublicaciones";
import type { ApiError } from "../../infrastructure/api/client";
import "./feed-publicaciones.css";

const PAGE_SIZE = 10;

function mensajeDeError(error: unknown): string {
  if (error instanceof Error) {
    const apiError = error as ApiError;
    if (apiError.details?.length) {
      return apiError.details.map(({ field, message }) => `${field}: ${message}`).join(" ");
    }
    return error.message;
  }
  return "No se pudo completar la solicitud.";
}

function likesDe(publicacion: Publicacion) {
  return publicacion.likes ?? { totalLikes: 0, meGusta: false };
}

function validarImagen(url: string): string | null {
  if (!url.trim()) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") return null;
  } catch {
    return "Escribe una URL válida para la imagen.";
  }
  return "La imagen debe usar una URL http o https.";
}

export function FeedPublicaciones({ vistaPrevia = false }: { vistaPrevia?: boolean }) {
  const { token, user } = useAuth();
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [contenido, setContenido] = useState("");
  const [titulo, setTitulo] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [likesEnCurso, setLikesEnCurso] = useState<number[]>([]);
  const [detalle, setDetalle] = useState<Publicacion | null>(null);
  const [cargandoDetalleId, setCargandoDetalleId] = useState<number | null>(null);
  const [errorDetalle, setErrorDetalle] = useState<string | null>(null);

  const cargarPublicaciones = useCallback(async (paginaSolicitada = 1, anexar = false) => {
    if (!token) {
      setErrorCarga("Inicia sesión para ver las publicaciones.");
      setCargando(false);
      return;
    }
    setCargando(true);
    setErrorCarga(null);
    try {
      const resultado = await getPosts(token, undefined, paginaSolicitada, PAGE_SIZE);
      setPublicaciones((actuales) =>
        anexar ? [...actuales, ...resultado.items] : resultado.items,
      );
      setPagina(resultado.page);
      setTotal(resultado.total);
    } catch (error: unknown) {
      setErrorCarga(mensajeDeError(error));
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    if (!vistaPrevia) void cargarPublicaciones();
  }, [cargarPublicaciones, vistaPrevia]);

  if (vistaPrevia) return null;

  const idUsuario = Number(user?.id);

  const manejarCrear = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorFormulario(null);
    setMensajeExito(null);
    const texto = contenido.trim();
    const encabezado = titulo.trim();
    const imagen = imagenUrl.trim();
    if (texto.length < 1 || texto.length > 5000) {
      setErrorFormulario("El contenido debe tener entre 1 y 5000 caracteres.");
      return;
    }
    if (encabezado.length > 150) {
      setErrorFormulario("El título no puede superar 150 caracteres.");
      return;
    }
    const errorImagen = validarImagen(imagen);
    if (errorImagen) {
      setErrorFormulario(errorImagen);
      return;
    }
    if (!token) {
      setErrorFormulario("Inicia sesión para publicar.");
      return;
    }

    const datos: DatosPublicacion = { contenido: texto };
    if (encabezado) datos.titulo = encabezado;
    if (imagen) datos.imagenUrl = imagen;
    setGuardando(true);
    try {
      const respuesta = await createPost(token, datos);
      setPublicaciones((actuales) => [respuesta.publicacion, ...actuales].slice(0, PAGE_SIZE * pagina));
      setTotal((actual) => actual + 1);
      setContenido("");
      setTitulo("");
      setImagenUrl("");
      setMensajeExito("Publicación creada.");
    } catch (error: unknown) {
      setErrorFormulario(mensajeDeError(error));
    } finally {
      setGuardando(false);
    }
  };

  const manejarLike = async (publicacion: Publicacion) => {
    if (!token || likesEnCurso.includes(publicacion.id)) return;
    const anterior = likesDe(publicacion);
    const siguiente = {
      totalLikes: Math.max(0, anterior.totalLikes + (anterior.meGusta ? -1 : 1)),
      meGusta: !anterior.meGusta,
    };
    setLikesEnCurso((actuales) => [...actuales, publicacion.id]);
    setPublicaciones((actuales) =>
      actuales.map((item) => item.id === publicacion.id ? { ...item, likes: siguiente } : item),
    );
    try {
      const respuesta = await toggleLike(token, publicacion.id);
      setPublicaciones((actuales) =>
        actuales.map((item) =>
          item.id === publicacion.id
            ? { ...item, likes: { meGusta: respuesta.meGusta, totalLikes: respuesta.totalLikes } }
            : item,
        ),
      );
    } catch (error: unknown) {
      setPublicaciones((actuales) =>
        actuales.map((item) => item.id === publicacion.id ? { ...item, likes: anterior } : item),
      );
      setErrorCarga(mensajeDeError(error));
    } finally {
      setLikesEnCurso((actuales) => actuales.filter((id) => id !== publicacion.id));
    }
  };

  const manejarEliminar = async (id: number) => {
    if (!token || eliminandoId !== null) return;
    setEliminandoId(id);
    try {
      await deletePost(token, id);
      setPublicaciones((actuales) => actuales.filter((item) => item.id !== id));
      setTotal((actual) => Math.max(0, actual - 1));
      if (detalle?.id === id) setDetalle(null);
      setMensajeExito("Publicación eliminada.");
    } catch (error: unknown) {
      setErrorCarga(mensajeDeError(error));
    } finally {
      setEliminandoId(null);
    }
  };

  const abrirDetalle = async (id: number) => {
    if (!token) return;
    setCargandoDetalleId(id);
    setErrorDetalle(null);
    try {
      setDetalle(await getPost(token, id));
    } catch (error: unknown) {
      setErrorDetalle(mensajeDeError(error));
    } finally {
      setCargandoDetalleId(null);
    }
  };

  return (
    <section className="feed-posts" aria-labelledby="feed-posts-title">
      <header className="feed-posts__heading">
        <div>
          <h2 id="feed-posts-title">Publicaciones</h2>
          <p>Ideas, novedades y avances de la comunidad.</p>
        </div>
      </header>

      <form className="feed-post-form" onSubmit={manejarCrear}>
        <label>
          Título <span>(opcional)</span>
          <input
            value={titulo}
            onChange={(event) => setTitulo(event.target.value)}
            maxLength={150}
            placeholder="Dale un título a tu publicación"
          />
        </label>
        <label>
          ¿Qué quieres compartir?
          <textarea
            value={contenido}
            onChange={(event) => setContenido(event.target.value)}
            maxLength={5000}
            minLength={1}
            required
            rows={4}
            placeholder="Comparte una idea con la comunidad"
          />
          <span className="feed-post-form__count">{contenido.length}/5000</span>
        </label>
        <label>
          Imagen por URL <span>(opcional)</span>
          <input
            type="url"
            inputMode="url"
            value={imagenUrl}
            onChange={(event) => setImagenUrl(event.target.value)}
            placeholder="https://..."
          />
        </label>
        {errorFormulario && <p className="feed-posts__error" role="alert">{errorFormulario}</p>}
        <button className="feed-posts__primary" type="submit" disabled={guardando}>
          {guardando ? "Publicando…" : "Publicar"}
        </button>
      </form>

      {mensajeExito && <p className="feed-posts__success" role="status">{mensajeExito}</p>}
      {errorCarga && (
        <div className="feed-posts__notice" role="alert">
          <p>{errorCarga}</p>
          <button type="button" onClick={() => void cargarPublicaciones()}>Reintentar</button>
        </div>
      )}
      {cargando && publicaciones.length === 0 ? (
        <p className="feed-posts__state" role="status">Cargando publicaciones…</p>
      ) : publicaciones.length === 0 ? (
        <p className="feed-posts__state">Aún no hay publicaciones. Comparte la primera.</p>
      ) : (
        <div className="feed-posts__list">
          {publicaciones.map((publicacion) => {
            const likes = likesDe(publicacion);
            const esAutor = Number.isFinite(idUsuario) && Number(publicacion.autor.id) === idUsuario;
            return (
              <article className="feed-post" key={publicacion.id}>
                <header className="feed-post__author">
                  {publicacion.autor.fotoPerfil ? (
                    <img src={publicacion.autor.fotoPerfil} alt="" />
                  ) : (
                    <span aria-hidden="true">{publicacion.autor.nombre?.slice(0, 1) || "F"}</span>
                  )}
                  <strong>{publicacion.autor.nombre}</strong>
                </header>
                {publicacion.titulo && <h3>{publicacion.titulo}</h3>}
                <p className="feed-post__content">{publicacion.contenido}</p>
                {publicacion.imagenUrl && (
                  <img className="feed-post__image" src={publicacion.imagenUrl} alt="" loading="lazy" />
                )}
                <footer className="feed-post__actions">
                  <button
                    type="button"
                    aria-pressed={likes.meGusta}
                    disabled={likesEnCurso.includes(publicacion.id)}
                    onClick={() => void manejarLike(publicacion)}
                  >
                    {likes.meGusta ? "Te gusta" : "Me gusta"} · {likes.totalLikes}
                  </button>
                  <button
                    type="button"
                    disabled={cargandoDetalleId === publicacion.id}
                    onClick={() => void abrirDetalle(publicacion.id)}
                  >
                    {cargandoDetalleId === publicacion.id ? "Cargando…" : "Ver publicación"}
                  </button>
                  {esAutor && (
                    <button
                      type="button"
                      className="feed-post__delete"
                      disabled={eliminandoId === publicacion.id}
                      onClick={() => void manejarEliminar(publicacion.id)}
                    >
                      {eliminandoId === publicacion.id ? "Eliminando…" : "Eliminar"}
                    </button>
                  )}
                </footer>
              </article>
            );
          })}
        </div>
      )}
      {!cargando && publicaciones.length < total && (
        <button
          className="feed-posts__more"
          type="button"
          onClick={() => void cargarPublicaciones(pagina + 1, true)}
        >
          Cargar más publicaciones
        </button>
      )}

      {errorDetalle && <p className="feed-posts__error" role="alert">{errorDetalle}</p>}
      {detalle && (
        <div className="feed-posts__backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setDetalle(null);
        }}>
          <section className="feed-posts__dialog" role="dialog" aria-modal="true" aria-labelledby="feed-post-detail-title">
            <button type="button" className="feed-posts__close" onClick={() => setDetalle(null)} aria-label="Cerrar detalle">
              ×
            </button>
            <h2 id="feed-post-detail-title">{detalle.titulo || `Publicación de ${detalle.autor.nombre}`}</h2>
            <p>{detalle.contenido}</p>
            {detalle.imagenUrl && <img src={detalle.imagenUrl} alt="" />}
            <p className="feed-posts__detail-meta">Publicado por {detalle.autor.nombre}</p>
          </section>
        </div>
      )}
    </section>
  );
}
