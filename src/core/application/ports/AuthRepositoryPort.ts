import type { User } from "../../domain/entities/user";

export interface RegistroClienteData {
  username: string;
  email: string;
  password: string;
}

export interface RegistroFreelancerData extends RegistroClienteData {
  telefono: string;
  documento: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RestablecerData {
  token: string;
  password: string;
}

export interface Sesion {
  user: User;
  token: string;
}

export interface AuthRepositoryPort {
  registrarCliente(data: RegistroClienteData): Promise<User>;
  registrarFreelancer(data: RegistroFreelancerData): Promise<User>;
  login(data: LoginData): Promise<Sesion>;
  loginConGoogle(idToken: string): Promise<Sesion>;
  solicitarRecuperacion(email: string): Promise<void>;
  restablecerPassword(data: RestablecerData): Promise<void>;
  verificarCuenta(token: string): Promise<void>;
}