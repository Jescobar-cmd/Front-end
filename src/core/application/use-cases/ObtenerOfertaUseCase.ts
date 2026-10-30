import type { OfertasRepositoryPort } from "../ports/OfertasRepositoryPort";
import type { Oferta } from "../../domain/entities/oferta";
import { validarIdOferta } from "../../domain/value-objects/camposOferta";

/** Caso de uso: detalle de una oferta propia (GET /api/cliente/ofertas/:id). */
export class ObtenerOfertaUseCase {
  constructor(private readonly ofertasRepository: OfertasRepositoryPort) {}

  async execute(token: string, id: number): Promise<Oferta> {
    if (!token) throw new Error("Sesión expirada");
    validarIdOferta(id);
    return this.ofertasRepository.obtenerOferta(token, id);
  }
}