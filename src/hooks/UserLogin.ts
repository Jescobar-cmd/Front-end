import { useState } from "react";
import { loginUseCase } from "../di/container";
import type { LoginInput } from "../core/application/use-cases/LoginUseCase";
import type { Sesion } from "../core/application/ports/AuthRepositoryPort";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const iniciarSesion = async (datos: LoginInput): Promise<Sesion | null> => {
    setLoading(true);
    setError(null);
    try {
      return await loginUseCase.execute(datos);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { iniciarSesion, loading, error };
}