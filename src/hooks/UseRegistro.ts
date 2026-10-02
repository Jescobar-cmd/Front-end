import { useState } from "react";
import { registroUseCase } from "../di/container";
import type { RegistroInput } from "../core/application/use-cases/RegistroUseCase";

export function useRegistro() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registrar = async (datos: RegistroInput): Promise<{ email: string } | null> => {
    setLoading(true);
    setError(null);
    try {
      return await registroUseCase.execute(datos);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const limpiarError = () => setError(null);

  return { registrar, loading, error, limpiarError };
}