import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { rolDesdeId, User } from "../core/domain/entities/user";
import type { Rol } from "../core/domain/entities/user";
import type { Sesion } from "../core/application/ports/AuthRepositoryPort";
import { obtenerPerfilUseCase } from "../di/container";

const STORAGE_KEY = "first_gig_sesion";

interface SesionGuardada {
  token: string;
  user: { id?: number | string; nombre: string; email: string; rol: Rol };
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  cargando: boolean;
  guardarSesion: (sesion: Sesion) => void;
  actualizarNombre: (nombre: string) => void;
  refrescarSesion: () => Promise<void>;
  cerrarSesion: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function aPlano(sesion: Sesion): SesionGuardada {
  return {
    token: sesion.token,
    user: {
      id: sesion.user.id,
      nombre: sesion.user.nombre,
      email: sesion.user.email.value,
      rol: sesion.user.rol,
    },
  };
}

function leerSesionGuardada(): { user: User | null; token: string | null } {
  try {
    const almacenada = localStorage.getItem(STORAGE_KEY);
    if (!almacenada) return { user: null, token: null };
    const plana = JSON.parse(almacenada) as SesionGuardada;
    if (!plana?.token || !plana?.user?.email) return { user: null, token: null };
    return {
      token: plana.token,
      user: new User({
        id: plana.user.id,
        nombre: plana.user.nombre,
        email: plana.user.email,
        rol: rolDesdeId(plana.user.rol),
      }),
    };
  } catch {
    return { user: null, token: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const inicial = leerSesionGuardada();
    if (!inicial.token) {
      setCargando(false);
      return;
    }
    // Valida el JWT contra GET /auth/me: si expiró (401) se cierra sesión
    obtenerPerfilUseCase
      .execute(inicial.token)
      .then((sesion) => {
        setUser(sesion.user);
        setToken(sesion.token);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(aPlano(sesion)));
      })
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
        setToken(null);
      })
      .finally(() => setCargando(false));
  }, []);

  const guardarSesion = useCallback((sesion: Sesion) => {
    setUser(sesion.user);
    setToken(sesion.token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(aPlano(sesion)));
  }, []);

  const actualizarNombre = useCallback((nombre: string) => {
    if (!user || !token) return;
    const nombreLimpio = nombre.trim();
    if (!nombreLimpio || nombreLimpio === user.nombre) return;
    const actualizado = new User({
      id: user.id,
      nombre: nombreLimpio,
      email: user.email.value,
      rol: user.rol,
    });
    setUser(actualizado);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        token,
        user: {
          id: actualizado.id,
          nombre: actualizado.nombre,
          email: actualizado.email.value,
          rol: actualizado.rol,
        },
      }));
    } catch {
      // El cambio sigue vigente durante la sesión.
    }
  }, [user, token]);

  const refrescarSesion = useCallback(async () => {
    if (!token) return;
    const sesion = await obtenerPerfilUseCase.execute(token);
    setUser(sesion.user);
    setToken(sesion.token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(aPlano(sesion)));
  }, [token]);

  const cerrarSesion = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, cargando, guardarSesion, actualizarNombre, refrescarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return context;
}
