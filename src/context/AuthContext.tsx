import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "../core/domain/entities/user";
import type { Sesion } from "../core/application/ports/AuthRepositoryPort";

const STORAGE_KEY = "first_gig_sesion";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  cargando: boolean;
  guardarSesion: (sesion: Sesion) => void;
  cerrarSesion: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function leerSesionGuardada(): { user: User | null; token: string | null } {
  try {
    const almacenada = localStorage.getItem(STORAGE_KEY);
    if (!almacenada) return { user: null, token: null };
    const sesion = JSON.parse(almacenada) as Sesion;
    return { user: sesion.user ?? null, token: sesion.token ?? null };
  } catch {
    return { user: null, token: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const sesion = leerSesionGuardada();
    setUser(sesion.user);
    setToken(sesion.token);
    setCargando(false);
  }, []);

  const guardarSesion = (sesion: Sesion) => {
    setUser(sesion.user);
    setToken(sesion.token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sesion));
  };

  const cerrarSesion = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, cargando, guardarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return context;
}