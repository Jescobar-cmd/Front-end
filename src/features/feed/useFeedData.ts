import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { obtenerPerfilUseCase } from "../../di/container";
import type { User } from "../../core/domain/entities/user";
import { getFeed } from "../../infrastructure/api/apiPublicaciones";
import type { Feed } from "../../infrastructure/api/apiPublicaciones";
import { ofertaAPieza, obtenerProyectosParaFreelancer, obtenerTalentoParaExplorar } from "./datosFeed";
import type { TipoCuentaFeed, PiezaFeed } from "./datosFeed";
import { useCategorias, useMisOfertas } from "./hooks/useOfertas";
import type { EstadoLista } from "./hooks/useOfertas";

function aMensajeError(error: unknown): string {
  return error instanceof Error ? error.message : "No se pudo cargar la información.";
}

export function useFeedData(tipoEsperado: TipoCuentaFeed) {
  const { user: usuarioSesion, token } = useAuth();
  const [indicePerfil, setIndicePerfil] = useState(0);
  const [estadoPerfil, setEstadoPerfil] = useState<EstadoLista<User>>({ estado: "cargando" });
  const [estadoFeed, setEstadoFeed] = useState<EstadoLista<Feed>>({ estado: "cargando" });
  const [feed, setFeed] = useState<Feed | null>(null);

  useEffect(() => {
    if (!token) {
      setEstadoPerfil({ estado: "error", mensaje: "Sesión no disponible." });
      return;
    }

    let activo = true;
    setEstadoPerfil({ estado: "cargando" });

    obtenerPerfilUseCase
      .execute(token)
      .then((sesion) => {
        if (activo) setEstadoPerfil({ estado: "listo", datos: sesion.user });
      })
      .catch((error: unknown) => {
        if (activo) setEstadoPerfil({ estado: "error", mensaje: aMensajeError(error) });
      });

    return () => {
      activo = false;
    };
  }, [token, indicePerfil]);

  useEffect(() => {
    if (!token) {
      setEstadoFeed({ estado: "error", mensaje: "Sesión no disponible." });
      return;
    }

    let activo = true;
    setEstadoFeed({ estado: "cargando" });

    getFeed(token, 30)
      .then((datos) => {
        if (!activo) return;
        setFeed(datos);
        setEstadoFeed({ estado: "listo", datos });
      })
      .catch((error: unknown) => {
        if (!activo) return;
        setEstadoFeed({ estado: "error", mensaje: aMensajeError(error) });
      });

    return () => {
      activo = false;
    };
  }, [token, indicePerfil]);

  const usuarioActual = estadoPerfil.estado === "listo" ? estadoPerfil.datos : usuarioSesion;
  const tipoCuenta = usuarioActual?.rol ?? tipoEsperado;
  const { categorias, estado: estadoCategorias, error: errorCategorias, recargar: recargarCategorias } =
    useCategorias(token);
  const {
    ofertas,
    estado: estadoMisOfertas,
    error: errorMisOfertas,
    recargar: recargarMisOfertas,
  } = useMisOfertas(tipoCuenta === "cliente" ? token : undefined);

  const proyectosParaTi = useMemo((): PiezaFeed[] => {
    if (estadoFeed.estado === "listo" && feed) {
      if (tipoCuenta === "freelancer") {
        return feed.ofertas.map((oferta) => ({
          id: String(oferta.id),
          categoria: oferta.categoria?.nombre ?? "General",
          titulo: oferta.titulo,
          descripcion: oferta.descripcion,
          detalle: `Proyecto · ${oferta.estado}`,
          etiquetas: oferta.habilidades.map((habilidad) => habilidad.nombre),
          imagenUrl: oferta.imagenUrl ?? undefined,
        }));
      }
      return feed.servicios.map((servicio) => ({
        id: String(servicio.id),
        categoria: servicio.categoriaId ? String(servicio.categoriaId) : "General",
        titulo: servicio.titulo,
        descripcion: servicio.descripcion,
        detalle: `Servicio · ${servicio.estado ?? "activo"}`,
        etiquetas: [],
        imagenUrl: servicio.imagenUrl ?? undefined,
      }));
    }
    return tipoCuenta === "freelancer" ? obtenerProyectosParaFreelancer() : obtenerTalentoParaExplorar();
  }, [estadoFeed, feed, tipoCuenta]);

  const misProyectos = useMemo(() => {
    if (tipoCuenta !== "cliente" || !ofertas) return [];
    return ofertas.items.map(ofertaAPieza);
  }, [tipoCuenta, ofertas]);

  return {
    usuario: { nombre: usuarioActual?.nombre, tipoCuenta },
    errorUsuario: estadoPerfil.estado === "error" ? estadoPerfil.mensaje : null,
    recargarUsuario: () => setIndicePerfil((indice) => indice + 1),
    categorias,
    estadoCategorias,
    errorCategorias,
    recargarCategorias,
    proyectosParaTi,
    misProyectos,
    estadoMisOfertas,
    errorMisOfertas,
    recargarMisOfertas,
  };
}

export type FeedData = ReturnType<typeof useFeedData>;
