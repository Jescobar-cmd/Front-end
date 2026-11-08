import type { PerfilRepositoryPort } from "../ports/PerfilRepositoryPort";
import type { PerfilFreelancer } from "../../domain/entities/perfil";

/** Caso de uso: ver mi perfil de freelancer (GET /api/freelancer/perfil). */
export class ObtenerMiPerfilFreelancerUseCase {
  constructor(private readonly perfilRepository: PerfilRepositoryPort) {}

  async execute(token: string): Promise<PerfilFreelancer> {
    if (!token) throw new Error("Sesión expirada");
    return this.perfilRepository.obtenerMiPerfilFreelancer(token);
  }
}
