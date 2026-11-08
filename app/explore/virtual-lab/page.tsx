import ExploreHero from "@/app/components/ExploreHero";
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
      <ExploreHero
        image="/images/journey/journey-pixabay.jpg"
        alt="Blue liquid being poured in a laboratory"
        eyebrow="Explore · Virtual Labs"
        lineOne="Run the practical."
        lineTwo="Without the spills."
        lead="Advanced science practicals for the secondary classroom. Run the experiment, record results, work through the tasks and test yourself."
        actions={[{ label: "Open a lab", href: "#labs" }, { label: "Early science experiences", href: "/explore/experiences", secondary: true }]}
        stats={[{ value: String(items.length), label: "virtual labs" }, { value: String(SUBJECT_ORDER.length), label: "subjects" }, { label: "Tasks and practice questions" }]}
        align="center"
        tone="sky"
      />
      <section id="labs" className="rx-section" style={{ paddingTop: 20, paddingBottom: 48, scrollMarginTop: 80 }}>
        <div className="rx-container">
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
