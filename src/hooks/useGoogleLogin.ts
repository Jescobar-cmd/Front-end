import { useEffect, useRef, useState } from "react";

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

export function useGoogleLogin(onCredential: (credential: string) => void) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const inicializadoRef = useRef(false);
  const googleYaInicializadoRef = useRef(false);
  const googleCallbackActualRef = useRef<((credential: string) => void) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const callbackRef = useRef(onCredential);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    googleCallbackActualRef.current = (credential) => {
      setError(null);
      callbackRef.current(credential);
    };
    return () => {
      googleCallbackActualRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!clientId || !contenedorRef.current) return;

    const intentarInicializar = () => {
      if (!window.google || !contenedorRef.current) return false;

      if (!googleYaInicializadoRef.current) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            googleCallbackActualRef.current?.(response.credential);
          },
        });
        googleYaInicializadoRef.current = true;
      }

      contenedorRef.current.replaceChildren();
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
      } else if (inicializadoRef.current || intentos >= 50) {
        clearInterval(intervalo);
        if (intentos >= 50) {
          setError("No se pudo cargar el inicio con Google. Intenta de nuevo.");
        }
      }
    }, 200);

    return () => clearInterval(intervalo);
  }, [clientId]);

  return { contenedorRef, error };
}
