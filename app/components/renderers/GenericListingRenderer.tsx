import Link from "next/link";

import type { ContentItem } from "@/lib/content";

import PageHeader from "../PageHeader";
import ContentList from "../content/ContentList";
import { toRow } from "../content/rows";
import styles from "../content/content.module.css";

interface GenericListingRendererProps {
  eyebrow: string;
  heading: string;
  description: string;
  items: ContentItem[];
  /** The section's URL path. Kept for callers; the compact header needs no photograph. */
  path?: string;
  /** Optional pointer shown above the list. */
  notice?: { text: string; href: string; label: string };
}

// The listing page for every content section: a compact header (title, one
// line, count), then a filterable list of rows (no cards). Used by the generic content engine
// (app/[...path]/page.tsx).
export default function GenericListingRenderer({
  eyebrow,
  heading,
  description,
  items,
  notice,
}: GenericListingRendererProps) {
  const rows = items.map(toRow);

  return (
    <main style={{ background: "var(--rx-white)" }}>
      <PageHeader
        eyebrow={eyebrow}
        title={heading}
        lead={description}
        count={rows.length ? `${rows.length} ${rows.length === 1 ? "item" : "items"}` : undefined}
      />

      <section className={styles.listing}>
        <div className="rx-container">
          {notice && (
            <p className={styles.notice}>
              <span>{notice.text}</span>
              <Link href={notice.href}>{notice.label} →</Link>
            </p>
          )}
          {rows.length > 0 ? (
            <ContentList rows={rows} />
          ) : (
            <div className={styles.emptyBox}>
              <div>
                <h2>Being prepared</h2>
                <p>We are adding content to this section. In the meantime, try an interactive experience or talk to the team.</p>
              </div>
              <div className={styles.actions} style={{ marginTop: 0 }}>
                <Link href="/explore/experiences" className="rx-button rx-button-primary">Try an experience</Link>
                <Link href="/contact" className="rx-button rx-button-secondary">Contact Rhinox</Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
