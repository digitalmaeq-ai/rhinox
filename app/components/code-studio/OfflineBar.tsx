"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import {
  isSaved,
  offlineSupported,
  removeOfflineCopy,
  saveForOffline,
  type OfflineStatus,
} from "@/lib/code-studio/offline";

import styles from "./CodeStudio.module.css";

// The browser's own "install" offer. Not in the standard type definitions.
interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const noopSubscribe = () => () => {};

function subscribeOnline(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

// "Save for offline use": keeps Code Studio in this browser so it opens and runs
// with no internet, and lets it be installed like an app. Shown only in browsers
// that can do it (secure page, service workers and cache storage).
export default function OfflineBar() {
  const [status, setStatus] = useState<OfflineStatus>("checking");
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [message, setMessage] = useState("");
  const [installable, setInstallable] = useState(false);
  const installEvent = useRef<InstallPrompt | null>(null);
  const online = useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true);
  const supported = useSyncExternalStore(noopSubscribe, offlineSupported, () => false);

  useEffect(() => {
    let live = true;
    if (!supported) return;
    void isSaved().then((saved) => {
      if (live) setStatus(saved ? "ready" : "not-saved");
    });
    const onPrompt = (event: Event) => {
      event.preventDefault();
      installEvent.current = event as InstallPrompt;
      setInstallable(true);
    };
    const onInstalled = () => {
      installEvent.current = null;
      setInstallable(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      live = false;
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [supported]);

  async function save() {
    setStatus("saving");
    setMessage("");
    setProgress({ done: 0, total: 0 });
    try {
      await saveForOffline((done, total) => setProgress({ done, total }));
      setStatus("ready");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not save Code Studio for offline use.");
    }
  }

  async function remove() {
    try {
      await removeOfflineCopy();
      setStatus("not-saved");
      setMessage("");
    } catch {
      setMessage("Could not remove the saved copy.");
    }
  }

  async function install() {
    const event = installEvent.current;
    if (!event) return;
    await event.prompt();
    await event.userChoice;
    installEvent.current = null;
    setInstallable(false);
  }

  if (!supported || status === "checking") return null;

  return (
    <div className={styles.offline} role="status" aria-live="polite">
      {status === "not-saved" && (
        <>
          <span>
            {online
              ? "Want to code without internet? Save Code Studio on this device (about 15 MB)."
              : "You are offline, and Code Studio is not saved on this device yet."}
          </span>
          <button type="button" onClick={() => void save()} disabled={!online}>
            Save for offline use
          </button>
        </>
      )}
      {status === "saving" && (
        <>
          <span>
            Saving for offline use… {progress.total > 0 ? `${progress.done} of ${progress.total} files` : "starting"}
          </span>
          <progress value={progress.done} max={Math.max(1, progress.total)} aria-label="Saving for offline use" />
        </>
      )}
      {status === "ready" && (
        <>
          <span>
            {online
              ? "Saved for offline use. Code Studio will open without internet. Your programs and files stay in this browser."
              : "You are offline. Code Studio is running from the saved copy. My Projects and the rest of the site need internet."}
          </span>
          {installable && (
            <button type="button" onClick={() => void install()}>
              Install as an app
            </button>
          )}
          {online && (
            <button type="button" onClick={() => void remove()}>
              Remove saved copy
            </button>
          )}
        </>
      )}
      {status === "error" && (
        <>
          <span>{message}</span>
          <button type="button" onClick={() => void save()} disabled={!online}>
            Try again
          </button>
        </>
      )}
      {status !== "error" && message && <span>{message}</span>}
    </div>
  );
}
