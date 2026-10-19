import fs from "node:fs";
import path from "node:path";

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import type { ListRow } from "@/app/components/content/ContentList";
import { toRow } from "@/app/components/content/rows";
import { getSectionByPath, getSectionItems } from "@/lib/content-sections";

import Cover from "./Cover";
import Rail from "./Rail";
import styles from "./games.module.css";

export const metadata: Metadata = {
  title: "STEM Games | Rhinox Scientifica",
  description: "Interactive games that make STEM learning engaging and practical. Play in your browser.",
};

const HERO_IMAGE = "/images/hero/coding.jpg";

interface Game extends ListRow {
  art?: string;
  subject: string;
}

// The shelves, in order. A game appears on the first shelf that claims its subject.
const SHELVES: { title: string; hint: string; subjects: string[] }[] = [
  { title: "Number play", hint: "Fractions, shapes and time", subjects: ["mathematics"] },
  { title: "Code & logic", hint: "Think in steps, then program the robot", subjects: ["coding", "robotics"] },
  { title: "Nature & Earth", hint: "Animals, food, farms and maps", subjects: ["biology", "environmental-science", "earth-and-space"] },
  { title: "Matter & machines", hint: "Materials, mixtures and simple machines", subjects: ["chemistry", "physics", "engineering"] },
];

function artFor(row: ListRow): string | undefined {
  const slug = row.href.split("/").filter(Boolean).pop() ?? "";
  const rel = `/images/games/${slug}.jpg`;
  return fs.existsSync(path.join(process.cwd(), "public", rel)) ? rel : undefined;
}

function GameCard({ g }: { g: Game }) {
  return (
    <li className={styles.slide}>
      <Link href={g.href} className={styles.card}>
        <span className={styles.coverWrap}>
          <Cover title={g.title} type={g.type} subjects={g.subjects} ink={g.ink} image={g.art} />
          <span className={styles.badge}>{g.type === "game" ? "Game" : g.subject === "coding" || g.subject === "robotics" ? "Code" : "Play"}</span>
          <span className={styles.hoverPlay} aria-hidden="true">▶ Play</span>
        </span>
        <strong>{g.title}</strong>
        <span className={styles.cardMeta}>
          {[g.subjectLabels[0], g.metaTop, g.metaBottom].filter(Boolean).join(" · ")}
        </span>
      </Link>
    </li>
  );
}

export default function StemGamesPage() {
  const section = getSectionByPath("/explore/stem-games");
  const rows: Game[] = (section ? getSectionItems(section) : []).map(toRow).map((r) => ({
    ...r,
    art: artFor(r),
    subject: r.subjects[0] ?? "general",
  }));

  const featured = rows.find((r) => r.type === "game") ?? rows[0];
  const rest = rows.filter((r) => r !== featured);

  // With only a few games, one "All games" shelf says it all; subject shelves
  // start to earn their place once there are more than a handful.
  const bySubject = rows.length > 6;
  const used = new Set<string>();
  const shelves = (bySubject ? SHELVES : []).map((s) => {
    const items = rest.filter((r) => s.subjects.includes(r.subject));
    items.forEach((i) => used.add(i.id));
    return { ...s, items };
  }).filter((s) => s.items.length > 0);
  const leftover = rest.filter((r) => !used.has(r.id));
  if (bySubject && leftover.length) shelves.push({ title: "More to explore", hint: "", subjects: [], items: leftover });

  shelves.unshift({ title: "All games", hint: "Everything on the shelf, ready to play", subjects: [], items: rows });

  const subjectCount = new Set(rows.map((r) => r.subject)).size;

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Image src={HERO_IMAGE} alt="" fill priority sizes="100vw" className={styles.heroImg} />
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={`rx-container ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Rhinox Scientifica · STEM Games</p>
            <h1 className={styles.title}>
              Play to learn.
              <span>Learn to win.</span>
            </h1>
            {featured && (
              <>
                <p className={styles.now}>Featured · {featured.subjectLabels[0] ?? "Science"}</p>
                <p className={styles.lead}><strong>{featured.title}</strong>. {featured.description}</p>
                <div className={styles.actions}>
                  <Link href={featured.href} className={styles.play}>
                    <span className={styles.playIcon} aria-hidden="true">▶</span>
                    Play now
                  </Link>
                  <a href="#shelf" className={styles.ghost}>Browse {rows.length} games</a>
                </div>
              </>
            )}
          </div>
          {featured && (
            <Link href={featured.href} className={styles.spot} tabIndex={-1} aria-hidden="true">
              <Cover title={featured.title} type={featured.type} subjects={featured.subjects} ink={featured.ink} image={featured.art} large />
              <span className={styles.spotLabel}>{featured.title}</span>
            </Link>
          )}
        </div>
        <ul className={styles.stats} aria-label="At a glance">
          <li><strong>{rows.length}</strong> games</li>
          <li><strong>{subjectCount}</strong> subjects</li>
          <li><strong>10</strong> min per game</li>
          <li>Plays in your browser</li>
        </ul>
      </section>

      <div id="shelf" className={`rx-container ${styles.shelf}`}>
        {shelves.map((s) => (
          <Rail key={s.title} title={s.title} hint={s.hint}>
            {s.items.map((g) => <GameCard key={g.id} g={g} />)}
          </Rail>
        ))}
        <p className={styles.note}>
          More games are on the way. New releases appear here first. Looking for sorting, matching and short lessons?{" "}
          <Link href="/explore/experiences">Explore STEM Experiences</Link>. Coding games have moved to{" "}
          <Link href="/coding-robotics/challenges">RhinoCode Game Challenges</Link>.
        </p>
      </div>
    </main>
  );
}
