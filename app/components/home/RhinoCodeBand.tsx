import Link from "next/link";

import styles from "./RhinoCodeBand.module.css";

// A small maze that shows what the Game Creator makes. # wall, S start, G goal,
// c coin, e enemy, k key, D door, . floor.
const MAZE = ["#########", "#S..c..e#", "#.##.##.#", "#c.#k#.c#", "#.##D##.#", "#...c...G", "#########"];

const CLASS: Record<string, string> = { "#": styles.wall, S: styles.start, G: styles.goal, c: styles.coin, e: styles.enemy, k: styles.key, D: styles.door };

/** Home page band that points to RhinoCode (robot lab, Game Creator, projects). */
export default function RhinoCodeBand() {
  return (
    <section className={styles.band} aria-labelledby="rhinocode-band-title">
      <div className={`rx-container ${styles.inner}`}>
        <div className={styles.copy}>
          <p className={styles.kind}>RhinoCode</p>
          <h2 id="rhinocode-band-title" className={styles.title}>
            Code a robot. <span>Build a game.</span>
          </h2>
          <p className={styles.text}>
            Program RhinoBot through a maze, then design your own levels with enemies, keys and doors. Play them, and save everything in My Projects.
          </p>
          <div className={styles.actions}>
            <Link href="/coding-robotics" className={styles.primary}>Open RhinoCode</Link>
            <Link href="/coding-robotics/game-creator" className={styles.secondary}>Make a game</Link>
          </div>
        </div>
        <div className={styles.maze} aria-hidden="true">
          {MAZE.flatMap((row, y) => [...row].map((ch, x) => <i key={`${x}-${y}`} className={CLASS[ch] ?? ""} />))}
        </div>
      </div>
    </section>
  );
}
