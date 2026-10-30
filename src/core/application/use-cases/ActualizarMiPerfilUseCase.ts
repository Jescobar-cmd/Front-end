import type { PerfilRepositoryPort } from "../ports/PerfilRepositoryPort";
import type { DatosPerfilCliente, PerfilCliente } from "../../domain/entities/perfil";
import { Telefono } from "../../domain/value-objects/telefono";

/** Texto opcional: "" o null borra el valor (el backend lo guarda como null). */
function textoOpcional(valor: string | null, max: number, mensajeMax: string): string | null {
  const limpio = valor?.trim() ?? "";
  if (limpio.length > max) throw new Error(mensajeMax);
  return limpio.length > 0 ? limpio : null;
}

/** Caso de uso: editar mi perfil de cliente (PATCH /api/cliente/perfil). */
export class ActualizarMiPerfilUseCase {
  constructor(private readonly perfilRepository: PerfilRepositoryPort) {}

  async execute(token: string, datos: DatosPerfilCliente): Promise<PerfilCliente> {
    if (!token) throw new Error("Sesión expirada");

    // Solo viajan los campos que el usuario tocó: el backend rechaza campos desconocidos (.strict()).
    const payload: DatosPerfilCliente = {};

    if (datos.nombre !== undefined) {
      const nombre = datos.nombre.trim();
      if (nombre.length < 2) throw new Error("El nombre debe tener al menos 2 caracteres");
      if (nombre.length > 100) throw new Error("El nombre no puede exceder 100 caracteres");
      payload.nombre = nombre;
    }

    if (datos.telefono !== undefined) {
      const telefono = datos.telefono?.trim() ?? "";
      payload.telefono = telefono ? new Telefono(telefono).value : null;
    }

    if (datos.fotoPerfil !== undefined) {
      const foto = textoOpcional(datos.fotoPerfil, 500, "La URL de la foto no puede exceder 500 caracteres");
      if (foto && !/^https?:\/\/.+/.test(foto)) {
        throw new Error("La foto debe ser una URL válida (http o https)");
      }
      payload.fotoPerfil = foto;
    }

    if (datos.descripcion !== undefined) {
      payload.descripcion = textoOpcional(datos.descripcion, 500, "La descripción no puede exceder 500 caracteres");
    }

    if (datos.nombreEmpresa !== undefined) {
      payload.nombreEmpresa = textoOpcional(
        datos.nombreEmpresa,
        150,
        "El nombre de la empresa no puede exceder 150 caracteres",
      );
    }

    if (datos.tipoCliente !== undefined) {
      if (datos.tipoCliente !== "natural" && datos.tipoCliente !== "empresa") {
        throw new Error("El tipo de cliente debe ser natural o empresa");
      }
      payload.tipoCliente = datos.tipoCliente;
    }

    if (Object.keys(payload).length === 0) {
      throw new Error("Debes cambiar al menos un campo");
    }

    return this.perfilRepository.actualizarMiPerfil(token, payload);
  }
}