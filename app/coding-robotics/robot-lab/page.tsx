import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import InteractiveRuntimeWorkspace from "@/app/components/interactive/InteractiveRuntimeWorkspace";
import { ExperienceNavProvider } from "@/app/components/interactive/shared/ExperienceNavContext";
import { getInteractiveExperienceBySlug } from "@/lib/interactive-experiences";

import styles from "./studio.module.css";

const SLUG = "rhinobot-programming-lab";

export async function generateMetadata(): Promise<Metadata> {
  const experience = getInteractiveExperienceBySlug(SLUG);
  return {
    title: "RhinoBot: Robot Programming Lab | Rhinox Scientifica",
    description: experience?.description,
  };
}

// The Robot Lab studio: the lab itself under a slim title bar, with the long
// introduction folded away so the workspace is what you see first.
export default function RobotLabStudioPage() {
  const experience = getInteractiveExperienceBySlug(SLUG);
  if (!experience) notFound();

  return (
    <main className={styles.page}>
      <div className={`rx-container ${styles.wrap}`}>
        <header className={styles.bar}>
          <nav className={styles.crumbs} aria-label="Breadcrumb">
            <Link href="/coding-robotics">RhinoCode</Link>
            <span aria-hidden="true">/</span>
            <h1>{experience.title}</h1>
          </nav>
          <div className={styles.links}>
            <Link href="/coding-robotics/my-projects">My Projects</Link>
            <Link href="/coding-robotics/challenges">Game Challenges</Link>
          </div>
        </header>

        <details className={styles.about}>
          <summary>About this lab</summary>
          <p>{experience.description}</p>
          <div className={styles.cols}>
            {experience.learningObjectives && experience.learningObjectives.length > 0 && (
              <div>
                <h2>You will learn to</h2>
                <ul>
                  {experience.learningObjectives.map((objective) => (
                    <li key={objective}>{objective}</li>
                  ))}
                </ul>
              </div>
            )}
            {experience.skills && experience.skills.length > 0 && (
              <div>
                <h2>Skills you will build</h2>
                <ul className={styles.chips}>
                  {experience.skills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </details>

        <section className={styles.lab} aria-label="Robot programming lab">
          <ExperienceNavProvider
            library={{ href: "/coding-robotics", label: "RhinoCode", noun: "studio" }}
            previous={null}
            next={null}
          >
            <InteractiveRuntimeWorkspace experience={experience} />
          </ExperienceNavProvider>
        </section>
      </div>
    </main>
  );
}
