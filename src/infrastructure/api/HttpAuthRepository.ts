import type {
  AuthRepositoryPort,
  LoginData,
  RegistroClienteData,
  RegistroFreelancerData,
  RestablecerData,
  Sesion,
} from "../../core/application/ports/AuthRepositoryPort";
import { User, type Rol } from "../../core/domain/entities/user";

const API_URL = import.meta.env.VITE_API_URL;

interface UserDto {
  id: string;
  username: string;
  email: string;
  rol: Rol;
}

interface LoginResponseDto {
  token: string;
  user: UserDto;
}

async function post<T>(path: string, body: unknown, mensajeError: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? mensajeError);
  }

  const texto = await res.text();
  return (texto ? JSON.parse(texto) : undefined) as T;
}

const toUser = (d: UserDto): User =>
  new User({ id: d.id, username: d.username, email: d.email, rol: d.rol });

export class HttpAuthRepository implements AuthRepositoryPort {
  async registrarCliente(data: RegistroClienteData): Promise<User> {
    const dto = await post<UserDto>("/auth/registro/cliente", data, "No se pudo crear la cuenta");
    return toUser(dto);
  }

  async registrarFreelancer(data: RegistroFreelancerData): Promise<User> {
    const dto = await post<UserDto>("/auth/registro/freelancer", data, "No se pudo crear la cuenta");
    return toUser(dto);
  }

  async login(data: LoginData): Promise<Sesion> {
    const dto = await post<LoginResponseDto>("/auth/login", data, "Correo o contraseña incorrectos");
    return { user: toUser(dto.user), token: dto.token };
  }

  async loginConGoogle(idToken: string): Promise<Sesion> {
    const dto = await post<LoginResponseDto>(
      "/auth/google",
      { idToken },
      "No se pudo iniciar sesión con Google"
    );
    return { user: toUser(dto.user), token: dto.token };
  }

  async solicitarRecuperacion(email: string): Promise<void> {
    await post<void>("/auth/recuperar-password", { email }, "No se pudo enviar el enlace");
  }

  async restablecerPassword(data: RestablecerData): Promise<void> {
    await post<void>("/auth/restablecer-password", data, "El enlace no es válido o ya expiró");
  }

  async verificarCuenta(token: string): Promise<void> {
    await post<void>("/auth/verificar", { token }, "El enlace de verificación no es válido o ya expiró");
  }
}