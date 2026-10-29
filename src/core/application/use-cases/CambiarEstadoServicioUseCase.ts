import type { ServiciosRepositoryPort } from "../ports/ServiciosRepositoryPort";
import type { EstadoServicio } from "../../domain/entities/servicio";
import type { RespuestaServicio } from "../../domain/entities/servicio";

/** Caso de uso: cambiar el estado de un servicio. */
export class CambiarEstadoServicioUseCase {
  constructor(private readonly serviciosRepository: ServiciosRepositoryPort) {}

  async execute(token: string, id: number, estado: EstadoServicio): Promise<RespuestaServicio> {
    return this.serviciosRepository.cambiarEstadoServicio(token, id, estado);
  }
}
