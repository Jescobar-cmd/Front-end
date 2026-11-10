import { Telefono } from "../../domain/value-objects/telefono";
import { DocumentoIdentidad } from "../../domain/value-objects/documento";
import type { AuthRepositoryPort, Sesion } from "../ports/AuthRepositoryPort";

export type SeleccionarRolInput =
  | { rol: "cliente"; telefono?: string; documento?: string }
  | { rol: "freelancer"; telefono?: string; documento: string };

export class SeleccionarRolUseCase {
  constructor(private readonly authRepository: AuthRepositoryPort) {}

  async execute(token: string, input: SeleccionarRolInput): Promise<Sesion> {
    if (!token) throw new Error("Sesión expirada. Inicia sesión de nuevo.");
    if (input.rol === "freelancer" && !input.documento?.trim()) {
      throw new Error("La cédula es obligatoria para freelancers");
    }

    const telefono = input.telefono?.trim() ? new Telefono(input.telefono).value : undefined;
    const cedula = input.documento?.trim() ? new DocumentoIdentidad(input.documento).value : undefined;

    return this.authRepository.seleccionarRol(token, {
      rolId: input.rol === "freelancer" ? 2 : 3,
      ...(telefono ? { telefono } : {}),
      ...(cedula ? { cedula } : {}),
    });
  }
}
