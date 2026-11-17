import { HttpAuthRepository } from "../infrastructure/api/HttpAuthRepository";
import { RegistroUseCase } from "../core/application/use-cases/RegistroUseCase";
import { LoginUseCase } from "../core/application/use-cases/LoginUseCase";
import { LoginConGoogleUseCase } from "../core/application/use-cases/LoginConGoogleUseCase";
import { SolicitarRecuperacionUseCase } from "../core/application/use-cases/SolicitarRecuperacionUseCase";
import { RestablecerPasswordUseCase } from "../core/application/use-cases/RestablecerPasswordUseCase";
import { VerificarCuentaUseCase } from "../core/application/use-cases/VerificarCuentaUseCase";
import { CompletarPerfilGoogleUseCase } from "../core/application/use-cases/CompletarPerfilGoogleUseCase";
import { CambiarPasswordUseCase } from "../core/application/use-cases/CambiarPasswordUseCase";
import { ReenviarCodigoUseCase } from "../core/application/use-cases/ReenviarCodigoUseCase";
import { ObtenerPerfilUseCase } from "../core/application/use-cases/ObtenerPerfilUseCase";
import { ListarCategoriasUseCase } from "../core/application/use-cases/ListarCategoriasUseCase";
import { ListarMisOfertasUseCase } from "../core/application/use-cases/ListarMisOfertasUseCase";
import { CrearOfertaUseCase } from "../core/application/use-cases/CrearOfertaUseCase";
import { ObtenerOfertaUseCase } from "../core/application/use-cases/ObtenerOfertaUseCase";
import { ActualizarOfertaUseCase } from "../core/application/use-cases/ActualizarOfertaUseCase";
import { CambiarEstadoOfertaUseCase } from "../core/application/use-cases/CambiarEstadoOfertaUseCase";
import { ObtenerMiPerfilUseCase } from "../core/application/use-cases/ObtenerMiPerfilUseCase";
import { ActualizarMiPerfilUseCase } from "../core/application/use-cases/ActualizarMiPerfilUseCase";
import { ObtenerMiPerfilFreelancerUseCase } from "../core/application/use-cases/ObtenerMiPerfilFreelancerUseCase";
import { ActualizarMiPerfilFreelancerUseCase } from "../core/application/use-cases/ActualizarMiPerfilFreelancerUseCase";
import { ObtenerPerfilPublicoUseCase } from "../core/application/use-cases/ObtenerPerfilPublicoUseCase";
import { HttpOfertasRepository } from "../infrastructure/api/HttpOfertasRepository";
import { HttpPerfilRepository } from "../infrastructure/api/HttpPerfilRepository";

import type { AuthRepositoryPort } from "../core/application/ports/AuthRepositoryPort";
import type { OfertasRepositoryPort } from "../core/application/ports/OfertasRepositoryPort";
import type { PerfilRepositoryPort } from "../core/application/ports/PerfilRepositoryPort";

const authRepository = new HttpAuthRepository();
const ofertasRepository = new HttpOfertasRepository();
const perfilRepository = new HttpPerfilRepository();

export { authRepository };
export const registroUseCase = new RegistroUseCase(authRepository);
export const loginUseCase = new LoginUseCase(authRepository);
export const loginConGoogleUseCase = new LoginConGoogleUseCase(authRepository);
export const solicitarRecuperacionUseCase = new SolicitarRecuperacionUseCase(authRepository);
export const restablecerPasswordUseCase = new RestablecerPasswordUseCase(authRepository);
export const verificarCuentaUseCase = new VerificarCuentaUseCase(authRepository);
export const completarPerfilGoogleUseCase = new CompletarPerfilGoogleUseCase(authRepository);
export const cambiarPasswordUseCase = new CambiarPasswordUseCase(authRepository);
export const reenviarCodigoUseCase = new ReenviarCodigoUseCase(authRepository);
export const obtenerPerfilUseCase = new ObtenerPerfilUseCase(authRepository);

export const listarCategoriasUseCase = new ListarCategoriasUseCase(ofertasRepository);
export const listarMisOfertasUseCase = new ListarMisOfertasUseCase(ofertasRepository);
export const crearOfertaUseCase = new CrearOfertaUseCase(ofertasRepository);
export const obtenerOfertaUseCase = new ObtenerOfertaUseCase(ofertasRepository);
export const actualizarOfertaUseCase = new ActualizarOfertaUseCase(ofertasRepository);
export const cambiarEstadoOfertaUseCase = new CambiarEstadoOfertaUseCase(ofertasRepository);

export const obtenerMiPerfilUseCase = new ObtenerMiPerfilUseCase(perfilRepository);
export const actualizarMiPerfilUseCase = new ActualizarMiPerfilUseCase(perfilRepository);
export const obtenerMiPerfilFreelancerUseCase = new ObtenerMiPerfilFreelancerUseCase(perfilRepository);
export const actualizarMiPerfilFreelancerUseCase = new ActualizarMiPerfilFreelancerUseCase(perfilRepository);
export const obtenerPerfilPublicoUseCase = new ObtenerPerfilPublicoUseCase(perfilRepository);

/**
 * Factory para inyección de dependencias. Permite sustituir los repositorios
 * por mocks o implementaciones alternativas sin tocar los use-cases.
 * Mantiene las exportaciones globales por defecto para no romper código existente.
 */
export function createContainer(
  authRepo?: AuthRepositoryPort,
  ofertasRepo?: OfertasRepositoryPort,
  perfilRepo?: PerfilRepositoryPort,
) {
  const a = authRepo ?? authRepository;
  const o = ofertasRepo ?? ofertasRepository;
  const p = perfilRepo ?? perfilRepository;

  return {
    authRepository: a,
    ofertasRepository: o,
    perfilRepository: p,
    registroUseCase: new RegistroUseCase(a),
    loginUseCase: new LoginUseCase(a),
    loginConGoogleUseCase: new LoginConGoogleUseCase(a),
    solicitarRecuperacionUseCase: new SolicitarRecuperacionUseCase(a),
    restablecerPasswordUseCase: new RestablecerPasswordUseCase(a),
    verificarCuentaUseCase: new VerificarCuentaUseCase(a),
    completarPerfilGoogleUseCase: new CompletarPerfilGoogleUseCase(a),
    cambiarPasswordUseCase: new CambiarPasswordUseCase(a),
    reenviarCodigoUseCase: new ReenviarCodigoUseCase(a),
    obtenerPerfilUseCase: new ObtenerPerfilUseCase(a),
    listarCategoriasUseCase: new ListarCategoriasUseCase(o),
    listarMisOfertasUseCase: new ListarMisOfertasUseCase(o),
    crearOfertaUseCase: new CrearOfertaUseCase(o),
    obtenerOfertaUseCase: new ObtenerOfertaUseCase(o),
    actualizarOfertaUseCase: new ActualizarOfertaUseCase(o),
    cambiarEstadoOfertaUseCase: new CambiarEstadoOfertaUseCase(o),
    obtenerMiPerfilUseCase: new ObtenerMiPerfilUseCase(p),
    actualizarMiPerfilUseCase: new ActualizarMiPerfilUseCase(p),
    obtenerMiPerfilFreelancerUseCase: new ObtenerMiPerfilFreelancerUseCase(p),
    actualizarMiPerfilFreelancerUseCase: new ActualizarMiPerfilFreelancerUseCase(p),
    obtenerPerfilPublicoUseCase: new ObtenerPerfilPublicoUseCase(p),
  };
}