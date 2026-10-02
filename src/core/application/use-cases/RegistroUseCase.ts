import { User } from "../../domain/entities/user";
import { Telefono } from "../../domain/value-objects/telefono";
import { DocumentoIdentidad } from "../../domain/value-objects/documento";
import type { AuthRepositoryPort } from "../ports/AuthRepositoryPort";

interface DatosBase {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  mayorDeEdad: boolean;
}

export type RegistroInput = DatosBase &
  (
    | { rol: "cliente" }
    | { rol: "freelancer"; telefono: string; documento: string }
  );

export class RegistroUseCase {
  constructor(private readonly authRepository: AuthRepositoryPort) {}

  async execute(input: RegistroInput): Promise<User> {
    if (!input.mayorDeEdad) {
      throw new Error("Debes confirmar que eres mayor de 18 años");
    }
    if (input.password.length < 8) {
      throw new Error("La contraseña debe tener al menos 8 caracteres");
    }
    if (input.password !== input.confirmPassword) {
      throw new Error("Las contraseñas no coinciden");
    }

    const user = new User({
      username: input.username,
      email: input.email,
      rol: input.rol,
    });

    const base = {
      username: user.username,
      email: user.email.value,
      password: input.password,
    };

    if (input.rol === "freelancer") {
      return this.authRepository.registrarFreelancer({
        ...base,
        telefono: new Telefono(input.telefono).value,
        documento: new DocumentoIdentidad(input.documento).value,
      });
    }

    return this.authRepository.registrarCliente(base);
  }
}