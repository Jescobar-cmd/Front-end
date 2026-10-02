import { Email } from "../../domain/value-objects/Email";
import type { AuthRepositoryPort, Sesion } from "../ports/AuthRepositoryPort";

export interface LoginInput {
  email: string;
  password: string;
}

export class LoginUseCase {
  constructor(private readonly authRepository: AuthRepositoryPort) {}

  async execute({ email, password }: LoginInput): Promise<Sesion> {
    if (!password) {
      throw new Error("Ingresa tu contraseña");
    }
    const correo = new Email(email);
    return this.authRepository.login({ email: correo.value, password });
  }
}