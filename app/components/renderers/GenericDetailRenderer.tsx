import type { ContentItem } from "@/lib/content";
import { getContentTypeDefinition } from "@/lib/content-registry";
import { TYPE_LABEL, imageForType } from "@/lib/listing-presentation";

import ContentHero from "../content/ContentHero";
import { pretty } from "../content/rows";
import styles from "../content/content.module.css";
import RelatedContent from "../RelatedContent";

interface GenericDetailRendererProps {
  item: ContentItem;
}

type Loose = ContentItem & {
  subjects?: string[];
  topics?: string[];
  ageGroups?: string[];
  classLevels?: string[];
  difficulty?: string;
  durationMinutes?: number;
  skills?: string[];
  learningObjectives?: string[];
  author?: string;
  fileType?: string;
  price?: number;
  currency?: string;
  transcript?: string;
};

// The detail page for any content type without its own renderer: a compact
// photo hero, the reading column, and an "at a glance" list beside it.
export default function GenericDetailRenderer({ item }: GenericDetailRendererProps) {
  const it = item as Loose;
  const typeLabel = TYPE_LABEL[item.contentType] ?? pretty(item.contentType);
  const def = getContentTypeDefinition(item.contentType);

  const glance: [string, string][] = [];
  if (it.subjects?.length) glance.push(["Subject", it.subjects.map(pretty).join(", ")]);
  if (it.topics?.length) glance.push(["Topic", it.topics.join(", ")]);
  if (it.ageGroups?.length) glance.push(["Ages", it.ageGroups.join(", ")]);
  if (it.classLevels?.length) glance.push(["Class", it.classLevels.join(", ")]);
  if (it.difficulty) glance.push(["Level", pretty(it.difficulty)]);
  if (it.durationMinutes) glance.push(["Time", `${it.durationMinutes} minutes`]);
  if (it.fileType) glance.push(["Format", it.fileType]);
  if (it.author) glance.push(["By", it.author]);
  if (it.price !== undefined) glance.push(["Price", `${it.currency && it.currency !== "NGN" ? it.currency + " " : "₦"}${it.price.toLocaleString()}`]);

  const meta = [
    ...(it.durationMinutes ? [{ value: `${it.durationMinutes} min` }] : []),
    ...(it.difficulty ? [{ value: pretty(it.difficulty) }] : []),
    ...(it.ageGroups?.[0] ? [{ label: "Ages", value: it.ageGroups[0] }] : []),
  ];

  return (
    <main style={{ background: "var(--rx-white)" }}>
      <ContentHero
        eyebrow={typeLabel}
        lineOne={item.title}
        lead={item.excerpt ?? item.description}
        image={imageForType(item.contentType)}
        alt=""
        meta={meta}
        back={def ? { href: def.route, label: `Back to ${def.label}` } : undefined}
      />

      <section className={styles.article}>
        <div className={`rx-container ${styles.articleGrid}`}>
          <div className={styles.prose}>
            {item.description && (
              <section>
                <h2>Overview</h2>
                <p>{item.description}</p>
              </section>
            )}

            {it.learningObjectives && it.learningObjectives.length > 0 && (
              <section>
                <h2>What you will learn</h2>
                <ul>
                  {it.learningObjectives.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </section>
            )}

            {it.skills && it.skills.length > 0 && (
              <section>
                <h2>Skills you will use</h2>
                <p>{it.skills.join(" · ")}</p>
              </section>
            )}

            {it.transcript && (
              <section>
                <h2>Transcript</h2>
                <p>{it.transcript}</p>
              </section>
            )}
          </div>

          {glance.length > 0 && (
            <aside className={styles.aside} aria-label="At a glance">
              <h2>At a glance</h2>
              <ul className={styles.glance}>
                {glance.map(([k, v]) => (
                  <li key={k}>
                    <span>{k}</span>
                    <strong>{v}</strong>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </section>

      <RelatedContent content={item} />
    </main>
  );
}
