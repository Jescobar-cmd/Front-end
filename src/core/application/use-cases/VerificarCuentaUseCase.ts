import type { AuthRepositoryPort } from "../ports/AuthRepositoryPort";

export class VerificarCuentaUseCase {
  constructor(private readonly authRepository: AuthRepositoryPort) {}

  async execute(token: string): Promise<void> {
    if (!token) {
      throw new Error("El enlace de verificación no es válido o ya expiró");
    }
    await this.authRepository.verificarCuenta(token);
  }
}