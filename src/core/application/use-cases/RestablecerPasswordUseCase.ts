import type { AuthRepositoryPort } from "../ports/AuthRepositoryPort";

export interface RestablecerInput {
  token: string;
  password: string;
  confirmPassword: string;
}

export class RestablecerPasswordUseCase {
  constructor(private readonly authRepository: AuthRepositoryPort) {}

  async execute({ token, password, confirmPassword }: RestablecerInput): Promise<void> {
    if (!token) {
      throw new Error("El enlace no es válido o ya expiró");
    }
    if (password.length < 8) {
      throw new Error("La contraseña debe tener al menos 8 caracteres");
    }
    if (password !== confirmPassword) {
      throw new Error("Las contraseñas no coinciden");
    }
    await this.authRepository.restablecerPassword({ token, password });
  }
}