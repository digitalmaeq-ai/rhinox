"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  getAllContent,
  type ContentItem,
} from "@/lib/content";
import { isLiveContent } from "@/lib/interactive-experiences";

import {
  exploreTaxonomy,
  type ExploreCategory,
  type ExploreSubcategory,
} from "@/lib/explore-taxonomy";

import { hasTaxonomyBranch } from "@/lib/content-taxonomy";
import {
  getPageForTaxonomy,
  navigation,
  parseExploreParam,
  EXPLORE_MENUS,
  type NavigationItem,
} from "@/lib/site-navigation";
import { getDestinationItems } from "@/lib/menu-destinations";
import { filterContent } from "@/lib/filters";
import { searchContent } from "@/lib/search";

import {
  contentRegistry,
  getContentTypeDefinition,
  getContentHref,
} from "@/lib/content-registry";

type FilterState = {
  search: string;
  age: string;
  level: string;
  type: string;
};

// Search + Age/Level/Type filters, applied to any list of items.
function applySearchFilters(
  items: ContentItem[],
  state: FilterState
): ContentItem[] {
  let result = items;

  if (state.search.trim()) {
    result = searchContent(result, { query: state.search });
  }

  if (state.age !== "All ages") {
    result = filterContent(result, { ageGroups: [state.age] });
  }

  if (state.level !== "All levels") {
    result = filterContent(result, {
      difficulty: state.level.toLowerCase() as
        | "beginner"
        | "intermediate"
        | "advanced",
    });
  }

  if (state.type !== "All types") {
    result = filterContent(result, { contentType: state.type });
  }

  return result;
}

// Virtual labs are filed under their own branch; say so on the card.
function kindLabel(item: ContentItem, fallback: string): string {
  return item.taxonomy?.some((entry) => entry.path[0] === "virtual-labs")
    ? "Virtual lab"
    : fallback;
}


type SelectedTaxonomy = {
  category: string;
  path: string[];
};

function getCategoryItems(
  content: ContentItem[],
  categoryId: string
): ContentItem[] {
  if (categoryId === "all") {
    return content;
  }

  return content.filter((item) =>
    item.taxonomy?.some(
      (taxonomy) => taxonomy.category === categoryId
    )
  );
}

function getTaxonomyItems(
  content: ContentItem[],
  selection: SelectedTaxonomy | null
): ContentItem[] {
  if (!selection) {
    return content;
  }

  return content.filter((item) =>
    hasTaxonomyBranch(
      item,
      selection.category,
      selection.path
    )
  );
}

function getSubcategoryCount(
  content: ContentItem[],
  categoryId: string,
  path: string[]
): number {
  return content.filter((item) =>
    hasTaxonomyBranch(item, categoryId, path)
  ).length;
}

function getSubcategoryByPath(
  category: ExploreCategory,
  path: string[]
): ExploreSubcategory | null {
  let current = category.subcategories;

  let result: ExploreSubcategory | null = null;

  for (const segment of path) {
    const found = current.find(
      (subcategory) => subcategory.id === segment
    );

    if (!found) {
      return null;
    }

    result = found;
    current = found.children ?? [];
  }

  return result;
}

// Branches with content first (original order kept), empty ones last.
function withCounts(
  nodes: ExploreSubcategory[],
  content: ContentItem[],
  categoryId: string,
  parentPath: string[]
) {
  const counted = nodes.map((node) => ({
    node,
    count: getSubcategoryCount(content, categoryId, [
      ...parentPath,
      node.id,
    ]),
  }));

  return [
    ...counted.filter((entry) => entry.count > 0),
    ...counted.filter((entry) => entry.count === 0),
  ];
}

/* =========================================================
   COLUMN 2
   RHINOX ECOSYSTEM
   ========================================================= */

