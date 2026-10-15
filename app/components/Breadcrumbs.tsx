import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({
  items,
  className = "",
}: BreadcrumbsProps) {
  if (!items.length) {
    return null;
  }

  return (
    <nav
      className={`rx-breadcrumbs ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="rx-breadcrumbs-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={`${item.label}-${index}`}
              className={`rx-breadcrumbs-item ${
                isLast ? "is-current" : ""
              }`}
            >
              {item.href && !isLast ? (
                <Link href={item.href}>
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              )}

              {!isLast && (
                <span
                  className="rx-breadcrumbs-separator"
                  aria-hidden="true"
                >
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}