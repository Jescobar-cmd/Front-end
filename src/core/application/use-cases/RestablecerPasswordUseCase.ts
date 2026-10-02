import type { AuthRepositoryPort } from "../ports/AuthRepositoryPort";

export interface RestablecerInput {
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
}

export class RestablecerPasswordUseCase {
  constructor(private readonly authRepository: AuthRepositoryPort) {}

  async execute({ email, code, password, confirmPassword }: RestablecerInput): Promise<void> {
    if (!/^\d{6}$/.test(code)) throw new Error("El código debe tener 6 dígitos");
    if (password.length < 8) {
      throw new Error("La contraseña debe tener al menos 8 caracteres");
    }
    if (password !== confirmPassword) {
      throw new Error("Las contraseñas no coinciden");
    }
    await this.authRepository.restablecerPassword({ email, code, password });
  }
}