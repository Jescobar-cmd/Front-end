import { apiFetch } from "./client";

export interface DatosReporte {
  usuarioReportadoId?: number;
  proyectoId?: number;
  motivo: string;
  descripcion?: string;
}

/**
 * Módulo de API — Reportes de usuario.
 * Backend: POST /api/reportes
 * El moderador los gestiona en /api/moderador/reportes.
 */

export async function crearReporte(token: string, datos: DatosReporte): Promise<void> {
  await apiFetch({
    method: "POST",
    path: "/reportes",
    token,
    body: datos,
    mensajeError: "No se pudo enviar el reporte",
  });
}
