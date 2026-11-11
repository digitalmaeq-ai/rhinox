import type { Metadata } from "next";
import { notFound } from "next/navigation";

import LearningHome from "@/app/components/code-studio-v2/LearningHome";
import { NURSERY_1_WEEKS, findWeek, weekPath } from "@/lib/tmc/nursery-1";
import { interactiveLessonFor } from "@/lib/tmc/lessons";

interface LessonPageProps {
  params: Promise<{ term: string; week: string }>;
}

// Only weeks whose lesson has been reviewed get a page; any other address is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return NURSERY_1_WEEKS.filter((item) => interactiveLessonFor(item)).map((item) => ({
    term: `term-${item.term}`,
    week: `week-${item.week}`,
  }));
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { term, week } = await params;
  const item = findWeek(term, week);
  if (!item) return {};
  return {
    title: `Lesson with RhinoBot · Nursery 1 Term ${item.term} Week ${item.week} | Rhinox Scientifica`,
    description: `The interactive RhinoBot lesson for Think • Move • Code! Nursery 1, Term ${item.term} Week ${item.week}.`,
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { term, week } = await params;
  const item = findWeek(term, week);
  const lesson = item ? interactiveLessonFor(item) : null;
  if (!item || !lesson) notFound();
  return <LearningHome activities={[lesson]} focusActivityId={lesson.id} exitHref={weekPath(item)} />;
}
