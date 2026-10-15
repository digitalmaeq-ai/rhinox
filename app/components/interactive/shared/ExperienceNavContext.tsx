"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * The experience before and after the one being played, in easiest-first
 * order. The experience page provides it; the shared completion buttons
 * (CompletionActions) read it, so every renderer gets Previous / Next beside
 * "Try again" without each one being changed. Outside an experience page
 * there is no provider and no Previous / Next appear.
 */
export interface ExperienceStep {
  title: string;
  href: string;
}

/** Where "All experiences" leads: the library the current item belongs to. */
export interface ExperienceLibraryLink {
  href: string;
  /** Button text, e.g. "All experiences" or "All virtual labs". */
  label: string;
  /** Singular noun for accessible labels, e.g. "experience" or "virtual lab". */
  noun: string;
}

export const DEFAULT_LIBRARY: ExperienceLibraryLink = {
  href: "/explore/experiences",
  label: "All experiences",
  noun: "experience",
};

interface ExperienceNav {
  previous: ExperienceStep | null;
  next: ExperienceStep | null;
  library?: ExperienceLibraryLink;
}

const ExperienceNavContext = createContext<ExperienceNav | null>(null);

export function ExperienceNavProvider({
  previous,
  next,
  library,
  children,
}: ExperienceNav & { children: ReactNode }) {
  return (
    <ExperienceNavContext.Provider value={{ previous, next, library }}>
      {children}
    </ExperienceNavContext.Provider>
  );
}

export function useExperienceNav() {
  return useContext(ExperienceNavContext);
}
