import type {
  AuthRepositoryPort,
  LoginGoogleOptions,
  ResultadoGoogle,
} from "../ports/AuthRepositoryPort";

export class LoginConGoogleUseCase {
  constructor(private readonly authRepository: AuthRepositoryPort) {}

  async execute(idToken: string, options?: LoginGoogleOptions): Promise<ResultadoGoogle> {
    if (!idToken) {
      throw new Error("No se pudo verificar la cuenta de Google");
    }
    if (options?.rolId === 2 && !options.cedula?.trim()) {
      throw new Error("La cédula es obligatoria para freelancers");
    }
    return this.authRepository.loginConGoogle(idToken, options);
  }
}