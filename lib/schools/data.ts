// Facts for the Schools & Institutions pages. Counts and lists are read from the real catalogue
// (Nursery 1 weeks, virtual labs, shop equipment) so the pages never drift from the platform.

import { getContentHref } from "../content-registry";
import { getSectionByPath, getSectionItems } from "../content-sections";
import { getExperienceSequence } from "../experience-sequence";
import { isVirtualExperiment } from "../explore-experience-items";
import { NURSERY_1_TERMS, NURSERY_1_WEEKS } from "../tmc/nursery-1";
import type { ProductContent } from "@/types/products";

export type WeekKind = "learn" | "practice" | "revision" | "project" | "assessment" | "showcase";

export function kindOf(kind: string): WeekKind {
  const k = kind.toLowerCase();
  if (k.startsWith("assessment")) return "assessment";
  if (k.startsWith("showcase")) return "showcase";
  if (k.startsWith("mini-project")) return "project";
  if (k.startsWith("revision")) return "revision";
  if (k.startsWith("practice")) return "practice";
  return "learn";
}

export const KIND_LABEL: Record<WeekKind, string> = {
  learn: "Learning",
  practice: "Practice & play",
  revision: "Revision",
  project: "Mini-project",
  assessment: "Assessment",
  showcase: "Showcase",
};

export interface TermPlan {
  term: number;
  title: string;
  weeks: { week: number; title: string; kind: WeekKind }[];
  counts: Record<WeekKind, number>;
}

export function termPlans(): TermPlan[] {
  return NURSERY_1_TERMS.map((t) => {
    const weeks = NURSERY_1_WEEKS.filter((w) => w.term === t.term).map((w) => ({ week: w.week, title: w.title, kind: kindOf(w.kind) }));
    const counts = { learn: 0, practice: 0, revision: 0, project: 0, assessment: 0, showcase: 0 } as Record<WeekKind, number>;
    for (const w of weeks) counts[w.kind] += 1;
    return { term: t.term, title: t.title, weeks, counts };
  });
}

export interface LabProduct {
  title: string;
  excerpt: string;
  href: string;
  image?: string;
  subjects: string[];
}

export function labEquipment(): LabProduct[] {
  const section = getSectionByPath("/shop/laboratory-equipment");
  if (!section) return [];
  return getSectionItems(section).map((item) => {
    const p = item as ProductContent;
    return {
      title: p.title,
      excerpt: p.excerpt ?? p.description,
      href: getContentHref(item),
      image: p.coverImage,
      subjects: (p.subjects ?? []).map((s) => s.toLowerCase()),
    };
  });
}

export interface VirtualLab {
  title: string;
  href: string;
  subject: string;
}

export function virtualLabs(): VirtualLab[] {
  return getExperienceSequence()
    .filter(isVirtualExperiment)
    .map((item) => {
      const subjects = ((item as { subjects?: string[] }).subjects ?? []).map((s) => s.toLowerCase());
      const subject = ["physics", "chemistry", "biology"].find((s) => subjects.includes(s)) ?? "science";
      return { title: item.title, href: `/experiences/${item.slug}`, subject };
    });
}

export function schoolFacts() {
  return {
    weeks: NURSERY_1_WEEKS.length,
    labs: virtualLabs().length,
    equipment: labEquipment().length,
  };
}
