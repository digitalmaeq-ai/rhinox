"use client";

import { useMemo, useState } from "react";
import type { ContentItem } from "@/lib/content";
import ContentGrid from "./ContentGrid";

interface ContentCatalogueProps {
  content: ContentItem[];
  title?: string;
  description?: string;
  searchable?: boolean;
}

export default function ContentCatalogue({
  content,
  title,
  description,
  searchable = true,
}: ContentCatalogueProps) {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("all");

  const difficulties = useMemo(() => {
    const values = content
      .map((item) => item.difficulty)
      .filter(
        (value): value is NonNullable<ContentItem["difficulty"]> =>
          Boolean(value)
      );

    return Array.from(new Set(values));
  }, [content]);

  const filteredContent = useMemo(() => {
    const query = search.trim().toLowerCase();

    return content.filter((item) => {
      const matchesSearch =
        query.length === 0 ||
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.tags?.some((tag) =>
          tag.toLowerCase().includes(query)
        ) ||
        item.topics?.some((topic) =>
          topic.toLowerCase().includes(query)
        );

      const matchesDifficulty =
        difficulty === "all" ||
        item.difficulty === difficulty;

      return matchesSearch && matchesDifficulty;
    });
  }, [content, search, difficulty]);

  return (
    <section className="rx-section">
      <div className="rx-container">
        {(title || description) && (
          <div className="rx-section-heading">
            {title && <h2>{title}</h2>}

            {description && <p>{description}</p>}
          </div>
        )}

        {searchable && (
          <div className="rx-catalogue-controls">
            <div className="rx-search-wrapper">
              <label htmlFor="content-search">
                Search
              </label>

              <input
                id="content-search"
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search learning content..."
                className="rx-search-input"
              />
            </div>

            {difficulties.length > 0 && (
              <div className="rx-filter-wrapper">
                <label htmlFor="difficulty-filter">
                  Difficulty
                </label>

                <select
                  id="difficulty-filter"
                  value={difficulty}
                  onChange={(event) =>
                    setDifficulty(event.target.value)
                  }
                  className="rx-filter-select"
                >
                  <option value="all">All levels</option>

                  {difficulties.map((value) => (
                    <option key={value} value={value}>
                      {value.charAt(0).toUpperCase() +
                        value.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        <div className="rx-catalogue-result-count">
          {filteredContent.length}{" "}
          {filteredContent.length === 1
            ? "resource"
            : "resources"}
        </div>

        <ContentGrid
          content={filteredContent}
          emptyMessage="No content matches your search."
        />
      </div>
    </section>
  );
}