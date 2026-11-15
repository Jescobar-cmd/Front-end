import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";
import { getConversations } from "../../infrastructure/api/apiChat";
import {
  listarNotificaciones,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,
} from "../../infrastructure/api/apiNotificaciones";
import type { Notificacion } from "../../infrastructure/api/apiNotificaciones";

const POLL_INTERVAL_MS = 45_000;

interface NotificationsContextValue {
  notificaciones: Notificacion[];
  noLeidas: number;
  total: number;
  mensajesNoLeidos: number;
  cargando: boolean;
  refrescando: boolean;
  error: string;
  refrescar: () => Promise<void>;
  marcarLeida: (id: number) => Promise<void>;
  marcarTodasLeidas: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

function mensajeDeError(reason: unknown, fallback: string): string {
  return reason instanceof Error ? reason.message : fallback;
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();
  const rol = user?.rol;

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [total, setTotal] = useState(0);
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState("");
  const solicitudRef = useRef(0);

  const cargar = useCallback(
    async (silencioso: boolean) => {
      if (!token || !rol) {
        solicitudRef.current += 1;
        setNotificaciones([]);
        setNoLeidas(0);
        setTotal(0);
        setMensajesNoLeidos(0);
        setCargando(false);
        setRefrescando(false);
        setError("");
        return;
      }

      const solicitud = ++solicitudRef.current;
      if (!silencioso) setCargando(true);
      setRefrescando(true);

      const [resultadoNotificaciones, resultadoConversaciones] = await Promise.allSettled([
        listarNotificaciones(token, rol, { page: 1, limit: 20 }),
        getConversations(token),
      ]);

      if (solicitud !== solicitudRef.current) return;

      if (resultadoNotificaciones.status === "fulfilled") {
        setNotificaciones(resultadoNotificaciones.value.items);
        setNoLeidas(resultadoNotificaciones.value.noLeidas);
        setTotal(resultadoNotificaciones.value.total);
        setError("");
      } else {
        setError(
          mensajeDeError(
            resultadoNotificaciones.reason,
            "No se pudieron cargar las notificaciones.",
          ),
        );
      }

      if (resultadoConversaciones.status === "fulfilled") {
        const conversaciones = resultadoConversaciones.value.conversaciones ?? [];
        setMensajesNoLeidos(
          conversaciones.reduce(
            (suma, conversacion) => suma + (conversacion.noLeidos ?? 0),
            0,
          ),
        );
      }

      setCargando(false);
      setRefrescando(false);
    },
    [rol, token],
  );

  useEffect(() => {
    if (!token || !rol) {
      solicitudRef.current += 1;
      setNotificaciones([]);
      setNoLeidas(0);
      setTotal(0);
      setMensajesNoLeidos(0);
      setCargando(false);
      setRefrescando(false);
      setError("");
      return;
    }

    void cargar(false);

    const actualizarSiVisible = () => {
      if (document.visibilityState === "visible") void cargar(true);
    };
    const intervalo = window.setInterval(actualizarSiVisible, POLL_INTERVAL_MS);
    window.addEventListener("focus", actualizarSiVisible);

    return () => {
      window.clearInterval(intervalo);
      window.removeEventListener("focus", actualizarSiVisible);
    };
  }, [cargar, rol, token]);

  const refrescar = useCallback(async () => {
    await cargar(true);
  }, [cargar]);

  const marcarLeida = useCallback(
    async (id: number) => {
      if (!token || !rol) return;

      const notificacion = notificaciones.find((item) => item.id === id);
      if (!notificacion || notificacion.leida) return;

      setNotificaciones((actuales) =>
        actuales.map((item) => (item.id === id ? { ...item, leida: true } : item)),
      );
      setNoLeidas((actuales) => Math.max(0, actuales - 1));

      try {
        await marcarNotificacionLeida(token, rol, id);
        setError("");
      } catch (reason) {
        setNotificaciones((actuales) =>
          actuales.map((item) => (item.id === id ? notificacion : item)),
        );
        setNoLeidas((actuales) => actuales + 1);
        setError(mensajeDeError(reason, "No se pudo marcar la notificación como leída."));
      }
    },
    [notificaciones, rol, token],
  );

  const marcarTodasLeidas = useCallback(async () => {
    if (!token || !rol) return;

    const anteriores = notificaciones;
    const noLeidasAnteriores = noLeidas;
    setNotificaciones((actuales) => actuales.map((item) => ({ ...item, leida: true })));
    setNoLeidas(0);
    setError("");

    try {
      await marcarTodasNotificacionesLeidas(token, rol);
    } catch (reason) {
      setNotificaciones(anteriores);
      setNoLeidas(noLeidasAnteriores);
      setError(mensajeDeError(reason, "No se pudieron marcar las notificaciones como leídas."));
    }
  }, [noLeidas, notificaciones, rol, token]);

  const value = useMemo(
    () => ({
      notificaciones,
      noLeidas,
      total,
      mensajesNoLeidos,
      cargando,
      refrescando,
      error,
      refrescar,
      marcarLeida,
      marcarTodasLeidas,
    }),
    [
      cargando,
      error,
      marcarLeida,
      marcarTodasLeidas,
      mensajesNoLeidos,
      noLeidas,
      notificaciones,
      refrescar,
      total,
    ],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotificaciones(): NotificationsContextValue {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotificaciones debe usarse dentro de <NotificationsProvider>");
  }
  return context;
}
