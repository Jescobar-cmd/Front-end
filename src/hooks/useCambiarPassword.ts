import { useState } from "react";
import type { SyntheticEvent } from "react";
import { cambiarPasswordUseCase } from "../di/container";

export function useCambiarPassword(token: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  const cambiar = async (currentPassword: string, newPassword: string, confirmPassword: string): Promise<boolean> => {
    if (!token) {
      setError("Sesión expirada. Vuelve a iniciar sesión.");
      return false;
    }
    setLoading(true);
    setError(null);
    setExito(false);
    try {
      await cambiarPasswordUseCase.execute({ token, currentPassword, newPassword, confirmPassword });
      setExito(true);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { cambiar, loading, error, exito };
}
