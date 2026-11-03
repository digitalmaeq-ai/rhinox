import type { Metadata } from "next";
import Link from "next/link";

import Breadcrumbs from "../components/Breadcrumbs";
import ResourcesBrowser, { type ResourceColumn, type ResourceRow } from "./ResourcesBrowser";
import { getContentHref } from "@/lib/content-registry";
import { getDestinationItems } from "@/lib/menu-destinations";
import styles from "./resources.module.css";

export const metadata: Metadata = {
  title: "Resources | Rhinox Scientifica",
  description: "Search Rhinox articles, videos and free downloads, and find badges, certificates and your learning library.",
};

function column(id: ResourceRow["type"], label: string, singular: string, seeAll: string): ResourceColumn {
  const items = (getDestinationItems(seeAll) ?? [])
    .slice()
    .sort((a, b) => String(b.updatedAt ?? b.createdAt ?? "").localeCompare(String(a.updatedAt ?? a.createdAt ?? "")))
    .map((item) => ({ title: item.title, text: item.excerpt ?? item.description, href: getContentHref(item), type: id }));
  return { id, label, singular, seeAll, items };
}

function status(href: string): string {
  const n = getDestinationItems(href)?.length ?? 0;
  return n > 0 ? `${n} ${n === 1 ? "item" : "items"}` : "Coming soon";
}

export default function ResourcesPage() {
  const columns = [
    column("articles", "Articles", "Article", "/resources/articles"),
    column("videos", "Videos", "Video", "/resources/videos"),
    column("downloads", "Free Downloads", "Download", "/resources/free-downloads"),
  ];
  const mine = [
    { title: "My Rhinox Library", href: "/resources/my-rhinox-library", status: "Coming soon" },
    { title: "Badges", href: "/resources/badges", status: status("/resources/badges") },
    { title: "Certificates", href: "/resources/certificates", status: status("/resources/certificates") },
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
