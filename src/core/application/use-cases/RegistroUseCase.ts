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

export type RegistroInput = DatosBase &
  (
    | { rol: "cliente"; telefono?: string; documento?: string }
    | { rol: "freelancer"; telefono?: string; documento: string }
  );

export class RegistroUseCase {
  constructor(private readonly authRepository: AuthRepositoryPort) {}

  async execute(input: RegistroInput): Promise<{ email: string }> {
    if (!input.mayorDeEdad) throw new Error("Debes confirmar que eres mayor de 18 años");
    if (input.nombre.trim().length < 2) throw new Error("El nombre debe tener al menos 2 caracteres");
    if (input.apellido.trim().length < 2) throw new Error("El apellido debe tener al menos 2 caracteres");
    if (input.password.length < 8) throw new Error("La contraseña debe tener al menos 8 caracteres");
    if (input.password !== input.confirmPassword) throw new Error("Las contraseñas no coinciden");

    const correo = new Email(input.email);
    const base = {
      nombre: input.nombre.trim(),
      apellido: input.apellido.trim(),
      email: correo.value,
      password: input.password,
    };

    if (input.rol === "freelancer") {
      return this.authRepository.registrar({
        ...base,
        rolId: 2,
        ...(input.telefono?.trim() ? { telefono: new Telefono(input.telefono).value } : {}),
        cedula: new DocumentoIdentidad(input.documento).value,
      });
    }
    return this.authRepository.registrar({
      ...base,
      rolId: 3,
      ...(input.telefono?.trim() ? { telefono: new Telefono(input.telefono).value } : {}),
      ...(input.documento?.trim() ? { cedula: new DocumentoIdentidad(input.documento).value } : {}),
    });
  }
}