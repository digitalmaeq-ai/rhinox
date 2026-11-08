import type { Metadata } from "next";
import Link from "next/link";

import Breadcrumbs from "../../components/Breadcrumbs";
import ExploreHero from "../../components/ExploreHero";
import styles from "./pathway.module.css";

export const metadata: Metadata = {
  title: "Coding & Robotics for Schools | Rhinox Scientifica",
  description: "A coding and robotics pathway for schools, from screen-free Nursery play to Python, Arduino and web projects in the browser.",
};

const STAGES = [
  {
    level: "Nursery",
    title: "Think • Move • Code!",
    text: "Screen-free lessons where children move, play and give instructions to Ayo, the programme guide. Thinking in steps comes first, before any keyboard.",
    skills: ["Sequencing", "Directions", "Patterns", "Teamwork"],
    links: [{ label: "Open the Nursery 1 programme", href: "/think-move-code/nursery-1" }],
  },
  {
    level: "Primary",
    title: "Robots and games",
    text: "Learners snap blocks together to drive the RhinoBot, take on game challenges and build a game of their own.",
    skills: ["Block coding", "Loops", "Conditions", "Problem solving"],
    links: [
      { label: "Robot Lab", href: "/coding-robotics/robot-lab" },
      { label: "Game Challenges", href: "/coding-robotics/challenges" },
      { label: "Game Creator", href: "/coding-robotics/game-creator" },
    ],
  },
  {
    level: "Secondary",
    title: "Real code in Rhinox Code Studio",
    text: "Older learners write Python, program Arduino circuits and build web pages, all in the browser with nothing to install.",
    skills: ["Python", "Arduino", "HTML, CSS and JavaScript", "Projects"],
    links: [
      { label: "Python workspace", href: "/coding-robotics/code-studio/workspace" },
      { label: "Arduino", href: "/coding-robotics/code-studio/arduino" },
      { label: "Web studio", href: "/coding-robotics/code-studio/web" },
    ],
  },
];

const NEEDS = [
  { title: "Runs in the browser", text: "Any laptop, tablet or lab computer with internet. No software to install." },
  { title: "Learners keep their work", text: "My Projects stores what each learner builds." },
  { title: "Teachers are supported", text: "Training and guides help staff lead lessons with confidence." },
];

export default function Page() {
  return (
    <main className={styles.page}>
      <div className={`rx-container ${styles.crumbs}`}>
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Schools & Institutions", href: "/schools" }, { label: "Coding & Robotics" }]} />
      </div>

      <ExploreHero
        image="/images/hero/coding.jpg"
        alt="Lines of code on a screen"
        imagePosition="30% 50%"
        eyebrow="Coding & Robotics for schools"
        lineOne="A coding pathway"
        lineTwo="that climbs with your learners."
        lead="Each stage builds on the last, so a child who starts with movement games can finish school writing real programs."
        actions={[{ label: "See the pathway", href: "#pathway" }, { label: "Request a quote", href: "/schools/request-a-quote", secondary: true }]}
        panel={{ image: "/images/play/experience-rhinobot-programming-lab.jpg", alt: "The RhinoBot Robot Lab, where learners program a robot with blocks", label: "RhinoBot Robot Lab", href: "/coding-robotics/robot-lab" }}
        align="right"
        tone="amber"
      />

      <section id="pathway" className={styles.stairs} aria-label="The coding pathway" style={{ scrollMarginTop: 80 }}>
        <div className={`rx-container ${styles.stairsInner}`}>
          <ol>
            {STAGES.map((s, i) => (
              <li key={s.level} className={styles[`step${i + 1}`]}>
                <div className={styles.card}>
                  <span className={styles.level}>Step {i + 1} · {s.level}</span>
                  <h2>{s.title}</h2>
                  <p>{s.text}</p>
                  <ul className={styles.skills} aria-label="Skills">
                    {s.skills.map((k) => <li key={k}>{k}</li>)}
                  </ul>
                  <div className={styles.links}>
                    {s.links.map((l) => <Link key={l.href} href={l.href}>{l.label} →</Link>)}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.needs} aria-label="What your school needs">
        <div className={`rx-container ${styles.needsInner}`}>
          {NEEDS.map((n) => (
            <div key={n.title}><h3>{n.title}</h3><p>{n.text}</p></div>
          ))}
        </div>
      </section>

      <section className={styles.cta}>
        <div className={`rx-container ${styles.ctaInner}`}>
          <p>Planning coding or robotics for your school? Tell us the age groups and equipment you have.</p>
          <Link href="/schools/request-a-quote" className="rx-button rx-button-primary">Request a quote</Link>
        </div>
      </section>
    </main>
  );
}
