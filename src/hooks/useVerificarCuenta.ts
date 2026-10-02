import { useEffect, useState } from "react";
import { verificarCuentaUseCase } from "../di/container";

type Estado = "verificando" | "exito" | "error";

export function useVerificarCuenta(token: string) {
  const [estado, setEstado] = useState<Estado>("verificando");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    let activo = true;

    verificarCuentaUseCase
      .execute(token)
      .then(() => {
        if (activo) setEstado("exito");
      })
      .catch((e) => {
        if (activo) {
          setMensaje(e instanceof Error ? e.message : "Error inesperado");
          setEstado("error");
        }
      });

    return () => {
      activo = false;
    };
  }, [token]);

  return { estado, mensaje };
}