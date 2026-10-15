import Link from "next/link";
import type { ContentItem } from "@/lib/content";
import { getContentTypeDefinition, getContentHref } from "@/lib/content-registry";

interface ContentCardProps {
  content: ContentItem;
  href?: string;
}

export default function ContentCard({
  content,
  href,
}: ContentCardProps) {
  const destination = href ?? getContentHref(content);
  const definition = getContentTypeDefinition(content.contentType);

  return (
    <Link href={destination} className="rx-content-card">
      <span className="rx-content-meta-type">
        {definition?.label ?? content.contentType}
      </span>

      <h3 className="rx-content-card-title">
        {content.title}
      </h3>

      {content.excerpt ? (
        <p className="rx-content-card-description">
          {content.excerpt}
        </p>
      ) : (
        <p className="rx-content-card-description">
          {content.description}
        </p>
      )}

      <span className="rx-platform-link">
        Explore →
      </span>
    </Link>
  );
}