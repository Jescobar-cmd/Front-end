import type { PerfilRepositoryPort } from "../ports/PerfilRepositoryPort";
import type { PerfilPublico } from "../../domain/entities/perfil";

/** Caso de uso: ver el perfil público de un usuario. */
export class ObtenerPerfilPublicoUseCase {
  constructor(private readonly perfilRepository: PerfilRepositoryPort) {}

  async execute(token: string, id: number | string): Promise<PerfilPublico> {
    if (!token) throw new Error("Sesión expirada");
    return this.perfilRepository.obtenerPerfilPublico(token, id);
  }
}
