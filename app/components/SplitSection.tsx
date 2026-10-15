import Image from "next/image";
import type { ReactNode } from "react";
import Button from "./Button";

interface SplitSectionProps {
  eyebrow?: string;
  title: string;
  description: string;
  children?: ReactNode;
  image?: string;
  imageAlt?: string;
  href?: string;
  linkLabel?: string;
  reverse?: boolean;
  className?: string;
}

export default function SplitSection({
  eyebrow,
  title,
  description,
  children,
  image,
  imageAlt = "",
  href,
  linkLabel = "Explore",
  reverse = false,
  className = "",
}: SplitSectionProps) {
  const classes = [
    "rx-split-section",
    reverse
      ? "rx-split-section-reverse"
      : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classes}>
      <div className="rx-split-content">
        {eyebrow && (
          <span className="rx-eyebrow">
            {eyebrow}
          </span>
        )}

        <h2>{title}</h2>

        <p>{description}</p>

        {children && (
          <div className="rx-split-extra">
            {children}
          </div>
        )}

        {href && (
          <div className="rx-split-action">
            <Button href={href}>
              {linkLabel}
            </Button>
          </div>
        )}
      </div>

      {image && (
        <div className="rx-split-media">
          <Image
            src={image}
            alt={imageAlt}
            width={1400}
            height={1000}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      )}
    </section>
  );
}