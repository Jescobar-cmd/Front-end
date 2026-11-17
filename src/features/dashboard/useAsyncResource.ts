import { useCallback, useEffect, useRef, useState } from "react";

export interface AsyncResource<T> {
  data: T | null;
  loading: boolean;
  error: string;
  recargar: () => void;
}

function mensajeDeError(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

/**
 * Carga un recurso con estados explícitos de carga y error.
 * `cargar` debe ser estable (useCallback) para evitar bucles de peticiones.
 */
export function useAsyncResource<T>(
  cargar: () => Promise<T>,
  enabled = true,
  mensajeError = "No se pudo cargar la información.",
): AsyncResource<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);

  const cargarRef = useRef(cargar);
  const mensajeErrorRef = useRef(mensajeError);
  cargarRef.current = cargar;
  mensajeErrorRef.current = mensajeError;

  useEffect(() => {
    if (!enabled) {
      setData(null);
      setLoading(false);
      setError("");
      return;
    }

    let activo = true;
    setLoading(true);
    setError("");

    void Promise.resolve()
      .then(cargarRef.current)
      .then((resultado) => {
        if (activo) setData(resultado);
      })
      .catch((reason: unknown) => {
        if (activo) setError(mensajeDeError(reason, mensajeErrorRef.current));
      })
      .finally(() => {
        if (activo) setLoading(false);
      });

    return () => {
      activo = false;
    };
  }, [enabled, version]);

  const recargar = useCallback(() => setVersion((actual) => actual + 1), []);

  return { data, loading, error, recargar };
}
