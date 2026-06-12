'use client';

interface PaginationProps {
  total: number;
  page: number;
  perPage: number;
  onChange: (page: number) => void;
}

export default function Pagination({ total, page, perPage, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  const from = (page - 1) * perPage + 1;
  const to   = Math.min(page * perPage, total);

  /* Build page number list with ellipsis */
  const pages: (number | '…')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 4)              pages.push('…');
    for (let i = Math.max(2, page - 2); i <= Math.min(totalPages - 1, page + 2); i++) pages.push(i);
    if (page < totalPages - 3) pages.push('…');
    pages.push(totalPages);
  }

  return (
    <div className="wr-pg">
      <span className="wr-pg-info">{from}–{to} of {total.toLocaleString()}</span>
      <div className="wr-pg-btns">
        <button
          className="wr-pg-btn"
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          aria-label="Previous page"
        >‹</button>
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ell-${i}`} className="wr-pg-ell">…</span>
          ) : (
            <button
              key={p}
              className={'wr-pg-btn' + (p === page ? ' on' : '')}
              onClick={() => onChange(p)}
            >{p}</button>
          )
        )}
        <button
          className="wr-pg-btn"
          disabled={page === totalPages}
          onClick={() => onChange(page + 1)}
          aria-label="Next page"
        >›</button>
      </div>
    </div>
  );
}
