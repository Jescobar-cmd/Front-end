import type {
  AuthRepositoryPort,
  CambiarPasswordData,
  CompletarPerfilGoogleData,
  LoginData,
  RegistroData,
  RestablecerData,
  ResultadoGoogle,
  Sesion,
  VerificarData,
} from "../../core/application/ports/AuthRepositoryPort";
import { User, rolDesdeId } from "../../core/domain/entities/user";

// Debe incluir el prefijo /api (ej: http://localhost:4000/api)
const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:4000/api").replace(/\/+$/, "");

interface ErrorDto {
  error?: string;
  message?: string;
}

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
}

async function request<T>(
  method: "GET" | "POST" | "PATCH",
  path: string,
  body: unknown,
  mensajeError: string,
  token?: string
): Promise<{ status: number; data: T }> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor. Verifica que el backend esté encendido.");
  }

  const texto = await res.text();
  const data = (texto ? JSON.parse(texto) : {}) as T & ErrorDto;

  if (!res.ok) {
    throw new Error(data.error ?? data.message ?? mensajeError);
  }
  return { status: res.status, data };
}

const post = <T>(path: string, body: unknown, msg: string) => request<T>("POST", path, body, msg);

async function sesionDesdeDto(dto: SesionDto): Promise<Sesion> {
  let email = dto.email;
  let id = dto.id;
  let nombre = dto.nombre;

  // Google no devuelve email/id en la respuesta: se pide el perfil con el JWT
  if (!email) {
    const { data } = await request<PerfilDto>("GET", "/auth/me", undefined, "No se pudo cargar tu perfil", dto.token);
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
    const { data: res } = await post<{ email: string }>("/auth/register", data, "No se pudo crear la cuenta");
    return { email: res.email ?? data.email };
  }

  async verificarCuenta(data: VerificarData): Promise<void> {
    await post("/auth/verify-code", data, "Código inválido o vencido");
  }

  async reenviarCodigo(email: string): Promise<void> {
    await post("/auth/resend-code", { email }, "No se pudo reenviar el código");
  }

  async login(data: LoginData): Promise<Sesion> {
    const { data: dto } = await post<SesionDto>("/auth/login", data, "Correo o contraseña incorrectos");
    return sesionDesdeDto(dto);
  }

  async loginConGoogle(idToken: string, rolId?: 2 | 3): Promise<ResultadoGoogle> {
    const { status, data } = await post<SesionDto & { needsOnboarding?: boolean; email?: string }>(
      "/auth/google",
      { idToken, ...(rolId ? { rolId } : {}) },
      "No se pudo iniciar sesión con Google"
    );
    if (status === 202 || data.needsOnboarding) {
      return { tipo: "onboarding", idToken, email: data.email ?? "" };
    }
    return { tipo: "sesion", sesion: await sesionDesdeDto(data) };
  }

  async completarPerfilGoogle(data: CompletarPerfilGoogleData): Promise<Sesion> {
    const { data: dto } = await post<SesionDto>(
      "/auth/google/complete-profile",
      data,
      "No se pudo completar tu perfil"
    );
    return sesionDesdeDto(dto);
  }

  async solicitarRecuperacion(email: string): Promise<void> {
    await post("/auth/forgot-password", { email }, "No se pudo enviar el código");
  }

  async restablecerPassword(data: RestablecerData): Promise<void> {
    await post("/auth/reset-password", data, "Código inválido o vencido");
  }

  async cambiarPassword(token: string, data: CambiarPasswordData): Promise<void> {
    await request("PATCH", "/auth/me/password", data, "No se pudo cambiar la contraseña", token);
  }
}