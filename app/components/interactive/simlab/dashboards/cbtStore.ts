// Remembers CBT attempts in this browser only, one list per lab.
// Everything is wrapped in try/catch: storage can be missing or blocked,
// and the page must still work.

export type Attempt = {
  t: number;
  score: number;
  total: number;
  percent: number;
  level: string;
  seconds: number;
  topics: Record<string, [number, number]>;
};

export function parseAttempts(raw: string): Attempt[] {
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? (data as Attempt[]) : [];
  } catch {
    return [];
  }
}

export type CbtStore = {
  subscribe: (callback: () => void) => () => void;
  getSnapshot: () => string;
  getServerSnapshot: () => string;
  saveAttempt: (attempt: Attempt) => void;
  clearAttempts: () => void;
};

const stores = new Map<string, CbtStore>();

/** The (cached) store for one lab. `labId` "titration" keeps its original key. */
export function storeFor(labId: string): CbtStore {
  const hit = stores.get(labId);
  if (hit) return hit;
  const KEY = `rhinox.${labId}.cbt.v1`;
  const listeners = new Set<() => void>();

  const read = (): string => {
    try {
      return window.localStorage.getItem(KEY) ?? "[]";
    } catch {
      return "[]";
    }
  };
  const write = (list: Attempt[]) => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(list.slice(-30)));
    } catch {
      /* storage unavailable: progress simply is not kept */
    }
    listeners.forEach((l) => l());
  };

  const store: CbtStore = {
    subscribe(callback) {
      listeners.add(callback);
      const onStorage = (e: StorageEvent) => {
        if (e.key === KEY) callback();
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(callback);
        window.removeEventListener("storage", onStorage);
      };
    },
    getSnapshot: read,
    getServerSnapshot: () => "[]",
    saveAttempt: (attempt) => write([...parseAttempts(read()), attempt]),
    clearAttempts: () => write([]),
  };
  stores.set(labId, store);
  return store;
}
