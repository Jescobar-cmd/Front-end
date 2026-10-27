import type { PerfilRepositoryPort } from "../ports/PerfilRepositoryPort";
import type { DatosPerfilCliente, PerfilCliente } from "../../domain/entities/perfil";

/** Caso de uso: editar el perfil propio del cliente autenticado. */
export class ActualizarMiPerfilUseCase {
  constructor(private readonly perfilRepository: PerfilRepositoryPort) {}

  async execute(token: string, datos: DatosPerfilCliente): Promise<{ mensaje: string; perfil: PerfilCliente }> {
    if (!token) throw new Error("Sesión expirada");
    return this.perfilRepository.actualizarMiPerfil(token, datos);
  }
}
