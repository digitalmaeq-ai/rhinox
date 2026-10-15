import Image from "next/image";

import { pathFor } from "@/app/components/content/tiles";

import styles from "./games.module.css";

export interface CoverProps {
  title: string;
  type: string;
  subjects: string[];
  ink: string;
  /** Real artwork, if a file exists at public/images/games/<slug>.jpg. */
  image?: string;
  large?: boolean;
}

// Placeholder cover art: a coloured gradient with a large glyph for the
// subject. When real artwork is dropped into public/images/games/<slug>.jpg
// it replaces the placeholder automatically.
export default function Cover({ title, type, subjects, ink, image, large }: CoverProps) {
  if (image) {
    return (
      <span className={styles.cover}>
        <Image src={image} alt="" fill sizes={large ? "560px" : "280px"} style={{ objectFit: "cover" }} />
      </span>
    );
  }
  return (
    <span
      className={styles.cover}
      style={{ background: `linear-gradient(140deg, ${ink} 0%, color-mix(in srgb, ${ink} 45%, #0b1a2b) 100%)` }}
      role="img"
      aria-label={`${title} cover`}
    >
      <i className={styles.orbA} aria-hidden="true" />
      <i className={styles.orbB} aria-hidden="true" />
      <svg className={styles.glyph} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={pathFor(type, subjects)} />
      </svg>
    </span>
  );
}
