import type { RolId } from "../../domain/entities/user";

export interface RegistroData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rolId: RolId;
  telefono?: string;
  cedula?: string;
}

export interface RegistroResultado {
  id: string;
  email: string;
}

export interface VerificarCodigoData {
  email: string;
  code: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface SesionSimple {
  token: string;
  rol: RolId;
  nombre: string;
}

export type GoogleLoginResultado =
  | { tipo: "sesion"; sesion: SesionSimple }
  | { tipo: "onboarding"; email: string; idToken: string };

export interface CompletarPerfilGoogleData {
  idToken: string;
  rolId: RolId;
  telefono?: string;
  cedula?: string;
}

export interface RestablecerData {
  email: string;
  code: string;
  password: string;
}

export interface CambiarPasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface PerfilUsuario {
  id: string;
  nombre: string;
  email: string;
  rol: RolId;
  telefono?: string | null;
  cedula?: string | null;
  estado: string;
}

export interface AuthRepositoryPort {
  registrar(data: RegistroData): Promise<RegistroResultado>;
  verificarCodigo(data: VerificarCodigoData): Promise<void>;
  reenviarCodigo(email: string): Promise<void>;
  login(data: LoginData): Promise<SesionSimple>;
  loginConGoogle(idToken: string): Promise<GoogleLoginResultado>;
  completarPerfilGoogle(data: CompletarPerfilGoogleData): Promise<SesionSimple>;
  solicitarRecuperacion(email: string): Promise<void>;
  restablecerPassword(data: RestablecerData): Promise<void>;
  obtenerPerfil(token: string): Promise<PerfilUsuario>;
  cambiarPassword(token: string, data: CambiarPasswordData): Promise<void>;
}