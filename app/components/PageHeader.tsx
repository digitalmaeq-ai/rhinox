import Link from "next/link";
import type { ReactNode } from "react";

import styles from "./PageHeader.module.css";

export interface PageHeaderProps {
  /** Small label above the title, for example the section name. */
  eyebrow: string;
  title: string;
  /** One line that says what the page holds. */
  lead?: string;
  /** Short text such as "12 items". Real counts only; omit when unknown. */
  count?: string;
  /** A way back to the parent page. */
  back?: { href: string; label: string };
  /** Optional actions or filters, placed under the text. */
  children?: ReactNode;
}

/**
 * The compact header for library and listing pages: eyebrow, title, one line
 * and a count. No photograph, no pattern, no gradient. The page's results are
 * the focus (docs/design/phase-0-design-system.md, family F4).
 */
export default function PageHeader({ eyebrow, title, lead, count, back, children }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={`rx-container ${styles.inner}`}>
        {back && (
          <Link href={back.href} className={styles.back}>
            <span aria-hidden="true">←</span> {back.label}
          </Link>
        )}
        <p className={styles.eyebrow}>{eyebrow}</p>
        <div className={styles.row}>
          <h1 className={styles.title}>{title}</h1>
          {count && <p className={styles.count}>{count}</p>}
        </div>
        {lead && <p className={styles.lead}>{lead}</p>}
        {children && <div className={styles.slot}>{children}</div>}
      </div>
    </header>
  );
}
