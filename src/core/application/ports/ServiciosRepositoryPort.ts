import type { Paginado, RespuestaServicio, Servicio } from "../../domain/entities/servicio";
import type { DatosServicio, DatosActualizacionServicio, EstadoServicio, FiltrosListadoServicio, FiltrosMisServicio } from "../../domain/entities/servicio";

export interface ServiciosRepositoryPort {
  listarServicios(token: string, filtros: FiltrosListadoServicio): Promise<Paginado<Servicio>>;
  obtenerServicio(token: string, id: number): Promise<Servicio>;
  crearServicio(token: string, datos: DatosServicio): Promise<RespuestaServicio>;
  actualizarServicio(token: string, id: number, datos: DatosActualizacionServicio): Promise<RespuestaServicio>;
  cambiarEstadoServicio(token: string, id: number, estado: EstadoServicio): Promise<RespuestaServicio>;
  listarMisServicios(token: string, filtros: FiltrosMisServicio): Promise<Paginado<Servicio>>;
}
