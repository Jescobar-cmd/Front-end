import { rolDesdeId } from "../../domain/entities/user";
import { User } from "../../domain/entities/user";
import type { AuthRepositoryPort, Sesion } from "../ports/AuthRepositoryPort";

export class ObtenerPerfilUseCase {
  constructor(private readonly authRepository: AuthRepositoryPort) {}

  async execute(token: string): Promise<Sesion> {
    if (!token) throw new Error("Sesión expirada");
    const perfil = await this.authRepository.obtenerPerfil(token);
    return {
      token,
      user: new User({
        id: perfil.id,
        nombre: perfil.nombre,
        email: perfil.email,
        rol: rolDesdeId(perfil.rol),
      }),
    };
  }
}
