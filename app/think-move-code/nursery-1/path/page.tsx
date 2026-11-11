import type { Metadata } from "next";
import Link from "next/link";

import PathTrail from "./PathTrail";
import styles from "./path.module.css";
import { getNursery1PathView } from "@/lib/tmc-path/learning-path.server";

export const metadata: Metadata = {
  title: "Learning Path · Think • Move • Code! Nursery 1 | Rhinox Scientifica",
  description: "Follow Think • Move • Code! Nursery 1 one step at a time: learn, play, match and quiz, week by week.",
};

// A trail through the Nursery 1 weeks. It holds only order, links and progress; every step opens
// content that already exists. Progress is kept in the visitor's own browser (see PathTrail).
export default function LearningPathPage() {
  const view = getNursery1PathView();

  return (
    <main className={styles.page}>
      <div className={`rx-container ${styles.wrap}`}>
        <nav aria-label="Breadcrumb">
          <ol className={styles.crumbs}>
            <li>
              <Link href="/think-move-code">Think • Move • Code! Nursery 1</Link>
            </li>
            <li aria-current="page">Learning Path</li>
          </ol>
        </nav>

        <header className={styles.head}>
          <p className={styles.eyebrow}>Nursery 1</p>
          <h1 className={styles.title}>Learning Path</h1>
          <p className={styles.lead}>
            One week at a time, in four short steps: learn, play, match and quiz. Start at Week 1, or jump to any week you like. Nothing is locked.
          </p>
          <p className={styles.note}>
            Grown-ups: this path links to the games and quizzes already on the week pages.{" "}
            <Link href="/think-move-code#weeks">Prefer printables and guides? Use Week by week.</Link>
          </p>
        </header>

        <PathTrail view={view} />
      </div>
    </main>
  );
}
