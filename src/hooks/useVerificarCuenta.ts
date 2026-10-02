import { useState } from "react";
import { verificarCuentaUseCase } from "../di/container";

export function useVerificarCuenta() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const verificar = async (email: string, code: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      await verificarCuentaUseCase.execute(email, code);
      setInfo("Tu cuenta fue verificada.");
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reenviar = async (email: string): Promise<void> => {
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      await verificarCuentaUseCase.reenviar(email);
      setInfo("Te enviamos un nuevo código.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo reenviar el código");
    } finally {
      setLoading(false);
    }
  };

  return { verificar, reenviar, loading, error, info };
}