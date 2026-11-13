// Which Think • Move • Code! weeks have an interactive RhinoBot lesson.
//
// The lessons themselves live in lib/code-studio-v2 (curriculum records plus a reviewed lesson
// spec). A week only offers a lesson once its spec is reviewed; the rest are listed as "in review".
// Kept free of other lib/tmc imports so scripts can load it directly.

import { CURRICULUM_ACTIVITIES, type CurriculumActivity } from "../code-studio-v2/curriculum.ts";
import { getLessonSpec, isReviewedInteractiveLesson, type InteractiveLessonSpec } from "../code-studio-v2/lesson-specs.ts";

export const nursery1LessonId = (week: { term: number; week: number }) =>
  `tmc-v3-15-nursery-1-t${week.term}-w${week.week}`;

export const nursery1LessonPath = (week: { term: number; week: number }) =>
  `/think-move-code/nursery-1/term-${week.term}/week-${week.week}/lesson`;

/**
 * The lesson page's details for a lesson described by the approved books alone. The step wording
 * comes from the spec's own steps, so nothing is copied from the curriculum sheet.
 */
export function activityFromBookSpec(spec: InteractiveLessonSpec): CurriculumActivity | null {
  const unit = spec.unit;
  if (!unit) return null;
  return {
    id: spec.activityId,
    curriculumVersion: "book",
    level: unit.level,
    term: unit.term,
    week: unit.week,
    weekType: "Themed learning",
    theme: unit.theme,
    focus: unit.focus,
    strand: null,
    think: spec.steps.think.instruction,
    move: spec.steps.move.instruction,
    code: spec.steps.code.instruction,
    build: spec.steps.build.instruction,
    create: spec.steps.create.instruction,
    practicalActivity: unit.practicalActivity,
    weeklyCheck: spec.steps.check.evidence,
    masteryTarget: unit.masteryTarget,
    priorLearning: "",
    futureBridge: "",
    assessmentEvidence: "Teacher observation + task evidence",
    platform: unit.materials,
    coreParts: unit.coreParts,
    stretch: unit.stretch,
    fallback: unit.fallback,
  };
}

/** The reviewed interactive lesson for a Nursery 1 week, or null when there is none yet. */
export function interactiveLessonFor(week: { term: number; week: number }): CurriculumActivity | null {
  const id = nursery1LessonId(week);
  if (!isReviewedInteractiveLesson(id)) return null;
  const spec = getLessonSpec(id);
  return (spec && activityFromBookSpec(spec)) ?? CURRICULUM_ACTIVITIES.find((item) => item.id === id) ?? null;
}

/**
 * Curriculum lessons that exist as records but are not yet reviewed for learners.
 * Nursery 1 and 2 are built from the approved books alone, so their curriculum-sheet records are never listed.
 */
export function lessonsInReview(): CurriculumActivity[] {
  return CURRICULUM_ACTIVITIES.filter((item) => item.level !== "Nursery 1" && item.level !== "Nursery 2" && !isReviewedInteractiveLesson(item.id));
}
