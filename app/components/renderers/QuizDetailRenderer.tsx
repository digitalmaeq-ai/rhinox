import type { ContentItem } from "@/lib/content";
import { imageForType } from "@/lib/listing-presentation";

import ContentHero from "../content/ContentHero";
import { pretty } from "../content/rows";
import styles from "../content/content.module.css";
import QuizPlayer from "../QuizPlayer";
import RelatedContent from "../RelatedContent";

interface QuizDetailRendererProps {
  item: ContentItem;
}

// The quiz page: a compact hero, then the quiz itself beside its rules.
// Quiz is an `engine: "runtime"` type, so QuizPlayer handles interaction.
export default function QuizDetailRenderer({ item }: QuizDetailRendererProps) {
  if (item.contentType !== "quiz") {
    return null;
  }

  const quiz = item;
  const n = quiz.questions.length;

  const glance: [string, string][] = [
    ["Questions", String(n)],
    ...(quiz.durationMinutes ? [["Time", `${quiz.durationMinutes} minutes`] as [string, string]] : []),
    ...(quiz.passingScore !== undefined ? [["Pass mark", `${quiz.passingScore}%`] as [string, string]] : []),
    ...(quiz.attemptsAllowed !== undefined ? [["Attempts", String(quiz.attemptsAllowed)] as [string, string]] : []),
    ...(quiz.ageGroups?.length ? [["Ages", quiz.ageGroups.join(", ")] as [string, string]] : []),
    ...(quiz.difficulty ? [["Level", pretty(quiz.difficulty)] as [string, string]] : []),
  ];

  return (
    <main style={{ background: "var(--rx-white)" }}>
      <ContentHero
        eyebrow="STEM quiz"
        lineOne={quiz.title}
        lead={quiz.excerpt ?? quiz.description}
        image={imageForType("quiz")}
        alt=""
        meta={[
          { value: `${n} ${n === 1 ? "question" : "questions"}` },
          ...(quiz.durationMinutes ? [{ value: `${quiz.durationMinutes} min` }] : []),
          ...(quiz.difficulty ? [{ value: pretty(quiz.difficulty) }] : []),
        ]}
        back={{ href: "/explore/stem-quizzes", label: "Back to STEM Quizzes" }}
      />

      <section className={styles.article}>
        <div className={`rx-container ${styles.articleGrid}`}>
          <div className={styles.quizBox}>
            {quiz.instructions && (
              <p style={{ margin: "0 0 18px", fontSize: 15, color: "var(--rx-text-soft)" }}>{quiz.instructions}</p>
            )}
            <QuizPlayer quiz={quiz} />
          </div>

          <aside className={styles.aside} aria-label="About this quiz">
            <h2>About this quiz</h2>
            <ul className={styles.glance}>
              {glance.map(([k, v]) => (
                <li key={k}>
                  <span>{k}</span>
                  <strong>{v}</strong>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <RelatedContent content={quiz} />
    </main>
  );
}
