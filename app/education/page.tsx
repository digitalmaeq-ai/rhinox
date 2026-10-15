import type { Metadata } from "next";

import HubShowcase, { type ShowcaseItem } from "../components/hub/HubShowcase";
import { HubClosing, HubHero, HubHighlights, HubSectionHead } from "../components/hub/HubParts";
import styles from "../components/hub/hub.module.css";
import { getDestinationItems } from "@/lib/menu-destinations";

export const metadata: Metadata = {
  title: "Education | Rhinox Scientifica",
  description:
    "STEM and STEAM learning, Think, Move, Code!, books, coding and robotics, and resources for teachers and parents.",
};

function count(href: string): string | undefined {
  const n = getDestinationItems(href)?.length ?? 0;
  return n > 0 ? `${n} ${n === 1 ? "item" : "items"}` : undefined;
}

const items: ShowcaseItem[] = [
  {
    title: "STEM & STEAM Education",
    text: "Lessons, activities and hands-on experiences in science, mathematics, engineering and more.",
    href: "/education/stem-steam",
    image: "/images/journey/journey-science.jpg",
    alt: "A teacher and a young learner at a chalkboard of equations",
    tag: count("/education/stem-steam"),
  },
  {
    title: "Think • Move • Code",
    text: "The Think, Move, Code! book series and the coding and robotics activities that go with it.",
    href: "/education/think-move-code",
    image: "/images/hero/coding.jpg",
    alt: "Lines of code on a screen",
    tag: count("/education/think-move-code"),
  },
  {
    title: "Books",
    text: "Rhinox books, workbooks and activity books for practical learning.",
    href: "/education/books",
    image: "/images/hero/classroom.jpg",
    alt: "Learners reading a book beside a microscope",
    tag: count("/education/books"),
  },
  {
    title: "Coding & Robotics",
    text: "Coding, computational thinking and robotics projects and experiences.",
    href: "/education/coding-robotics",
    image: "/images/journey/journey-robotics.jpg",
    alt: "Young people building a robotics project together",
    tag: count("/education/coding-robotics"),
  },
  {
    title: "Teacher & Parent Resources",
    text: "Teaching guides, worksheets, assessments and ideas for learning at home.",
    href: "/education/teacher-parent-resources",
    image: "/images/hero/stem-lab.jpg",
    alt: "A bright STEM laboratory ready for a class",
    tag: count("/education/teacher-parent-resources"),
  },
];

const highlights = [
  {
    title: "Learn by doing",
    text: "Every topic has an interactive experience to try, not just a page to read.",
    icon: "M12 3v4M12 17v4M3 12h4M17 12h4M12 8l1.5 2.5L16 12l-2.5 1.5L12 16l-1.5-2.5L8 12l2.5-1.5Z",
  },
  {
    title: "Built for the classroom",
    text: "Aligned to what learners study, with notes, tasks and practice questions.",
    icon: "M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3ZM5 17a3 3 0 0 1 3-3h10M9 8h5",
  },
  {
    title: "Support for adults too",
    text: "Teacher guides and parent resources make it easy to help at school and at home.",
    icon: "M3 9l9-5 9 5-9 5Zm4 3v5c0 1.5 2.2 3 5 3s5-1.5 5-3v-5",
  },
];

export default function EducationPage() {
  return (
    <main style={{ background: "var(--rx-white)" }}>
      <HubHero
        eyebrow="Rhinox education"
        lineOne="Learning that"
        lineTwo="starts with doing."
        lead="Explore STEM and STEAM education, the Think, Move, Code! series, books, coding, robotics and resources for teachers and parents."
        actions={[
          { label: "Try an experience", href: "/explore/experiences" },
          { label: "Browse books", href: "/education/books", secondary: true },
        ]}
        image="/images/hero/classroom.jpg"
        alt="Learners working together in a bright classroom"
        chips={["STEM & STEAM", "Coding", "Robotics", "Books"]}
      />

      <section className={styles.showcaseSection}>
        <div className="rx-container">
          <HubSectionHead eyebrow="Explore education" lineOne="Choose where to" lineTwo="start." />
          <HubShowcase items={items} />
        </div>
      </section>

      <HubHighlights items={highlights} />

      <HubClosing
        kicker="Teaching a class?"
        lineOne="Let's help you"
        lineTwo="bring it to life."
        lead="Talk to us about training, kits and resources for your school."
        actions={[
          { label: "Teacher training", href: "/schools/teacher-training" },
          { label: "Contact Rhinox", href: "/contact", secondary: true },
        ]}
        image="/images/hero/stem-lab.jpg"
      />
    </main>
  );
}
