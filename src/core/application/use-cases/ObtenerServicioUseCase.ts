import type { ServiciosRepositoryPort } from "../ports/ServiciosRepositoryPort";
import type { Servicio } from "../../domain/entities/servicio";

/** Caso de uso: obtener un servicio por id. */
export class ObtenerServicioUseCase {
  constructor(private readonly serviciosRepository: ServiciosRepositoryPort) {}

  async execute(token: string, id: number): Promise<Servicio> {
    return this.serviciosRepository.obtenerServicio(token, id);
  }
}
