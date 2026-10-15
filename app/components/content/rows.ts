import type { ContentItem } from "@/lib/content";
import { getContentHref } from "@/lib/content-registry";
import { TYPE_LABEL } from "@/lib/listing-presentation";

import type { ListRow } from "./ContentList";
import { toneFor } from "./tiles";

export function pretty(value: string): string {
  const s = value.replace(/-/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

type Loose = ContentItem & {
  subjects?: string[];
  ageGroups?: string[];
  difficulty?: string;
  durationMinutes?: number;
  price?: number;
  currency?: string;
};

export function toRow(item: ContentItem): ListRow {
  const it = item as Loose;
  const subjects = it.subjects ?? [];
  const tone = toneFor(subjects);
  const top =
    it.price !== undefined
      ? `${it.currency === "NGN" || !it.currency ? "₦" : it.currency + " "}${it.price.toLocaleString()}`
      : it.durationMinutes
        ? `${it.durationMinutes} min`
        : undefined;
  const bottom = it.difficulty ? pretty(it.difficulty) : it.ageGroups?.[0] ? `Ages ${it.ageGroups[0]}` : undefined;
  return {
    id: `${item.contentType}-${item.id}`,
    href: getContentHref(item),
    title: item.title,
    description: item.description ?? "",
    type: item.contentType,
    typeLabel: TYPE_LABEL[item.contentType] ?? pretty(item.contentType),
    subjects,
    subjectLabels: subjects.map(pretty),
    tint: tone.tint,
    ink: tone.ink,
    metaTop: top,
    metaBottom: bottom,
  };
}
