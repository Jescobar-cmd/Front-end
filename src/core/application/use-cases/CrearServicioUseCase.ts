import type { ServiciosRepositoryPort } from "../ports/ServiciosRepositoryPort";
import type { DatosServicio } from "../../domain/entities/servicio";
import type { RespuestaServicio } from "../../domain/entities/servicio";

/** Caso de uso: crear un servicio. */
export class CrearServicioUseCase {
  constructor(private readonly serviciosRepository: ServiciosRepositoryPort) {}

  async execute(token: string, datos: DatosServicio): Promise<RespuestaServicio> {
    return this.serviciosRepository.crearServicio(token, datos);
  }
}
