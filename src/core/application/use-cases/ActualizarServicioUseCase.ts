import type { ServiciosRepositoryPort } from "../ports/ServiciosRepositoryPort";
import type { DatosActualizacionServicio } from "../../domain/entities/servicio";
import type { RespuestaServicio } from "../../domain/entities/servicio";

/** Caso de uso: actualizar un servicio. */
export class ActualizarServicioUseCase {
  constructor(private readonly serviciosRepository: ServiciosRepositoryPort) {}

  async execute(token: string, id: number, datos: DatosActualizacionServicio): Promise<RespuestaServicio> {
    return this.serviciosRepository.actualizarServicio(token, id, datos);
  }
}
