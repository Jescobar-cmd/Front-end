import type { DatosPerfilCliente, PerfilCliente, PerfilPublico } from "../../domain/entities/perfil";

export interface PerfilRepositoryPort {
  obtenerMiPerfil(token: string): Promise<PerfilCliente>;
  actualizarMiPerfil(token: string, datos: DatosPerfilCliente): Promise<{ mensaje: string; perfil: PerfilCliente }>;
  obtenerPerfilPublico(token: string, id: number | string): Promise<PerfilPublico>;
}
