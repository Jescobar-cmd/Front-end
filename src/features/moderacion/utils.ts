import type { ApiError } from "../../infrastructure/api/client";

export function mensajeError(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Ocurrió un error inesperado. Inténtalo de nuevo.";
}

export function esApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as ApiError).status === "number"
  );
}

export function esSuspension(error: unknown): boolean {
  return (
    esApiError(error) &&
    error.status === 403 &&
    /suspendid/i.test(error.message ?? "")
  );
}

export function erroresPorCampo(error: unknown): Record<string, string> {
  if (!esApiError(error) || !Array.isArray(error.details)) return {};
  return error.details.reduce<Record<string, string>>((accumulator, detail) => {
    if (detail?.field) accumulator[detail.field] = detail.message;
    return accumulator;
  }, {});
}

const FORMATO_FECHA = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const FORMATO_FECHA_HORA = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatearFecha(valor: string | null | undefined): string {
  if (!valor) return "—";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "—";
  return FORMATO_FECHA.format(fecha);
}

export function formatearFechaHora(valor: string | null | undefined): string {
  if (!valor) return "—";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "—";
  return FORMATO_FECHA_HORA.format(fecha);
}

const FORMATO_MONEDA = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatearMoneda(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || Number.isNaN(Number(valor))) return "—";
  return FORMATO_MONEDA.format(Number(valor));
}

const FORMATO_NUMERO = new Intl.NumberFormat("es-CO");

export function formatearNumero(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || Number.isNaN(Number(valor))) return "—";
  return FORMATO_NUMERO.format(Number(valor));
}

const ETIQUETAS_ROL: Record<number, string> = {
  1: "Administrador",
  2: "Freelancer",
  3: "Cliente",
  4: "Moderador",
};

export function etiquetaRol(rolId: number | undefined): string {
  if (!rolId) return "Usuario";
  return ETIQUETAS_ROL[rolId] ?? "Usuario";
}

const ETIQUETAS_ROL_NOMBRE: Record<string, string> = {
  admin: "Administrador",
  administrador: "Administrador",
  freelancer: "Freelancer",
  cliente: "Cliente",
  moderador: "Moderador",
};

/** Etiqueta de rol cuando el backend devuelve el nombre en lugar del id. */
export function etiquetaRolDesdeNombre(
  rol: string | undefined,
  rolId?: number,
): string {
  if (rol) {
    return ETIQUETAS_ROL_NOMBRE[rol.toLowerCase()] ?? rol;
  }
  return etiquetaRol(rolId);
}

export const ETIQUETAS_ESTADO: Record<string, string> = {
  activo: "Activo",
  inactivo: "Inactivo",
  suspendido: "Suspendido",
  abierto: "Abierto",
  en_progreso: "En progreso",
  pausado: "Pausado",
  eliminado: "Eliminado",
  pendiente: "Pendiente",
  resuelto: "Resuelto",
  rechazado: "Rechazado",
  abierta: "Abierta",
  en_revision: "En revisión",
  resuelta: "Resuelta",
  rechazada: "Rechazada",
  solicitada: "Solicitada",
  pagada: "Pagada",
  pendiente_pago: "Pendiente de pago",
  completado: "Completado",
  cancelado: "Cancelado",
  retenido: "Retenido",
  liberado: "Liberado",
  reembolsado: "Reembolsado",
};

export function etiquetaEstado(estado: string | null | undefined): string {
  if (!estado) return "—";
  return ETIQUETAS_ESTADO[estado] ?? estado.replace(/_/g, " ");
}

export function iniciales(nombre: string | null | undefined): string {
  const limpio = (nombre ?? "").trim();
  if (!limpio) return "?";
  const palabras = limpio.split(/\s+/).slice(0, 2);
  return palabras.map((palabra) => palabra.charAt(0).toLocaleUpperCase()).join("");
}

export function truncar(texto: string | null | undefined, maximo = 90): string {
  if (!texto) return "—";
  if (texto.length <= maximo) return texto;
  return `${texto.slice(0, maximo - 1).trimEnd()}…`;
}