function EcosystemList({
  category,
  selectedPath,
  onSelect,
  content,
}: {
  category: ExploreCategory;
  selectedPath: string[] | null;
  onSelect: (path: string[]) => void;
  content: ContentItem[];
}) {
  return (
    <div className="rx-explore3-list">
      {withCounts(
        category.subcategories,
        content,
        category.id,
        []
      ).map(({ node: subcategory, count }) => {
        const path = [subcategory.id];

        const selected =
          selectedPath?.length === 1 &&
          selectedPath[0] === subcategory.id;

        return (
          <button
            key={subcategory.id}
            type="button"
            disabled={count === 0}
            className={`rx-explore3-ecosystem-item ${
              selected ? "is-active" : ""
            } ${count === 0 ? "is-empty" : ""}`}
            onClick={() => onSelect(path)}
          >
            <span>
              <strong>{subcategory.label}</strong>

              <small>
                {subcategory.description}
              </small>
            </span>

            <span className="rx-explore3-count">
              {count === 0 ? "Soon" : count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* =========================================================
   COLUMN 3
   CONTENT / TYPES
   ========================================================= */

function ContentGroup({
  categoryId,
  group,
  parentPath,
  content,
  expanded,
  onToggle,
}: {
  categoryId: string;
  group: ExploreSubcategory;
  parentPath: string[];
  content: ContentItem[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const groupPath = [...parentPath, group.id];

  const items = content.filter((item) =>
    hasTaxonomyBranch(
      item,
      categoryId,
      groupPath
    )
  );

  const hasChildren =
    Boolean(group.children?.length);

  // Items filed straight under this group. Items that belong to a sub-group
  // are listed once, inside that sub-group, instead of twice.
  const ownItems = hasChildren
    ? items.filter(
        (item) =>
          !(group.children ?? []).some((child) =>
            hasTaxonomyBranch(item, categoryId, [...groupPath, child.id])
          )
      )
    : items;

  const hasItems = ownItems.length > 0;

  return (
    <div
      className={`rx-explore3-group ${
        expanded ? "is-open" : ""
      } ${items.length === 0 ? "is-empty" : ""}`}
    >
      <button
        type="button"
        className="rx-explore3-group-trigger"
        onClick={onToggle}
        aria-expanded={expanded && items.length > 0}
        disabled={items.length === 0}
      >

        <span className="rx-explore3-group-title">
          {group.label}
        </span>

        <span className="rx-explore3-group-count">
          {items.length === 0 ? "Soon" : items.length}
        </span>
      </button>

      {expanded && items.length > 0 && (
        <div className="rx-explore3-group-panel">
          {hasItems && (
            <div className="rx-explore3-group-items">
              {ownItems.map((item) => {
                const definition =
                  getContentTypeDefinition(
                    item.contentType
                  );

                return (
                  <Link
                    key={item.id}
                    href={getContentHref(item)}
                    className="rx-explore3-content-link"
                  >
                    <span className="rx-explore3-content-mark" />

                    <span className="rx-explore3-content-copy">
                      <strong>{item.title}</strong>

                      <small>
                        {kindLabel(item, definition?.label ?? item.contentType)}
                      </small>
                    </span>
                  </Link>
                );
              })}
            </div>
          )}

          {hasChildren && (
            <div className="rx-explore3-nested-groups">
              {withCounts(
                group.children ?? [],
                content,
                categoryId,
                groupPath
              ).map(({ node: child }) => (
                <NestedContentGroup
                  key={child.id}
                  categoryId={categoryId}
                  group={child}
                  parentPath={groupPath}
                  content={content}
                />
              ))}
            </div>
          )}

          {!hasItems && !hasChildren && (
            <p className="rx-explore3-no-content">
              Content will appear here as this section
              grows.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function NestedContentGroup({
  categoryId,
  group,
  parentPath,
  content,
}: {
  categoryId: string;
  group: ExploreSubcategory;
  parentPath: string[];
  content: ContentItem[];
}) {
  const [open, setOpen] = useState(false);

  const path = [...parentPath, group.id];

  const items = content.filter((item) =>
    hasTaxonomyBranch(
      item,
      categoryId,
      path
    )
  );

  const hasChildren =
    Boolean(group.children?.length);

  return (
    <div className="rx-explore3-nested-group">
      <button
        type="button"
        className="rx-explore3-nested-trigger"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span>
          {open ? "\u2212" : "+"}
        </span>

        <strong>{group.label}</strong>

        <small>{items.length}</small>
      </button>

      {open && (
        <div className="rx-explore3-nested-panel">
          {items.map((item) => {
            const definition =
              getContentTypeDefinition(
                item.contentType
              );

            return (
              <Link
                key={item.id}
                href={getContentHref(item)}
                className="rx-explore3-content-link"
              >
                <span className="rx-explore3-content-mark" />

                <span className="rx-explore3-content-copy">
                  <strong>{item.title}</strong>

                  <small>
                    {kindLabel(item, definition?.label ?? item.contentType)}
                  </small>
                </span>
              </Link>
            );
          })}

          {hasChildren &&
            group.children?.map((child) => (
              <NestedContentGroup
                key={child.id}
                categoryId={categoryId}
                group={child}
                parentPath={path}
                content={content}
              />
            ))}

          {!items.length && !hasChildren && (
            <p className="rx-explore3-no-content">
              Content will appear here as this section
              grows.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   SITE MENU VIEW
   Every dropdown page of the header menus, with the same item
   lists and counts the header and the pages use.
   ========================================================= */

const siteMenus: NavigationItem[] = navigation.filter((item) =>
  EXPLORE_MENUS.includes(item.label)
);

function titleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/(^|\s)([a-z])/g, (_, space, letter) => space + letter.toUpperCase());
}

function menuDestinations(menu: NavigationItem) {
  return (menu.megaMenu?.columns ?? []).flatMap((column) =>
    column.items.map((item) => ({ ...item, group: column.title }))
  );
}

function menuItemCount(menu: NavigationItem): number {
  const ids = new Set<string>();
  for (const dest of menuDestinations(menu)) {
    getDestinationItems(dest.href)?.forEach((item) => ids.add(item.id));
  }
  return ids.size;
}

function MenuDestinationList({
  menu,
  selected,
  onSelect,
}: {
  menu: NavigationItem;
  selected: string | null;
  onSelect: (href: string) => void;
}) {
  return (
    <div className="rx-explore3-list">
      {menuDestinations(menu).map((dest) => {
        const count = getDestinationItems(dest.href)?.length;

        return (
          <button
            key={dest.href + dest.label}
            type="button"
            className={`rx-explore3-ecosystem-item ${
              selected === dest.href ? "is-active" : ""
            }`}
            onClick={() => onSelect(dest.href)}
          >
            <span>
              <strong>{dest.label}</strong>
              <small>{dest.group}</small>
            </span>

            {count !== undefined && count > 0 && (
              <span className="rx-explore3-category-count">{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function MenuDestinationDetail({
  menu,
  href,
}: {
  menu: NavigationItem;
  href: string;
}) {
  const dest = menuDestinations(menu).find((entry) => entry.href === href);
  const items = getDestinationItems(href);

  if (!dest) return null;

  return (
    <>
      {dest.description && (
        <p className="rx-explore3-description">{dest.description}</p>
      )}

      <div className="rx-explore3-direct-content">
        {items && items.length > 0 ? (
          items.map((item) => {
            const definition = getContentTypeDefinition(item.contentType);

            return (
              <Link
                key={item.id}
                href={getContentHref(item)}
                className="rx-explore3-content-link"
              >
                <span className="rx-explore3-content-mark" />

                <span className="rx-explore3-content-copy">
                  <strong>{item.title}</strong>
                  <small>{kindLabel(item, definition?.label ?? item.contentType)}</small>
                </span>
              </Link>
            );
          })
        ) : (
          <p className="rx-explore3-no-content">
            {items
              ? "No items have been added to this page yet."
              : "This page is a service or tool page rather than a content list."}
          </p>
        )}
      </div>
    </>
  );
}

/* =========================================================
   MAIN EXPLORE
   ========================================================= */

export default function ExploreRhinox() {
  // useSearchParams needs a Suspense boundary during static rendering.
  return (
    <Suspense fallback={null}>
      <ExploreRhinoxInner />
    </Suspense>
  );
}

function ExploreRhinoxInner() {
  // Everything live on the site — published content plus active
  // interactive experiences — so Explore > Interactive > Experiences lists
  // the same items as the Experiences page in the menu.
  const publishedContent = useMemo(
    () => getAllContent().filter(isLiveContent),
    []
  );

  /*
   * Start on Experiences so all three columns
   * are populated immediately.
   */
  const [activeCategory, setActiveCategory] =
    useState("interactive");

  const [selectedTaxonomy, setSelectedTaxonomy] =
    useState<SelectedTaxonomy | null>({
      category: "interactive",
      path: ["experiences"],
    });

  // The biggest group opens by default so content is visible on arrival
  // instead of hiding behind collapsed groups.
  const [openGroups, setOpenGroups] =
    useState<Set<string>>(
      new Set(["interactive:experiences:interactive-learning"])
    );

  // Header menu links open this engine on a branch: /?explore=a/b/c#explore
  const searchParams = useSearchParams();
  const exploreParam = searchParams.get("explore");
  const menuParam = searchParams.get("menu");
  const destParam = searchParams.get("dest");
  const paramKey = `${exploreParam ?? ""}|${menuParam ?? ""}|${destParam ?? ""}`;

  // Site menu view: which header menu / dropdown page is open.
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeDest, setActiveDest] = useState<string | null>(null);

  // All Content view: which content type is open.
  const [allType, setAllType] = useState<string | null>(null);

  const [appliedParam, setAppliedParam] = useState<string>("||");

  if (paramKey !== appliedParam) {
    setAppliedParam(paramKey);

    const menu = menuParam
      ? siteMenus.find((entry) => entry.label === menuParam)
      : undefined;

    if (menu) {
      setActiveMenu(menu.label);
      setActiveDest(destParam ?? menuDestinations(menu)[0]?.href ?? null);
    }

    const target = parseExploreParam(exploreParam);
    const category = target
      ? exploreTaxonomy.find((entry) => entry.id === target.category)
      : undefined;

    if (!menu && target && category) {
      setActiveMenu(null);
      setActiveDest(null);
      setActiveCategory(category.id);
      setSelectedTaxonomy(
        target.path.length
          ? { category: category.id, path: [target.path[0]] }
          : null
      );
      setOpenGroups(
        target.path.length > 1
          ? new Set([[category.id, target.path[0], target.path[1]].join(":")])
          : new Set()
      );
    }
  }

  useEffect(() => {
    if (exploreParam || menuParam) {
      document
        .getElementById("explore")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [exploreParam, menuParam]);

  const [search, setSearch] = useState("");

  const [filtersOpen, setFiltersOpen] =
    useState(false);

  const [age, setAge] =
    useState("All ages");

  const [level, setLevel] =
    useState("All levels");

  const [type, setType] =
    useState("All types");

  const activeCategoryData = useMemo<
    ExploreCategory | null
  >(() => {
    return (
      exploreTaxonomy.find(
        (category) =>
          category.id === activeCategory
      ) ?? null
    );
  }, [activeCategory]);

  const selectedSubcategory = useMemo(() => {
    if (
      !activeCategoryData ||
      !selectedTaxonomy
    ) {
      return null;
    }

    return getSubcategoryByPath(
      activeCategoryData,
      selectedTaxonomy.path
    );
  }, [
    activeCategoryData,
    selectedTaxonomy,
  ]);

  const ageOptions = useMemo(() => {
    const values = new Set<string>();

    publishedContent.forEach((item) => {
      item.ageGroups?.forEach((value) =>
        values.add(value)
      );
    });

    return Array.from(values).sort();
  }, [publishedContent]);

  const typeOptions = useMemo(() => {
    return contentRegistry
      .filter((definition) =>
        publishedContent.some(
          (item) =>
            item.contentType === definition.type
        )
      )
      .sort((a, b) =>
        a.label.localeCompare(b.label)
      );
  }, [publishedContent]);

  const filteredItems = useMemo(() => {
    let items = getCategoryItems(
      publishedContent,
      activeCategory
    );

    if (selectedTaxonomy) {
      items = getTaxonomyItems(
        items,
        selectedTaxonomy
      );
    }

    if (search.trim()) {
      items = searchContent(items, {
        query: search,
      });
    }

    if (age !== "All ages") {
      items = filterContent(items, {
        ageGroups: [age],
      });
    }

    if (level !== "All levels") {
      items = filterContent(items, {
        difficulty:
          level.toLowerCase() as
            | "beginner"
            | "intermediate"
            | "advanced",
      });
    }

    if (type !== "All types") {
      items = filterContent(items, {
        contentType: type,
      });
    }

    return items;
  }, [
    publishedContent,
    activeCategory,
    selectedTaxonomy,
    search,
    age,
    level,
    type,
  ]);

  // Search and filters look across the whole library, not just the open branch.
  const searchResults = useMemo(
    () =>
      applySearchFilters(publishedContent, { search, age, level, type }),
    [publishedContent, search, age, level, type]
  );

  // Content types that have live items, for the All Content view.
  const allTypes = useMemo(
    () =>
      contentRegistry
        .map((definition) => ({
          type: definition.type as string,
          label: definition.label,
          count: publishedContent.filter(
            (item) => item.contentType === definition.type
          ).length,
        }))
        .filter((entry) => entry.count > 0)
        .sort((a, b) => a.label.localeCompare(b.label)),
    [publishedContent]
  );

  const effectiveAllType = allType ?? allTypes[0]?.type ?? null;

  const selectCategory = (
    categoryId: string
  ) => {
    setActiveMenu(null);
    setActiveDest(null);
    setAllType(null);
    setActiveCategory(categoryId);
    setSelectedTaxonomy(null);
    setOpenGroups(new Set());
  };

  const showTopicView = () => {
    setActiveMenu(null);
    setActiveDest(null);
  };

  const selectMenu = (menu: NavigationItem) => {
    setActiveMenu(menu.label);
    setActiveDest(menuDestinations(menu)[0]?.href ?? null);
  };

  const selectSubcategory = (
    path: string[]
  ) => {
    setSelectedTaxonomy({
      category: activeCategory,
      path,
    });

    setOpenGroups(new Set());
  };

  const toggleGroup = (key: string) => {
    setOpenGroups((current) => {
      const next = new Set(current);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  };

  const resetFilters = () => {
    setSearch("");
    setAge("All ages");
    setLevel("All levels");
    setType("All types");
  };

  const clearSelection = () => {
    setSelectedTaxonomy(null);
    setOpenGroups(new Set());
  };

  const activeSelectionLabel =
    selectedSubcategory?.label ??
    activeCategoryData?.label ??
    "Explore";

  const hasFilters =
    Boolean(search) ||
    age !== "All ages" ||
    level !== "All levels" ||
    type !== "All types";

  const showResults = Boolean(search.trim()) || hasFilters;

  const openKey = Array.from(openGroups)[0];
  const pagePath = openKey
    ? openKey.split(":").slice(1)
    : selectedTaxonomy?.path ?? [];

  const totalActiveFilters = [
    age !== "All ages",
    level !== "All levels",
    type !== "All types",
  ].filter(Boolean).length;

  return (
    <section
      id="explore"
      className="rx-explore"
      aria-labelledby="rx-explore-title"
    >
      <div className="rx-container">

        {/* =================================================
            INTRO
            ================================================= */}

        <div className="rx-explore-intro">
          <div>
            <p className="rx-section-eyebrow">
              EXPLORE RHINOX
            </p>

            <h2 id="rx-explore-title">
              Find your next way to learn, practise
              and create.
            </h2>
          </div>

          <p>
            Explore the complete Rhinox ecosystem
            through experiences, virtual labs, projects,
            learning, technology, competitions, books,
            resources, kits, laboratory products
            and services.
          </p>
        </div>

        {/* =================================================
            SEARCH
            ================================================= */}

        <div className="rx-explore-tools">
          <div className="rx-explore-search">
            <label htmlFor="rx-explore-search-input">
              Search Rhinox
            </label>

            <input
              id="rx-explore-search-input"
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search Rhinox content..."
            />
          </div>

          <button
            type="button"
            className={`rx-explore-filter-toggle ${
              filtersOpen ? "is-open" : ""
            }`}
            onClick={() =>
              setFiltersOpen(
                (current) => !current
              )
            }
            aria-expanded={filtersOpen}
          >
            <span>Filters</span>

            {totalActiveFilters > 0 && (
              <span className="rx-filter-count">
                {totalActiveFilters}
              </span>
            )}
          </button>
        </div>

        {filtersOpen && (
          <div className="rx-explore-filters">
            <div>
              <label htmlFor="rx-age-filter">
                Age
              </label>

              <select
                id="rx-age-filter"
                value={age}
                onChange={(event) =>
                  setAge(event.target.value)
                }
              >
                <option>All ages</option>

                {ageOptions.map((option) => (
                  <option key={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="rx-level-filter">
                Level
              </label>

              <select
                id="rx-level-filter"
                value={level}
                onChange={(event) =>
                  setLevel(event.target.value)
                }
              >
                <option>All levels</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>

            <div>
              <label htmlFor="rx-type-filter">
                Type
              </label>

              <select
                id="rx-type-filter"
                value={type}
                onChange={(event) =>
                  setType(event.target.value)
                }
              >
                <option>All types</option>

                {typeOptions.map((option) => (
                  <option
                    key={option.type}
                    value={option.type}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="rx-explore-reset"
              onClick={resetFilters}
            >
              Clear filters
            </button>
          </div>
        )}

        {/* =================================================
            THREE COLUMN EXPLORE DIRECTORY
            ================================================= */}

        <div className="rx-explore3-frame">

          {/* =================================================
              COLUMN 1
              ================================================= */}

          <aside
            className="rx-explore3-column rx-explore3-nav"
            aria-label="Explore by"
          >
            <div className="rx-explore3-column-heading">
<div>
                <p>EXPLORE BY</p>
                <strong>Discover the Rhinox ecosystem</strong>
              </div>
            </div>

            <div className="rx-explore3-view-switch" role="group" aria-label="Browse by">
              <button
                type="button"
                className={!activeMenu ? "is-active" : ""}
                aria-pressed={!activeMenu}
                onClick={showTopicView}
              >
                By topic
              </button>

              <button
                type="button"
                className={activeMenu ? "is-active" : ""}
                aria-pressed={Boolean(activeMenu)}
                onClick={() => selectMenu(siteMenus[0])}
              >
                By site menu
              </button>
            </div>

            <div
              className="rx-explore3-category-list"
              role="tablist"
            >
              {!activeMenu && exploreTaxonomy.map(
                (category) => {
                  const count =
                    getCategoryItems(
                      publishedContent,
                      category.id
                    ).length;

                  const active =
                    !activeMenu &&
                    category.id ===
                    activeCategory;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      className={`rx-explore3-category ${
                        active
                          ? "is-active"
                          : ""
                      }`}
                      onClick={() =>
                        selectCategory(
                          category.id
                        )
                      }
                    >
                      <span>
                        <strong>
                          {category.label}
                        </strong>

                        <small>
                          {category.description}
                        </small>
                      </span>

                      <span className="rx-explore3-category-count">
                        {count}
                      </span>
                    </button>
                  );
                }
              )}

              {!activeMenu && (
              <button
                type="button"
                className={`rx-explore3-all ${
                  !activeMenu && activeCategory === "all"
                    ? "is-active"
                    : ""
                }`}
                onClick={() =>
                  selectCategory("all")
                }
              >
                <span>
                  <strong>
                    All Content
                  </strong>

                  <small>
                    Search the complete library
                  </small>
                </span>

                <span>
                  {publishedContent.length}
                </span>
              </button>
              )}

              {activeMenu && siteMenus.map((menu) => (
                <button
                  key={menu.label}
                  type="button"
                  role="tab"
                  aria-selected={activeMenu === menu.label}
                  className={`rx-explore3-category ${
                    activeMenu === menu.label ? "is-active" : ""
                  }`}
                  onClick={() => selectMenu(menu)}
                >
                  <span>
                    <strong>{titleCase(menu.label)}</strong>

                    <small>
                      {menuDestinations(menu).length} menu pages
                    </small>
                  </span>

                  {menuItemCount(menu) > 0 && (
                    <span className="rx-explore3-category-count">
                      {menuItemCount(menu)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </aside>

          {/* =================================================
              COLUMN 2
              ================================================= */}

          <section
            className="rx-explore3-column rx-explore3-ecosystem"
            aria-label="Rhinox ecosystem"
          >
            <div className="rx-explore3-column-heading">
<div>
                <p>
                  RHINOX ECOSYSTEM
                </p>

                <strong>
                  {activeMenu
                    ? titleCase(activeMenu)
                    : activeCategoryData?.label ?? "All Content by type"}
                </strong>
              </div>
            </div>

            {!activeMenu && activeCategory === "all" ? (
              <div className="rx-explore3-list">
                {allTypes.map((entry) => (
                  <button
                    key={entry.type}
                    type="button"
                    className={`rx-explore3-ecosystem-item ${
                      effectiveAllType === entry.type ? "is-active" : ""
                    }`}
                    onClick={() => setAllType(entry.type)}
                  >
                    <span>
                      <strong>{entry.label}</strong>
                    </span>

                    <span className="rx-explore3-count">{entry.count}</span>
                  </button>
                ))}
              </div>
            ) : activeMenu ? (
              <MenuDestinationList
                menu={siteMenus.find((entry) => entry.label === activeMenu) as NavigationItem}
                selected={activeDest}
                onSelect={setActiveDest}
              />
            ) : activeCategoryData ? (
              <EcosystemList
                category={
                  activeCategoryData
                }
                selectedPath={
                  selectedTaxonomy?.path ??
                  null
                }
                onSelect={
                  selectSubcategory
                }
                content={
                  publishedContent
                }
              />
            ) : (
              <div className="rx-explore3-placeholder">
                <span>{"\u2190"}</span>

                <p>
                  Select a section from
                  Explore By.
                </p>
              </div>
            )}
          </section>

          {/* =================================================
              COLUMN 3
              ================================================= */}

          <section
            className="rx-explore3-column rx-explore3-content"
            aria-label="Content and types"
          >
            <div className="rx-explore3-column-heading">
<div>
                <p>
                  CONTENT / TYPES
                </p>

                <strong>
                  {showResults
                    ? "Search results"
                    : !activeMenu && activeCategory === "all"
                    ? allTypes.find((entry) => entry.type === effectiveAllType)
                        ?.label ?? "All Content"
                    : activeMenu
                    ? menuDestinations(
                        siteMenus.find((entry) => entry.label === activeMenu) as NavigationItem
                      ).find((entry) => entry.href === activeDest)?.label ?? "Menu pages"
                    : activeSelectionLabel}
                </strong>
              </div>

              {!showResults && activeMenu && activeDest && (
                <Link href={activeDest} className="rx-explore3-open-page">
                  Open page
                </Link>
              )}

              {showResults && (
                <button
                  type="button"
                  className="rx-explore3-clear"
                  onClick={resetFilters}
                >
                  Clear search
                </button>
              )}

              {!showResults &&
                !activeMenu &&
                selectedTaxonomy &&
                getPageForTaxonomy(
                  selectedTaxonomy.category,
                  pagePath
                ) && (
                  <Link
                    href={
                      getPageForTaxonomy(
                        selectedTaxonomy.category,
                        pagePath
                      ) as string
                    }
                    className="rx-explore3-open-page"
                  >
                    Open page
                  </Link>
                )}

              {!showResults && !activeMenu && selectedTaxonomy && (
                <button
                  type="button"
                  className="rx-explore3-clear"
                  onClick={
                    clearSelection
                  }
                >
                  Clear
                </button>
              )}
            </div>

            {showResults ? (
              <div className="rx-explore3-direct-content">
                <p className="rx-explore3-description">
                  {searchResults.length}{" "}
                  {searchResults.length === 1 ? "item" : "items"} across the
                  whole library.
                </p>

                {searchResults.length > 0 ? (
                  searchResults.map((item) => {
                    const definition = getContentTypeDefinition(
                      item.contentType
                    );

                    return (
                      <Link
                        key={item.id}
                        href={getContentHref(item)}
                        className="rx-explore3-content-link"
                      >
                        <span className="rx-explore3-content-mark" />

                        <span className="rx-explore3-content-copy">
                          <strong>{item.title}</strong>
                          <small>
                            {kindLabel(item, definition?.label ?? item.contentType)}
                          </small>
                        </span>
                      </Link>
                    );
                  })
                ) : (
                  <p className="rx-explore3-no-content">
                    Nothing matches your search yet.
                  </p>
                )}
              </div>
            ) : !activeMenu && activeCategory === "all" ? (
              <div className="rx-explore3-direct-content">
                {publishedContent
                  .filter((item) => item.contentType === effectiveAllType)
                  .map((item) => (
                    <Link
                      key={item.id}
                      href={getContentHref(item)}
                      className="rx-explore3-content-link"
                    >
                      <span className="rx-explore3-content-mark" />

                      <span className="rx-explore3-content-copy">
                        <strong>{item.title}</strong>
                      </span>
                    </Link>
                  ))}
              </div>
            ) : activeMenu && activeDest ? (
              <MenuDestinationDetail
                menu={siteMenus.find((entry) => entry.label === activeMenu) as NavigationItem}
                href={activeDest}
              />
            ) : !selectedSubcategory ? (
              <div className="rx-explore3-placeholder">
                <span>{"\u2190"}</span>

                <p>
                  Select an ecosystem section
                  to explore its types and
                  content.
                </p>
              </div>
            ) : (
              <>
                <p className="rx-explore3-description">
                  {selectedSubcategory.description}
                </p>

                {selectedSubcategory.children &&
                selectedSubcategory.children.length >
                  0 ? (
                  <div className="rx-explore3-groups">
                    {withCounts(
                      selectedSubcategory.children,
                      publishedContent,
                      activeCategory,
                      selectedTaxonomy?.path ?? []
                    ).map(
                      ({ node: group }) => {
                        const key = [
                          activeCategory,
                          ...(
                            selectedTaxonomy?.path ??
                            []
                          ),
                          group.id,
                        ].join(":");

                        return (
                          <ContentGroup
                            key={group.id}
                            categoryId={
                              activeCategory
                            }
                            group={group}
                            parentPath={
                              selectedTaxonomy?.path ??
                              []
                            }
                            content={
                              publishedContent
                            }
                            expanded={openGroups.has(
                              key
                            )}
                            onToggle={() =>
                              toggleGroup(
                                key
                              )
                            }
                          />
                        );
                      }
                    )}
                  </div>
                ) : (
                  <div className="rx-explore3-direct-content">
                    {filteredItems.length >
                    0 ? (
                      filteredItems.map(
                        (item) => {
                          const definition =
                            getContentTypeDefinition(
                              item.contentType
                            );

                          return (
                            <Link
                              key={item.id}
                              href={getContentHref(
                                item
                              )}
                              className="rx-explore3-content-link"
                            >
                              <span className="rx-explore3-content-mark" />

                              <span className="rx-explore3-content-copy">
                                <strong>
                                  {item.title}
                                </strong>

                                <small>
                                  {kindLabel(item, definition?.label ?? item.contentType)}
                                </small>
                              </span>
                            </Link>
                          );
                        }
                      )
                    ) : (
                      <p className="rx-explore3-no-content">
                        No content has been
                        added to this section
                        yet.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}
