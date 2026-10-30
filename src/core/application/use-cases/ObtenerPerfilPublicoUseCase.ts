import type { PerfilRepositoryPort } from "../ports/PerfilRepositoryPort";
import type { PerfilPublico } from "../../domain/entities/perfil";

/** Caso de uso: ver el perfil público de otro usuario (GET /api/usuarios/:id). */
export class ObtenerPerfilPublicoUseCase {
  constructor(private readonly perfilRepository: PerfilRepositoryPort) {}

  async execute(token: string, id: number): Promise<PerfilPublico> {
    if (!token) throw new Error("Sesión expirada");
    if (!Number.isInteger(id) || id <= 0) throw new Error("El id del usuario no es válido");
    return this.perfilRepository.obtenerPerfilPublico(token, id);
  }
}