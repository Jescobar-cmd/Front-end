import type {
  DatosPerfilCliente,
  PerfilCliente,
  PerfilPublico,
} from "../../domain/entities/perfil";

export type {
  DatosPerfilCliente,
  FreelancerPerfil,
  PerfilCliente,
  PerfilPublico,
  TipoCliente,
} from "../../domain/entities/perfil";

/**
 * Puerto de perfiles.
 * Backend: GET/PATCH /api/cliente/perfil, GET /api/freelancer/perfil,
 *          GET /api/usuarios/:id.
 */
export interface PerfilRepositoryPort {
  obtenerMiPerfil(token: string): Promise<PerfilCliente>;
  actualizarMiPerfil(token: string, datos: DatosPerfilCliente): Promise<PerfilCliente>;
  obtenerPerfilPublico(token: string, id: number): Promise<PerfilPublico>;
}
