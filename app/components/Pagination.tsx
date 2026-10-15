import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const previousPage = currentPage - 1;
  const nextPage = currentPage + 1;

  return (
    <nav
      className="rx-pagination"
      aria-label="Pagination"
    >
      {currentPage > 1 ? (
        <Link
          href={`${basePath}?page=${previousPage}`}
          className="rx-pagination-link"
        >
          Previous
        </Link>
      ) : (
        <span className="rx-pagination-link rx-pagination-disabled">
          Previous
        </span>
      )}

      <span className="rx-pagination-current">
        Page {currentPage} of {totalPages}
      </span>

      {currentPage < totalPages ? (
        <Link
          href={`${basePath}?page=${nextPage}`}
          className="rx-pagination-link"
        >
          Next
        </Link>
      ) : (
        <span className="rx-pagination-link rx-pagination-disabled">
          Next
        </span>
      )}
    </nav>
  );
}
