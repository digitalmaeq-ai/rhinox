import Link from "next/link";
import styles from "./home-statement.module.css";

// Band 1 of the homepage: one statement, two actions, the learning journey as a
// single line, and four quiet links into the main areas of the site.
// Server component: nothing here moves or needs client code.

const JOURNEY = [
  { label: "Discover", href: "/resources" },
  { label: "Learn", href: "/education" },
  { label: "Practise", href: "/explore" },
  { label: "Build", href: "/explore/project-lab" },
  { label: "Create", href: "/explore/stem-challenges" },
] as const;

const AREAS = [
  {
    title: "Science",
    text: "Scientific equipment, laboratory supplies and practical tools.",
    href: "/shop/laboratory-equipment",
  },
  {
    title: "Education",
    text: "STEM and STEAM learning, books and resources.",
    href: "/education",
  },
  {
    title: "Technology",
    text: "Coding, robotics and projects, from idea to creation.",
    href: "/coding-robotics",
  },
  {
    title: "Laboratory Solutions",
    text: "Design, equipment and supply for schools and institutions.",
    href: "/schools/laboratory-solutions",
  },
] as const;

export default function HomeStatement() {
  return (
    <section className={styles.band} aria-labelledby="home-statement-title">
      <div className="rx-container">
        <div className={styles.statement}>
          <p className={styles.eyebrow}>
            Science <span aria-hidden="true">•</span> Technology{" "}
            <span aria-hidden="true">•</span> Education{" "}
            <span aria-hidden="true">•</span> Innovation
          </p>

          <h1 id="home-statement-title" className={styles.title}>
            <span>Everything you need</span>
            <span className={styles.accent}>to learn, build and create.</span>
          </h1>

          <p className={styles.lead}>
            Scientific equipment, laboratory solutions, STEM and STEAM
            education, books, kits, technology and practical experiences for
            learners, families, schools and professionals.
          </p>

          <div className={styles.actions}>
            <Link href="/explore" className="rx-button rx-button-primary">
              <span>Explore Rhinox</span>
            </Link>
            <Link href="/shop" className="rx-button rx-button-secondary">
              <span>Shop &amp; Discover</span>
            </Link>
          </div>
        </div>

        <nav className={styles.journey} aria-label="The Rhinox learning journey">
          <ol className={styles.steps}>
            {JOURNEY.map((step, i) => (
              <li key={step.label} className={styles.step}>
                <Link href={step.href} className={styles.stepLink}>
                  <span className={styles.stepNum}>{i + 1}</span>
                  {step.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <ul className={styles.areas}>
          {AREAS.map((a) => (
            <li key={a.title}>
              <Link href={a.href} className={styles.area}>
                <span className={styles.areaTitle}>{a.title}</span>
                <span className={styles.areaText}>{a.text}</span>
                <span className={styles.areaGo} aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
