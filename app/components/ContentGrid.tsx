import type { ContentItem } from "@/lib/content";
import ContentCard from "./ContentCard";

interface ContentGridProps {
  content: ContentItem[];
  emptyMessage?: string;
}

export default function ContentGrid({
  content,
  emptyMessage = "No content is available yet.",
}: ContentGridProps) {
  if (content.length === 0) {
    return (
      <div className="rx-content-card">
        <p className="rx-content-card-description">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="rx-content-grid">
      {content.map((item) => (
        <ContentCard
          key={`${item.contentType}-${item.slug}`}
          content={item}
        />
      ))}
    </div>
  );
}