import { useEffect, useRef, useState } from "react";
import { moderacionApi } from "../../../infrastructure/api/apiModeracion";
import type { PerfilPublicoModeracion } from "../../../infrastructure/api/apiModeracion";

/**
 * Resuelve nombres y fotos para las filas del listado de reportes.
 * El endpoint de listado solo devuelve IDs; el perfil público los completa.
 * Se cachea por sesión de página para no repetir solicitudes al paginar.
 */
export function usePerfilesUsuarios(token: string | null, ids: number[]) {
  const cacheRef = useRef(new Map<number, PerfilPublicoModeracion>());
  const [perfiles, setPerfiles] = useState<Record<number, PerfilPublicoModeracion>>({});
  const clave = ids.join(",");

  useEffect(() => {
    if (!token) return;
    const unicos = Array.from(new Set(ids.filter((id) => Number.isInteger(id) && id > 0)));
    const faltantes = unicos.filter((id) => !cacheRef.current.has(id));

    if (faltantes.length === 0) {
      setPerfiles(Object.fromEntries(cacheRef.current));
      return;
    }

    let activo = true;
    void Promise.allSettled(
      faltantes.map((id) => moderacionApi.obtenerPerfilPublico(token, id)),
    ).then((resultados) => {
      resultados.forEach((resultado, indice) => {
        if (resultado.status === "fulfilled") {
          cacheRef.current.set(faltantes[indice], resultado.value);
        }
      });
      if (activo) setPerfiles(Object.fromEntries(cacheRef.current));
    });

    return () => {
      activo = false;
    };
    // `clave` resume los ids; evita repetir el efecto por una nueva referencia de arreglo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, clave]);

  return perfiles;
}
