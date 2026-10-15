import type { Metadata } from "next";

import HubShowcase, { type ShowcaseItem } from "../components/hub/HubShowcase";
import { HubClosing, HubFeature, HubHero, HubSectionHead } from "../components/hub/HubParts";
import styles from "../components/hub/hub.module.css";

export const metadata: Metadata = {
  title: "Resources | Rhinox Scientifica",
  description:
    "Articles, videos, free downloads, learning materials, badges and certificates from Rhinox Scientifica.",
};

const items: ShowcaseItem[] = [
  {
    title: "Articles",
    text: "STEM articles and educational insights.",
    href: "/resources/articles",
    image: "/images/journey/journey-science.jpg",
    alt: "A teacher and a young learner at a chalkboard of equations",
    tag: "Read",
  },
  {
    title: "Videos",
    text: "Educational and companion videos.",
    href: "/resources/videos",
    image: "/images/journey/journey-unsplash.jpg",
    alt: "A student looking through a microscope",
    tag: "Watch",
  },
  {
    title: "Free Downloads",
    text: "Printable and downloadable learning resources.",
    href: "/resources/free-downloads",
    image: "/images/hero/classroom.jpg",
    alt: "Learners studying together in a classroom",
    tag: "Download",
  },
  {
    title: "My Rhinox Library",
    text: "A personal space to collect resources, projects and progress.",
    href: "/resources/my-rhinox-library",
    image: "/images/journey/journey-pexels.jpg",
    alt: "Students working at a laboratory bench",
    tag: "Coming soon",
  },
];

export default function ResourcesPage() {
  return (
    <main style={{ background: "var(--rx-white)" }}>
      <HubHero
        eyebrow="Rhinox resources"
        lineOne="Keep learning"
        lineTwo="beyond the classroom."
        lead="Access articles, videos, downloads, learning materials, badges and certificates, all in one place."
        actions={[
          { label: "Free downloads", href: "/resources/free-downloads" },
          { label: "Read articles", href: "/resources/articles", secondary: true },
        ]}
        image="/images/journey/journey-science.jpg"
        alt="A teacher and a young learner in a science lesson"
        chips={["Articles", "Videos", "Downloads", "Certificates"]}
      />

      <section className={styles.showcaseSection}>
        <div className="rx-container">
          <HubSectionHead eyebrow="Browse resources" lineOne="Read, watch, download" lineTwo="and keep." />
          <HubShowcase items={items} />
        </div>
      </section>

      <HubFeature
        eyebrow="Learn by doing"
        lineOne="Practise with interactive"
        lineTwo="experiences."
        text="Games, challenges and virtual labs that let learners try science, maths and coding for themselves, then pick another and keep going."
        action={{ label: "Open the experience library", href: "/explore/experiences" }}
        image="/images/hero/coding.jpg"
        alt="Code on a screen"
      />

      <HubClosing
        kicker="Can't find it?"
        lineOne="Ask the Rhinox team"
        lineTwo="for what you need."
        lead="Looking for a particular worksheet, guide or video? Tell us and we will point you in the right direction."
        actions={[
          { label: "Contact Rhinox", href: "/contact" },
          { label: "Get support", href: "/about/support", secondary: true },
        ]}
        image="/images/journey/journey-pixabay.jpg"
      />
    </main>
  );
}
