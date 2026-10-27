import type { OfertasRepositoryPort } from "../ports/OfertasRepositoryPort";
import type { FiltrosOferta, OfertaPaginada } from "../../domain/entities/oferta";

/** Caso de uso: listar las ofertas (proyectos) registradas por el cliente autenticado. */
export class ListarMisOfertasUseCase {
  constructor(private readonly ofertasRepository: OfertasRepositoryPort) {}

  async execute(token: string, filtros: FiltrosOferta): Promise<OfertaPaginada> {
    return this.ofertasRepository.listarMisOfertas(token, filtros);
  }
}
