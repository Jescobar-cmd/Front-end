import type { ReactNode } from "react";
import { Button } from "../../../components/ui/Button";

interface ListToolbarProps {
  children: ReactNode;
  summary?: ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
  actions?: ReactNode;
}

export function ListToolbar({
  children,
  summary,
  onRefresh,
  refreshing = false,
  actions,
}: ListToolbarProps) {
  return (
    <div className="mod-toolbar">
      <div className="mod-toolbar__filters">{children}</div>
      <div className="mod-toolbar__actions">
        {actions}
        {onRefresh ? (
          <Button variant="ghost" size="sm" onClick={onRefresh} disabled={refreshing}>
            {refreshing ? "Actualizando…" : "Actualizar"}
          </Button>
        ) : null}
      </div>
      {summary ? (
        <p className="mod-toolbar__summary" aria-live="polite">
          {summary}
        </p>
      ) : null}
    </div>
  );
}
