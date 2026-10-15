import type { ContentItem } from "@/lib/content";

interface ContentMetaProps {
  content: ContentItem;
}

export default function ContentMeta({
  content,
}: ContentMetaProps) {
  return (
    <div className="rx-content-meta">
      {content.contentType && (
        <span className="rx-content-meta-type">
          {content.contentType}
        </span>
      )}

      {content.difficulty && (
        <span className="rx-content-meta-item">
          {content.difficulty}
        </span>
      )}

      {content.durationMinutes && (
        <span className="rx-content-meta-item">
          {content.durationMinutes} min
        </span>
      )}

      {content.ageGroups && content.ageGroups.length > 0 && (
        <span className="rx-content-meta-item">
          {content.ageGroups.join(", ")}
        </span>
      )}
    </div>
  );
}
