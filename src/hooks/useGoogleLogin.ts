import { useEffect, useRef, useState } from "react";
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

export function useGoogleLogin(onResultado: (resultado: ResultadoGoogle) => void) {
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
            const resultado = await loginConGoogleUseCase.execute(response.credential);
            onResultado(resultado);
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
  }, [onResultado]);

  return { contenedorRef, error };
}