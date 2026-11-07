import type { Metadata } from "next";
import Link from "next/link";

import Breadcrumbs from "../components/Breadcrumbs";
import ResourcesBrowser, { type ResourceColumn, type ResourceRow } from "./ResourcesBrowser";
import { badges, NURSERY_1_TERMS, termKits, TMC_VIDEOS, totals } from "@/lib/resources/library";
import { getAllArticles } from "@/lib/resources/all-articles";
import styles from "./resources.module.css";

export const metadata: Metadata = {
  title: "Resources | Rhinox Scientifica",
  description: "Search Rhinox articles, videos and free downloads, and find badges, certificates and your learning library.",
};

const row = (type: ResourceRow["type"], title: string, text: string, href: string): ResourceRow => ({ title, text, href, type });

export default function ResourcesPage() {
  const articles = getAllArticles().map((x) => row("articles", x.title, x.dek, `/resources/articles/${x.slug}`));
  const videos = TMC_VIDEOS.map((v) => row("videos", v.title, `${NURSERY_1_TERMS[v.term - 1].title}. ${v.youtubeId ? "Watch now." : "Coming soon."}`, "/resources/videos"));
  const downloads = [
    ...termKits.map((k) => row("downloads", `Term ${k.term} packs: ${k.title}`, "Lesson plans, printable cards, guides, review sheets and question banks for every week.", "/resources/free-downloads")),
    row("downloads", "Step Thinker badges and Step Star stickers", "Print-ready badge images and sticker sheets for every term.", "/resources/badges"),
  ];
  const columns: ResourceColumn[] = [
    { id: "articles", label: "Articles", singular: "Article", seeAll: "/resources/articles", items: articles },
    { id: "videos", label: "Videos", singular: "Video", seeAll: "/resources/videos", items: videos },
    { id: "downloads", label: "Free Downloads", singular: "Download", seeAll: "/resources/free-downloads", items: downloads },
  ];
  const mine = [
    { title: "My Rhinox Library", href: "/resources/my-rhinox-library", status: `${totals.weeks}-week tracker` },
    { title: "Badges", href: "/resources/badges", status: `${badges.length} badges` },
    { title: "Certificates", href: "/resources/certificates", status: "Print yours" },
  ];
  return (
    <main className={styles.page}>
      <div className={`rx-container ${styles.crumbs}`}>
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Resources" }]} />
      </div>
      <ResourcesBrowser columns={columns} />

      <section className={styles.mine} aria-labelledby="mine-title">
        <div className="rx-container">
          <h2 id="mine-title" className={styles.mineTitle}>My Rhinox</h2>
          <ul className={styles.mineList}>
            {mine.map((m) => (
              <li key={m.href}>
                <Link href={m.href} className={styles.mineLink}>
                  <span>{m.title}</span>
                  <span className={styles.mineStatus}>{m.status}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.closing} aria-label="Suggest a topic">
        <div className={`rx-container ${styles.closingInner}`}>
          <p>Want a topic covered? Tell us.</p>
          <Link href="/contact" className="rx-button rx-button-primary">Suggest a topic</Link>
        </div>
      </section>
    </main>
  );
}
