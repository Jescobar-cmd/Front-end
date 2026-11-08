import type {
  DatosPerfilCliente,
  DatosPerfilFreelancer,
  PerfilCliente,
  PerfilFreelancer,
  PerfilPublico,
} from "../../domain/entities/perfil";

export type {
  DatosPerfilCliente,
  DatosPerfilFreelancer,
  FreelancerPerfil,
  HabilidadPerfil,
  PerfilCliente,
  PerfilFreelancer,
  PerfilPublico,
  TipoCliente,
} from "../../domain/entities/perfil";

/**
 * Puerto de perfiles.
 * Backend: GET/PATCH /api/cliente/perfil, GET/PATCH /api/freelancer/perfil,
 *          GET /api/usuarios/:id.
 */
export interface PerfilRepositoryPort {
  obtenerMiPerfil(token: string): Promise<PerfilCliente>;
  actualizarMiPerfil(token: string, datos: DatosPerfilCliente): Promise<PerfilCliente>;
  obtenerMiPerfilFreelancer(token: string): Promise<PerfilFreelancer>;
  actualizarMiPerfilFreelancer(token: string, datos: DatosPerfilFreelancer): Promise<PerfilFreelancer>;
  obtenerPerfilPublico(token: string, id: number): Promise<PerfilPublico>;
}
