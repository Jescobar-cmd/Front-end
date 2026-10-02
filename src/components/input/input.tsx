import { useState } from "react";
import type { InputHTMLAttributes } from "react";

function IconoOjo({ abierto }: { abierto: boolean }) {
  if (abierto) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a18.6 18.6 0 0 1 4.22-5.06M9.9 4.24A10.6 10.6 0 0 1 12 4c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export function Input({ type, className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  const [mostrar, setMostrar] = useState(false);
  const esPassword = type === "password";

  if (!esPassword) {
    return <input className={`input ${className ?? ""}`} type={type} {...rest} />;
  }

  return (
    <div className="input-password">
      <input
        className={`input ${className ?? ""}`}
        type={mostrar ? "text" : "password"}
        {...rest}
      />
      <button
        type="button"
        className="toggle-password"
        tabIndex={-1}
        aria-label={mostrar ? "Ocultar contraseña" : "Mostrar contraseña"}
        onClick={() => setMostrar((s) => !s)}
      >
        <IconoOjo abierto={mostrar} />
      </button>
    </div>
  );
}