import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ContentNotFoundCard from "@/app/components/ContentNotFoundCard";
import GenericDetailRenderer from "@/app/components/renderers/GenericDetailRenderer";
import GenericListingRenderer from "@/app/components/renderers/GenericListingRenderer";
import { getContentTypeDefinition } from "@/lib/content-registry";
import {
  getSectionByPath,
  getSectionItemBySlug,
  getSectionItems,
} from "@/lib/content-sections";

interface CatchAllPageProps {
  params: Promise<{
    path: string[];
  }>;
}

// Titles end with the site name once, matching the other pages.
const plain = (text: string) => `${text.replace(/\s*\|\s*Rhinox Scientifica\s*$/, "")} | Rhinox Scientifica`;

// Page title and description come from the section (listing) or the item (detail).
export async function generateMetadata({ params }: CatchAllPageProps): Promise<Metadata> {
  const { path } = await params;
  const section = getSectionByPath(`/${path.join("/")}`);
  if (section) return { title: plain(section.heading), description: section.description };
  if (path.length >= 2) {
    const parent = getSectionByPath(`/${path.slice(0, -1).join("/")}`);
    const item = parent ? getSectionItemBySlug(parent, path[path.length - 1]) : null;
    if (item) return { title: plain(item.title), description: item.description };
  }
  return {};
}

// GENERIC CONTENT ENGINE — the locked architecture diagram's
// app/[...path]/page.tsx. A literal route folder always wins over this
// catch-all in Next.js (so /about, /contact, /schools/*, the interactive
// /experiences system, and the various "coming soon" stub sections are
// completely unaffected — they are not part of the content catalogue and
// were deliberately left as their own routes), which means this file only
// ever runs for the ~20 content-catalogue sections registered in
// lib/content-sections.ts. For each request it:
//   1. resolves the URL to a taxonomy/section node (a listing) or a
//      section + slug (a single content item),
//   2. looks the item's contentType up in the Type Registry
//      (lib/content-registry.ts) to find its TYPE RENDERER,
//   3. and renders it — falling back to GenericDetailRenderer for any type
//      that doesn't need a bespoke one.
// Adding a new browsable section for an existing content type from here on
// is one entry in lib/content-sections.ts, not a new pair of route files.
export default async function CatchAllPage({ params }: CatchAllPageProps) {
  const { path } = await params;

  if (path.length === 0) {
    notFound();
  }

  const fullPath = `/${path.join("/")}`;

  // Case 1: the whole path is a known section — render its listing.
  const exactSection = getSectionByPath(fullPath);

  if (exactSection) {
    const items = getSectionItems(exactSection);

    return (
      <GenericListingRenderer
        eyebrow={exactSection.eyebrow}
        heading={exactSection.heading}
        description={exactSection.description}
        items={items}
        path={fullPath}
        notice={exactSection.notice}
      />
    );
  }

  // Case 2: everything but the last segment is a known section, and the
  // last segment is a content item's slug — render its detail page.
  if (path.length >= 2) {
    const sectionPath = `/${path.slice(0, -1).join("/")}`;
    const slug = path[path.length - 1];
    const section = getSectionByPath(sectionPath);

    if (section) {
      const item = getSectionItemBySlug(section, slug);

      if (!item) {
        return <ContentNotFoundCard label={section.notFoundLabel} />;
      }

      const definition = getContentTypeDefinition(item.contentType);
      const DetailRenderer = definition?.DetailRenderer ?? GenericDetailRenderer;

      return <DetailRenderer item={item} />;
    }
  }

  // Not a recognised content section at all.
  notFound();
}
