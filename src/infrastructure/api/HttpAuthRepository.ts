import { apiFetch } from "./client";
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
import { User, rolDesdeId } from "../../core/domain/entities/user";

interface SesionDto {
  token: string;
  rol: number;
  nombre: string;
  id?: number;
  email?: string;
}

interface PerfilDto {
  id: number;
  nombre: string;
  email: string;
  rol: number;
  telefono?: string;
  cedula?: string;
  estado?: string;
}

async function sesionDesdeDto(dto: SesionDto): Promise<Sesion> {
  let email = dto.email;
  let id = dto.id;
  let nombre = dto.nombre;

  // Google no devuelve email/id en la respuesta: se pide el perfil con el JWT
  if (!email) {
    const { data } = await apiFetch<PerfilDto>({
      method: "GET",
      path: "/auth/me",
      token: dto.token,
      mensajeError: "No se pudo cargar tu perfil",
    });
    email = data.email;
    id = data.id;
    nombre = data.nombre;
  }

  return {
    token: dto.token,
    user: new User({ id, nombre, email: email as string, rol: rolDesdeId(dto.rol) }),
  };
}

export class HttpAuthRepository implements AuthRepositoryPort {
  async registrar(data: RegistroData): Promise<{ email: string }> {
    const { data: respuesta } = await apiFetch<{ email: string }>({
      method: "POST",
      path: "/auth/register",
      body: data,
      mensajeError: "No se pudo crear la cuenta",
    });
    return { email: respuesta.email };
  }

  async verificarCuenta(data: VerificarData): Promise<void> {
    await apiFetch<unknown>({
      method: "POST",
      path: "/auth/verify-code",
      body: data,
      mensajeError: "Código inválido o vencido",
    });
  }

  async reenviarCodigo(email: string): Promise<void> {
    await apiFetch<unknown>({
      method: "POST",
      path: "/auth/resend-code",
      body: { email },
      mensajeError: "No se pudo reenviar el código",
    });
  }

  async login(data: LoginData): Promise<Sesion> {
    const { data: dto } = await apiFetch<SesionDto>({
      method: "POST",
      path: "/auth/login",
      body: data,
      mensajeError: "Correo o contraseña incorrectos",
    });
    return sesionDesdeDto(dto);
  }

  async loginConGoogle(idToken: string, rolId?: 2 | 3): Promise<ResultadoGoogle> {
    const { status, data } = await apiFetch<SesionDto & { needsOnboarding?: boolean; email?: string }>({
      method: "POST",
      path: "/auth/google",
      body: { idToken, ...(rolId ? { rolId } : {}) },
      mensajeError: "No se pudo iniciar sesión con Google",
    });
    if (status === 202 || data.needsOnboarding) {
      return { tipo: "onboarding", idToken, email: data.email ?? "" };
    }
    return { tipo: "sesion", sesion: await sesionDesdeDto(data) };
  }

  async completarPerfilGoogle(data: CompletarPerfilGoogleData): Promise<Sesion> {
    const { data: dto } = await apiFetch<SesionDto>({
      method: "POST",
      path: "/auth/google/complete-profile",
      body: data,
      mensajeError: "No se pudo completar tu perfil",
    });
    return sesionDesdeDto(dto);
  }

  async solicitarRecuperacion(email: string): Promise<void> {
    await apiFetch<unknown>({
      method: "POST",
      path: "/auth/forgot-password",
      body: { email },
      mensajeError: "No se pudo enviar el código",
    });
  }

  async restablecerPassword(data: RestablecerData): Promise<void> {
    await apiFetch<unknown>({
      method: "POST",
      path: "/auth/reset-password",
      body: data,
      mensajeError: "Código inválido o vencido",
    });
  }

  async cambiarPassword(token: string, data: CambiarPasswordData): Promise<void> {
    await apiFetch<unknown>({
      method: "PATCH",
      path: "/auth/me/password",
      token,
      body: data,
      mensajeError: "No se pudo cambiar la contraseña",
    });
  }

  async obtenerPerfil(token: string): Promise<Perfil> {
    const { data } = await apiFetch<Perfil>({
      method: "GET",
      path: "/auth/me",
      token,
      mensajeError: "Sesión expirada",
    });
    return data;
  }
}
