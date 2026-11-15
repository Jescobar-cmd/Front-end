import type { Rol } from "../core/domain/entities/user";

const INICIO_POR_ROL: Record<Rol, string> = {
  administrador: "/dashboard/administrador",
  freelancer: "/dashboard/freelancer",
  cliente: "/dashboard/cliente",
  moderador: "/moderacion",
};

export const dashboardPorRol = (rol: Rol): string => INICIO_POR_ROL[rol];

const PANEL_POR_ROL: Partial<Record<Rol, string>> = {
  freelancer: "/dashboard/freelancer/panel",
  cliente: "/dashboard/cliente/panel",
};

export const panelPorRol = (rol: Rol): string | undefined => PANEL_POR_ROL[rol];
