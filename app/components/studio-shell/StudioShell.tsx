"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

import styles from "./StudioShell.module.css";

interface NavItem {
  label: string;
  href: string;
  /** Extra path prefixes that also mean "I am in this section". */
  alsoActive?: string[];
  hint: string;
}

interface NavGroup {
  heading: string;
  items: NavItem[];
}

// Every link is an existing route. Challenges lives in the main site catalogue,
// so it opens outside the shell.
export const NAV_GROUPS: NavGroup[] = [
  {
    heading: "Start",
    items: [
      { label: "Overview", href: "/coding-robotics/studio", hint: "All tools, your projects and learning resources" },
      {
        label: "Learn",
        href: "/coding-robotics/code-studio/learn",
        alsoActive: ["/coding-robotics/code-studio/guided"],
        hint: "Guided, curriculum-led lessons",
      },
    ],
  },
  {
    heading: "Coding",
    items: [
      { label: "Python Studio", href: "/coding-robotics/code-studio", hint: "Write and run real Python" },
      { label: "Web Studio", href: "/coding-robotics/code-studio/web", hint: "Build web pages with HTML and CSS" },
    ],
  },
  {
    heading: "Robotics",
    items: [
      { label: "Beginner Workspace", href: "/coding-robotics/code-studio/workspace", hint: "Sequence instructions for a robot" },
      { label: "Robot Lab", href: "/coding-robotics/robot-lab", hint: "Program a robot with blocks" },
      { label: "Arduino Studio", href: "/coding-robotics/code-studio/arduino", hint: "Program a simulated Arduino board" },
    ],
  },
  {
    heading: "Games",
    items: [
      { label: "Game Creator", href: "/coding-robotics/game-creator", hint: "Design and play your own game" },
      { label: "Challenges", href: "/coding-robotics/challenges", hint: "Short coding puzzles (opens the main site)" },
    ],
  },
  {
    heading: "Your work",
    items: [{ label: "My Projects", href: "/coding-robotics/my-projects", hint: "Everything you have saved" }],
  },
];

function isActive(pathname: string, item: NavItem): boolean {
  if (pathname === item.href || pathname === `${item.href}/`) return true;
  return (item.alsoActive ?? []).some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function currentLabel(pathname: string): string {
  for (const group of NAV_GROUPS) {
    for (const item of group.items) if (isActive(pathname, item)) return item.label;
  }
  return "Code Studio";
}

// The shared Code Studio frame: a compact navigation rail beside the workspace.
// On a desktop the frame fills the screen below the site header, so the working
// area is seen at once and only the panels inside it scroll. On narrow screens
// the rail becomes a menu and the page scrolls normally.
export default function StudioShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFor, setOpenFor] = useState(pathname);

  // Choosing a destination closes the menu: reset when the route changes.
  if (openFor !== pathname) {
    setOpenFor(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const here = currentLabel(pathname);

  // The frame fills exactly the space below the site header. The header's height
  // changes with screen width, so measure where the frame starts instead of
  // guessing a number.
  const shellRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    function measure() {
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      el.style.setProperty("--shell-header", `${Math.ceil(top)}px`);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <div ref={shellRef} className={styles.shell} data-studio-shell>
      <div className={styles.mobileBar}>
        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={menuOpen}
          aria-controls="studio-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span aria-hidden="true" className={styles.burger} />
          Studio menu
        </button>
        <span className={styles.mobileHere}>{here}</span>
      </div>

      <nav
        id="studio-nav"
        aria-label="Code Studio"
        className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`}
      >
        <p className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true" />
          Rhinox Code Studio
        </p>
        {NAV_GROUPS.map((group) => (
          <div key={group.heading} className={styles.group}>
            <p className={styles.groupHeading}>{group.heading}</p>
            <ul>
              {group.items.map((item) => {
                const active = isActive(pathname, item);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={item.hint}
                      className={`${styles.link} ${active ? styles.active : ""}`}
                      aria-current={active ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {menuOpen && <button type="button" className={styles.scrim} aria-label="Close studio menu" onClick={() => setMenuOpen(false)} />}

      <div className={styles.content}>{children}</div>
    </div>
  );
}
