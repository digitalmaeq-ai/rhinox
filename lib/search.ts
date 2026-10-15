import type { ContentItem } from "./content";

export interface SearchOptions {
  query: string;
  fields?: (
    | "title"
    | "description"
    | "excerpt"
    | "subjects"
    | "topics"
    | "tags"
    | "skills"
  )[];
}

type SearchField = NonNullable<SearchOptions["fields"]>[number];

const defaultSearchFields: SearchField[] = [
  "title",
  "description",
  "excerpt",
  "subjects",
  "topics",
  "tags",
  "skills",
];

function normalise(value: string): string {
  return value.toLowerCase().trim();
}

function getSearchValues(item: ContentItem, field: SearchField): string[] {
  switch (field) {
    case "title":
      return item.title ? [item.title] : [];

    case "description":
      return item.description ? [item.description] : [];

    case "excerpt":
      return item.excerpt ? [item.excerpt] : [];

    case "subjects":
      return item.subjects ?? [];

    case "topics":
      return item.topics ?? [];

    case "tags":
      return item.tags ?? [];

    case "skills":
      return item.skills ?? [];

    default:
      return [];
  }
}

export function searchContent(
  content: ContentItem[],
  options: SearchOptions
): ContentItem[] {
  const query = normalise(options.query);

  if (!query) {
    return content;
  }

  const fields = options.fields ?? defaultSearchFields;

  return content.filter((item) =>
    fields.some((field) =>
      getSearchValues(item, field).some((value) =>
        normalise(value).includes(query)
      )
    )
  );
}