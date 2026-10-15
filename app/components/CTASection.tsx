import type { ReactNode } from "react";
import Button from "./Button";

interface CTASectionProps {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  children?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

export default function CTASection({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "Get started",
  secondaryHref,
  secondaryLabel,
  children,
  align = "center",
  className = "",
}: CTASectionProps) {
  const classes = [
    "rx-cta-section",
    align === "center" ? "rx-cta-section-center" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classes}>
      <div className="rx-cta-section-inner">
        {eyebrow && (
          <span className="rx-eyebrow">{eyebrow}</span>
        )}

        <h2>{title}</h2>

        {description && <p>{description}</p>}

        {children && (
          <div className="rx-cta-section-extra">
            {children}
          </div>
        )}

        {(href || secondaryHref) && (
          <div className="rx-cta-section-actions">
            {href && (
              <Button href={href}>
                {linkLabel}
              </Button>
            )}

            {secondaryHref && (
              <Button
                href={secondaryHref}
                variant="secondary"
              >
                {secondaryLabel || "Learn more"}
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}