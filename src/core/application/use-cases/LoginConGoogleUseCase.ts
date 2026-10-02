import type { AuthRepositoryPort, ResultadoGoogle } from "../ports/AuthRepositoryPort";

export class LoginConGoogleUseCase {
  constructor(private readonly authRepository: AuthRepositoryPort) {}

  async execute(idToken: string): Promise<ResultadoGoogle> {
    if (!idToken) {
      throw new Error("No se pudo verificar la cuenta de Google");
    }
    return this.authRepository.loginConGoogle(idToken);
  }
}