import { Telefono } from "../../domain/value-objects/telefono";
import { DocumentoIdentidad } from "../../domain/value-objects/documento";
import type { AuthRepositoryPort, Sesion } from "../ports/AuthRepositoryPort";

export type CompletarPerfilInput = { idToken: string } & (
  | { rol: "cliente"; telefono?: string; documento?: string }
  | { rol: "freelancer"; telefono?: string; documento: string }
);

export class CompletarPerfilGoogleUseCase {
  constructor(private readonly authRepository: AuthRepositoryPort) {}

  async execute(input: CompletarPerfilInput): Promise<Sesion> {
    if (!input.idToken) throw new Error("La sesión de Google expiró. Vuelve a intentarlo.");
    if (input.rol === "freelancer" && !input.documento.trim()) {
      throw new Error("La cédula es obligatoria para freelancers");
    }

    const telefono = input.telefono?.trim()
      ? new Telefono(input.telefono).value
      : undefined;
    const cedula = input.documento?.trim()
      ? new DocumentoIdentidad(input.documento).value
      : undefined;

    return this.authRepository.completarPerfilGoogle({
      idToken: input.idToken,
      rolId: input.rol === "freelancer" ? 2 : 3,
      ...(telefono ? { telefono } : {}),
      ...(cedula ? { cedula } : {}),
    });
  }
}