import { useCallback, useEffect, useRef, useState } from "react";
import { loginConGoogleUseCase } from "../di/container";
import type { ResultadoGoogle } from "../core/application/ports/AuthRepositoryPort";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

// Bandera de módulo: initialize() debe ejecutarse una sola vez por carga de página,
// incluso si StrictMode monta el efecto dos veces en desarrollo.
let googleYaInicializado = false;

export function useGoogleLogin(onResultado: (resultado: ResultadoGoogle) => void) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const callbackRef = useRef(onResultado);

  useEffect(() => {
    callbackRef.current = onResultado;
  }, [onResultado]);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    const intentarInicializar = () => {
      if (!window.google || !contenedorRef.current) return false;
      if (googleYaInicializado) return true;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            const resultado = await loginConGoogleUseCase.execute(response.credential);
            await callbackRef.current(resultado);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Error inesperado");
          }
        },
      });

      // Solo visual: botón solo-logo de Google (el flujo de login no cambia)
      window.google.accounts.id.renderButton(contenedorRef.current, {
        theme: "outline",
        size: "large",
        type: "icon",
        shape: "circle",
      });

      googleYaInicializado = true;
      return true;
    };

    if (intentarInicializar()) return;

    const intervalo = setInterval(() => {
      if (intentarInicializar()) clearInterval(intervalo);
    }, 200);

    return () => clearInterval(intervalo);
  }, []);

  return { contenedorRef, error };
}
