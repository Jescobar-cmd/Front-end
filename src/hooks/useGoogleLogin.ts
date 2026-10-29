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
  const inicializadoRef = useRef(false);
  const onResultadoRef = useRef(onResultado);
  const [error, setError] = useState<string | null>(null);
  const callbackRef = useRef(onResultado);

  useEffect(() => {
    callbackRef.current = onResultado;
  }, [onResultado]);

  useEffect(() => {
    onResultadoRef.current = onResultado;
  }, [onResultado]);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError("El inicio con Google no está configurado.");
      return;
    }

    const intentarInicializar = () => {
      if (!window.google || !contenedorRef.current) return false;

      if (!googleYaInicializado) {
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
        googleYaInicializado = true;
      }

      contenedorRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(contenedorRef.current, {
        type: "icon",
        shape: "circle",
        theme: "outline",
        size: "large",
      });

      inicializadoRef.current = true;
      return true;
    };

    if (intentarInicializar()) return;

    let intentos = 0;
    const intervalo = setInterval(() => {
      intentos += 1;
      if (intentarInicializar()) {
        clearInterval(intervalo);
      } else if (inicializadoRef.current) {
        clearInterval(intervalo);
      } else if (intentos >= 50) {
        clearInterval(intervalo);
        setError("No se pudo cargar el inicio con Google. Intenta de nuevo.");
      }
    }, 200);

    return () => clearInterval(intervalo);
  }, []);

  return { contenedorRef, error };
}
