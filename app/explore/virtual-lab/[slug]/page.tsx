import { notFound, redirect } from "next/navigation";

import { getExperienceHref } from "@/lib/experience-sequence";
import { isVirtualExperiment } from "@/lib/explore-experience-items";
import { getInteractiveExperienceBySlug, isLiveContent } from "@/lib/interactive-experiences";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// The runtime lives at /experiences/<slug>. This older address used to show a
// "being prepared" page for any slug. A published virtual lab now goes to its
// real page; anything else is a proper not-found, never unrelated content.
export default async function VirtualLabDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const experience = getInteractiveExperienceBySlug(slug);

  if (!experience || !isLiveContent(experience) || !isVirtualExperiment(experience)) {
    notFound();
  }

  redirect(getExperienceHref(experience));
}
