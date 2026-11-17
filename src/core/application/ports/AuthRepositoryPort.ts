import type { User } from "../../domain/entities/user";
export interface RegistroData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rolId: 2 | 3;
  telefono?: string;
  cedula?: string;
  terminosYCondiciones: boolean;
}

export interface LoginData {
  email: string;
  password: string;
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

export interface VerificarData {
  email: string;
  code: string;
}

export interface CompletarPerfilGoogleData {
  idToken: string;
  rolId: 2 | 3;
  telefono?: string;
  cedula?: string;
}

export interface LoginGoogleOptions {
  rolId?: 2 | 3;
  cedula?: string;
}

export interface Sesion {
  user: User;
  token: string;
}

export type ResultadoGoogle =
  | { tipo: "sesion"; sesion: Sesion }
  | { tipo: "onboarding"; idToken: string; email: string; rol?: "cliente" | "freelancer" }
  | { tipo: "requiere_rol"; email: string };

export interface Perfil {
  id: number;
  nombre: string;
  email: string;
  rol: number;
  telefono?: string;
  cedula?: string;
  estado?: string;
}

export interface AuthRegistroPort {
  registrar(data: RegistroData): Promise<{ email: string }>;
}

export interface AuthLoginPort {
  login(data: LoginData): Promise<Sesion>;
  loginConGoogle(idToken: string, options?: LoginGoogleOptions | 2 | 3): Promise<ResultadoGoogle>;
  completarPerfilGoogle(data: CompletarPerfilGoogleData): Promise<Sesion>;
}

export interface AuthPasswordPort {
  solicitarRecuperacion(email: string): Promise<void>;
  restablecerPassword(data: RestablecerData): Promise<void>;
  cambiarPassword(token: string, data: CambiarPasswordData): Promise<void>;
}

export interface AuthSessionPort {
  verificarCuenta(data: VerificarData): Promise<void>;
  reenviarCodigo(email: string): Promise<void>;
  obtenerPerfil(token: string): Promise<Perfil>;
}

export interface AuthRepositoryPort
  extends AuthRegistroPort, AuthLoginPort, AuthPasswordPort, AuthSessionPort {}