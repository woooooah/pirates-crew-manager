type PaginationProps = {
    page: number;
    total: number;
    pageSize: number;
    onChange: (page: number) => void;
};

function Pagination({ page, total, pageSize, onChange }: PaginationProps) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return (
        <div className="d-flex justify-content-center align-items-center gap-3 mb-5">
            <button
                className="addButton"
                disabled={page <= 1}
                onClick={() => onChange(page - 1)}>
                ← Prev
            </button>
            <span>
                Page {page} of {totalPages} · {total} total
            </span>
            <button
                className="addButton"
                disabled={page >= totalPages}
                onClick={() => onChange(page + 1)}>
                Next →
            </button>
        </div>
    );
}

export default Pagination;
