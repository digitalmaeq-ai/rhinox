// One place for everything a learner makes in RhinoCode (robot programmes,
// games and Python programs). Projects live in the browser (localStorage), so nothing leaves
// the device. The stored shape is versioned so it can move to an account
// database later: the functions below are the only code that knows the format.
//
// The Robot Lab's older "rhinobot-saved-programmes" list is imported the first
// time the store is written. The old key is left untouched, so nothing is lost
// if the import ever needs to be repeated.

export type ProjectKind = "robot-program" | "game" | "python" | "arduino" | "web";

export interface Project {
  id: string;
  kind: ProjectKind;
  name: string;
  createdAt: number;
  updatedAt: number;
  /** Kind-specific content (a Blockly workspace for a robot programme). */
  data: unknown;
}

export interface ProjectStore {
  version: 1;
  /** True once the old Robot Lab saves have been imported. */
  legacyImported: boolean;
  projects: Project[];
}

/** The slice of localStorage the store needs, so tests can use memory. */
export interface KeyValue {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const PROJECTS_KEY = "rhinocode-projects";
export const LEGACY_PROGRAMMES_KEY = "rhinobot-saved-programmes";
export const CHANGE_EVENT = "rhinocode-projects-changed";
export const MAX_PER_KIND = 50;
export const MAX_NAME = 40;

const KINDS: ProjectKind[] = ["robot-program", "game", "python", "arduino", "web"];

export const KIND_LABELS: Record<ProjectKind, string> = {
  "robot-program": "Robot programme",
  game: "Game",
  python: "Python program",
  arduino: "Arduino sketch",
  web: "Web page",
};

function isProject(value: unknown): value is Project {
  const p = value as Project;
  return (
    Boolean(p) &&
    typeof p.id === "string" &&
    typeof p.name === "string" &&
    KINDS.includes(p.kind) &&
    typeof p.createdAt === "number" &&
    typeof p.updatedAt === "number" &&
    "data" in p
  );
}

function parseJson(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function legacyProjects(raw: string | null): Project[] {
  const parsed = parseJson(raw);
  if (!Array.isArray(parsed)) return [];
  const out: Project[] = [];
  for (const item of parsed) {
    const old = item as { id?: unknown; name?: unknown; savedAt?: unknown; workspace?: unknown };
    if (typeof old?.id !== "string" || typeof old.name !== "string" || typeof old.savedAt !== "number" || typeof old.workspace !== "object" || !old.workspace) continue;
    out.push({ id: old.id, kind: "robot-program", name: cleanName(old.name, "My programme"), createdAt: old.savedAt, updatedAt: old.savedAt, data: old.workspace });
  }
  return out;
}

export function cleanName(name: string, fallback: string): string {
  return name.trim().replace(/\s+/g, " ").slice(0, MAX_NAME) || fallback;
}

/**
 * The store as it should be read, from the two raw stored strings. Pure:
 * until the store has been written once, the old saves are merged in memory.
 */
export function resolveStore(rawStore: string | null, rawLegacy: string | null): ProjectStore {
  const parsed = parseJson(rawStore) as Partial<ProjectStore> | null;
  const stored: ProjectStore =
    parsed && parsed.version === 1 && Array.isArray(parsed.projects)
      ? { version: 1, legacyImported: parsed.legacyImported === true, projects: parsed.projects.filter(isProject) }
      : { version: 1, legacyImported: false, projects: [] };

  if (stored.legacyImported) return stored;
  const known = new Set(stored.projects.map((p) => p.id));
  return { ...stored, projects: [...stored.projects, ...legacyProjects(rawLegacy).filter((p) => !known.has(p.id))] };
}

function browserStorage(): KeyValue | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** The raw strings the store is built from. Stable between changes, so it works as a useSyncExternalStore snapshot. */
export function projectsSnapshot(kv: KeyValue | null = browserStorage()): string {
  if (!kv) return "";
  try {
    return `${kv.getItem(PROJECTS_KEY) ?? ""}\u0000${kv.getItem(LEGACY_PROGRAMMES_KEY) ?? ""}`;
  } catch {
    return "";
  }
}

export function storeFromSnapshot(snapshot: string): ProjectStore {
  const [rawStore, rawLegacy] = snapshot.split("\u0000");
  return resolveStore(rawStore || null, rawLegacy || null);
}

export function readStore(kv: KeyValue | null = browserStorage()): ProjectStore {
  return storeFromSnapshot(projectsSnapshot(kv));
}

function writeStore(store: ProjectStore, kv: KeyValue | null): boolean {
  if (!kv) return false;
  try {
    kv.setItem(PROJECTS_KEY, JSON.stringify({ ...store, legacyImported: true }));
    if (typeof window !== "undefined" && kv === window.localStorage) window.dispatchEvent(new Event(CHANGE_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function listProjects(kind?: ProjectKind, kv: KeyValue | null = browserStorage()): Project[] {
  return readStore(kv)
    .projects.filter((p) => !kind || p.kind === kind)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getProject(id: string, kv: KeyValue | null = browserStorage()): Project | undefined {
  return readStore(kv).projects.find((p) => p.id === id);
}

let counter = 0;
function newId(now: number): string {
  counter += 1;
  return `p${now.toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}

/** Saves a new project. Past MAX_PER_KIND the oldest of that kind is dropped. */
export function createProject(kind: ProjectKind, name: string, data: unknown, kv: KeyValue | null = browserStorage(), now = Date.now()): Project {
  const project: Project = { id: newId(now), kind, name: cleanName(name, "My project"), createdAt: now, updatedAt: now, data };
  const store = readStore(kv);
  const ofKind = store.projects.filter((p) => p.kind === kind).sort((a, b) => b.updatedAt - a.updatedAt);
  const dropped = new Set(ofKind.slice(MAX_PER_KIND - 1).map((p) => p.id));
  writeStore({ ...store, projects: [project, ...store.projects.filter((p) => !dropped.has(p.id))] }, kv);
  return project;
}

export function updateProjectData(id: string, data: unknown, kv: KeyValue | null = browserStorage(), now = Date.now()): void {
  const store = readStore(kv);
  writeStore({ ...store, projects: store.projects.map((p) => (p.id === id ? { ...p, data, updatedAt: now } : p)) }, kv);
}

export function renameProject(id: string, name: string, kv: KeyValue | null = browserStorage()): void {
  const store = readStore(kv);
  writeStore({ ...store, projects: store.projects.map((p) => (p.id === id ? { ...p, name: cleanName(name, p.name) } : p)) }, kv);
}

export function deleteProject(id: string, kv: KeyValue | null = browserStorage()): void {
  const store = readStore(kv);
  writeStore({ ...store, projects: store.projects.filter((p) => p.id !== id) }, kv);
}

/** Subscribes to changes from this tab and from other tabs. */
export function subscribeProjects(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === PROJECTS_KEY || event.key === LEGACY_PROGRAMMES_KEY) onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}
