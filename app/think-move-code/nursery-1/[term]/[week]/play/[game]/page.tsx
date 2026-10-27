import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import styles from "../../../../../tmc.module.css";
import { GAMES, NURSERY_1_WEEKS, findWeek, gameTitle, weekAssets, weekPath, type GameKey } from "@/lib/tmc/nursery-1";

interface PlayPageProps {
  params: Promise<{ term: string; week: string; game: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return NURSERY_1_WEEKS.flatMap((item) =>
    (Object.keys(GAMES) as GameKey[]).map((game) => ({ term: `term-${item.term}`, week: `week-${item.week}`, game })),
  );
}

const isGame = (value: string): value is GameKey => value in GAMES;

export async function generateMetadata({ params }: PlayPageProps): Promise<Metadata> {
  const { term, week, game } = await params;
  const item = findWeek(term, week);
  if (!item || !isGame(game)) return {};
  return { title: `${gameTitle(item, game)} · Nursery 1 Term ${item.term} Week ${item.week} | Rhinox Scientifica` };
}

// The games are small self-contained pages from the weekly pack; this page
// frames one with a way back to the week.
export default async function PlayPage({ params }: PlayPageProps) {
  const { term, week, game } = await params;
  const item = findWeek(term, week);
  if (!item || !isGame(game)) notFound();
  const src = `${weekAssets(item)}/${GAMES[game].file}`;

  return (
    <main className={styles.page}>
      <div className="rx-container">
        <div className={styles.playBar}>
          <Link className={styles.back} href={weekPath(item)}>
            ← Back to Week {item.week}
          </Link>
          <h1>{gameTitle(item, game)}</h1>
          <a className={styles.back} href={src}>
            Full screen
          </a>
        </div>
        <iframe className={styles.frame} src={src} title={`${gameTitle(item, game)} game`} />
      </div>
    </main>
  );
}
