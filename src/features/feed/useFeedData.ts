import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getFeed } from "../../infrastructure/api/apiPublicaciones";
import type { Feed } from "../../infrastructure/api/apiPublicaciones";
import type { TipoCuentaFeed, PiezaFeed } from "./datosFeed";
import { useCategorias } from "./hooks/useOfertas";
import type { EstadoLista } from "./hooks/useOfertas";

function aMensajeError(error: unknown): string {
  return error instanceof Error ? error.message : "No se pudo cargar la información.";
}

export function useFeedData(tipoEsperado: TipoCuentaFeed) {
  const { user: usuarioSesion, token } = useAuth();
  const [indiceFeed, setIndiceFeed] = useState(0);
  const [estadoFeed, setEstadoFeed] = useState<EstadoLista<Feed>>({ estado: "cargando" });
  const [feed, setFeed] = useState<Feed | null>(null);

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
  }, [token, indiceFeed]);

  const tipoCuenta = usuarioSesion?.rol ?? tipoEsperado;
  const {
    categorias,
    estado: estadoCategorias,
    error: errorCategorias,
    recargar: recargarCategorias,
  } = useCategorias(token);

  const proyectosParaTi = useMemo((): PiezaFeed[] => {
    if (estadoFeed.estado !== "listo" || !feed) return [];

    if (tipoCuenta === "freelancer") {
      return feed.ofertas.map((oferta) => ({
        id: String(oferta.id),
        categoria: oferta.categoria?.nombre ?? "General",
        titulo: oferta.titulo,
        descripcion: oferta.descripcion,
        detalle: `Proyecto · ${oferta.estado}`,
        etiquetas: oferta.habilidades.map((habilidad) => habilidad.nombre),
        imagenUrl: oferta.imagenUrl ?? undefined,
        precio: oferta.presupuesto,
        etiquetaPrecio: "Presupuesto",
      }));
    }

    return feed.servicios.map((servicio) => ({
      id: String(servicio.id),
      categoria: servicio.categoria?.nombre ?? "General",
      titulo: servicio.titulo,
      descripcion: servicio.descripcion,
      detalle: `Servicio · ${servicio.estado ?? "activo"}`,
      etiquetas: [],
      imagenUrl: servicio.imagenUrl ?? undefined,
      precio: servicio.precio,
      etiquetaPrecio: "Precio",
    }));
  }, [estadoFeed, feed, tipoCuenta]);

  return {
    usuario: { nombre: usuarioSesion?.nombre, tipoCuenta },
    estadoFeed,
    errorFeed: estadoFeed.estado === "error" ? estadoFeed.mensaje : null,
    recargarFeed: () => setIndiceFeed((indice) => indice + 1),
    categorias,
    estadoCategorias,
    errorCategorias,
    recargarCategorias,
    proyectosParaTi,
  };
}

export type FeedData = ReturnType<typeof useFeedData>;
