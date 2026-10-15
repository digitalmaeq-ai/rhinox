import Link from "next/link";

import type { ContentItem } from "@/lib/content";
import { getAllContent } from "@/lib/content";
import { getContentHref } from "@/lib/content-registry";
import { getRelatedContent } from "@/lib/relationships";
import { TYPE_LABEL } from "@/lib/listing-presentation";

import { pathFor, toneFor } from "./content/tiles";
import styles from "./content/content.module.css";

interface RelatedContentProps {
  content: ContentItem;
  title?: string;
}

// "Keep going": a short list of rows, not a grid of cards.
export default function RelatedContent({ content, title = "Keep going" }: RelatedContentProps) {
  const related = getRelatedContent(content, getAllContent());
  if (related.length === 0) return null;

  return (
    <section className={styles.related} aria-labelledby="related-heading">
      <div className="rx-container">
        <h2 id="related-heading" className={styles.relatedHead}>{title}</h2>
        <ul className={styles.rows}>
          {related.map((result) => {
            const item = result.content;
            const subjects = (item as { subjects?: string[] }).subjects ?? [];
            const tone = toneFor(subjects);
            return (
              <li key={`${item.contentType}-${item.slug}`} className={styles.row}>
                <Link
                  href={getContentHref(item)}
                  className={styles.rowLink}
                  style={{ ["--tint" as string]: tone.tint, ["--ink" as string]: tone.ink }}
                >
                  <span className={styles.tile} aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d={pathFor(item.contentType, subjects)} />
                    </svg>
                  </span>
                  <span className={styles.rowMain}>
                    <span className={styles.kicker}>
                      <span>{TYPE_LABEL[item.contentType] ?? item.contentType}</span>
                      {(result.label ?? result.relation) && <span>{result.label ?? result.relation}</span>}
                    </span>
                    <h3 className={styles.rowTitle}>{item.title}</h3>
                    {item.description && <p className={styles.rowText}>{item.description}</p>}
                  </span>
                  <span />
                  <svg className={styles.arrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
