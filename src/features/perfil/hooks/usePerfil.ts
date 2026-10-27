import { useEffect, useState } from "react";
import { obtenerMiPerfilUseCase, actualizarMiPerfilUseCase, obtenerPerfilPublicoUseCase } from "../../../di/container";
import type { PerfilCliente, PerfilPublico } from "../../../core/domain/entities/perfil";
import type { DatosPerfilCliente } from "../../../core/domain/entities/perfil";

export type EstadoPerfil<T> =
  | { estado: "cargando" }
  | { estado: "error"; mensaje: string }
  | { estado: "listo"; datos: T };

function aMensajeError(error: unknown): string {
  return error instanceof Error ? error.message : "No se pudo cargar la información.";
}

export function useMiPerfil(token?: string) {
  const [indice, setIndice] = useState(0);
  const [estado, setEstado] = useState<EstadoPerfil<PerfilCliente>>({ estado: "cargando" });

  useEffect(() => {
    if (!token) {
      setEstado({ estado: "error", mensaje: "Sesión no disponible." });
      return;
    }

    let activo = true;
    setEstado({ estado: "cargando" });

    obtenerMiPerfilUseCase
      .execute(token)
      .then((perfil) => {
        if (!activo) return;
        setEstado({ estado: "listo", datos: perfil });
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
    perfil: estado.estado === "listo" ? estado.datos : null,
    estado,
    error: estado.estado === "error" ? estado.mensaje : null,
    recargar,
  };
}

export function useActualizarPerfil(token?: string) {
  const [estado, setEstado] = useState<{ estado: "idle" | "cargando" | "exito" | "error"; mensaje?: string; error?: string }>({
    estado: "idle",
  });

  const ejecutar = async (datos: DatosPerfilCliente): Promise<boolean> => {
    if (!token) {
      setEstado({ estado: "error", error: "Sesión no disponible." });
      return false;
    }

    setEstado({ estado: "cargando" });
    try {
      const respuesta = await actualizarMiPerfilUseCase.execute(token, datos);
      setEstado({ estado: "exito", mensaje: respuesta.mensaje });
      return true;
    } catch (error: unknown) {
      setEstado({ estado: "error", error: aMensajeError(error) });
      return false;
    }
  };

  return { estado, ejecutar };
}

export function usePerfilPublico(token?: string, id?: number | string) {
  const [indice, setIndice] = useState(0);
  const [estado, setEstado] = useState<EstadoPerfil<PerfilPublico>>({ estado: "cargando" });

  useEffect(() => {
    if (!token || !id) {
      setEstado({ estado: "error", mensaje: "Perfil no disponible." });
      return;
    }

    let activo = true;
    setEstado({ estado: "cargando" });

    obtenerPerfilPublicoUseCase
      .execute(token, id)
      .then((perfil) => {
        if (!activo) return;
        setEstado({ estado: "listo", datos: perfil });
      })
      .catch((error: unknown) => {
        if (!activo) return;
        setEstado({ estado: "error", mensaje: aMensajeError(error) });
      });

    return () => {
      activo = false;
    };
  }, [token, id, indice]);

  const recargar = () => setIndice((n) => n + 1);

  return {
    perfil: estado.estado === "listo" ? estado.datos : null,
    estado,
    error: estado.estado === "error" ? estado.mensaje : null,
    recargar,
  };
}
