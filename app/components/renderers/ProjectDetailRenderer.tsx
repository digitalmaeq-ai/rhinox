import type { ContentItem } from "@/lib/content";
import RelatedContent from "@/app/components/RelatedContent";
import ContentHero from "../content/ContentHero";
import { pretty } from "../content/rows";
import { imageForType } from "@/lib/listing-presentation";
import cstyles from "../content/content.module.css";


interface ProjectDetailRendererProps {
  item: ContentItem;
}

// Moved from the old app/explore/project-lab/[slug]/page.tsx — the bespoke
// "project" TYPE RENDERER referenced by the generic content engine's
// Type Registry lookup (lib/content-registry.ts). See QuizDetailRenderer
// for why `item` is typed as the ContentItem union rather than
// ProjectContent directly.
export default function ProjectDetailRenderer({
  item,
}: ProjectDetailRendererProps) {
  if (item.contentType !== "project") {
    return null;
  }

  const project = item;

  return (
    <main className={cstyles.legacy} style={{ background: "var(--rx-white)" }}>
      <ContentHero
        eyebrow="Project Lab"
        lineOne={project.title}
        lead={project.description}
        image={imageForType("project")}
        alt=""
        meta={[
          ...(project.ageGroups?.length ? [{ label: "Ages", value: project.ageGroups.join(", ") }] : []),
          ...(project.difficulty ? [{ value: pretty(project.difficulty) }] : []),
          ...(project.durationMinutes ? [{ value: `${project.durationMinutes} min` }] : []),
        ]}
        back={{ href: "/explore/project-lab", label: "Back to Project Lab" }}
      />

      {/* Problem */}
      {project.problem && (
        <section className="rx-detail-section rx-detail-section-white">
          <div className="rx-container">
            <div className="rx-detail-content">
              <p className="rx-eyebrow">THE PROBLEM</p>

              <h2>What are we trying to solve?</h2>

              <p>{project.problem}</p>
            </div>
          </div>
        </section>
      )}

      {/* Project Goal */}
      {project.projectGoal && (
        <section className="rx-detail-section">
          <div className="rx-container">
            <div className="rx-detail-content">
              <p className="rx-eyebrow">PROJECT GOAL</p>

              <h2>What will you build?</h2>

              <p>{project.projectGoal}</p>
            </div>
          </div>
        </section>
      )}

      {/* Materials, Tools and Equipment */}
      {(project.materials?.length ||
        project.tools?.length ||
        project.equipment?.length) && (
        <section className="rx-detail-section rx-detail-section-white">
          <div className="rx-container">
            <div className="rx-detail-content">
              <p className="rx-eyebrow">GET READY</p>

              <h2>Materials and Tools</h2>

              <div className="rx-detail-grid">
                {project.materials && project.materials.length > 0 && (
                  <div className="rx-detail-card">
                    <h3>Materials</h3>

                    <ul>
                      {project.materials.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {project.tools && project.tools.length > 0 && (
                  <div className="rx-detail-card">
                    <h3>Tools</h3>

                    <ul>
                      {project.tools.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {project.equipment && project.equipment.length > 0 && (
                  <div className="rx-detail-card">
                    <h3>Equipment</h3>

                    <ul>
                      {project.equipment.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Safety */}
      {project.safetyNotes && project.safetyNotes.length > 0 && (
        <section className="rx-detail-section">
          <div className="rx-container">
            <div className="rx-detail-content">
              <p className="rx-eyebrow">SAFETY FIRST</p>

              <h2>Safety</h2>

              <ul className="rx-detail-list">
                {project.safetyNotes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Build Instructions */}
      {project.instructions && project.instructions.length > 0 && (
        <section className="rx-detail-section rx-detail-section-white">
          <div className="rx-container">
            <div className="rx-detail-content">
              <p className="rx-eyebrow">BUILD</p>

              <h2>Build Instructions</h2>

              <ol className="rx-detail-steps">
                {project.instructions.map((step, index) => (
                  <li key={`${step}-${index}`}>
                    <span className="rx-detail-step-number">
                      {index + 1}
                    </span>

                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      )}

      {/* Testing */}
      {project.testing && project.testing.length > 0 && (
        <section className="rx-detail-section">
          <div className="rx-container">
            <div className="rx-detail-content">
              <p className="rx-eyebrow">TEST</p>

              <h2>Testing</h2>

              <ul className="rx-detail-list">
                {project.testing.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Expected Results */}
      {project.expectedResults && project.expectedResults.length > 0 && (
        <section className="rx-detail-section rx-detail-section-white">
          <div className="rx-container">
            <div className="rx-detail-content">
              <p className="rx-eyebrow">OBSERVE</p>

              <h2>Expected Results</h2>

              <ul className="rx-detail-list">
                {project.expectedResults.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Troubleshooting */}
      {project.troubleshooting && project.troubleshooting.length > 0 && (
        <section className="rx-detail-section">
          <div className="rx-container">
            <div className="rx-detail-content">
              <p className="rx-eyebrow">PROBLEM SOLVING</p>

              <h2>Troubleshooting</h2>

              <ul className="rx-detail-list">
                {project.troubleshooting.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Extension Activities */}
      {project.extensionActivities && project.extensionActivities.length > 0 && (
        <section className="rx-detail-section rx-detail-section-white">
          <div className="rx-container">
            <div className="rx-detail-content">
              <p className="rx-eyebrow">GO FURTHER</p>

              <h2>Extension Activities</h2>

              <ul className="rx-detail-list">
                {project.extensionActivities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Skills Developed */}
      {project.skillsDeveloped && project.skillsDeveloped.length > 0 && (
        <section className="rx-detail-section">
          <div className="rx-container">
            <div className="rx-detail-content">
              <p className="rx-eyebrow">LEARNING OUTCOMES</p>

              <h2>Skills Developed</h2>

              <div className="rx-detail-grid">
                {project.skillsDeveloped.map((skill) => (
                  <div key={skill} className="rx-detail-card">
                    <h3>{skill}</h3>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Submission Requirements */}
      {project.submissionRequirements &&
        project.submissionRequirements.length > 0 && (
          <section className="rx-detail-section rx-detail-section-white">
            <div className="rx-container">
              <div className="rx-detail-content">
                <p className="rx-eyebrow">SHARE YOUR WORK</p>

                <h2>Submission Requirements</h2>

                <ul className="rx-detail-list">
                  {project.submissionRequirements.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

      {/* Related Content */}
      <RelatedContent content={project} />
    </main>
  );
}
