import type { Metadata } from "next";
import Link from "next/link";

import { NURSERY_1_TERMS, TERM_COLOURS, TMC_VIDEOS, YOUTUBE_CHANNEL_URL, weekPacks } from "@/lib/resources/library";
import VideoWall, { type WallVideo } from "./VideoWall";
import styles from "./videos.module.css";

export const metadata: Metadata = {
  title: "Videos | Rhinox Scientifica",
  description: "Bonus teacher videos for Think • Move • Code! Nursery 1, plus 39 playable screen games and matching games you can open right now.",
};

export default function VideosPage() {
  const wall: WallVideo[] = TMC_VIDEOS.map((v) => ({
    id: v.id,
    term: v.term,
    title: v.title,
    subtitle: NURSERY_1_TERMS[v.term - 1].title,
    youtubeId: v.youtubeId,
    colour: TERM_COLOURS[v.term].main,
  }));
  const terms = [1, 2, 3];

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={`rx-container ${styles.heroInner}`}>
          <p className={styles.eyebrow}>Resources · Videos</p>
          <h1 className={styles.title}>Now showing <span>on Rhinox.</span></h1>
          <p className={styles.lead}>One short bonus teacher video for each term of Think • Move • Code! Nursery 1. Until they are published, there are 39 screen games to play right now.</p>
        </div>
      </header>

      <section className={styles.cinema} aria-labelledby="wall-title">
        <div className={`rx-container ${styles.cinemaInner}`}>
          <h2 id="wall-title" className={styles.sectionTitle}>Bonus videos</h2>
          <VideoWall videos={wall} channelUrl={YOUTUBE_CHANNEL_URL} />
        </div>
      </section>

      <section className={styles.arcade} aria-labelledby="arcade-title">
        <div className={`rx-container ${styles.arcadeInner}`}>
          <div className={styles.arcadeHead}>
            <h2 id="arcade-title" className={styles.sectionTitle}>Play instead</h2>
            <p>Every week has a screen game with Ayo and a Find the Pairs matching game. They open in your browser: no sign-in and no download.</p>
          </div>
          {terms.map((t) => (
            <div key={t} className={styles.reel} style={{ ["--c" as string]: TERM_COLOURS[t].main }}>
              <h3 className={styles.reelTitle}>Term {t} <span>{NURSERY_1_TERMS[t - 1].title}</span></h3>
              <ul className={styles.games}>
                {weekPacks.filter((w) => w.term === t).map((w) => (
                  <li key={w.week}>
                    <a href={w.screenGameHref} className={styles.game}>
                      <span className={styles.gameNo}>{String(w.week).padStart(2, "0")}</span>
                      <span className={styles.gameName}>{w.screenGame}</span>
                      <span className={styles.gameGo} aria-hidden="true">▶</span>
                      <span className={styles.srOnly}>Play {w.screenGame}, Term {t} Week {w.week}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.more}>
        <div className={`rx-container ${styles.moreInner}`}>
          <p>Want more to try? <Link href="/explore/experiences">Open the experience library</Link> or <Link href="/think-move-code">visit Think • Move • Code!</Link></p>
        </div>
      </section>
    </main>
  );
}
