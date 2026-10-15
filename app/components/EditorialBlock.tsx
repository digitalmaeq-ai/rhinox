import Link from "next/link";

interface EditorialBlockProps {
  eyebrow?: string;
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
  meta?: string;
  className?: string;
}

export default function EditorialBlock({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "Read more",
  meta,
  className = "",
}: EditorialBlockProps) {
  return (
    <article className={`rx-editorial-block ${className}`}>
      <div className="rx-editorial-content">
        {eyebrow && (
          <span className="rx-eyebrow">
            {eyebrow}
          </span>
        )}

        <h3>{title}</h3>

        <p>{description}</p>

        {meta && (
          <span className="rx-editorial-meta">
            {meta}
          </span>
        )}

        {href && (
          <Link href={href} className="rx-editorial-link">
            <span>{linkLabel}</span>
            <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
    </article>
  );
}