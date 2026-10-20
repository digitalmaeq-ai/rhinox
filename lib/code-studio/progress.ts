// Which exercises a learner has completed, and the unsaved work in each one.
// Kept in this browser only (localStorage), like My Projects.
import { MAX_CODE_CHARS } from "./project";

export const PROGRESS_KEY = "rhinox-code-studio";
const CHANGE_EVENT = "rhinox-code-studio-changed";

export interface Progress {
  completed: string[];
  /** Unsaved work, by exercise id ("free" for free coding). */
  drafts: Record<string, string>;
}

export interface KeyValue {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function browserStorage(): KeyValue | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function parseProgress(raw: string | null): Progress {
  const empty: Progress = { completed: [], drafts: {} };
  if (!raw) return empty;
  try {
    const parsed = JSON.parse(raw) as Partial<Progress>;
    const completed = Array.isArray(parsed.completed) ? parsed.completed.filter((x): x is string => typeof x === "string") : [];
    const drafts: Record<string, string> = {};
    if (parsed.drafts && typeof parsed.drafts === "object") {
      for (const [key, value] of Object.entries(parsed.drafts)) {
        if (typeof value === "string" && value.length <= MAX_CODE_CHARS) drafts[key] = value;
      }
    }
    return { completed, drafts };
  } catch {
    return empty;
  }
}

/** A string that changes whenever progress does. "" means storage is unavailable. */
export function progressSnapshot(kv: KeyValue | null = browserStorage()): string {
  if (!kv) return "";
  try {
    return `p:${kv.getItem(PROGRESS_KEY) ?? ""}`;
  } catch {
    return "";
  }
}

export function progressFromSnapshot(snapshot: string): Progress {
  return parseProgress(snapshot.startsWith("p:") ? snapshot.slice(2) : null);
}

function write(progress: Progress, kv: KeyValue | null) {
  if (!kv) return;
  try {
    kv.setItem(PROGRESS_KEY, JSON.stringify(progress));
    if (typeof window !== "undefined" && kv === window.localStorage) window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    /* storage full or blocked: progress simply is not kept */
  }
}

export function markCompleted(id: string, kv: KeyValue | null = browserStorage()) {
  const progress = parseProgress(kv?.getItem(PROGRESS_KEY) ?? null);
  if (!progress.completed.includes(id)) write({ ...progress, completed: [...progress.completed, id] }, kv);
}

export function saveDraft(id: string, code: string, kv: KeyValue | null = browserStorage()) {
  if (code.length > MAX_CODE_CHARS) return;
  const progress = parseProgress(kv?.getItem(PROGRESS_KEY) ?? null);
  write({ ...progress, drafts: { ...progress.drafts, [id]: code } }, kv);
}

export function subscribeProgress(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === PROGRESS_KEY) onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}
