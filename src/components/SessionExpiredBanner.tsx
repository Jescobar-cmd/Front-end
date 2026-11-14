import { useEffect, useState } from "react";
import { SESSION_EXPIRED_KEY } from "../infrastructure/api/client";

function CloseMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function SessionExpiredBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const revisar = () => {
      try {
        if (sessionStorage.getItem(SESSION_EXPIRED_KEY) === "1") {
          sessionStorage.removeItem(SESSION_EXPIRED_KEY);
          setVisible(true);
        }
      } catch {
        // El almacenamiento puede estar bloqueado por el navegador.
      }
    };

    revisar();
    window.addEventListener("fg:session-expired", revisar);
    return () => window.removeEventListener("fg:session-expired", revisar);
  }, []);

  if (!visible) return null;

  return (
    <div className="fg-session-banner" role="alert">
      <span className="fg-session-banner__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7.5v5" />
          <circle cx="12" cy="16.2" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <span>Tu sesión expiró. Vuelve a iniciar sesión para continuar.</span>
      <button type="button" onClick={() => setVisible(false)} aria-label="Cerrar aviso">
        <CloseMark />
      </button>
    </div>
  );
}
