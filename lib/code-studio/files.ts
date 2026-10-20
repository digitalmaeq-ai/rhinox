// The files a program can read and write (CSV, text and similar). They live in
// this browser only: the page keeps them, hands them to the Python worker at the
// start of every run, and takes back whatever the program left behind. Nothing
// here runs Python. Everything that comes from outside (the worker, storage, an
// uploaded file) is checked here before it is kept.
import {
  FILE_EXTENSIONS,
  MAX_FILE_CHARS,
  MAX_FILE_NAME_CHARS,
  MAX_FILES,
  MAX_TOTAL_FILE_CHARS,
} from "./limits";

export const FILES_KEY = "rhinox-code-studio-files";
const CHANGE_EVENT = "rhinox-code-studio-files-changed";

export interface ProgramFile {
  name: string;
  text: string;
}

export interface KeyValue {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const NAME_PATTERN = new RegExp(`^[A-Za-z0-9][A-Za-z0-9_.-]{0,${MAX_FILE_NAME_CHARS - 1}}$`);

/** The words shown to a learner when a name is not allowed. */
export const FILE_NAME_RULE = `Use letters, numbers, dots, dashes or underscores (at most ${MAX_FILE_NAME_CHARS} characters), ending in ${FILE_EXTENSIONS.join(", ")}.`;

export function isValidFileName(name: unknown): boolean {
  if (typeof name !== "string" || !NAME_PATTERN.test(name)) return false;
  const lower = name.toLowerCase();
  return FILE_EXTENSIONS.some((extension) => lower.endsWith(extension) && lower.length > extension.length);
}

/** Turns the name of a file the learner picked into one that is allowed, or null if it cannot be. */
export function cleanUploadName(raw: string): string | null {
  const base = raw.split(/[\\/]/).pop() ?? "";
  let name = base.trim().replace(/\s+/g, "_").replace(/[^A-Za-z0-9_.-]/g, "");
  name = name.replace(/^[._-]+/, "");
  if (name.length > MAX_FILE_NAME_CHARS) {
    const dot = name.lastIndexOf(".");
    const extension = dot > 0 ? name.slice(dot) : "";
    name = name.slice(0, MAX_FILE_NAME_CHARS - extension.length) + extension;
  }
  return isValidFileName(name) ? name : null;
}

export function totalChars(files: readonly ProgramFile[]): number {
  return files.reduce((sum, file) => sum + file.text.length, 0);
}

/**
 * Checks a list of files that came from somewhere untrusted. Keeps the ones that
 * are allowed, drops the rest, and says why in plain words.
 */
export function cleanFiles(input: unknown): { files: ProgramFile[]; notes: string[] } {
  const files: ProgramFile[] = [];
  const notes: string[] = [];
  if (!Array.isArray(input)) return { files, notes };
  let total = 0;
  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const { name, text } = item as Record<string, unknown>;
    if (typeof text !== "string" || typeof name !== "string") continue;
    if (!isValidFileName(name)) {
      notes.push(`${name.slice(0, 40)}: not kept. ${FILE_NAME_RULE}`);
    } else if (files.some((f) => f.name === name)) {
      notes.push(`${name}: listed twice, the first one was kept.`);
    } else if (text.length > MAX_FILE_CHARS) {
      notes.push(`${name}: not kept, it is longer than ${MAX_FILE_CHARS.toLocaleString("en")} characters.`);
    } else if (files.length >= MAX_FILES) {
      notes.push(`${name}: not kept, you can keep at most ${MAX_FILES} files.`);
    } else if (total + text.length > MAX_TOTAL_FILE_CHARS) {
      notes.push(`${name}: not kept, all files together can hold at most ${MAX_TOTAL_FILE_CHARS.toLocaleString("en")} characters.`);
    } else {
      files.push({ name, text });
      total += text.length;
    }
  }
  return { files, notes };
}

/** Adds or replaces one file. Returns the new list, or a sentence saying why not. */
export function putFile(files: readonly ProgramFile[], file: ProgramFile): { files: ProgramFile[] } | { error: string } {
  if (!isValidFileName(file.name)) return { error: `"${file.name.slice(0, 40)}" cannot be used as a file name. ${FILE_NAME_RULE}` };
  if (file.text.length > MAX_FILE_CHARS) {
    return { error: `${file.name} is too long. A file can hold at most ${MAX_FILE_CHARS.toLocaleString("en")} characters.` };
  }
  const others = files.filter((f) => f.name !== file.name);
  if (others.length >= MAX_FILES) return { error: `You can keep at most ${MAX_FILES} files. Delete one first.` };
  if (totalChars(others) + file.text.length > MAX_TOTAL_FILE_CHARS) {
    return { error: `There is not enough room. All files together can hold at most ${MAX_TOTAL_FILE_CHARS.toLocaleString("en")} characters.` };
  }
  const next = [...others, file].sort((a, b) => a.name.localeCompare(b.name));
  return { files: next };
}

export function removeFile(files: readonly ProgramFile[], name: string): ProgramFile[] {
  return files.filter((file) => file.name !== name);
}

export function parseFiles(raw: string | null): ProgramFile[] {
  if (!raw) return [];
  try {
    return cleanFiles(JSON.parse(raw)).files;
  } catch {
    return [];
  }
}

function browserStorage(): KeyValue | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** A string that changes whenever the files do. "" means storage is unavailable. */
export function filesSnapshot(kv: KeyValue | null = browserStorage()): string {
  if (!kv) return "";
  try {
    return `f:${kv.getItem(FILES_KEY) ?? ""}`;
  } catch {
    return "";
  }
}

export function filesFromSnapshot(snapshot: string): ProgramFile[] {
  return parseFiles(snapshot.startsWith("f:") ? snapshot.slice(2) : null);
}

/** Keeps the files. Returns false when the browser would not store them. */
export function saveFiles(files: readonly ProgramFile[], kv: KeyValue | null = browserStorage()): boolean {
  if (!kv) return false;
  try {
    kv.setItem(FILES_KEY, JSON.stringify(files));
    if (typeof window !== "undefined" && kv === window.localStorage) window.dispatchEvent(new Event(CHANGE_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function subscribeFiles(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === FILES_KEY) onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** The name and type to use when the learner downloads a file. */
export function downloadInfo(file: ProgramFile): { filename: string; type: string; content: string } {
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".csv") || lower.endsWith(".tsv")) {
    // A byte-order mark makes Excel and other spreadsheet programs read accents and symbols correctly.
    return { filename: file.name, type: "text/csv;charset=utf-8", content: `\ufeff${file.text}` };
  }
  if (lower.endsWith(".json")) return { filename: file.name, type: "application/json;charset=utf-8", content: file.text };
  return { filename: file.name, type: "text/plain;charset=utf-8", content: file.text };
}

export function describeSize(file: ProgramFile): string {
  const chars = file.text.length;
  if (chars < 1000) return `${chars} characters`;
  return `${(chars / 1000).toFixed(chars < 10_000 ? 1 : 0)} thousand characters`;
}
