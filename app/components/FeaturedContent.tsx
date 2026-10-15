import type { ContentItem } from "@/lib/content";
import { getContentHref } from "@/lib/content-registry";
import ContentCard from "./ContentCard";

interface FeaturedContentProps {
  items: ContentItem[];
  title?: string;
}

export default function FeaturedContent({
  items,
  title = "Featured",
}: FeaturedContentProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="rx-section rx-featured-content">
      <div className="rx-container">
        <div className="rx-section-heading">
          <h2>{title}</h2>
        </div>

        <div className="rx-content-grid">
          {items.map((item) => (
            <ContentCard
              key={`${item.contentType}-${item.slug}`}
              content={item}
              href={getContentHref(item)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
