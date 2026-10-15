import Link from "next/link";

import { getContentHref } from "@/lib/content-registry";
import { getSectionByPath, getSectionItems } from "@/lib/content-sections";

import { HubClosing, HubHero, HubSectionHead, HubSteps } from "./HubParts";
import type { SectionConfig } from "./pageData";
import styles from "./hub.module.css";

const icons = [
  "M12 3v4M12 17v4M3 12h4M17 12h4M12 8l1.5 2.5L16 12l-2.5 1.5L12 16l-1.5-2.5L8 12l2.5-1.5Z",
  "M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3ZM5 17a3 3 0 0 1 3-3h10M9 8h5",
  "M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3M7.5 14h9",
  "m8 7-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16",
  "M3 9l9-5 9 5-9 5Zm4 3v5c0 1.5 2.2 3 5 3s5-1.5 5-3v-5",
  "M13 2 4 14h7l-1 8 9-12h-7Z",
];

function label(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, " ");
}

// The shared layout for every dropdown page of Shop, Resources and
// Schools & Institutions. Copy lives in pageData.ts.
export default function SectionPage({ config }: { config: SectionConfig }) {
  const section = config.catalog ? getSectionByPath(config.catalog.path) : null;
  const items = section ? getSectionItems(section) : [];

  return (
    <main style={{ background: "var(--rx-white)" }}>
      <HubHero
        eyebrow={config.eyebrow}
        lineOne={config.lineOne}
        lineTwo={config.lineTwo}
        lead={config.lead}
        actions={config.actions}
        image={config.image}
        alt={config.alt}
        chips={config.chips}
      />

      <section className={styles.showcaseSection}>
        <div className={`rx-container ${styles.split}`}>
          <div className={styles.splitHead}>
            <p className={`rx-eyebrow ${styles.eyebrow}`}>{config.intro.eyebrow}</p>
            <h2 className={styles.sectionTitle}>
              <span>{config.intro.lineOne}</span>
              <span className={styles.muted}>{config.intro.lineTwo}</span>
            </h2>
            <p className={styles.bodyText}>{config.intro.text}</p>
          </div>

          <ul className={styles.offerList}>
            {config.intro.items.map((item, index) => (
              <li key={item.title}>
                <span className={styles.highlightIcon} aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d={icons[index % icons.length]} />
                  </svg>
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {config.catalog ? (
        <section className={styles.catalogSection} id="catalogue">
          <div className="rx-container">
            <HubSectionHead
              eyebrow={config.catalog.eyebrow}
              lineOne={config.catalog.lineOne}
              lineTwo={config.catalog.lineTwo}
            />

            {items.length > 0 ? (
              <ul className={styles.catalogList}>
                {items.map((item) => (
                  <li key={item.id}>
                    <Link href={getContentHref(item)} className={styles.catalogRow}>
                      <span className={styles.catalogType}>{label(item.contentType)}</span>
                      <span className={styles.rowText}>
                        <span className={styles.rowTitle}>{item.title}</span>
                        <span className={styles.rowDesc}>{item.description}</span>
                      </span>
                      <svg className={styles.rowArrow} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4 12h15M14 7l5 5-5 5" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.emptyNote}>
                <p>{config.catalog.empty}</p>
                <Link href="/contact" className="rx-button rx-button-secondary">
                  Ask the team
                </Link>
              </div>
            )}
          </div>
        </section>
      ) : null}

      {config.steps ? (
        <section className={styles.stepsSection}>
          <div className="rx-container">
            <HubSectionHead
              eyebrow={config.steps.eyebrow}
              lineOne={config.steps.lineOne}
              lineTwo={config.steps.lineTwo}
            />
            <HubSteps steps={config.steps.items} />
          </div>
        </section>
      ) : null}

      <HubClosing
        kicker={config.closing.kicker}
        lineOne={config.closing.lineOne}
        lineTwo={config.closing.lineTwo}
        lead={config.closing.lead}
        actions={config.closing.actions}
        image={config.closing.image}
      />
    </main>
  );
}
