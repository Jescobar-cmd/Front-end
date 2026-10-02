import { Email } from "../../domain/value-objects/Email";
import type { AuthRepositoryPort } from "../ports/AuthRepositoryPort";

export class SolicitarRecuperacionUseCase {
  constructor(private readonly authRepository: AuthRepositoryPort) {}

  async execute(email: string): Promise<void> {
    const correo = new Email(email);
    await this.authRepository.solicitarRecuperacion(correo.value);
  }
}