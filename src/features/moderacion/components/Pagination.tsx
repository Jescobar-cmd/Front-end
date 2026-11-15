import { formatearNumero } from "../utils";

interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, total, limit, onChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (total === 0) return null;

  return (
    <nav className="mod-pager" aria-label="Paginación de resultados">
      <span className="mod-pager__summary">
        {formatearNumero(total)} {total === 1 ? "resultado" : "resultados"} · Página{" "}
        {formatearNumero(page)} de {formatearNumero(totalPages)}
      </span>
      <div className="mod-pager__controls">
        <button
          type="button"
          className="mod-pager__button"
          disabled={page <= 1}
          onClick={() => onChange(Math.max(1, page - 1))}
        >
          <span aria-hidden="true">←</span> Anterior
        </button>
        <button
          type="button"
          className="mod-pager__button"
          disabled={page >= totalPages}
          onClick={() => onChange(Math.min(totalPages, page + 1))}
        >
          Siguiente <span aria-hidden="true">→</span>
        </button>
      </div>
    </nav>
  );
}
