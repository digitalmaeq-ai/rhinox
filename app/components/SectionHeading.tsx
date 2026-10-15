interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className = "",
}: SectionHeadingProps) {
  const classes = [
    "rx-section-heading",
    `rx-section-heading-${align}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {eyebrow && <span className="rx-eyebrow">{eyebrow}</span>}

      <h2>{title}</h2>

      {description && <p>{description}</p>}
    </div>
  );
}