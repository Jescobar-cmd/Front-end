import { Email } from "../../domain/value-objects/Email";
import type { AuthRepositoryPort } from "../ports/AuthRepositoryPort";

export class ReenviarCodigoUseCase {
  constructor(private readonly authRepository: AuthRepositoryPort) {}

  async execute(email: string): Promise<void> {
    await this.authRepository.reenviarCodigo(new Email(email).value);
  }
}