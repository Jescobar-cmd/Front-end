import type { ServiciosRepositoryPort } from "../ports/ServiciosRepositoryPort";
import type { FiltrosMisServicio, Paginado, Servicio } from "../../domain/entities/servicio";

/** Caso de uso: listar mis servicios (freelancer autenticado). */
export class ListarMisServiciosUseCase {
  constructor(private readonly serviciosRepository: ServiciosRepositoryPort) {}

  async execute(token: string, filtros: FiltrosMisServicio = {}): Promise<Paginado<Servicio>> {
    return this.serviciosRepository.listarMisServicios(token, filtros);
  }
}
