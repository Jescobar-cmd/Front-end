import { apiFetch } from "./client";

export interface ModeradorDashboard {
  reportesPendientes: number;
  disputasAbiertas: number;
  retirosPendientes: number;
}

export const moderacionApi = {
  async obtenerDashboard(token: string): Promise<ModeradorDashboard> {
    const { data } = await apiFetch<ModeradorDashboard>({
      method: "GET",
      path: "/moderador/dashboard",
      token,
      mensajeError: "No se pudo cargar el panel de moderación",
    });
    return data;
  },
};
