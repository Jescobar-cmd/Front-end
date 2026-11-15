import type { ReactNode } from "react";
import { useId } from "react";
import { Button } from "../../../components/ui/Button";
import { EmptyState } from "../../../components/ui/EmptyState";

export interface ColumnaTabla<T> {
  key: string;
  header: string;
  render: (fila: T) => ReactNode;
  align?: "left" | "center" | "right";
  width?: string;
}

interface DataTableProps<T> {
  caption: string;
  columns: Array<ColumnaTabla<T>>;
  rows: T[];
  rowKey: (fila: T) => string | number;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  emptyTitle: string;
  emptyDescription: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
}

export function DataTable<T>({
  caption,
  columns,
  rows,
  rowKey,
  loading = false,
  error = "",
  onRetry,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
}: DataTableProps<T>) {
  const captionId = useId();

  return (
    <div className="mod-table-wrap" aria-busy={loading || undefined}>
      <table className="mod-table" aria-labelledby={captionId}>
        <caption id={captionId} className="mod-sr-only">
          {caption}
        </caption>
        <thead>
          <tr>
            {columns.map((columna) => (
              <th
                key={columna.key}
                scope="col"
                style={columna.width ? { width: columna.width } : undefined}
                className={columna.align ? `is-${columna.align}` : undefined}
              >
                {columna.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 5 }, (_, fila) => (
                <tr key={`skeleton-${fila}`} aria-hidden="true">
                  {columns.map((columna) => (
                    <td key={columna.key} data-label={columna.header}>
                      <span className="mod-skeleton mod-skeleton--line" />
                    </td>
                  ))}
                </tr>
              ))
            : null}

          {!loading && error ? (
            <tr>
              <td colSpan={columns.length}>
                <div className="mod-alert mod-alert--error" role="alert">
                  <span>{error}</span>
                  {onRetry ? (
                    <Button variant="secondary" size="sm" onClick={onRetry}>
                      Reintentar
                    </Button>
                  ) : null}
                </div>
              </td>
            </tr>
          ) : null}

          {!loading && !error && rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState
                  title={emptyTitle}
                  description={emptyDescription}
                  actionLabel={emptyActionLabel}
                  onAction={onEmptyAction}
                />
              </td>
            </tr>
          ) : null}

          {!loading && !error
            ? rows.map((fila) => (
                <tr key={rowKey(fila)}>
                  {columns.map((columna) => (
                    <td
                      key={columna.key}
                      data-label={columna.header}
                      className={columna.align ? `is-${columna.align}` : undefined}
                    >
                      {columna.render(fila)}
                    </td>
                  ))}
                </tr>
              ))
            : null}
        </tbody>
      </table>
    </div>
  );
}
