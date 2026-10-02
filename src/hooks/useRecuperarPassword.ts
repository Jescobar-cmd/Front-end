import { useState } from "react";
import { solicitarRecuperacionUseCase } from "../di/container";

export function useRecuperarPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  const solicitar = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await solicitarRecuperacionUseCase.execute(email);
      setEnviado(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return { solicitar, loading, error, enviado };
}