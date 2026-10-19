import type { Metadata } from "next";

import HubShowcase, { type ShowcaseItem } from "../components/hub/HubShowcase";
import { HubClosing, HubHero, HubSectionHead, HubSteps } from "../components/hub/HubParts";
import styles from "../components/hub/hub.module.css";

export const metadata: Metadata = {
  title: "Schools & Institutions | Rhinox Scientifica",
  description:
    "STEM education, laboratory solutions, coding and robotics programmes, teacher training and quotations for schools and institutions.",
};

const items: ShowcaseItem[] = [
  {
    title: "STEM School Solutions",
    text: "Practical STEM programmes and learning solutions.",
    href: "/schools/stem-school-solutions",
    image: "/images/hero/classroom.jpg",
    alt: "Learners working together at a classroom table",
    tag: "Programmes",
  },
  {
    title: "Laboratory Solutions",
    text: "Laboratory planning, supply and development.",
    href: "/schools/laboratory-solutions",
    image: "/images/hero/stem-lab.jpg",
    alt: "A bright, modern school laboratory",
    tag: "Laboratories",
  },
  {
    title: "Coding & Robotics",
    text: "Coding and robotics programmes for institutions.",
    href: "/schools/coding-robotics",
    image: "/images/journey/journey-robotics.jpg",
    alt: "Young people building a robotics project",
    tag: "Training",
  },
  {
    title: "STEM Clubs",
    text: "Hands-on school clubs. Express interest in the pilot.",
    href: "/schools/stem-clubs",
    image: "/images/journey/journey-science.jpg",
    alt: "Learners carrying out a science activity",
    tag: "Pilot",
  },
  {
    title: "Teacher Training",
    text: "Practical professional development for educators.",
    href: "/schools/teacher-training",
    image: "/images/journey/journey-pexels.jpg",
    alt: "Students and a teacher working at laboratory apparatus",
    tag: "Educators",
  },
];

const steps = [
  { title: "Consult", text: "We learn about your learners, space and goals." },
  { title: "Plan", text: "We shape a practical programme or laboratory plan." },
  { title: "Deliver", text: "Training, equipment and resources are put in place." },
  { title: "Support", text: "We stay close so the programme keeps working." },
];

export default function SchoolsPage() {
  return (
    <main style={{ background: "var(--rx-white)" }}>
      <HubHero
        eyebrow="Schools & institutions"
        lineOne="STEM solutions for"
        lineTwo="schools & institutions."
        lead="Rhinox supports schools and institutions with STEM education, laboratory solutions, coding, robotics, teacher training and practical programmes."
        actions={[
          { label: "Request a quote", href: "/schools/request-a-quote" },
          { label: "Talk to us", href: "/contact", secondary: true },
        ]}
        image="/images/hero/stem-lab.jpg"
        alt="A modern school laboratory"
        chips={["Laboratories", "Coding & robotics", "Teacher training"]}
      />

      <section className={styles.showcaseSection}>
        <div className="rx-container">
          <HubSectionHead eyebrow="What we offer" lineOne="One partner for the whole" lineTwo="STEM programme." />
          <HubShowcase items={items} />
        </div>
      </section>

      <section className={styles.stepsSection}>
        <div className="rx-container">
          <HubSectionHead eyebrow="How we work" lineOne="From first conversation" lineTwo="to a working programme." />
          <HubSteps steps={steps} />
        </div>
      </section>

      <HubClosing
        kicker="Ready to start?"
        lineOne="Tell us what your"
        lineTwo="institution needs."
        lead="Share your requirements and the Rhinox team will come back with a clear, practical proposal."
        actions={[
          { label: "Request a quote", href: "/schools/request-a-quote" },
          { label: "Contact Rhinox", href: "/contact", secondary: true },
        ]}
        image="/images/hero/classroom.jpg"
      />
    </main>
  );
}
