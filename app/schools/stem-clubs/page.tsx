import type { Metadata } from "next";


import Breadcrumbs from "../../components/Breadcrumbs";
import ExploreHero from "../../components/ExploreHero";
import StemClubsForm from "./StemClubsForm";
import styles from "./clubs.module.css";

export const metadata: Metadata = {
  title: "Rhinox STEM Clubs | Rhinox Scientifica",
  description:
    "Rhinox STEM Clubs bring hands-on science, coding, robotics and engineering to schools, with inter-school challenges under development. Express interest in the pilot.",
};

const gains = [
  { title: "Hands-on learning", text: "Learners investigate, build and test ideas instead of only reading about them." },
  { title: "A club that fits the school", text: "Run by an adult coordinator, with activities suited to your learners and resources." },
  { title: "Connection beyond the school", text: "Opportunities to share work with other schools through inter-school challenges." },
];

const divisions = [
  { title: "Primary", text: "Curiosity-led activities that introduce learners to science, making and simple coding." },
  { title: "Junior Secondary", text: "Projects that build practical skills in investigation, design and problem solving." },
  { title: "Senior Secondary", text: "Deeper engineering, coding and innovation work that connects to further study." },
];

const activities = [
  "Science experiments",
  "Coding",
  "Robotics",
  "Engineering design",
  "STEM quizzes",
  "Innovation projects",
  "Sustainability",
];

const steps = [
  { title: "Express interest", text: "A school coordinator completes the short form below." },
  { title: "We get in touch", text: "Rhinox contacts the school to talk through the pilot." },
  { title: "Shape the pilot", text: "Details are agreed with participating schools as the pilot is planned." },
];

const faqs = [
  {
    q: "What is a Rhinox STEM Club?",
    a: "A school club where learners take part in practical science, technology, engineering and mathematics activities, led by an adult at the school.",
  },
  {
    q: "Which schools can take part?",
    a: "The pilot is intended for a small group of schools, between five and ten, in a single area. Primary, Junior Secondary and Senior Secondary schools can express interest.",
  },
  {
    q: "Where and when will the pilot run?",
    a: "The area and timing have not been decided. We will share them directly with schools that express interest.",
  },
  {
    q: "What does it cost?",
    a: "Costs have not been decided. Expressing interest does not commit your school to anything.",
  },
  {
    q: "What are the inter-school challenges?",
    a: "Inter-school challenges are a programme area under development. Categories, formats and any events have not been confirmed.",
  },
  {
    q: "What information do you collect?",
    a: "Only school and adult coordinator details. Please do not send learner names, dates of birth, home addresses, personal phone numbers or photographs.",
  },
  {
    q: "What happens when I submit the form?",
    a: "The form opens your email app with the details already written out. Your interest is registered once you press send. If your device has no email app, write to us using the address on the Contact page.",
  },
];

const STATUS = [
  { label: "Intended", text: "A pilot with five to ten schools in a single area.", state: "yes" },
  { label: "Open now", text: "Schools can express interest. It commits you to nothing.", state: "yes" },
  { label: "Not decided", text: "Area, timing and costs. We share these with interested schools first.", state: "no" },
  { label: "Not confirmed", text: "Inter-school challenge categories, events, dates, venues and prizes.", state: "no" },
];

export default function StemClubsPage() {
  return (
    <main className={styles.page}>
      <div className={`rx-container ${styles.crumbs}`}>
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Schools & Institutions", href: "/schools" }, { label: "STEM Clubs" }]} />
      </div>

      <ExploreHero
        image="/images/journey/journey-robotics.jpg"
        alt="Young people building a robotics project together"
        eyebrow="Rhinox STEM Clubs · Pilot"
        lineOne="Hands-on STEM clubs"
        lineTwo="for schools."
        lead="Rhinox STEM Clubs help schools run practical science, coding, robotics and engineering activities, with inter-school challenges being developed. We are now inviting schools to express interest in a pilot."
        actions={[{ label: "Express interest", href: "#interest-form" }, { label: "Talk to us", href: "/contact", secondary: true }]}
        aside={
            <section className={styles.board} aria-labelledby="board-title">
          <h2 id="board-title">Where the pilot stands</h2>
          <ul>
            {STATUS.map((s) => (
              <li key={s.label}>
                <span className={`${styles.pill} ${s.state === "yes" ? styles.pillYes : styles.pillNo}`}>
                  <span aria-hidden="true">{s.state === "yes" ? "\u2713" : "?"}</span>{s.label}
                </span>
                <span>{s.text}</span>
              </li>
            ))}
          </ul>
        </section>
        }
        align="left"
        tone="sky"
      />

      <section className={styles.gains} aria-labelledby="gains-title">
        <div className={`rx-container ${styles.gainsInner}`}>
          <h2 id="gains-title" className={styles.h2}>What schools gain</h2>
          <div className={styles.gainRow}>
            {gains.map((g, i) => (
              <div key={g.title}><span className={styles.num}>{i + 1}</span><h3>{g.title}</h3><p>{g.text}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.inside} aria-labelledby="inside-title">
        <div className={`rx-container ${styles.insideInner}`}>
          <div>
            <h2 id="inside-title" className={styles.h2}>Inside the school, all year</h2>
            <p>
              Each club meets within the school, guided by an adult coordinator. Learners work in small teams on practical activities and share what they discover with their classmates.
            </p>
          </div>
          <ul className={styles.tiles}>
            {activities.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </div>
      </section>

      <section className={styles.divs} aria-labelledby="div-title">
        <div className={`rx-container ${styles.divsInner}`}>
          <h2 id="div-title" className={styles.h2}>A place for every age group</h2>
          <div className={styles.divGrid}>
            {divisions.map((d, i) => (
              <div key={d.title} className={styles[`div${i + 1}`]}><h3>{d.title}</h3><p>{d.text}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.between} aria-labelledby="between-title">
        <div className={`rx-container ${styles.betweenInner}`}>
          <h2 id="between-title">Inter-school challenges: under development</h2>
          <p>
            We are developing challenges and competitions in which clubs from different schools can take part. Competition categories are programme areas under development, and no events, dates, venues or prizes have been confirmed.
          </p>
        </div>
      </section>

      <section className={styles.join} id="interest-form">
        <div className={`rx-container ${styles.joinInner}`}>
          <aside className={styles.joinSide}>
            <h2 className={styles.h2}>Express interest in the pilot</h2>
            <p>We plan to work with five to ten schools in one area. Tell us about your school and we will be in touch.</p>
            <ol>
              {steps.map((s, i) => (
                <li key={s.title}><span className={styles.num}>{i + 1}</span><div><strong>{s.title}</strong><span>{s.text}</span></div></li>
              ))}
            </ol>
          </aside>
          <div className={styles.formPanel}>
            <StemClubsForm />
          </div>
        </div>
      </section>

      <section className={styles.faq} aria-labelledby="faq-title">
        <div className={`rx-container ${styles.faqInner}`}>
          <h2 id="faq-title" className={styles.h2}>Frequently asked questions</h2>
          <div>
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
