import { Email } from "../../domain/value-objects/Email";
import { Telefono } from "../../domain/value-objects/telefono";
import { DocumentoIdentidad } from "../../domain/value-objects/documento";
import type { AuthRepositoryPort } from "../ports/AuthRepositoryPort";

interface DatosBase {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  confirmPassword: string;
  mayorDeEdad: boolean;
}

export type RegistroInput = DatosBase & {
  rolId: 2 | 3;
  telefono?: string;
  documento?: string;
};

export class RegistroUseCase {
  constructor(private readonly authRepository: AuthRepositoryPort) {}

  async execute(input: RegistroInput): Promise<{ email: string }> {
    if (!input.mayorDeEdad) throw new Error("Debes confirmar que eres mayor de 18 años");
    if (input.nombre.trim().length < 2) throw new Error("El nombre debe tener al menos 2 caracteres");
    if (input.apellido.trim().length < 2) throw new Error("El apellido debe tener al menos 2 caracteres");
    if (input.password.length < 8) throw new Error("La contraseña debe tener al menos 8 caracteres");
    if (input.password !== input.confirmPassword) throw new Error("Las contraseñas no coinciden");
    if (input.rolId === 2 && !input.documento?.trim()) {
      throw new Error("La cédula es obligatoria para freelancers");
    }

    const correo = new Email(input.email);
    // El backend fija el rol al registrar; no existe un endpoint posterior
    // para cambiarlo, así que la elección se envía en este momento.
    return this.authRepository.registrar({
      nombre: input.nombre.trim(),
      apellido: input.apellido.trim(),
      email: correo.value,
      password: input.password,
      rolId: input.rolId,
      ...(input.telefono?.trim() ? { telefono: new Telefono(input.telefono).value } : {}),
      ...(input.documento?.trim() ? { cedula: new DocumentoIdentidad(input.documento).value } : {}),
    });
  }
}