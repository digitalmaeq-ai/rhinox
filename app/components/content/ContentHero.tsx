import Image from "next/image";
import Link from "next/link";

import type { HubAction } from "../hub/HubParts";
import styles from "./content.module.css";

export interface ContentHeroProps {
  eyebrow: string;
  lineOne: string;
  lineTwo?: string;
  lead?: string;
  image: string;
  alt: string;
  chips?: string[];
  meta?: { label?: string; value: string }[];
  actions?: HubAction[];
  back?: { href: string; label: string };
}

// The compact hero used by every content page: title, one line of lead,
// a few facts, and one photograph.
export default function ContentHero({
  eyebrow,
  lineOne,
  lineTwo,
  lead,
  image,
  alt,
  chips = [],
  meta = [],
  actions = [],
  back,
}: ContentHeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.heroGrid} aria-hidden="true" />
      <div className={`rx-container ${styles.heroInner}`}>
        <div>
          {back && (
            <Link href={back.href} className={styles.crumb}>
              <span aria-hidden="true">←</span> {back.label}
            </Link>
          )}
          <p className="rx-eyebrow" style={{ marginBottom: 12 }}>{eyebrow}</p>
          <h1 className={styles.title}>
            <span>{lineOne}</span>
            {lineTwo && <span className={styles.muted}>{lineTwo}</span>}
          </h1>
          {lead && <p className={styles.lead}>{lead}</p>}
          {meta.length > 0 && (
            <ul className={styles.meta}>
              {meta.map((m) => (
                <li key={(m.label ?? "") + m.value}>
                  {m.label ? <><span>{m.label}</span> <strong>{m.value}</strong></> : <strong>{m.value}</strong>}
                </li>
              ))}
            </ul>
          )}
          {actions.length > 0 && (
            <div className={styles.actions}>
              {actions.map((a) => (
                <Link
                  key={a.href + a.label}
                  href={a.href}
                  className={`rx-button ${a.secondary ? "rx-button-secondary" : "rx-button-primary"}`}
                >
                  {a.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className={styles.mediaWrap}>
          <div className={styles.photo}>
            <Image src={image} alt={alt} fill priority sizes="(max-width: 900px) 100vw, 480px" style={{ objectFit: "cover" }} />
          </div>
          {chips.length > 0 && (
            <ul className={styles.chips} aria-label="Highlights">
              {chips.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
