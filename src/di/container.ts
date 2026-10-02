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

const authRepository = new HttpAuthRepository();

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
