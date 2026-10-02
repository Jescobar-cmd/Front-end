import { Email } from "../../domain/value-objects/Email";
import type { AuthRepositoryPort } from "../ports/AuthRepositoryPort";

export class VerificarCuentaUseCase {
  constructor(private readonly authRepository: AuthRepositoryPort) {}

  async execute(email: string, code: string): Promise<void> {
    const correo = new Email(email);
    if (!/^\d{6}$/.test(code.trim())) {
      throw new Error("El código debe tener exactamente 6 dígitos");
    }
    await this.authRepository.verificarCuenta({ email: correo.value, code: code.trim() });
  }

  async reenviar(email: string): Promise<void> {
    const correo = new Email(email);
    await this.authRepository.reenviarCodigo(correo.value);
  }
}