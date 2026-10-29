import { authRepository } from "../../di/container";
import type {
  AuthRepositoryPort,
  CambiarPasswordData,
  CompletarPerfilGoogleData,
  LoginData,
  Perfil,
  RegistroData,
  RestablecerData,
  ResultadoGoogle,
  Sesion,
  VerificarData,
} from "../../core/application/ports/AuthRepositoryPort";

const repo: AuthRepositoryPort = authRepository;

/**
 * Módulo de API — Autenticación (backend: Jescobar-cmd/Backend).
 * Nombres de función según la especificación del frontend.
 */

export async function register(data: RegistroData): Promise<{ email: string }> {
  return repo.registrar(data);
}

export async function verifyCode(data: VerificarData): Promise<void> {
  return repo.verificarCuenta(data);
}

export async function resendCode(email: string): Promise<void> {
  return repo.reenviarCodigo(email);
}

export async function login(data: LoginData): Promise<Sesion> {
  return repo.login(data);
}

export async function loginGoogle(idToken: string, rolId?: 2 | 3): Promise<ResultadoGoogle> {
  return repo.loginConGoogle(idToken, rolId);
}

export async function completeGoogleProfile(data: CompletarPerfilGoogleData): Promise<Sesion> {
  return repo.completarPerfilGoogle(data);
}

export async function forgotPassword(email: string): Promise<void> {
  return repo.solicitarRecuperacion(email);
}

export async function resetPassword(data: RestablecerData): Promise<void> {
  return repo.restablecerPassword(data);
}

export async function getMe(token: string): Promise<Perfil> {
  return repo.obtenerPerfil(token);
}

export async function changePassword(token: string, data: CambiarPasswordData): Promise<void> {
  return repo.cambiarPassword(token, data);
}
