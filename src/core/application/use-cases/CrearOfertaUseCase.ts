import type { OfertasRepositoryPort } from "../ports/OfertasRepositoryPort";
import type { NuevaOferta, Oferta } from "../../domain/entities/oferta";
import {
  validarCamposOpcionalesOferta,
  validarDescripcionOferta,
  validarTituloOferta,
} from "../../domain/value-objects/camposOferta";

/** Caso de uso: el cliente publica una oferta (POST /api/cliente/ofertas). */
export class CrearOfertaUseCase {
  constructor(private readonly ofertasRepository: OfertasRepositoryPort) {}

  async execute(token: string, datos: NuevaOferta): Promise<Oferta> {
    if (!token) throw new Error("Sesión expirada");

    const titulo = datos.titulo.trim();
    const descripcion = datos.descripcion.trim();
    validarTituloOferta(titulo);
    validarDescripcionOferta(descripcion);
    validarCamposOpcionalesOferta(datos);

    // Solo se envían los campos definidos: el backend rechaza campos desconocidos (.strict()).
    const payload: NuevaOferta = { titulo, descripcion };
    if (datos.presupuesto !== undefined) payload.presupuesto = datos.presupuesto;
    if (datos.plazoDias !== undefined) payload.plazoDias = datos.plazoDias;
    if (datos.categoriaId !== undefined) payload.categoriaId = datos.categoriaId;
    if (datos.imagenUrl !== undefined) payload.imagenUrl = datos.imagenUrl;
    if (datos.habilidadIds !== undefined) payload.habilidadIds = datos.habilidadIds;

    return this.ofertasRepository.crearOferta(token, payload);
  }
}