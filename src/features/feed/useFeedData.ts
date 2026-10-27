import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { obtenerPerfilUseCase } from "../../di/container";
import type { User } from "../../core/domain/entities/user";
import {
  ofertaAPieza,
  obtenerProyectosParaFreelancer,
  obtenerTalentoParaExplorar,
} from "./datosFeed";
import type { TipoCuentaFeed } from "./datosFeed";
import { useCategorias, useMisOfertas } from "./hooks/useOfertas";
import type { EstadoLista } from "./hooks/useOfertas";

function aMensajeError(error: unknown): string {
  return error instanceof Error ? error.message : "No se pudo cargar la información.";
}

export function useFeedData(tipoEsperado: TipoCuentaFeed) {
  const { user: usuarioSesion, token } = useAuth();
  const [indicePerfil, setIndicePerfil] = useState(0);
  const [estadoPerfil, setEstadoPerfil] = useState<EstadoLista<User>>({ estado: "cargando" });

  useEffect(() => {
    if (!token) {
      setEstadoPerfil({ estado: "error", mensaje: "Sesión no disponible." });
      return;
    }

    let activo = true;
    setEstadoPerfil({ estado: "cargando" });

    obtenerPerfilUseCase
      .execute(token)
      .then((sesion) => {
        if (activo) setEstadoPerfil({ estado: "listo", datos: sesion.user });
      })
      .catch((error: unknown) => {
        if (activo) setEstadoPerfil({ estado: "error", mensaje: aMensajeError(error) });
      });

    return () => {
      activo = false;
    };
  }, [token, indicePerfil]);

  const usuarioActual = estadoPerfil.estado === "listo" ? estadoPerfil.datos : usuarioSesion;
  const tipoCuenta = usuarioActual?.rol ?? tipoEsperado;
  const { categorias, estado: estadoCategorias, error: errorCategorias, recargar: recargarCategorias } =
    useCategorias(token);
  const {
    ofertas,
    estado: estadoMisOfertas,
    error: errorMisOfertas,
    recargar: recargarMisOfertas,
  } = useMisOfertas(tipoCuenta === "cliente" ? token : undefined);

  const proyectosParaTi = useMemo(
    () => (tipoCuenta === "freelancer" ? obtenerProyectosParaFreelancer() : obtenerTalentoParaExplorar()),
    [tipoCuenta],
  );
  const misProyectos = useMemo(
    () => (tipoCuenta === "cliente" && ofertas ? ofertas.items.map(ofertaAPieza) : []),
    [tipoCuenta, ofertas],
  );

  return {
    usuario: { nombre: usuarioActual?.nombre, tipoCuenta },
    errorUsuario: estadoPerfil.estado === "error" ? estadoPerfil.mensaje : null,
    recargarUsuario: () => setIndicePerfil((indice) => indice + 1),
    categorias,
    estadoCategorias,
    errorCategorias,
    recargarCategorias,
    proyectosParaTi,
    misProyectos,
    estadoMisOfertas,
    errorMisOfertas,
    recargarMisOfertas,
  };
}

export type FeedData = ReturnType<typeof useFeedData>;
