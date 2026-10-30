import type { OfertasRepositoryPort } from "../ports/OfertasRepositoryPort";
import type { EstadoOferta, Oferta } from "../../domain/entities/oferta";
import { validarIdOferta } from "../../domain/value-objects/camposOferta";

const ESTADOS: EstadoOferta[] = ["abierto", "en_progreso", "completado", "cancelado"];

/** Caso de uso: cambiar el estado de una oferta propia (PATCH /api/cliente/ofertas/:id/estado). */
export class CambiarEstadoOfertaUseCase {
  constructor(private readonly ofertasRepository: OfertasRepositoryPort) {}

  async execute(token: string, id: number, estado: EstadoOferta): Promise<Oferta> {
    if (!token) throw new Error("Sesión expirada");
    validarIdOferta(id);
    if (!ESTADOS.includes(estado)) {
      throw new Error("El estado debe ser abierto, en_progreso, completado o cancelado");
    }
    return this.ofertasRepository.cambiarEstadoOferta(token, id, estado);
  }
}