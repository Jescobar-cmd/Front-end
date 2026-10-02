import { useState } from "react";
import { completarPerfilGoogleUseCase } from "../di/container";
import type {
  CompletarPerfilGoogleData,
  Sesion,
} from "../core/application/ports/AuthRepositoryPort";

export function useCompletarPerfilGoogle() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completar = async (datos: CompletarPerfilGoogleData): Promise<Sesion | null> => {
    setLoading(true);
    setError(null);
    try {
      if (datos.rolId === 2) {
        return await completarPerfilGoogleUseCase.execute({
          idToken: datos.idToken,
          rol: "freelancer",
          telefono: datos.telefono,
          documento: datos.cedula ?? "",
        });
      }
      return await completarPerfilGoogleUseCase.execute({
        idToken: datos.idToken,
        rol: "cliente",
        telefono: datos.telefono,
        ...(datos.cedula ? { documento: datos.cedula } : {}),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { completar, loading, error };
}