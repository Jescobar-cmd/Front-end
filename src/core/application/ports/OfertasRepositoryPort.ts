import type { Categoria } from "../../domain/entities/categoria";
import type { FiltrosOferta, OfertaPaginada } from "../../domain/entities/oferta";

export interface OfertasRepositoryPort {
  listarCategorias(token: string): Promise<Categoria[]>;
  listarMisOfertas(token: string, filtros: FiltrosOferta): Promise<OfertaPaginada>;
}
