import type { Rol } from "../../core/domain/entities/user";
import { dashboardPorRol } from "../../routes/rutasPorRol";

const RUTAS_INTERNAS = [
  "/notificaciones",
  "/contracts",
  "/chat",
  "/dashboard",
  "/talento",
  "/servicios",
  "/perfil",
  "/cuenta",
  "/crear",
];

function esRutaInternaSegura(valor: string): boolean {
  if (!valor.startsWith("/") || valor.startsWith("//")) return false;
  return RUTAS_INTERNAS.some(
    (ruta) => valor === ruta || valor.startsWith(`${ruta}/`) || valor.startsWith(`${ruta}?`),
  );
}

/**
 * El backend usa enlaces de API en algunos avisos y `/contratos/:id` para
 * contratos. Traducimos esos valores a rutas reales del frontend para evitar
 * que una notificación abra una pantalla 404.
 */
export function resolverEnlaceNotificacion(enlace: string | null | undefined, rol: Rol): string {
  const valor = enlace?.trim();
  if (!valor) return "/notificaciones";

  if (valor.startsWith("/contratos/")) {
    const id = valor.slice("/contratos/".length).split(/[/?#]/)[0];
    return id ? `/contracts/${id}` : "/contracts";
  }
  if (valor === "/contratos") return "/contracts";

  if (valor.startsWith("/api/moderador/")) {
    return rol === "administrador" || rol === "moderador"
      ? dashboardPorRol(rol)
      : "/notificaciones";
  }
  if (valor.startsWith("/api/freelancer/")) {
    return rol === "freelancer" ? dashboardPorRol(rol) : "/notificaciones";
  }

  if (esRutaInternaSegura(valor)) return valor;
  return "/notificaciones";
}

export function formatearFechaNotificacion(fecha: string): string {
  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return "";

  const diferencia = Date.now() - date.getTime();
  if (diferencia < 0) return "Ahora";

  const minutos = Math.floor(diferencia / 60_000);
  if (minutos < 1) return "Ahora";
  if (minutos < 60) return `Hace ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `Hace ${horas} h`;

  const dias = Math.floor(horas / 24);
  if (dias === 1) return "Ayer";
  if (dias < 7) return `Hace ${dias} días`;

  return date.toLocaleDateString("es", { day: "2-digit", month: "short" });
}

export function fechaCompletaNotificacion(fecha: string): string {
  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("es", { dateStyle: "long", timeStyle: "short" });
}
