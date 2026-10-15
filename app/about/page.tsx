import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "About | Rhinox Scientifica",
  description:
    "Rhinox Scientifica brings together STEM education, coding and robotics training, laboratory solutions, books and practical learning experiences.",
};

const offerings = [
  {
    title: "STEM education & books",
    text: "Curriculum-aligned books and learning resources, including the Think, Move, Code! series, that turn ideas into practice.",
    icon: "M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3ZM5 17a3 3 0 0 1 3-3h10M9 8h5",
  },
  {
    title: "Coding & robotics training",
    text: "Hands-on classes and clubs that take learners from computational thinking to building and programming real robots.",
    icon: "m8 7-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16",
  },
  {
    title: "Laboratory solutions",
    text: "Laboratory design, equipment and supply for schools and institutions that want practical science done properly.",
    icon: "M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3M7.5 14h9",
  },
  {
    title: "Kits & equipment",
    text: "Practical kits and scientific tools that make experiments, electronics and engineering projects easy to run.",
    icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1",
  },
  {
    title: "Interactive experiences",
    text: "Games, challenges and virtual labs on this site that let learners practise science, maths and coding at their own pace.",
    icon: "M13 2 4 14h7l-1 8 9-12h-7Z",
  },
  {
    title: "School partnerships",
    text: "Teacher training, workshops and long-term support so schools can build STEM programmes that last.",
    icon: "M3 9l9-5 9 5-9 5Zm4 3v5c0 1.5 2.2 3 5 3s5-1.5 5-3v-5",
  },
];

const approach = [
  { word: "Think", text: "Understand the idea and ask why it works." },
  { word: "Move", text: "Learn by doing, with hands, tools and movement." },
  { word: "Code", text: "Give instructions and see them come alive." },
  { word: "Build", text: "Turn knowledge into working solutions." },
  { word: "Create", text: "Make something new with confidence." },
];

export default function AboutPage() {
  return (
    <main className={styles.page}>
      {/* ---------- Hero ---------- */}
      <section className={styles.hero}>
        <div className={styles.heroBackdrop} aria-hidden="true" />

        <div className={`rx-container ${styles.heroInner}`}>
          <div className={styles.heroMain}>
            <p className={`rx-eyebrow ${styles.eyebrow}`}>About Rhinox Scientifica</p>

            <h1 className={styles.heroTitle}>
              <span>Science made practical,</span>
              <span className={styles.muted}>learning made real.</span>
            </h1>

            <p className={styles.heroLead}>
              Rhinox Scientifica brings together scientific equipment,
              laboratory solutions, STEM and STEAM education, books, kits,
              training and practical experiences for learners, schools,
              institutions and professionals.
            </p>

            <div className={styles.heroActions}>
              <Link href="/about/mission" className="rx-button rx-button-primary">
                Our mission
              </Link>
              <Link href="/explore" className="rx-button rx-button-secondary">
                Explore Rhinox
              </Link>
            </div>
          </div>

          <aside className={styles.heroCard}>
            <p className={styles.heroCardTop}>
              <span className={styles.dot} aria-hidden="true" />
              What we stand for
            </p>
            <div className={styles.heroCardBody}>
              <span className={styles.badge}>R</span>
              <h2 className={styles.heroCardTitle}>
                <span>Think. Move. Code.</span>
                <span className={styles.muted}>Build. Create.</span>
              </h2>
              <p>
                Rhinox helps learners understand ideas, apply knowledge, build
                solutions and create with confidence.
              </p>
            </div>
            <p className={styles.heroCardFoot}>
              <span />
              Lagos, Nigeria
            </p>
          </aside>
        </div>

        <p className={styles.heroStrip}>
          <span />
          Discover • Learn • Practise • Build • Create
          <span />
        </p>
      </section>

      {/* ---------- Who we are ---------- */}
      <section className={styles.story}>
        <div className={`rx-container ${styles.storyInner}`}>
          <div className={styles.storyMedia}>
            <Image
              src="/images/hero/classroom.jpg"
              alt="Learners working together in a Rhinox classroom"
              fill
              sizes="(max-width: 1024px) 100vw, 560px"
              style={{ objectFit: "cover" }}
            />
            <p className={styles.mediaTag}>Learning by doing</p>
          </div>

          <div>
            <p className={`rx-eyebrow ${styles.eyebrow}`}>Who we are</p>
            <h2 className={styles.sectionTitle}>
              <span>A practical home for</span>
              <span className={styles.muted}>STEM learning.</span>
            </h2>
            <p className={styles.bodyText}>
              Rhinox Scientifica is a Lagos-based STEM company. We make
              science, technology, engineering and mathematics easier to
              understand by pairing good teaching with the right tools: books
              that explain, equipment that works and experiences that let
              learners try things for themselves.
            </p>
            <p className={styles.bodyText}>
              Whether we are training a coding club, equipping a laboratory or
              publishing a new book, the aim is the same: help people move
              from knowing about an idea to using it.
            </p>
            <Link href="/about/mission" className={styles.textLink}>
              Read our mission
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 12h15M14 7l5 5-5 5" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- What we do ---------- */}
      <section className={styles.offer}>
        <div className="rx-container">
          <div className={styles.sectionHead}>
            <p className={`rx-eyebrow ${styles.eyebrow}`}>What we do</p>
            <h2 className={styles.sectionTitle}>
              <span>Everything a learner needs,</span>
              <span className={styles.muted}>in one place.</span>
            </h2>
          </div>

          <ul className={styles.offerGrid}>
            {offerings.map((item) => (
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

      {/* ---------- Approach ---------- */}
      <section className={styles.approach}>
        <div className="rx-container">
          <div className={styles.sectionHead}>
            <p className={`rx-eyebrow ${styles.eyebrow}`}>How we teach</p>
            <h2 className={styles.sectionTitle}>
              <span>Five steps from curiosity</span>
              <span className={styles.muted}>to creation.</span>
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

      {/* ---------- Closing call to action ---------- */}
      <section className={styles.closing}>
        <div className="rx-container">
          <div className={styles.closingCard}>
            <p className={styles.closingKicker}>
              <span />
              Work with us
              <span />
            </p>
            <h2 className={styles.closingTitle}>
              <span>Let&apos;s shape the</span>
              <span className={styles.muted}>future of learning.</span>
            </h2>
            <p className={styles.closingLead}>
              Tell us what your learners need and we will help you build the
              right STEM path, from curriculum and training to laboratories.
            </p>
            <div className={styles.closingActions}>
              <Link href="/contact" className="rx-button rx-button-primary">
                Contact Rhinox
              </Link>
              <Link href="/about/support" className="rx-button rx-button-secondary">
                Get support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
