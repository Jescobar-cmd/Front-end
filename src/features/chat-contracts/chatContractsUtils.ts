import type { ApiError } from "../../infrastructure/api/client";

export function errorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) return fallback;

  const status = (error as ApiError).status;
  const explanations: Record<number, string> = {
    401: "Tu sesión ya no es válida. Inicia sesión de nuevo.",
    403: "No tienes permiso para realizar esta acción.",
    404: "No se encontró el recurso solicitado.",
    409: "El estado cambió o existe un conflicto. Actualiza la información e inténtalo de nuevo.",
    422: "Revisa los datos ingresados.",
  };
  const explanation = status ? explanations[status] : undefined;

  if (explanation && error.message && !error.message.includes(explanation)) {
    return `${explanation} ${error.message}`;
  }
  return error.message || explanation || fallback;
}

export function formatDate(value?: string): string {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function normalizedState(value: string): string {
  return value.trim().toLocaleLowerCase("es");
}

export function isPending(value: string): boolean {
  return ["pendiente", "pending"].includes(normalizedState(value));
}

export function isActive(value: string): boolean {
  return ["activo", "active"].includes(normalizedState(value));
}

export function isCompleted(value: string): boolean {
  return ["completado", "completed"].includes(normalizedState(value));
}

export function isCancelled(value: string): boolean {
  return ["cancelado", "cancelada", "cancelled", "canceled"].includes(normalizedState(value));
}

export function statusLabel(value: string): string {
  const normalized = normalizedState(value);
  const labels: Record<string, string> = {
    activo: "Activo",
    active: "Activo",
    completado: "Completado",
    completed: "Completado",
    cancelado: "Cancelado",
    cancelada: "Cancelado",
    cancelled: "Cancelado",
    canceled: "Cancelado",
    pendiente: "Pendiente",
    pending: "Pendiente",
    aceptada: "Aceptada",
    accepted: "Aceptada",
    rechazada: "Rechazada",
    rejected: "Rechazada",
  };
  return labels[normalized] ?? value;
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("es", { style: "currency", currency: "USD" }).format(amount);
}
