import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getInteractiveExperienceBySlug,
} from "@/lib/interactive-experiences";

import {
  getExperienceHref,
  getExperienceNeighbours,
} from "@/lib/experience-sequence";

import InteractiveRuntimeWorkspace from "@/app/components/interactive/InteractiveRuntimeWorkspace";
import { ExperienceNavProvider } from "@/app/components/interactive/shared/ExperienceNavContext";

import styles from "./page.module.css";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ExperiencePage({
  params,
}: PageProps) {
  const { slug } = await params;

  const experience =
    getInteractiveExperienceBySlug(slug);

  if (!experience) {
    notFound();
  }

  // Easiest-first order, shared with the Experiences list.
  const neighbours = getExperienceNeighbours(experience.id);
  const isLab = ["virtual-lab", "simulation"].includes(experience.runtime as string);
  const library = isLab
    ? { href: "/explore/virtual-lab", label: "All virtual labs", noun: "virtual lab" }
    : { href: "/explore/experiences", label: "All experiences", noun: "experience" };

  return (
    <main>
      <section className={`rx-section ${styles.page}`}>
        <div className="rx-container">
          <header className={styles.hero}>
            <div className={styles.heroMain}>
              <p className="rx-content-meta-type">
                {isLab ? "Virtual Lab" : "Interactive Experience"}
                {neighbours && ` · ${neighbours.position} of ${neighbours.total}`}
              </p>

              <h1 className={styles.title}>{experience.title}</h1>

              <p className={styles.description}>{experience.description}</p>

              <ul className={styles.facts} aria-label={isLab ? "Lab details" : "Experience details"}>
                {experience.subjects?.map((subject) => (
                  <li key={subject}>{subject}</li>
                ))}
                {experience.difficulty && <li>{experience.difficulty}</li>}
                {experience.durationMinutes && (
                  <li>{experience.durationMinutes} minutes</li>
                )}
              </ul>

              <div className={styles.cta}>
                <a href="#experiment" className="rx-button rx-button-primary">
                  {isLab ? "Start the lab" : "Start the experiment"}
                </a>
                <a href="#about" className="rx-button rx-button-secondary">
                  What you will learn
                </a>
              </div>
            </div>

            <dl className={styles.glance} aria-label="At a glance">
              {experience.durationMinutes ? (
                <div>
                  <dt>Minutes</dt>
                  <dd>{experience.durationMinutes}</dd>
                </div>
              ) : null}
              {experience.tasks && experience.tasks.length > 0 && (
                <div>
                  <dt>Tasks</dt>
                  <dd>{experience.tasks.length}</dd>
                </div>
              )}
              {experience.learningObjectives &&
                experience.learningObjectives.length > 0 && (
                  <div>
                    <dt>Goals</dt>
                    <dd>{experience.learningObjectives.length}</dd>
                  </div>
                )}
              {experience.achievements && experience.achievements.length > 0 && (
                <div>
                  <dt>Badges</dt>
                  <dd>{experience.achievements.length}</dd>
                </div>
              )}
            </dl>
          </header>

          <section id="about" className={styles.about} aria-labelledby="about-heading">
            <header className={styles.aboutHead}>
              <div>
                <p className={styles.eyebrow}>About this experience</p>
                <h2 id="about-heading" className={styles.aboutTitle}>
                  What you will learn and do
                </h2>
              </div>

            </header>

            {((experience.learningObjectives &&
              experience.learningObjectives.length > 0) ||
              (experience.skills && experience.skills.length > 0)) && (
              <div className={styles.twoUp}>
                {experience.learningObjectives &&
                  experience.learningObjectives.length > 0 && (
                    <div className={styles.panel}>
                      <h3 className={styles.panelTitle}>
                        Learning objectives
                      </h3>
                      <ul className={styles.checks}>
                        {experience.learningObjectives.map((objective) => (
                          <li key={objective}>{objective}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                {experience.skills && experience.skills.length > 0 && (
                  <div className={styles.panel}>
                    <h3 className={styles.panelTitle}>Skills you will build</h3>
                    <ul className={styles.chips}>
                      {experience.skills.map((skill) => (
                        <li key={skill}>{skill}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {experience.scenes && experience.scenes.length > 0 && (
              <div className={styles.block}>
                <h3 className={styles.blockTitle}>Experience scenes</h3>
                <div className={styles.cards}>
                  {experience.scenes.map((scene, i) => (
                    <article key={scene.id} className={styles.card}>
                      <span className={styles.num}>{i + 1}</span>
                      <div>
                        <h4 className={styles.cardTitle}>{scene.title}</h4>
                        {scene.description && (
                          <p className={styles.cardText}>{scene.description}</p>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {!["virtual-lab", "simulation"].includes(experience.runtime as string) &&
              experience.questions &&
              experience.questions.length > 0 && (
                <div className={styles.block}>
                  <h3 className={styles.blockTitle}>Check your understanding</h3>
                  <div className={styles.cards}>
                    {experience.questions.map((question, i) => (
                      <article key={question.id} className={styles.card}>
                        <span className={styles.num}>{i + 1}</span>
                        <div>
                          <h4 className={styles.cardTitle}>{question.question}</h4>
                          {question.options && question.options.length > 0 && (
                            <ol className={styles.options}>
                              {question.options.map((option) => (
                                <li key={option.id}>{option.text}</li>
                              ))}
                            </ol>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

            {!(experience.tasks && experience.tasks.length > 0) &&
              experience.achievements &&
              experience.achievements.length > 0 && (
              <div className={styles.block}>
                <h3 className={styles.blockTitle}>Achievements to earn</h3>
                <div className={styles.cards}>
                  {experience.achievements.map((achievement) => (
                    <article key={achievement.id} className={`${styles.card} ${styles.award}`}>
                      <span className={styles.medal} aria-hidden="true">★</span>
                      <div>
                        <h4 className={styles.cardTitle}>{achievement.title}</h4>
                        <p className={styles.cardText}>{achievement.description}</p>
                        {achievement.points && (
                          <span className={styles.points}>
                            +{achievement.points} points
                          </span>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section id="experiment" className={styles.lab} aria-label={isLab ? "Virtual lab" : "Interactive experiment"}>
            <div className={styles.labBar}>
              <p className={styles.eyebrow}>{isLab ? "Interactive practical" : "Interactive experiment"}</p>
              <a href="#about" className={styles.back}>
                ↑ Back to overview
              </a>
            </div>
          <ExperienceNavProvider
            library={library}
            previous={
              neighbours?.previous
                ? {
                    title: neighbours.previous.title,
                    href: getExperienceHref(neighbours.previous),
                  }
                : null
            }
            next={
              neighbours?.next
                ? {
                    title: neighbours.next.title,
                    href: getExperienceHref(neighbours.next),
                  }
                : null
            }
          >
            <InteractiveRuntimeWorkspace
              experience={experience}
            />
          </ExperienceNavProvider>
          </section>

          <Link
            href={library.href}
            className="rx-button rx-button-primary"
            style={{ marginTop: 24 }}
          >
            {isLab ? "Back to Virtual Labs" : "Back to Experiences"}
          </Link>
        </div>
      </section>
    </main>
  );
}



