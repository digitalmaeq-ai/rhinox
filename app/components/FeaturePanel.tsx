import Image from "next/image";
import type { ReactNode } from "react";
import Button from "./Button";

interface FeaturePanelProps {
  eyebrow?: string;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  href?: string;
  linkLabel?: string;
  children?: ReactNode;
  className?: string;
}

export default function FeaturePanel({
  eyebrow,
  title,
  description,
  image,
  imageAlt = "",
  href,
  linkLabel = "Explore",
  children,
  className = "",
}: FeaturePanelProps) {
  return (
    <section className={`rx-feature-panel ${className}`}>
      {image && (
        <div className="rx-feature-panel-media">
          <Image
            src={image}
            alt={imageAlt}
            width={1600}
            height={1000}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      )}

      <div className="rx-feature-panel-content">
        {eyebrow && (
          <span className="rx-eyebrow">
            {eyebrow}
          </span>
        )}

        <h2>{title}</h2>

        <p>{description}</p>

        {children && (
          <div className="rx-feature-panel-extra">
            {children}
          </div>
        )}

        {href && (
          <div className="rx-feature-panel-action">
            <Button href={href}>{linkLabel}</Button>
          </div>
        )}
      </div>
    </section>
  );
}