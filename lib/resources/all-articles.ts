import type { ArticleContent } from "@/types/resources";
import { getContentByType } from "../content";
import { isLiveContent } from "../interactive-experiences";
import { guides, type Article } from "./articles";

// Written articles from /content plus the guides built from the Nursery 1 packs.
export function getAllArticles(): Article[] {
  const written: Article[] = getContentByType("article")
    .filter(isLiveContent)
    .map((a) => {
      const c = a as ArticleContent;
      return {
        slug: c.slug,
        title: c.title,
        dek: c.excerpt ?? c.description,
        category: "Ideas" as const,
        minutes: c.readingTimeMinutes ?? 3,
        accent: "#0f6fde",
        blocks: [{ type: "p" as const, text: c.body ?? c.description }],
      };
    });
  return [...written, ...guides];
}

export const getArticle = (slug: string) => getAllArticles().find((a) => a.slug === slug) ?? null;
