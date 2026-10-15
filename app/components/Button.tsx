import Link from "next/link";
import type { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "text";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  children: ReactNode;
  href?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  external?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export default function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  className = "",
  external = false,
  onClick,
  type = "button",
  disabled = false,
}: ButtonProps) {
  const classes = [
    "rx-button",
    `rx-button-${variant}`,
    `rx-button-${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href && external) {
    return (
      <a
        href={href}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span>{children}</span>
        <span className="rx-button-arrow" aria-hidden="true">
          ↗
        </span>
      </a>
    );
  }

  if (href) {
    return (
      <Link href={href} className={classes}>
        <span>{children}</span>
        <span className="rx-button-arrow" aria-hidden="true">
          →
        </span>
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      <span>{children}</span>
      <span className="rx-button-arrow" aria-hidden="true">
        →
      </span>
    </button>
  );
}