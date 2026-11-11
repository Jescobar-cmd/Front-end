// URL pública por defecto. Evita que un build sin VITE_API_URL intente
// conectarse a localhost (Chrome muestra un permiso de red local en ese caso).
export const DEFAULT_API_URL = "https://backend-2n7n.onrender.com/api";

const LOCAL_URL =
  /^(https?:\/\/)?(localhost|127\.0\.0\.1|0\.0\.0\.0|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?(\/|$)/i;

const configuredUrl = import.meta.env.VITE_API_URL?.trim();

// En producción ignoramos una URL local aunque Vercel la tenga configurada:
// así el navegador nunca pide permiso para acceder a la red local.
const usableUrl =
  configuredUrl && (import.meta.env.DEV || !LOCAL_URL.test(configuredUrl))
    ? configuredUrl
    : DEFAULT_API_URL;

export const API_URL = usableUrl.replace(/\/+$/, "");
