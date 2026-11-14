// URL pública por defecto. Evita que un build sin VITE_API_URL intente
// conectarse a localhost (Chrome muestra un permiso de red local en ese caso).
export const DEFAULT_API_URL = "https://backend-2n7n.onrender.com/api";

const configuredUrl = import.meta.env.VITE_API_URL?.trim();

function esIpV4Privada(hostname: string): boolean {
  const octets = hostname.split(".").map(Number);
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return false;
  }

  const [first, second] = octets;
  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 198 && (second === 18 || second === 19))
  );
}

function esUrlLocal(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace(/^\[|\]$/g, "");
    if (
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      hostname.endsWith(".lan") ||
      hostname === "home.arpa" ||
      hostname === "::1"
    ) {
      return true;
    }

    if (hostname.includes(":")) {
      if (/^(fc|fd|fe[89ab])/i.test(hostname)) return true;
      const mappedIpv4 = hostname.match(/::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i);
      return mappedIpv4 ? esIpV4Privada(mappedIpv4[1]) : false;
    }

    return esIpV4Privada(hostname);
  } catch {
    return true;
  }
}

// Nunca permitimos que el navegador envíe solicitudes a hosts locales o privados.
const usableUrl =
  configuredUrl && !esUrlLocal(configuredUrl)
    ? configuredUrl
    : DEFAULT_API_URL;

export const API_URL = usableUrl.replace(/\/+$/, "");
