import { useState } from "react";
import { seleccionarRolUseCase } from "../di/container";
import type { SeleccionarRolInput } from "../core/application/use-cases/SeleccionarRolUseCase";
import type { Sesion } from "../core/application/ports/AuthRepositoryPort";

export function useSeleccionarRol() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const seleccionar = async (token: string, datos: SeleccionarRolInput): Promise<Sesion | null> => {
    setLoading(true);
    setError(null);
    try {
      return await seleccionarRolUseCase.execute(token, datos);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar tu rol");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { seleccionar, loading, error, limpiarError: () => setError(null) };
}
