import { useEffect, useState } from "react";
import { getCategories } from "../../../infrastructure/api/apiCatalogos";
import type { Categoria } from "../../../core/domain/entities/categoria";

export type EstadoLista<T> =
  | { estado: "cargando" }
  | { estado: "error"; mensaje: string }
  | { estado: "listo"; datos: T };

function aMensajeError(error: unknown): string {
  return error instanceof Error ? error.message : "No se pudo cargar la información.";
}

/**
 * Categorías del catálogo (GET /api/categorias).
 */
export function useCategorias(token?: string) {
  const [indice, setIndice] = useState(0);
  const [estado, setEstado] = useState<EstadoLista<Categoria[]>>({ estado: "cargando" });

  useEffect(() => {
    if (!token) {
      setEstado({ estado: "listo", datos: [] });
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
  }, [token, indice]);

  const recargar = () => setIndice((n) => n + 1);

  return {
    categorias: estado.estado === "listo" ? estado.datos : [],
    estado,
    error: estado.estado === "error" ? estado.mensaje : null,
    recargar,
  };
}
