import { useState } from "react";
import { restablecerPasswordUseCase } from "../di/container";
import type { RestablecerInput } from "../core/application/use-cases/RestablecerPasswordUseCase";

export function useRestablecerPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const restablecer = async (datos: RestablecerInput): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await restablecerPasswordUseCase.execute(datos);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { restablecer, loading, error };
}