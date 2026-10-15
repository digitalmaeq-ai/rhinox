import Image from "next/image";
import Link from "next/link";

interface ExperienceRowProps {
  number?: string;
  category?: string;
  title: string;
  description: string;
  href: string;
  image?: string;
  imageAlt?: string;
  meta?: string;
  className?: string;
}

export default function ExperienceRow({
  number,
  category,
  title,
  description,
  href,
  image,
  imageAlt = "",
  meta,
  className = "",
}: ExperienceRowProps) {
  return (
    <Link
      href={href}
      className={`rx-experience-row ${className}`}
    >
      <div className="rx-experience-row-index">
        {number && <span>{number}</span>}
      </div>

      {image && (
        <div className="rx-experience-row-media">
          <Image
            src={image}
            alt={imageAlt}
            width={1200}
            height={800}
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        </div>
      )}

      <div className="rx-experience-row-content">
        {category && (
          <span className="rx-eyebrow">
            {category}
          </span>
        )}

        <h3>{title}</h3>

        <p>{description}</p>

        {meta && (
          <span className="rx-experience-row-meta">
            {meta}
          </span>
        )}
      </div>

      <div
        className="rx-experience-row-arrow"
        aria-hidden="true"
      >
        →
      </div>
    </Link>
  );
}