import type { OfertasRepositoryPort } from "../../core/application/ports/OfertasRepositoryPort";
import type { Categoria } from "../../core/domain/entities/categoria";
import type {
  DatosOferta,
  EstadoOferta,
  FiltrosOferta,
  NuevaOferta,
  Oferta,
  OfertaPaginada,
} from "../../core/domain/entities/oferta";
import { getCategories } from "./apiCatalogos";
import {
  changeOfferStatus,
  createOffer,
  getMyOffer,
  getMyOffers,
  updateOffer,
} from "./apiOfertas";

/** Adaptador HTTP del puerto de ofertas. Delega en `apiOfertas` y `apiCatalogos`. */
export class HttpOfertasRepository implements OfertasRepositoryPort {
  async listarCategorias(token: string): Promise<Categoria[]> {
    return getCategories(token);
  }

  async listarMisOfertas(token: string, filtros: FiltrosOferta): Promise<OfertaPaginada> {
    return getMyOffers(token, filtros);
  }

  async obtenerOferta(token: string, id: number): Promise<Oferta> {
    return getMyOffer(token, id);
  }

  async crearOferta(token: string, datos: NuevaOferta): Promise<Oferta> {
    const respuesta = await createOffer(token, datos);
    return respuesta.oferta;
  }

  async actualizarOferta(token: string, id: number, datos: DatosOferta): Promise<Oferta> {
    const respuesta = await updateOffer(token, id, datos);
    return respuesta.oferta;
  }

  async cambiarEstadoOferta(token: string, id: number, estado: EstadoOferta): Promise<Oferta> {
    const respuesta = await changeOfferStatus(token, id, estado);
    return respuesta.oferta;
  }
}
