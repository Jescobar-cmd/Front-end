import { useEffect, useState } from "react";
import { listServices, getMyServices, getService, createService, updateService, changeServiceStatus } from "../../../infrastructure/api/apiServicios";
import type { EstadoServicio, FiltrosListadoServicio, FiltrosMisServicio, Paginado, RespuestaServicio, Servicio } from "../../../core/domain/entities/servicio";

export type EstadoLista<T> =
  | { estado: "cargando" }
  | { estado: "error"; mensaje: string }
  | { estado: "listo"; datos: T };

function aMensajeError(error: unknown): string {
  return error instanceof Error ? error.message : "No se pudo cargar la información.";
}

/**
 * Servicios del catálogo (GET /api/servicios).
 * Sin token (preview) usa estado de error para forzar empty state controlado.
 */
export function useListarServicios(token?: string, filtros: FiltrosListadoServicio = {}, vistaPrevia = false) {
  const [indice, setIndice] = useState(0);
  const [estado, setEstado] = useState<EstadoLista<Paginado<Servicio>>>({ estado: "cargando" });

  useEffect(() => {
    if (vistaPrevia) {
      setEstado({ estado: "listo", datos: { page: 1, limit: 50, total: 0, items: [] } });
      return;
    }

    if (!token) {
      setEstado({ estado: "error", mensaje: "Sesión no disponible." });
      return;
    }

    let activo = true;
    setEstado({ estado: "cargando" });

    listServices(token, filtros)
      .then((datos) => {
        if (!activo) return;
        setEstado({ estado: "listo", datos });
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
    servicios: estado.estado === "listo" ? estado.datos : null,
    estado,
    error: estado.estado === "error" ? estado.mensaje : null,
    recargar,
  };
}

/**
 * Mis servicios del freelancer autenticado (GET /api/freelancer/servicios).
 */
export function useListarMisServicios(token?: string, filtros: FiltrosMisServicio = {}, vistaPrevia = false) {
  const [indice, setIndice] = useState(0);
  const [estado, setEstado] = useState<EstadoLista<Paginado<Servicio>>>({ estado: "cargando" });

  useEffect(() => {
    if (vistaPrevia) {
      setEstado({ estado: "listo", datos: { page: 1, limit: 50, total: 0, items: [] } });
      return;
    }

    if (!token) {
      setEstado({ estado: "error", mensaje: "Sesión no disponible." });
      return;
    }

    let activo = true;
    setEstado({ estado: "cargando" });

    getMyServices(token, filtros)
      .then((datos) => {
        if (!activo) return;
        setEstado({ estado: "listo", datos });
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
    servicios: estado.estado === "listo" ? estado.datos : null,
    estado,
    error: estado.estado === "error" ? estado.mensaje : null,
    recargar,
  };
}

/**
 * Detalle de un servicio (GET /api/servicios/:id).
 */
export function useObtenerServicio(token?: string, id?: number, vistaPrevia = false) {
  const [indice, setIndice] = useState(0);
  const [estado, setEstado] = useState<EstadoLista<Servicio>>({ estado: "cargando" });

  useEffect(() => {
    if (vistaPrevia) {
      setEstado({ estado: "error", mensaje: "Vista previa local." });
      return;
    }

    if (!token || !id) {
      setEstado({ estado: "error", mensaje: "Servicio no disponible." });
      return;
    }

    let activo = true;
    setEstado({ estado: "cargando" });

    getService(token, id)
      .then((servicio) => {
        if (!activo) return;
        setEstado({ estado: "listo", datos: servicio });
      })
      .catch((error: unknown) => {
        if (!activo) return;
        setEstado({ estado: "error", mensaje: aMensajeError(error) });
      });

    return () => {
      activo = false;
    };
  }, [token, id, indice, vistaPrevia]);

  const recargar = () => setIndice((n) => n + 1);

  return {
    servicio: estado.estado === "listo" ? estado.datos : null,
    estado,
    error: estado.estado === "error" ? estado.mensaje : null,
    recargar,
  };
}

/**
 * Acciones sobre servicios: crear, actualizar y cambiar estado.
 */
export function useAccionesServicios(token?: string, vistaPrevia = false) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crear = async (datos: Parameters<typeof createService>[1]) => {
    if (vistaPrevia) {
      setError("Vista previa local.");
      return { ok: false as const };
    }
    if (!token) {
      setError("Sesión no disponible.");
      return { ok: false as const };
    }
    setLoading(true);
    try {
      const respuesta = await createService(token, datos);
      setError(null);
      return { ok: true as const, respuesta };
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear el servicio.");
      return { ok: false as const };
    } finally {
      setLoading(false);
    }
  };

  const actualizar = async (id: number, datos: Parameters<typeof updateService>[2]) => {
    if (vistaPrevia) {
      setError("Vista previa local.");
      return { ok: false as const };
    }
    if (!token) {
      setError("Sesión no disponible.");
      return { ok: false as const };
    }
    setLoading(true);
    try {
      const respuesta = await updateService(token, id, datos);
      setError(null);
      return { ok: true as const, respuesta };
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo actualizar el servicio.");
      return { ok: false as const };
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (id: number, estado: EstadoServicio) => {
    if (vistaPrevia) {
      setError("Vista previa local.");
      return { ok: false as const };
    }
    if (!token) {
      setError("Sesión no disponible.");
      return { ok: false as const };
    }
    setLoading(true);
    try {
      const respuesta = await changeServiceStatus(token, id, estado);
      setError(null);
      return { ok: true as const, respuesta };
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo actualizar el estado del servicio.");
      return { ok: false as const };
    } finally {
      setLoading(false);
    }
  };

  return { crear, actualizar, cambiarEstado, loading, error, reset: () => setError(null) };
}
