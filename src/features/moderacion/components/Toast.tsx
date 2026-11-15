import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

export type ToastTone = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: number;
  mensaje: string;
  tone: ToastTone;
}

interface ToastContextValue {
  mostrarToast: (mensaje: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const timersRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  const quitar = useCallback((id: number) => {
    setToasts((actuales) => actuales.filter((toast) => toast.id !== id));
  }, []);

  const mostrarToast = useCallback(
    (mensaje: string, tone: ToastTone = "info") => {
      const id = ++idRef.current;
      setToasts((actuales) => [...actuales.slice(-3), { id, mensaje, tone }]);
      const timer = window.setTimeout(() => {
        timersRef.current.delete(timer);
        quitar(id);
      }, tone === "error" ? 9000 : 6000);
      timersRef.current.add(timer);
    },
    [quitar],
  );

  return (
    <ToastContext.Provider value={{ mostrarToast }}>
      {children}
      <div className="mod-toasts" role="region" aria-label="Avisos del panel">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`mod-toast mod-toast--${toast.tone}`}
            role={toast.tone === "error" ? "alert" : "status"}
          >
            <span className="mod-toast__mark" aria-hidden="true" />
            <p>{toast.mensaje}</p>
            <button
              type="button"
              className="mod-toast__close"
              onClick={() => quitar(toast.id)}
              aria-label="Cerrar aviso"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return context;
}
