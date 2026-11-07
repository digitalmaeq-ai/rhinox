import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAllArticles, getArticle } from "@/lib/resources/all-articles";
import styles from "../articles.module.css";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  return a ? { title: `${a.title} | Rhinox Scientifica`, description: a.dek } : {};
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  const others = getAllArticles().filter((a) => a.slug !== slug).slice(0, 3);

  return (
    <main className={styles.page}>
      <article className={styles.read} style={{ ["--accent" as string]: article.accent }}>
        <div className={`rx-container ${styles.readInner}`}>
          <Link href="/resources/articles" className={styles.back}>← The Rhinox Reader</Link>
          <p className={styles.cat}>{article.category}</p>
          <h1 className={styles.readTitle}>{article.title}</h1>
          <p className={styles.readDek}>{article.dek}</p>
          <p className={styles.readMeta}>Rhinox Scientifica · {article.minutes} min read</p>
          <div className={styles.body}>
            {article.blocks.map((b, i) => {
              if (b.type === "h2") return <h2 key={i}>{b.text}</h2>;
              if (b.type === "p") return <p key={i}>{b.text}</p>;
              if (b.type === "steps") return <ol key={i} className={styles.stepList}>{b.items.map((t) => <li key={t}>{t}</li>)}</ol>;
              return <ul key={i}>{b.items.map((t) => <li key={t}>{t}</li>)}</ul>;
            })}
          </div>
        </div>
      </article>
      <section className={styles.section}>
        <div className={`rx-container ${styles.sectionInner}`}>
          <h2 className={styles.sectionTitle}>Keep reading</h2>
          <ul className={styles.list}>
            {others.map((a) => (
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
    </main>
  );
}
