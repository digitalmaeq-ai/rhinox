import type { Metadata } from "next";
import Link from "next/link";

import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Our Mission | Rhinox Scientifica",
  description:
    "Our mission is to make science, technology and practical creativity more accessible through meaningful learning, useful tools and real world experiences.",
};

const commitments = [
  {
    title: "Accessible",
    text: "Science and technology should feel within reach. We explain ideas clearly and start from where the learner is.",
    icon: "M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21ZM12 7v5l3 2",
  },
  {
    title: "Practical",
    text: "Learners understand more when they do. Every book, kit and experience is built around hands-on practice.",
    icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1",
  },
  {
    title: "Meaningful",
    text: "Content connects to the classroom and to the real world, so what is learned can be used.",
    icon: "M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3ZM5 17a3 3 0 0 1 3-3h10M9 8h5",
  },
];

const approach = [
  { word: "Think", text: "Understand the idea and ask why it works." },
  { word: "Move", text: "Learn by doing, with hands, tools and movement." },
  { word: "Code", text: "Give instructions and see them come alive." },
  { word: "Build", text: "Turn knowledge into working solutions." },
  { word: "Create", text: "Make something new with confidence." },
];

const audiences = [
  { title: "Learners", text: "Books, games and challenges that make STEM enjoyable and clear." },
  { title: "Schools & institutions", text: "Laboratories, equipment, training and programmes that last." },
  { title: "Teachers & parents", text: "Resources and guidance to support learning in class and at home." },
];

export default function MissionPage() {
  return (
    <main className={styles.page}>
      <section className={`${styles.hero} ${styles.heroTight}`}>
        <div className={styles.heroBackdrop} aria-hidden="true" />
        <div className={`rx-container ${styles.heroInner}`}>
          <div className={styles.heroMain}>
            <p className={`rx-eyebrow ${styles.eyebrow}`}>Our mission</p>
            <h1 className={styles.heroTitle}>
              <span>Making STEM accessible,</span>
              <span className={styles.muted}>practical and creative.</span>
            </h1>
            <p className={styles.heroLead}>
              The purpose behind Rhinox Scientifica: helping more people
              understand science and technology, and use it to build things
              that matter.
            </p>
            <div className={styles.heroActions}>
              <Link href="/explore" className="rx-button rx-button-primary">
                Explore Rhinox
              </Link>
              <Link href="/about" className="rx-button rx-button-secondary">
                About Rhinox
              </Link>
            </div>
          </div>

          <aside className={styles.heroCard}>
            <p className={styles.heroCardTop}>
              <span className={styles.dot} aria-hidden="true" />
              In one line
            </p>
            <div className={styles.heroCardBody}>
              <span className={styles.badge}>R</span>
              <h2 className={styles.heroCardTitle}>
                <span>Think. Move. Code.</span>
                <span className={styles.muted}>Build. Create.</span>
              </h2>
              <p>
                Learners understand ideas, apply knowledge, build solutions and
                create with confidence.
              </p>
            </div>
            <p className={styles.heroCardFoot}>
              <span />
              Rhinox Scientifica
            </p>
          </aside>
        </div>
      </section>

      <section className={styles.story}>
        <div className="rx-container">
          <div className={styles.sectionHead}>
            <p className={`rx-eyebrow ${styles.eyebrow}`}>Why we exist</p>
            <h2 className={styles.sectionTitle}>
              <span>Our mission</span>
              <span className={styles.muted}>in our own words.</span>
            </h2>
          </div>
          <blockquote className={styles.statement}>
            To make <em>science, technology and practical creativity</em> more
            accessible through <em>meaningful learning</em>, useful tools and{" "}
            <em>real world experiences</em>.
          </blockquote>
        </div>
      </section>

      <section className={styles.offer}>
        <div className="rx-container">
          <div className={styles.sectionHead}>
            <p className={`rx-eyebrow ${styles.eyebrow}`}>What guides us</p>
            <h2 className={styles.sectionTitle}>
              <span>Three commitments in</span>
              <span className={styles.muted}>everything we make.</span>
            </h2>
          </div>
          <ul className={styles.pillGrid}>
            {commitments.map((item) => (
              <li key={item.title} className={styles.offerCard}>
                <span className={styles.offerIcon} aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon} />
                  </svg>
                </span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.approach}>
        <div className="rx-container">
          <div className={styles.sectionHead}>
            <p className={`rx-eyebrow ${styles.eyebrow}`}>How we do it</p>
            <h2 className={styles.sectionTitle}>
              <span>Think, Move, Code,</span>
              <span className={styles.muted}>Build, Create.</span>
            </h2>
          </div>
          <ol className={styles.steps}>
            {approach.map((step, index) => (
              <li key={step.word} className={styles.step}>
                <span className={styles.stepNo}>{String(index + 1).padStart(2, "0")}</span>
                <h3>{step.word}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.offer}>
        <div className="rx-container">
          <div className={styles.sectionHead}>
            <p className={`rx-eyebrow ${styles.eyebrow}`}>Who we serve</p>
            <h2 className={styles.sectionTitle}>
              <span>Built for everyone</span>
              <span className={styles.muted}>who learns and teaches.</span>
            </h2>
          </div>
          <ul className={styles.pillGrid}>
            {audiences.map((item) => (
              <li key={item.title} className={styles.offerCard}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.closing}>
        <div className="rx-container">
          <div className={styles.closingCard}>
            <p className={styles.closingKicker}><span />Join the mission<span /></p>
            <h2 className={styles.closingTitle}>
              <span>Let&apos;s shape the</span>
              <span className={styles.muted}>future of learning.</span>
            </h2>
            <p className={styles.closingLead}>
              Partner with Rhinox for books, training, equipment or a full STEM
              programme for your school.
            </p>
            <div className={styles.closingActions}>
              <Link href="/contact" className="rx-button rx-button-primary">Contact Rhinox</Link>
              <Link href="/about/support" className="rx-button rx-button-secondary">Get support</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
