import Image from "next/image";
import type { ReactNode } from "react";
import Button from "./Button";

interface FullWidthFeatureProps {
  eyebrow?: string;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  href?: string;
  linkLabel?: string;
  children?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

export default function FullWidthFeature({
  eyebrow,
  title,
  description,
  image,
  imageAlt = "",
  href,
  linkLabel = "Explore",
  children,
  align = "left",
  className = "",
}: FullWidthFeatureProps) {
  const classes = [
    "rx-full-width-feature",
    align === "center"
      ? "rx-full-width-feature-center"
      : "",
    image
      ? "rx-full-width-feature-has-image"
      : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classes}>
      {image && (
        <div className="rx-full-width-feature-media">
          <Image
            src={image}
            alt={imageAlt}
            width={1800}
            height={900}
            sizes="100vw"
          />
        </div>
      )}

      <div className="rx-full-width-feature-content">
        {eyebrow && (
          <span className="rx-eyebrow">
            {eyebrow}
          </span>
        )}

        <h2>{title}</h2>

        <p>{description}</p>

        {children && (
          <div className="rx-full-width-feature-extra">
            {children}
          </div>
        )}

        {href && (
          <div className="rx-full-width-feature-action">
            <Button href={href}>{linkLabel}</Button>
          </div>
        )}
      </div>
    </section>
  );
}