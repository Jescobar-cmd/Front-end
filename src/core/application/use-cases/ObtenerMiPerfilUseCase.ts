import type { PerfilRepositoryPort } from "../ports/PerfilRepositoryPort";
import type { PerfilCliente } from "../../domain/entities/perfil";

/** Caso de uso: ver mi perfil de cliente (GET /api/cliente/perfil). */
export class ObtenerMiPerfilUseCase {
  constructor(private readonly perfilRepository: PerfilRepositoryPort) {}

  async execute(token: string): Promise<PerfilCliente> {
    if (!token) throw new Error("Sesión expirada");
    return this.perfilRepository.obtenerMiPerfil(token);
  }
}