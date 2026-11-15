import { createContext, useContext } from "react";
import type { ModeradorDashboard } from "../../infrastructure/api/apiModeracion";

export interface ModeracionPanelContextValue {
  dashboard: ModeradorDashboard | null;
  cargandoContadores: boolean;
  errorContadores: string;
  noLeidas: number;
  recargarContadores: () => Promise<void>;
  recargarNoLeidas: () => Promise<void>;
}

export const ModeracionPanelContext = createContext<ModeracionPanelContextValue | undefined>(
  undefined,
);

export function useModeracionPanel(): ModeracionPanelContextValue {
  const context = useContext(ModeracionPanelContext);
  if (!context) {
    throw new Error("useModeracionPanel debe usarse dentro de <ModeracionLayout>");
  }
  return context;
}
