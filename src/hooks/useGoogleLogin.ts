import { useEffect, useRef, useState } from "react";
import { loginConGoogleUseCase } from "../di/container";
import type { Sesion } from "../core/application/ports/AuthRepositoryPort";

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

export function useGoogleLogin(onSesion: (sesion: Sesion) => void) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    const intentarInicializar = () => {
      if (!window.google || !contenedorRef.current) return false;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            const sesion = await loginConGoogleUseCase.execute(response.credential);
            onSesion(sesion);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Error inesperado");
          }
        },
      });

      window.google.accounts.id.renderButton(contenedorRef.current, {
        theme: "outline",
        size: "large",
        width: 320,
        text: "continue_with",
      });

      return true;
    };

    if (intentarInicializar()) return;

    const intervalo = setInterval(() => {
      if (intentarInicializar()) clearInterval(intervalo);
    }, 200);

    return () => clearInterval(intervalo);
  }, [onSesion]);

  return { contenedorRef, error };
}