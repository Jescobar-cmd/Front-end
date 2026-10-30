import type { Categoria } from "../../domain/entities/categoria";
import type {
  DatosOferta,
  EstadoOferta,
  FiltrosOferta,
  NuevaOferta,
  Oferta,
  OfertaPaginada,
} from "../../domain/entities/oferta";

export interface OfertasRepositoryPort {
  listarCategorias(token: string): Promise<Categoria[]>;
  listarMisOfertas(token: string, filtros: FiltrosOferta): Promise<OfertaPaginada>;
  obtenerOferta(token: string, id: number): Promise<Oferta>;
  crearOferta(token: string, datos: NuevaOferta): Promise<Oferta>;
  actualizarOferta(token: string, id: number, datos: DatosOferta): Promise<Oferta>;
  cambiarEstadoOferta(token: string, id: number, estado: EstadoOferta): Promise<Oferta>;
}