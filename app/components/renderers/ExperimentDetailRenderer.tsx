import type { ContentItem } from "@/lib/content";
import RelatedContent from "@/app/components/RelatedContent";
import ContentHero from "../content/ContentHero";
import { pretty } from "../content/rows";
import { imageForType } from "@/lib/listing-presentation";
import cstyles from "../content/content.module.css";


interface ExperimentDetailRendererProps {
  item: ContentItem;
}

// Moved from the old app/explore/experiments/[slug]/page.tsx — the bespoke
// "experiment" TYPE RENDERER referenced by the generic content engine's
// Type Registry lookup (lib/content-registry.ts). See QuizDetailRenderer
// for why `item` is typed as the ContentItem union rather than
// ExperimentContent directly.
export default function ExperimentDetailRenderer({
  item,
}: ExperimentDetailRendererProps) {
  if (item.contentType !== "experiment") {
    return null;
  }

  const experiment = item;

  return (
    <main className={cstyles.legacy} style={{ background: "var(--rx-white)" }}>
      <ContentHero
        eyebrow="Practical experiment"
        lineOne={experiment.title}
        lead={experiment.description}
        image={imageForType("experiment")}
        alt=""
        meta={[
          ...(experiment.ageGroups?.length ? [{ label: "Ages", value: experiment.ageGroups.join(", ") }] : []),
          ...(experiment.difficulty ? [{ value: pretty(experiment.difficulty) }] : []),
          ...(experiment.durationMinutes ? [{ value: `${experiment.durationMinutes} min` }] : []),
        ]}
        back={{ href: "/explore/experiments", label: "Back to Experiments" }}
      />

      {/* OBJECTIVE */}
      {experiment.objective && (
        <section className="rx-section rx-section-white">
          <div className="rx-container rx-detail-narrow">
            <div className="rx-detail-section-heading">
              <span>01</span>
              <h2>Objective</h2>
            </div>

            <p className="rx-detail-body">{experiment.objective}</p>
          </div>
        </section>
      )}

      {/* MATERIALS */}
      {(experiment.materials?.length ||
        experiment.equipment?.length ||
        experiment.chemicals?.length) && (
        <section className="rx-section rx-section-soft">
          <div className="rx-container">
            <div className="rx-detail-section-heading">
              <span>02</span>
              <h2>What You Need</h2>
            </div>

            <div className="rx-detail-columns">
              {experiment.materials?.length ? (
                <div className="rx-detail-box">
                  <h3>Materials</h3>

                  <ul>
                    {experiment.materials.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {experiment.equipment?.length ? (
                <div className="rx-detail-box">
                  <h3>Equipment</h3>

                  <ul>
                    {experiment.equipment.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {experiment.chemicals?.length ? (
                <div className="rx-detail-box">
                  <h3>Chemicals</h3>

                  <ul>
                    {experiment.chemicals.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      )}

      {/* SAFETY */}
      {experiment.safetyNotes?.length ? (
        <section className="rx-section rx-section-white">
          <div className="rx-container rx-detail-narrow">
            <div className="rx-detail-section-heading">
              <span>03</span>
              <h2>Safety</h2>
            </div>

            <div className="rx-safety-box">
              <ul>
                {experiment.safetyNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      {/* PROCEDURE */}
      {experiment.procedure?.length ? (
        <section className="rx-section rx-section-soft">
          <div className="rx-container rx-detail-narrow">
            <div className="rx-detail-section-heading">
              <span>04</span>
              <h2>Procedure</h2>
            </div>

            <ol className="rx-procedure-list">
              {experiment.procedure.map((step, index) => (
                <li key={`${step}-${index}`}>
                  <span>{index + 1}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {/* OBSERVATIONS */}
      {experiment.observations?.length ? (
        <section className="rx-section rx-section-white">
          <div className="rx-container rx-detail-narrow">
            <div className="rx-detail-section-heading">
              <span>05</span>
              <h2>Observations</h2>
            </div>

            <ul className="rx-detail-list">
              {experiment.observations.map((observation) => (
                <li key={observation}>{observation}</li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* RESULTS */}
      {(experiment.results || experiment.conclusion) && (
        <section className="rx-section rx-section-soft">
          <div className="rx-container rx-detail-narrow">
            <div className="rx-detail-section-heading">
              <span>06</span>
              <h2>Results & Conclusion</h2>
            </div>

            {experiment.results && (
              <div className="rx-detail-result">
                <h3>Results</h3>
                <p>{experiment.results}</p>
              </div>
            )}

            {experiment.conclusion && (
              <div className="rx-detail-result">
                <h3>Conclusion</h3>
                <p>{experiment.conclusion}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* EXTENSIONS */}
      {experiment.extensionActivities?.length ? (
        <section className="rx-section rx-section-white">
          <div className="rx-container rx-detail-narrow">
            <div className="rx-detail-section-heading">
              <span>07</span>
              <h2>Take It Further</h2>
            </div>

            <ul className="rx-detail-list">
              {experiment.extensionActivities.map((activity) => (
                <li key={activity}>{activity}</li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* RELATED */}
      <RelatedContent content={experiment} title="Continue Exploring" />
    </main>
  );
}
