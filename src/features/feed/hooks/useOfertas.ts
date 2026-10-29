import { useEffect, useState } from "react";
import { getCategories } from "../../../infrastructure/api/apiCatalogos";
import { getMyOffers } from "../../../infrastructure/api/apiOfertas";
import type { Categoria } from "../../../core/domain/entities/categoria";
import type { FiltrosOferta, OfertaPaginada } from "../../../core/domain/entities/oferta";
import { MOSTRAR_EJEMPLOS } from "../datosFeed";
import { categoriasDemo } from "../datosDemoFeed";

export type EstadoLista<T> =
  | { estado: "cargando" }
  | { estado: "error"; mensaje: string }
  | { estado: "listo"; datos: T };

function aMensajeError(error: unknown): string {
  return error instanceof Error ? error.message : "No se pudo cargar la información.";
}

/**
 * Categorías del catálogo (GET /api/categorias).
 * Sin token (preview) usa el catálogo de ejemplo.
 */
export function useCategorias(token?: string, vistaPrevia = false) {
  const [indice, setIndice] = useState(0);
  const [estado, setEstado] = useState<EstadoLista<Categoria[]>>({ estado: "cargando" });

  useEffect(() => {
    if (vistaPrevia) {
      setEstado({ estado: "listo", datos: categoriasDemo });
      return;
    }

    if (!token) {
      setEstado({ estado: "listo", datos: MOSTRAR_EJEMPLOS ? categoriasDemo : [] });
      return;
    }

    let activo = true;
    setEstado({ estado: "cargando" });

    getCategories(token)
      .then((categorias) => {
        if (!activo) return;
        setEstado({ estado: "listo", datos: categorias });
      })
      .catch((error: unknown) => {
        if (!activo) return;
        setEstado({ estado: "error", mensaje: aMensajeError(error) });
      });

    return () => {
      activo = false;
    };
  }, [token, indice, vistaPrevia]);

  const recargar = () => setIndice((n) => n + 1);

  return {
    categorias: estado.estado === "listo" ? estado.datos : [],
    estado,
    error: estado.estado === "error" ? estado.mensaje : null,
    recargar,
  };
}

/**
 * Ofertas (proyectos) registradas por el cliente autenticado.
 */
export function useMisOfertas(
  token?: string,
  filtros: FiltrosOferta = { page: 1, limit: 20 },
  vistaPrevia = false,
) {
  const [indice, setIndice] = useState(0);
  const [estado, setEstado] = useState<EstadoLista<OfertaPaginada>>({ estado: "cargando" });

  useEffect(() => {
    if (vistaPrevia) {
      setEstado({ estado: "listo", datos: { page: 1, limit: 20, total: 0, items: [] } });
      return;
    }

    if (!token) {
      setEstado({ estado: "error", mensaje: "Sesión no disponible." });
      return;
    }

    let activo = true;
    setEstado({ estado: "cargando" });

    getMyOffers(token, filtros)
      .then((ofertaPaginada) => {
        if (!activo) return;
        setEstado({ estado: "listo", datos: ofertaPaginada });
      })
      .catch((error: unknown) => {
        if (!activo) return;
        setEstado({ estado: "error", mensaje: aMensajeError(error) });
      });

    return () => {
      activo = false;
    };
  }, [token, JSON.stringify(filtros), indice, vistaPrevia]);

  const recargar = () => setIndice((n) => n + 1);

  return {
    ofertas: estado.estado === "listo" ? estado.datos : null,
    estado,
    error: estado.estado === "error" ? estado.mensaje : null,
    recargar,
  };
}
