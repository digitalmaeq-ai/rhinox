"use client";

import Link from "next/link";
import { useId, useMemo, useState, useSyncExternalStore } from "react";

import { projectsSnapshot, storeFromSnapshot, subscribeProjects, KIND_LABELS } from "@/lib/rhinocode/projects";
import {
  STUDIO_ENTRIES,
  availableCategories,
  filterEntries,
  projectHref,
  sortEntries,
  sortProjects,
  type EntrySort,
  type ProjectSort,
  type StudioCategory,
} from "@/lib/studio-directory";

import styles from "./StudioOverview.module.css";

export interface ResourceRow {
  id: string;
  title: string;
  detail: string;
  href: string;
}

const PANELS_KEY = "rhinox-studio-overview-panels";
const PANELS_EVENT = "rhinox-studio-overview-panels-changed";
const DEFAULT_PANELS = { resources: false };
type Panels = typeof DEFAULT_PANELS;

// Which accordions are open is remembered on this device. Storage can be
// blocked, so every read and write is guarded and the defaults still work.
function readPanelsRaw(): string {
  try {
    return window.localStorage.getItem(PANELS_KEY) ?? "";
  } catch {
    return "";
  }
}

function subscribePanels(onChange: () => void): () => void {
  window.addEventListener(PANELS_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(PANELS_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function parsePanels(raw: string): Panels {
  try {
    const parsed = JSON.parse(raw) as Partial<Panels>;
    return { resources: typeof parsed.resources === "boolean" ? parsed.resources : DEFAULT_PANELS.resources };
  } catch {
    return DEFAULT_PANELS;
  }
}

function when(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

const COLUMNS: { key: EntrySort; label: string }[] = [
  { key: "name", label: "Tool" },
  { key: "category", label: "Category" },
  { key: "difficulty", label: "Difficulty" },
];

// The Code Studio overview: a compact, searchable directory of every tool, the
// learner's recent projects, and supporting resources in an accordion.
export default function StudioOverview({ resources }: { resources: ResourceRow[] }) {
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<StudioCategory | "All">("All");
  const [sort, setSort] = useState<EntrySort>("category");
  const [descending, setDescending] = useState(false);
  const [projectSort, setProjectSort] = useState<ProjectSort>("updated");
  const [projectKind, setProjectKind] = useState<string>("all");

  const panelsRaw = useSyncExternalStore(subscribePanels, readPanelsRaw, () => "");
  const panels = useMemo(() => parsePanels(panelsRaw), [panelsRaw]);
  const resourcesOpen = panels.resources;

  function toggleResources() {
    try {
      window.localStorage.setItem(PANELS_KEY, JSON.stringify({ ...panels, resources: !resourcesOpen }));
    } catch {
      /* storage blocked: the accordion still works for this visit through the event below */
    }
    window.dispatchEvent(new Event(PANELS_EVENT));
  }

  const snapshot = useSyncExternalStore(subscribeProjects, projectsSnapshot, () => "");
  const allProjects = useMemo(() => (snapshot ? storeFromSnapshot(snapshot).projects : []), [snapshot]);
  const projectKinds = useMemo(() => [...new Set(allProjects.map((p) => p.kind))], [allProjects]);
  const projects = useMemo(
    () => sortProjects(allProjects.filter((p) => projectKind === "all" || p.kind === projectKind), projectSort),
    [allProjects, projectKind, projectSort],
  );

  const categories = useMemo(() => availableCategories(STUDIO_ENTRIES), []);
  const rows = useMemo(
    () => sortEntries(filterEntries(STUDIO_ENTRIES, query, category), sort, descending),
    [query, category, sort, descending],
  );

  function onSort(key: EntrySort) {
    if (key === sort) setDescending((d) => !d);
    else {
      setSort(key);
      setDescending(false);
    }
  }

  function ariaSort(key: EntrySort): "ascending" | "descending" | "none" {
    if (key !== sort) return "none";
    return descending ? "descending" : "ascending";
  }

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <div>
          <h1>Overview</h1>
          <p>Every Code Studio tool in one place. Search, sort or filter, then open one.</p>
        </div>
        <div className={styles.controls}>
          <label className={styles.search} htmlFor={searchId}>
            <span className={styles.srOnly}>Search tools</span>
            <input
              id={searchId}
              type="search"
              value={query}
              placeholder="Search tools, e.g. robot, Python"
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className={styles.chips} role="group" aria-label="Filter by category">
            {(["All", ...categories] as const).map((name) => (
              <button
                key={name}
                type="button"
                className={`${styles.chip} ${category === name ? styles.chipOn : ""}`}
                aria-pressed={category === name}
                onClick={() => setCategory(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className={styles.body}>
        <section className={styles.tools} aria-labelledby="tools-heading">
          <h2 id="tools-heading" className={styles.srOnly}>Tools</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {COLUMNS.map((col) => (
                    <th key={col.key} scope="col" aria-sort={ariaSort(col.key)}>
                      <button type="button" className={styles.sortButton} onClick={() => onSort(col.key)}>
                        {col.label}
                        <span aria-hidden="true" className={styles.arrow}>
                          {col.key === sort ? (descending ? "▼" : "▲") : ""}
                        </span>
                      </button>
                    </th>
                  ))}
                  <th scope="col">Level</th>
                  <th scope="col" className={styles.descCol}>What it does</th>
                  <th scope="col"><span className={styles.srOnly}>Action</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((entry) => (
                  <tr key={entry.id}>
                    <th scope="row" className={styles.name}>{entry.name}</th>
                    <td>{entry.category}</td>
                    <td>{entry.difficulty}</td>
                    <td>{entry.level}</td>
                    <td className={styles.descCol}>{entry.description}</td>
                    <td className={styles.actionCell}>
                      <Link href={entry.href} className={styles.open} aria-label={`Open ${entry.name}`}>Open</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && (
              <p className={styles.empty} role="status">
                No tools match that search. Clear the search or choose All.
              </p>
            )}
          </div>
          <p className={styles.count} role="status">
            Showing {rows.length} of {STUDIO_ENTRIES.length} tools
          </p>

          <div className={styles.accordion}>
            <h2>
              <button
                type="button"
                className={styles.accButton}
                aria-expanded={resourcesOpen}
                aria-controls="resources-panel"
                onClick={toggleResources}
              >
                <span>Learning resources</span>
                <span className={styles.accHint}>{resources.length} exercise sets and lessons</span>
                <span aria-hidden="true" className={styles.chev}>{resourcesOpen ? "−" : "+"}</span>
              </button>
            </h2>
            {resourcesOpen && (
              <ul id="resources-panel" className={styles.resources}>
                {resources.map((row) => (
                  <li key={row.id}>
                    <Link href={row.href}>{row.title}</Link>
                    <span>{row.detail}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <aside className={styles.projects} aria-labelledby="projects-heading">
          <div className={styles.projectsHead}>
            <h2 id="projects-heading">My recent projects</h2>
            <Link href="/coding-robotics/my-projects">See all</Link>
          </div>
          {allProjects.length > 0 && (
            <div className={styles.projectControls}>
              <label>
                <span className={styles.srOnly}>Sort projects</span>
                <select value={projectSort} onChange={(event) => setProjectSort(event.target.value as ProjectSort)}>
                  <option value="updated">Recently modified</option>
                  <option value="name">Name</option>
                  <option value="type">Type</option>
                </select>
              </label>
              <label>
                <span className={styles.srOnly}>Filter projects by type</span>
                <select value={projectKind} onChange={(event) => setProjectKind(event.target.value)}>
                  <option value="all">All types</option>
                  {projectKinds.map((kind) => (
                    <option key={kind} value={kind}>{KIND_LABELS[kind]}</option>
                  ))}
                </select>
              </label>
            </div>
          )}
          {allProjects.length === 0 ? (
            <p className={styles.noProjects}>
              Nothing saved yet. Open a tool and save your work. It will appear here on this device.
            </p>
          ) : (
            <ul className={styles.projectList}>
              {projects.map((project) => (
                <li key={project.id}>
                  <div>
                    <strong>{project.name}</strong>
                    <span>{KIND_LABELS[project.kind]} · {when(project.updatedAt)}</span>
                  </div>
                  <Link href={projectHref(project)} aria-label={`Open ${project.name}`}>Open</Link>
                </li>
              ))}
              {projects.length === 0 && <li className={styles.noProjects}>No projects of that type.</li>}
            </ul>
          )}
        </aside>
      </div>
    </main>
  );
}
