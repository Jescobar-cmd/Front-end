import type { Rol } from "../core/domain/entities/user";

export const dashboardPorRol = (rol: Rol): string =>
  rol === "freelancer" ? "/dashboard/freelancer" : "/dashboard/cliente";
