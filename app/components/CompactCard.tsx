import Image from "next/image";
import Link from "next/link";

interface CompactCardProps {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  image?: string;
  imageAlt?: string;
  meta?: string;
  className?: string;
}

export default function CompactCard({
  eyebrow,
  title,
  description,
  href,
  image,
  imageAlt = "",
  meta,
  className = "",
}: CompactCardProps) {
  const content = (
    <>
      {image && (
        <div className="rx-compact-card-media">
          <Image
            src={image}
            alt={imageAlt}
            width={1200}
            height={800}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      )}

      <div className="rx-compact-card-content">
        {eyebrow && (
          <span className="rx-eyebrow">
            {eyebrow}
          </span>
        )}

        <h3>{title}</h3>

        {description && <p>{description}</p>}

        {meta && (
          <span className="rx-compact-card-meta">
            {meta}
          </span>
        )}
      </div>

      {href && (
        <span
          className="rx-compact-card-arrow"
          aria-hidden="true"
        >
          →
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`rx-compact-card ${className}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <article className={`rx-compact-card ${className}`}>
      {content}
    </article>
  );
}