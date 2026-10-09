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
          prompt: (
            listener?: (notification: { isNotDisplayed: () => boolean }) => void
          ) => void;
        };
      };
    };
  }
}

// Bandera a nivel de módulo: initialize() debe correr una sola vez por carga,
// aunque StrictMode monte el efecto dos veces en desarrollo.
let googleYaInicializado = false;

export function useGoogleLogin(onResultado: (resultado: ResultadoGoogle) => void) {
  const [error, setError] = useState<string | null>(null);
  // Ref con el callback más reciente para no re-inicializar si cambia su identidad.
  const callbackRef = useRef(onResultado);

  useEffect(() => {
    callbackRef.current = onResultado;
  }, [onResultado]);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    const intentarInicializar = () => {
      if (!window.google) return false;
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
      googleYaInicializado = true;

      return true;
    };

    if (intentarInicializar()) return;

    const intervalo = setInterval(() => {
      if (intentarInicializar()) clearInterval(intervalo);
    }, 200);

    return () => clearInterval(intervalo);
  }, []);

  const iniciarConGoogle = useCallback(() => {
    setError(null);
    if (!window.google) {
      setError("No se pudo cargar Google. Revisa tu conexión e inténtalo de nuevo.");
      return;
    }
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed()) {
        setError(
          "Google no mostró el selector de cuenta (quizá el navegador lo bloqueó). Permite accounts.google.com o inicia sesión con tu correo."
        );
      }
    });
  }, []);

  return { error, iniciarConGoogle };
}
