// Cliente HTTP central de la app First Gig.
// - Añade `Authorization: Bearer <token>` en cada request.
// - Ante un 401 borra el token guardado y redirige a /login.
// - Expone errores tipados (`ApiError`) con status y detalles de validación (422).

export interface ApiError extends Error {
  status: number;
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

const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:4000/api").replace(/\/+$/, "");
const TOKEN_KEY = "first_gig_sesion";

interface OpcionesFetch {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  token?: string;
  body?: unknown;
  mensajeError?: string;
}

export async function apiFetch<T>(o: OpcionesFetch): Promise<RespuestaApi<T>> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${o.path}`, {
      method: o.method,
      headers: {
        "Content-Type": "application/json",
        ...(o.token ? { Authorization: `Bearer ${o.token}` } : {}),
      },
      body: o.body === undefined ? undefined : JSON.stringify(o.body),
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor. Verifica que el backend esté encendido.");
  }

  const texto = await res.text();
  let data: DatosRespuesta<T>;
  try {
    data = (texto ? JSON.parse(texto) : {}) as DatosRespuesta<T>;
  } catch {
    throw new Error(o.mensajeError ?? "El servidor respondió con un formato inesperado.");
  }

  if (!res.ok) {
    const error = new Error(data.error ?? data.message ?? o.mensajeError ?? "No se pudo completar la solicitud.") as ApiError;
    error.status = res.status;
    error.details = data.details;
    if (res.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (typeof window !== "undefined") {
        window.location.replace("/login");
      }
    }
    throw error;
  }

  return { status: res.status, data: data as T };
}
