import type { Metadata } from "next";
import Link from "next/link";

import { getAllArticles } from "@/lib/resources/all-articles";
import styles from "./articles.module.css";

export const metadata: Metadata = {
  title: "Articles | Rhinox Scientifica",
  description: "Guides for teachers and parents: what children learn each term, how to use the weekly packs, and screen-free ways to start coding at home.",
};

const CATEGORIES = ["Term guide", "For teachers", "For parents", "Ideas"] as const;

export default function ArticlesPage() {
  const all = getAllArticles();
  const lead = all.find((a) => a.slug === "coding-at-home-without-a-screen") ?? all[0];
  const rest = all.filter((a) => a !== lead);
  const side = rest.slice(0, 4);

  return (
    <main className={styles.page}>
      <header className={styles.masthead}>
        <div className={`rx-container ${styles.mastInner}`}>
          <p className={styles.kicker}>Resources</p>
          <h1 className={styles.name}>The Rhinox <em>Reader</em></h1>
          <p className={styles.tag}>Guides and ideas for teachers, parents and curious learners · {all.length} articles</p>
        </div>
      </header>

      <section className={styles.front} aria-label="Featured">
        <div className={`rx-container ${styles.frontInner}`}>
          <Link href={`/resources/articles/${lead.slug}`} className={styles.lead} style={{ ["--accent" as string]: lead.accent }}>
            <span className={styles.cat}>{lead.category}</span>
            <h2>{lead.title}</h2>
            <p>{lead.dek}</p>
            <span className={styles.meta}>{lead.minutes} min read · Read the article →</span>
          </Link>
          <aside className={styles.side} aria-label="More to read">
            <p className={styles.sideHead}>Also reading</p>
            <ol>
              {side.map((a, i) => (
                <li key={a.slug}>
                  <Link href={`/resources/articles/${a.slug}`}>
                    <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      <strong>{a.title}</strong>
                      <em>{a.category} · {a.minutes} min</em>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>

      {CATEGORIES.map((cat) => {
        const items = all.filter((a) => a.category === cat);
        if (items.length === 0) return null;
        return (
          <section key={cat} className={styles.section} aria-labelledby={`c-${cat}`}>
            <div className={`rx-container ${styles.sectionInner}`}>
              <h2 id={`c-${cat}`} className={styles.sectionTitle}>{cat}</h2>
              <ul className={styles.list}>
                {items.map((a) => (
                  <li key={a.slug} style={{ ["--accent" as string]: a.accent }}>
                    <Link href={`/resources/articles/${a.slug}`}>
                      <h3>{a.title}</h3>
                      <p>{a.dek}</p>
                      <span>{a.minutes} min read</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        );
      })}
    </main>
  );
}
