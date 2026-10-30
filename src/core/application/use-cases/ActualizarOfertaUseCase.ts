import type { OfertasRepositoryPort } from "../ports/OfertasRepositoryPort";
import type { DatosOferta, Oferta } from "../../domain/entities/oferta";
import {
  validarCamposOpcionalesOferta,
  validarDescripcionOferta,
  validarIdOferta,
  validarTituloOferta,
} from "../../domain/value-objects/camposOferta";

/** Caso de uso: editar una oferta propia (PATCH /api/cliente/ofertas/:id). */
export class ActualizarOfertaUseCase {
  constructor(private readonly ofertasRepository: OfertasRepositoryPort) {}

  async execute(token: string, id: number, datos: DatosOferta): Promise<Oferta> {
    if (!token) throw new Error("Sesión expirada");
    validarIdOferta(id);

    // Solo viajan los campos definidos (undefined = no tocar; null = borrar).
    const payload = Object.fromEntries(
      Object.entries(datos).filter(([, valor]) => valor !== undefined),
    ) as DatosOferta;

    if (payload.titulo !== undefined) {
      payload.titulo = payload.titulo.trim();
      validarTituloOferta(payload.titulo);
    }
    if (payload.descripcion !== undefined) {
      payload.descripcion = payload.descripcion.trim();
      validarDescripcionOferta(payload.descripcion);
    }
    validarCamposOpcionalesOferta(payload);

    if (Object.keys(payload).length === 0) {
      throw new Error("Debes cambiar al menos un campo");
    }

    return this.ofertasRepository.actualizarOferta(token, id, payload);
  }
}