// Which Think • Move • Code! weeks have an interactive RhinoBot lesson.
//
// The lessons themselves live in lib/code-studio-v2 (curriculum records plus a reviewed lesson
// spec). A week only offers a lesson once its spec is reviewed; the rest are listed as "in review".
// Kept free of other lib/tmc imports so scripts can load it directly.

import { CURRICULUM_ACTIVITIES, type CurriculumActivity } from "../code-studio-v2/curriculum.ts";
import { isReviewedInteractiveLesson } from "../code-studio-v2/lesson-specs.ts";

export const nursery1LessonId = (week: { term: number; week: number }) =>
  `tmc-v3-15-nursery-1-t${week.term}-w${week.week}`;

export const nursery1LessonPath = (week: { term: number; week: number }) =>
  `/think-move-code/nursery-1/term-${week.term}/week-${week.week}/lesson`;

/** The reviewed interactive lesson for a Nursery 1 week, or null when there is none yet. */
export function interactiveLessonFor(week: { term: number; week: number }): CurriculumActivity | null {
  const id = nursery1LessonId(week);
  if (!isReviewedInteractiveLesson(id)) return null;
  return CURRICULUM_ACTIVITIES.find((item) => item.id === id) ?? null;
}

/** Curriculum lessons that exist as records but are not yet reviewed for learners. */
export function lessonsInReview(): CurriculumActivity[] {
  return CURRICULUM_ACTIVITIES.filter((item) => !isReviewedInteractiveLesson(item.id));
}
