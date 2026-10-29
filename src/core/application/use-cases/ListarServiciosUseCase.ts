import type { ServiciosRepositoryPort } from "../ports/ServiciosRepositoryPort";
import type { Paginado, Servicio } from "../../domain/entities/servicio";
import type { FiltrosListadoServicio } from "../../domain/entities/servicio";

/** Caso de uso: listar servicios (catálogo o mis servicios). */
export class ListarServiciosUseCase {
  constructor(private readonly serviciosRepository: ServiciosRepositoryPort) {}

  async execute(token: string, filtros: FiltrosListadoServicio = {}): Promise<Paginado<Servicio>> {
    return this.serviciosRepository.listarServicios(token, filtros);
  }
}
