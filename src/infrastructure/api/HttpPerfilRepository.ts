import type { PerfilRepositoryPort } from "../../core/application/ports/PerfilRepositoryPort";
import type {
  DatosPerfilCliente,
  DatosPerfilFreelancer,
  PerfilCliente,
  PerfilFreelancer,
  PerfilPublico,
} from "../../core/domain/entities/perfil";
import {
  getClientProfile,
  getFreelancerProfile,
  getPublicProfile,
  updateClientProfile,
  updateFreelancerProfile,
} from "./apiPerfiles";

/** Adaptador HTTP del puerto de perfiles. Delega en el módulo `apiPerfiles`. */
export class HttpPerfilRepository implements PerfilRepositoryPort {
  // GET /api/cliente/perfil (solo rol cliente)
  obtenerMiPerfil(token: string): Promise<PerfilCliente> {
    return getClientProfile(token);
  }

  // PATCH /api/cliente/perfil -> { mensaje, perfil }
  async actualizarMiPerfil(token: string, datos: DatosPerfilCliente): Promise<PerfilCliente> {
    const respuesta = await updateClientProfile(token, datos);
    return respuesta.perfil;
  }

  // GET /api/freelancer/perfil (solo rol freelancer)
  obtenerMiPerfilFreelancer(token: string): Promise<PerfilFreelancer> {
    return getFreelancerProfile(token);
  }

  // PATCH /api/freelancer/perfil -> { mensaje, perfil }
  async actualizarMiPerfilFreelancer(token: string, datos: DatosPerfilFreelancer): Promise<PerfilFreelancer> {
    const respuesta = await updateFreelancerProfile(token, datos);
    return respuesta.perfil;
  }

  // GET /api/usuarios/:id (cualquier usuario autenticado)
  obtenerPerfilPublico(token: string, id: number): Promise<PerfilPublico> {
    return getPublicProfile(token, id);
  }
}
