import Link from "next/link";

import ExperienceExplorer from "@/app/components/ExperienceExplorer";
import { getExperienceSequence } from "@/lib/experience-sequence";
import { isOwnPageContent, isVirtualExperiment, toMatrixItems } from "@/lib/explore-experience-items";

export default function ExploreExperiencesPage() {
  // Easiest first, the same order the experience page's Next button follows.
  // The advanced science labs live on their own page (Virtual Experiments),
  // so this page is the games, puzzles, sorting, coding and early science.
  const library = getExperienceSequence();
  const items = toMatrixItems(library.filter((item) => !isOwnPageContent(item)));
  const labs = library.filter(isVirtualExperiment).length;

  return (
    <main>
      <section className="rx-section" style={{ paddingTop: 28, paddingBottom: 48 }}>
        <div className="rx-container">
          <header style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "8px 32px" }}>
            <div>
              <p className="rx-content-meta-type" style={{ margin: "0 0 6px" }}>Explore</p>
              <h1 style={{ margin: 0 }}>
                Explore <span style={{ color: "var(--rx-blue)" }}>STEM</span> Experiences
              </h1>
            </div>
            <p style={{ margin: 0, maxWidth: 520, color: "var(--rx-text-muted)", fontSize: 15, lineHeight: 1.5 }}>
              Short hands-on challenges, grouped by learning path, subject or format, each one listed from easiest to hardest.
            </p>
          </header>

          <Link
            href="/explore/virtual-lab"
            style={{
              display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10,
              margin: "16px 0 0", padding: "12px 16px", borderRadius: 14, textDecoration: "none",
              background: "linear-gradient(90deg, #0b3a73, #0f6fde)", color: "#fff",
              boxShadow: "0 8px 24px rgba(15, 111, 222, 0.25)",
            }}
          >
            <span>
              <strong style={{ display: "block", fontSize: 15 }}>Looking for physics, chemistry or biology labs?</strong>
              <span style={{ fontSize: 13, opacity: 0.9 }}>{labs} advanced virtual labs, with tasks and practice questions, have their own page.</span>
            </span>
            <span style={{ fontWeight: 700, fontSize: 13, background: "#fff", color: "#0b3a73", borderRadius: 999, padding: "7px 14px", whiteSpace: "nowrap" }}>
              Open Virtual Labs →
            </span>
          </Link>

          <p style={{ margin: "10px 0 0", fontSize: 13.5, color: "var(--rx-text-muted)" }}>
            Looking for something else?{" "}
            <Link href="/explore/stem-games" style={{ color: "var(--rx-blue)", fontWeight: 700 }}>STEM Games</Link>
            {" · "}
            <Link href="/explore/stem-quizzes" style={{ color: "var(--rx-blue)", fontWeight: 700 }}>STEM Quizzes</Link>
          </p>

          <ExperienceExplorer items={items} />
        </div>
      </section>
    </main>
  );
}
