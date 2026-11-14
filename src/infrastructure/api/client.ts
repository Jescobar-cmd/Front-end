// Cliente HTTP central de la app First Gig.
// - Añade `Authorization: Bearer <token>` en cada request.
// - Ante un 401 autenticado limpia la sesión, avisa y redirige a /login.
// - Expone errores tipados (`ApiError`) con status, tipo y detalles (422).
// - No usa localhost ni direcciones privadas: la URL base vive en config.ts.

import { API_URL } from "./config";

export type ApiErrorKind =
  | "network"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "validation"
  | "server"
  | "unknown";

export interface ApiError extends Error {
  status: number;
  kind: ApiErrorKind;
  error?: string;
  details?: Array<{ field: string; message: string }>;
}

export interface RespuestaApi<T> {
  status: number;
  data: T;
}

interface CuerpoError {
  error?: string;
  message?: string;
  details?: Array<{ field: string; message: string }>;
}

type DatosRespuesta<T> = T & Partial<CuerpoError>;

const TOKEN_KEY = "first_gig_sesion";
export const SESSION_EXPIRED_KEY = "fg_session_expired";

type MetodoHttp = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface OpcionesFetch {
  method: MetodoHttp;
  path: string;
  token?: string;
  body?: unknown;
  mensajeError?: string;
}

function tipoDeError(status: number): ApiErrorKind {
  if (status === 0) return "network";
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 422) return "validation";
  if (status >= 500) return "server";
  return "unknown";
}

function mensajePorStatus(status: number, fallback?: string): string {
  if (status === 401) return fallback ?? "Tu sesión expiró. Vuelve a iniciar sesión.";
  if (status === 403) return fallback ?? "No tienes permisos para realizar esta acción.";
  if (status === 404) return fallback ?? "El recurso solicitado no existe.";
  if (status >= 500) return fallback ?? "Ocurrió un error en el servidor. Inténtalo de nuevo.";
  return fallback ?? "No se pudo completar la solicitud.";
}

function crearApiError(
  status: number,
  message: string,
  extras?: Pick<ApiError, "error" | "details">,
): ApiError {
  const error = new Error(message) as ApiError;
  error.name = "ApiError";
  error.status = status;
  error.kind = tipoDeError(status);
  error.error = extras?.error;
  error.details = extras?.details;
  return error;
}

function limpiarSesionYRedirigir() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.setItem(SESSION_EXPIRED_KEY, "1");
  } catch {
    // El almacenamiento puede estar bloqueado por el navegador.
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("fg:session-expired"));
    if (window.location.pathname !== "/login") {
      window.location.replace("/login");
    }
  }
}

export async function apiFetch<T>(o: OpcionesFetch): Promise<RespuestaApi<T>> {
  const esFormData = o.body instanceof FormData;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${o.path}`, {
      method: o.method,
      headers: {
        Accept: "application/json",
        ...(o.body !== undefined && !esFormData ? { "Content-Type": "application/json" } : {}),
        ...(o.token ? { Authorization: `Bearer ${o.token}` } : {}),
      },
      body:
        o.body === undefined
          ? undefined
          : esFormData
            ? (o.body as FormData)
            : JSON.stringify(o.body),
    });
  } catch {
    throw crearApiError(
      0,
      "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.",
    );
  }

  const texto = await res.text();
  let data: DatosRespuesta<T> = {} as DatosRespuesta<T>;
  let jsonValido = true;

  if (texto) {
    try {
      data = JSON.parse(texto) as DatosRespuesta<T>;
    } catch {
      jsonValido = false;
    }
  }

  if (!res.ok) {
    const mensaje =
      (jsonValido && (data.error ?? data.message)) ||
      mensajePorStatus(res.status, o.mensajeError);

    const error = crearApiError(res.status, mensaje, {
      ...(jsonValido && data.error ? { error: data.error } : {}),
      ...(jsonValido && data.details ? { details: data.details } : {}),
    });

    // Solo cerramos sesión si el request iba autenticado: un 401 del login
    // (credenciales incorrectas) debe mostrar el error, no recargar la página.
    if (res.status === 401 && o.token) {
      limpiarSesionYRedirigir();
    }

    throw error;
  }

  if (!jsonValido) {
    throw crearApiError(
      res.status,
      o.mensajeError ?? "El servidor respondió con un formato inesperado.",
    );
  }

  return { status: res.status, data: data as T };
}
