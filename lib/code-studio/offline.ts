// Saving Code Studio for offline use. The page keeps its own files, the Python
// runtime and the pictures in the browser's cache, and a small service worker
// (public/code-studio/offline-sw.js) hands them back when there is no internet.
// Everything stays in this browser. Nothing here runs a learner's Python.
import { MICROBIT_URL, PYODIDE_BASE, WORKER_URL } from "./limits";
import { ARDUINO_WORKER_URL } from "./arduino";

const ARDUINO_VM_URL = "/coding-robotics/code-studio/arduino-vm.js";
const ARDUINO_BOARDS_URL = "/coding-robotics/code-studio/arduino-boards.js";

/** The saved copy. Must match CACHE in public/code-studio/offline-sw.js (a test checks it). */
export const OFFLINE_CACHE = "rhinox-code-studio-offline-v1";
export const SW_URL = "/code-studio/offline-sw.js";
export const PAGE_PATH = "/coding-robotics/code-studio";
/** Arduino Studio lives under the Code Studio path, so the same service worker and saved copy cover it. */
export const ARDUINO_PAGE_PATH = "/coding-robotics/code-studio/arduino";
export const WEB_PAGE_PATH = "/coding-robotics/code-studio/web";
export type StudioKind = "python" | "arduino" | "web";
/** The service worker only controls the Code Studio page, never the rest of the site. */
export const SW_SCOPE = "/coding-robotics/code-studio";

/** The files the self-hosted Python runtime needs. Must match FILES in scripts/copy-code-studio-assets.mjs (a test checks it). */
export const PYODIDE_FILES = ["pyodide.mjs", "pyodide.asm.mjs", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json"] as const;

/** Where a saved page, picture or script is allowed to come from. Everything else is never saved. */
const ALLOWED_PREFIXES = ["/_next/static/", "/pyodide/", "/code-studio/", "/coding-robotics/code-studio/", "/brand/", "/images/", "/fonts/"];
const MAX_EXTRA_FILES = 300;

/** True for a same-site address that is safe and useful to keep. */
export function isSaveable(address: string, origin: string): boolean {
  let url: URL;
  try {
    url = new URL(address, origin);
  } catch {
    return false;
  }
  if (url.origin !== origin) return false;
  if (url.pathname.includes("..") || url.pathname.includes("//")) return false;
  if (url.pathname === SW_URL) return false;
  return ALLOWED_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
}

/** The files that must be saved for Code Studio to run offline, in the order they are fetched. */
export function requiredAddresses(kind: StudioKind = "python"): string[] {
  if (kind === "web") return [WEB_PAGE_PATH, "/code-studio/manifest.webmanifest", "/code-studio/icon-192.png"];
  if (kind === "arduino") return [ARDUINO_PAGE_PATH, ARDUINO_WORKER_URL, ARDUINO_VM_URL, ARDUINO_BOARDS_URL, "/code-studio/manifest.webmanifest", "/code-studio/icon-192.png"];
  return [PAGE_PATH, WORKER_URL, MICROBIT_URL, ...PYODIDE_FILES.map((file) => `${PYODIDE_BASE}${file}`), "/code-studio/manifest.webmanifest", "/code-studio/icon-192.png"];
}

/** Adds the scripts, styles and pictures this page has already loaded (from the browser's own list), checked and without repeats. */
export function allAddresses(loaded: readonly string[], origin: string, kind: StudioKind = "python"): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const address of requiredAddresses(kind)) {
    if (!seen.has(address)) {
      seen.add(address);
      out.push(address);
    }
  }
  let extra = 0;
  for (const raw of loaded) {
    if (extra >= MAX_EXTRA_FILES) break;
    if (!isSaveable(raw, origin)) continue;
    const url = new URL(raw, origin);
    const address = url.pathname + url.search;
    if (seen.has(address)) continue;
    seen.add(address);
    out.push(address);
    extra += 1;
  }
  return out;
}

export type OfflineStatus = "unsupported" | "checking" | "not-saved" | "saving" | "ready" | "error";

export function offlineSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    window.isSecureContext &&
    "serviceWorker" in navigator &&
    "caches" in window &&
    process.env.NODE_ENV === "production"
  );
}

/** Whether the saved copy is complete: everything required is in the cache. */
export async function isSaved(kind: StudioKind = "python"): Promise<boolean> {
  try {
    if (!(await caches.has(OFFLINE_CACHE))) return false;
    const cache = await caches.open(OFFLINE_CACHE);
    for (const address of requiredAddresses(kind)) {
      if (!(await cache.match(address, { ignoreVary: true }))) return false;
    }
    return true;
  } catch {
    return false;
  }
}

function loadedAddresses(): string[] {
  return performance.getEntriesByType("resource").map((entry) => entry.name);
}

async function keep(cache: Cache, address: string): Promise<void> {
  const response = await fetch(address, { cache: "reload", credentials: "same-origin" });
  if (!response.ok || response.redirected || response.type !== "basic") {
    throw new Error(`Could not save ${address.split("?")[0]} (${response.status}).`);
  }
  const bare = address.split("?")[0];
  await cache.put(bare === PAGE_PATH || bare === ARDUINO_PAGE_PATH || bare === WEB_PAGE_PATH ? bare : address, response);
}

/** Saves everything needed. Calls onProgress(done, total) as it goes. Throws an Error with words a learner can read. */
export async function saveForOffline(onProgress: (done: number, total: number) => void, kind: StudioKind = "python"): Promise<void> {
  if (!offlineSupported()) throw new Error("This browser cannot save Code Studio for offline use.");
  try {
    await navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE });
    await navigator.serviceWorker.ready;
    const cache = await caches.open(OFFLINE_CACHE);
    const addresses = allAddresses(loadedAddresses(), window.location.origin, kind);
    const required = new Set(requiredAddresses(kind));
    let done = 0;
    onProgress(0, addresses.length);
    // A few at a time: the Python runtime is a big file, so this keeps the page responsive.
    const queue = [...addresses];
    const failures: string[] = [];
    await Promise.all(
      Array.from({ length: 4 }, async () => {
        for (;;) {
          const address = queue.shift();
          if (!address) return;
          try {
            await keep(cache, address);
          } catch (error) {
            // A missing picture should not stop the save; a missing required file should.
            if (required.has(address)) failures.push(error instanceof Error ? error.message : String(error));
            else if (error instanceof DOMException && error.name === "QuotaExceededError") failures.push("quota");
          }
          done += 1;
          onProgress(done, addresses.length);
        }
      }),
    );
    if (failures.includes("quota")) throw new Error("There is not enough space on this device to save Code Studio.");
    if (failures.length > 0) throw new Error(failures[0]);
    if (!(await isSaved(kind))) throw new Error("The saved copy is incomplete. Check your connection and try again.");
    // Ask the browser to keep the copy (and the learner's work) when space runs low. It is allowed to say no.
    try {
      await navigator.storage?.persist?.();
    } catch {
      /* optional */
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      throw new Error("There is not enough space on this device to save Code Studio.");
    }
    throw error instanceof Error ? error : new Error("Could not save Code Studio for offline use.");
  }
}

/** Deletes the saved copy and the service worker. The learner's programs and files are NOT touched. */
export async function removeOfflineCopy(): Promise<void> {
  const registration = await navigator.serviceWorker.getRegistration(SW_SCOPE);
  await registration?.unregister();
  await caches.delete(OFFLINE_CACHE);
}
