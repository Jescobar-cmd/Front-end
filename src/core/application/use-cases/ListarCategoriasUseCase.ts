import type { OfertasRepositoryPort } from "../ports/OfertasRepositoryPort";
import type { Categoria } from "../../domain/entities/categoria";

/** Caso de uso: listar el catálogo de categorías (para los chips del feed). */
export class ListarCategoriasUseCase {
  constructor(private readonly ofertasRepository: OfertasRepositoryPort) {}

  async execute(token: string): Promise<Categoria[]> {
    return this.ofertasRepository.listarCategorias(token);
  }
}
