"use client";

import Link from "next/link";

import { DEFAULT_LIBRARY, useExperienceNav } from "./ExperienceNavContext";
import styles from "./CompletionActions.module.css";

// Ways back to the experience library, shared by every interaction
// renderer so the way out is always the same (no browser Back needed):
//   - ActivityHeaderButtons puts "All experiences" next to Reset in each
//     activity's header;
//   - CompletionActions shows "Try again" + "All experiences" the moment
//     an activity is complete.
export const EXPERIENCE_LIBRARY_HREF = "/explore/experiences";

export function AllExperiencesLink({
  className = "",
  primary = false,
}: {
  className?: string;
  primary?: boolean;
}) {
  // Virtual labs lead back to Virtual Labs, everything else to Experiences.
  const library = useExperienceNav()?.library ?? DEFAULT_LIBRARY;
  return (
    <Link
      href={library.href}
      className={`rx-button ${primary ? "rx-button-primary" : "rx-button-secondary"} ${styles.libraryLink} ${className}`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
      {library.label}
    </Link>
  );
}

// Header buttons for an activity: "All experiences" beside "Reset".
export function ActivityHeaderButtons({
  onReset,
  resetDisabled = false,
  buttonClassName = "",
}: {
  onReset: () => void;
  resetDisabled?: boolean;
  buttonClassName?: string;
}) {
  return (
    <div className={styles.headerButtons}>
      <AllExperiencesLink className={buttonClassName} />
      <button
        type="button"
        onClick={onReset}
        disabled={resetDisabled}
        className={`rx-button rx-button-secondary ${buttonClassName}`}
      >
        Reset
      </button>
    </div>
  );
}

export default function CompletionActions({
  onTryAgain,
  buttonClassName = "",
}: {
  onTryAgain?: () => void;
  buttonClassName?: string;
}) {
  // Previous / Next in easiest-first order, supplied by the experience page.
  const nav = useExperienceNav();
  const noun = (nav?.library ?? DEFAULT_LIBRARY).noun;
  const previous = nav?.previous ?? null;
  const next = nav?.next ?? null;

  return (
    <div className={styles.actions}>
      {onTryAgain && (
        <button
          type="button"
          onClick={onTryAgain}
          className={`rx-button rx-button-secondary ${buttonClassName}`}
        >
          Try again
        </button>
      )}

      {previous && (
        <Link
          href={previous.href}
          title={previous.title}
          aria-label={`Previous ${noun}: ${previous.title}`}
          className={`rx-button rx-button-secondary ${styles.libraryLink} ${buttonClassName}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
          Previous
        </Link>
      )}

      {next && (
        <Link
          href={next.href}
          title={next.title}
          aria-label={`Next ${noun}: ${next.title}`}
          className={`rx-button rx-button-secondary ${styles.libraryLink} ${buttonClassName}`}
        >
          Next
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      )}

      {/* The way back to the library is the main action only when there is
          no next experience to move on to. */}
      <AllExperiencesLink className={buttonClassName} />
    </div>
  );
}
