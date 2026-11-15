import { useCallback, useEffect, useRef, useState } from "react";

/** Bloquea temporalmente una acción tras un 429 para evitar reintentos en cadena. */
export function useTemporaryLock(ms = 12000) {
  const [bloqueado, setBloqueado] = useState(false);
  const timerRef = useRef<number | null>(null);

  const bloquear = useCallback(() => {
    setBloqueado(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setBloqueado(false);
      timerRef.current = null;
    }, ms);
  }, [ms]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  return { bloqueado, bloquear };
}
