import type { PerfilRepositoryPort } from "../ports/PerfilRepositoryPort";
import {
  NIVELES_HABILIDAD,
  type DatosPerfilFreelancer,
  type NivelHabilidad,
  type PerfilFreelancer,
} from "../../domain/entities/perfil";
import { Telefono } from "../../domain/value-objects/telefono";

/** Texto opcional: "" o null borra el valor (el backend lo guarda como null). */
function textoOpcional(valor: string | null, max: number, mensajeMax: string): string | null {
  const limpio = valor?.trim() ?? "";
  if (limpio.length > max) throw new Error(mensajeMax);
  return limpio.length > 0 ? limpio : null;
}

/** Caso de uso: editar mi perfil de freelancer (PATCH /api/freelancer/perfil). */
export class ActualizarMiPerfilFreelancerUseCase {
  constructor(private readonly perfilRepository: PerfilRepositoryPort) {}

  async execute(token: string, datos: DatosPerfilFreelancer): Promise<PerfilFreelancer> {
    if (!token) throw new Error("Sesión expirada");

    // Solo viajan los campos que el usuario tocó: el backend rechaza campos desconocidos (.strict()).
    const payload: DatosPerfilFreelancer = {};

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

    if (datos.tituloProfesional !== undefined) {
      payload.tituloProfesional = textoOpcional(
        datos.tituloProfesional,
        150,
        "El título profesional no puede exceder 150 caracteres",
      );
    }

    if (datos.biografia !== undefined) {
      payload.biografia = textoOpcional(
        datos.biografia,
        2000,
        "La biografía no puede exceder 2000 caracteres",
      );
    }

    if (datos.habilidades !== undefined) {
      if (!Array.isArray(datos.habilidades)) {
        throw new Error("Las habilidades deben ser una lista");
      }
      if (datos.habilidades.length > 20) {
        throw new Error("No puedes asignar más de 20 habilidades");
      }
      if (datos.habilidades.some((habilidad) => !Number.isInteger(habilidad.id) || habilidad.id <= 0)) {
        throw new Error("Las habilidades deben ser ids numéricos");
      }
      if (new Set(datos.habilidades.map((habilidad) => habilidad.id)).size !== datos.habilidades.length) {
        throw new Error("No puedes repetir una habilidad");
      }
      if (
        datos.habilidades.some(
          (habilidad) =>
            habilidad.nivel != null &&
            !NIVELES_HABILIDAD.includes(habilidad.nivel as NivelHabilidad),
        )
      ) {
        throw new Error("El nivel de la habilidad no es válido");
      }
      payload.habilidades = datos.habilidades.map((habilidad) => ({
        id: habilidad.id,
        nivel: habilidad.nivel ?? null,
      }));
    }

    if (Object.keys(payload).length === 0) {
      throw new Error("Debes cambiar al menos un campo");
    }

    return this.perfilRepository.actualizarMiPerfilFreelancer(token, payload);
  }
}
