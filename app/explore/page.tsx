import type { Metadata } from "next";
import Link from "next/link";

import ExploreHero from "@/app/components/ExploreHero";
import ContentList from "@/app/components/content/ContentList";
import { toRow } from "@/app/components/content/rows";
import contentStyles from "@/app/components/content/content.module.css";
import { getAllContent } from "@/lib/content";
import { isLiveContent } from "@/lib/interactive-experiences";
import { navigation } from "@/lib/site-navigation";

import styles from "./explore.module.css";

export const metadata: Metadata = {
  title: "Explore | Rhinox Scientifica",
  description:
    "Explore Rhinox: experiences, virtual labs, games, projects, articles and resources. Search, filter and sort everything in one place.",
};

// Explore is a tool, so the page opens on the tool: a compact header, quick links
// to the main Explore areas (read from the site menu), then every live item as a
// card that can be searched, filtered by kind and subject, and sorted.
// Products are left to the Shop. The old menu browser still lives on the homepage
// (/?explore=… links from the header menu).
export default function ExplorePage() {
  const rows = getAllContent()
    .filter(isLiveContent)
    .filter((item) => item.contentType !== "product")
    .map(toRow);

  const menu = navigation.find((item) => item.href === "/explore");
  const jump = (menu?.megaMenu?.columns ?? [])
    .flatMap((column) => column.items)
    .filter((item) => item.href !== "/explore");

  return (
    <main style={{ background: "var(--rx-white)" }}>
      <ExploreHero
        image="/images/hero/stem-lab.jpg"
        alt="A bright, modern STEM laboratory"
        eyebrow="Rhinox Scientifica · Explore"
        lineOne="Find your next"
        lineTwo="STEM adventure."
        lead="Experiences, virtual labs, games, projects and quizzes in one place. Search, filter by subject and sort."
        actions={[{ label: "Browse everything", href: "#library" }, { label: "Play a game", href: "/explore/stem-games", secondary: true }]}
        stats={[
          { value: String(rows.length), label: rows.length === 1 ? "item" : "items" },
          { value: String(jump.length), label: "areas to explore" },
          { label: "Free to try in your browser" },
        ]}
        align="left"
        tone="sky"
      />

      <section className={contentStyles.listing} id="library" style={{ scrollMarginTop: 80 }}>
        <div className="rx-container">
          {jump.length > 0 && (
            <nav className={styles.jump} aria-label="Explore areas">
              <span className={styles.jumpLabel}>Jump to</span>
              <ul>
                {jump.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <ContentList rows={rows} />
          <p className={styles.shopNote}>
            Looking for books, kits or laboratory equipment? <Link href="/shop">Visit the shop →</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
