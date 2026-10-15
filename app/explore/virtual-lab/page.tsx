import Link from "next/link";

import ExperienceExplorer from "@/app/components/ExperienceExplorer";
import { getExperienceSequence } from "@/lib/experience-sequence";
import { isVirtualExperiment, toMatrixItems } from "@/lib/explore-experience-items";

const SUBJECT_ORDER = ["physics", "chemistry", "biology", "earth-and-space", "engineering"];

const SUBJECT_NOTES: Record<string, string> = {
  physics: "Circuits, motion and forces",
  chemistry: "Titration, electrolysis, acids and bases",
  biology: "Photosynthesis, food tests and circulation",
  "earth-and-space": "Moon phases, rivers and the Earth",
  engineering: "Gears, bridges and solar energy",
};

export default function VirtualLabsPage() {
  const items = toMatrixItems(getExperienceSequence().filter(isVirtualExperiment));

  return (
    <main>
      <section className="rx-section" style={{ paddingTop: 28, paddingBottom: 48 }}>
        <div className="rx-container">
          <header style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "8px 32px" }}>
            <div>
              <p className="rx-content-meta-type" style={{ margin: "0 0 6px" }}>Explore · Virtual Labs</p>
              <h1 style={{ margin: 0 }}>
                <span style={{ color: "var(--rx-blue)" }}>Virtual</span> Labs
              </h1>
            </div>
            <p style={{ margin: 0, maxWidth: 560, color: "var(--rx-text-muted)", fontSize: 15, lineHeight: 1.5 }}>
              Advanced science practicals for the secondary classroom. Run the practical, record results, work through the tasks and test yourself, grouped by subject.
            </p>
          </header>

          <p style={{ margin: "10px 0 0", fontSize: 13.5 }}>
            Looking for games, puzzles and early science?{" "}
            <Link href="/explore/experiences" style={{ color: "var(--rx-blue)", fontWeight: 700 }}>Explore STEM Experiences →</Link>
          </p>

          <ExperienceExplorer
            items={items}
            modes={["subject", "path"]}
            noun="virtual labs"
            cta="Open lab"
            subjectOrder={SUBJECT_ORDER}
            subjectNotes={SUBJECT_NOTES}
          />
        </div>
      </section>
    </main>
  );
}
