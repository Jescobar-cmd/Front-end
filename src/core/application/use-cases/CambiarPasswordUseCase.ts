import type { AuthRepositoryPort } from "../ports/AuthRepositoryPort";

export interface CambiarPasswordInput {
  token: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export class CambiarPasswordUseCase {
  constructor(private readonly authRepository: AuthRepositoryPort) {}

  async execute({ token, currentPassword, newPassword, confirmPassword }: CambiarPasswordInput): Promise<void> {
    if (!currentPassword) {
      throw new Error("Ingresa tu contraseña actual");
    }
    if (newPassword.length < 8) {
      throw new Error("La nueva contraseña debe tener al menos 8 caracteres");
    }
    if (newPassword !== confirmPassword) {
      throw new Error("Las contraseñas no coinciden");
    }
    await this.authRepository.cambiarPassword(token, { currentPassword, newPassword });
  }
}