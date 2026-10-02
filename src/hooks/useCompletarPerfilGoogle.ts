import { useState } from "react";
import { completarPerfilGoogleUseCase } from "../di/container";
import type { CompletarPerfilInput } from "../core/application/use-cases/CompletarPerfilGoogleUseCase";
import type { Sesion } from "../core/application/ports/AuthRepositoryPort";

export function useCompletarPerfilGoogle() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completar = async (datos: CompletarPerfilInput): Promise<Sesion | null> => {
    setLoading(true);
    setError(null);
    try {
      return await completarPerfilGoogleUseCase.execute(datos);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { completar, loading, error };
}
