import type { Rol } from "../core/domain/entities/user";

const INICIO_POR_ROL: Record<Rol, string> = {
  administrador: "/dashboard/administrador",
  freelancer: "/dashboard/freelancer",
  cliente: "/dashboard/cliente",
  moderador: "/dashboard/moderador",
};

export const dashboardPorRol = (rol: Rol): string => INICIO_POR_ROL[rol];
