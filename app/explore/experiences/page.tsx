import Link from "next/link";

import ExploreHero from "@/app/components/ExploreHero";
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
      <ExploreHero
        image="/images/journey/journey-robotics.jpg"
        alt="Learners building a small project together"
        eyebrow="Explore · STEM Experiences"
        lineOne="Learn by doing."
        lineTwo="One task at a time."
        lead="Hands-on challenges, grouped by learning path, subject or format, each listed from easiest to hardest."
        actions={[{ label: "Start exploring", href: "#experiences" }, { label: "Virtual labs", href: "/explore/virtual-lab", secondary: true }]}
        stats={[{ value: String(items.length), label: "experiences" }, { label: "Easiest to hardest" }, { label: "Plays in your browser" }]}
        align="right"
        tone="amber"
      />
      <section id="experiences" className="rx-section" style={{ paddingTop: 20, paddingBottom: 48, scrollMarginTop: 80 }}>
        <div className="rx-container">
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
