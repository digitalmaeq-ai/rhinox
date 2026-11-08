import Image from "next/image";
import Link from "next/link";

import styles from "./ExploreHero.module.css";

export interface ExploreHeroProps {
  /** A photograph in /public/images. Each Explore page uses its own. */
  image: string;
  alt: string;
  /** CSS object-position for portrait photographs, for example "50% 30%". */
  imagePosition?: string;
  eyebrow: string;
  lineOne: string;
  lineTwo: string;
  lead: string;
  actions?: { label: string; href: string; secondary?: boolean }[];
  /** Real facts only: counts that come from the catalogue, or plain statements. */
  stats?: { value?: string; label: string }[];
  /** Where the copy sits over the photograph. */
  align?: "left" | "right" | "center";
  /** Colour of the second title line: sky blue (default) or the Rhinox amber. */
  tone?: "sky" | "amber";
}

// The photograph hero used across Explore, in the style of the STEM Games page:
// a full-width photograph under a navy shade, a large two-line title, one line
// of lead, actions and a strip of facts. The align and tone options and each
// page's own photograph keep the pages from looking alike.
export default function ExploreHero({
  image,
  alt,
  imagePosition,
  eyebrow,
  lineOne,
  lineTwo,
  lead,
  actions = [],
  stats = [],
  align = "left",
  tone = "sky",
}: ExploreHeroProps) {
  return (
    <section className={`${styles.hero} ${styles[align]} ${tone === "amber" ? styles.amber : ""}`}>
      <Image src={image} alt={alt} fill priority sizes="100vw" className={styles.img} style={imagePosition ? { objectPosition: imagePosition } : undefined} />
      <div className={styles.shade} aria-hidden="true" />
      <div className={`rx-container ${styles.inner}`}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 className={styles.title}>
            {lineOne}
            <span>{lineTwo}</span>
          </h1>
          <p className={styles.lead}>{lead}</p>
          {actions.length > 0 && (
            <div className={styles.actions}>
              {actions.map((a) => (
                <Link key={a.href + a.label} href={a.href} className={a.secondary ? styles.ghost : styles.primary}>
                  {a.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      {stats.length > 0 && (
        <ul className={styles.stats} aria-label="At a glance">
          {stats.map((s) => (
            <li key={s.label}>
              {s.value && <strong>{s.value}</strong>} {s.label}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
