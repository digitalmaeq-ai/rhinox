"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import "./header-nav.css";
import { EXPLORE_MENUS, menuHref, navigation, type MegaMenu } from "@/lib/site-navigation";

export default function Header({
  counts = {},
}: {
  counts?: Record<string, number>;
}) {
  const pathname = usePathname();

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  const headerRef = useRef<HTMLElement>(null);

  /*
   * Close desktop menus when clicking outside the header.
   */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /*
   * Close navigation when pressing Escape.
   */
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
        setMobileExpanded(null);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  /*
   * Prevent page scrolling while mobile navigation is open.
   */
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function toggleMenu(label: string) {
    setOpenMenu((current) => (current === label ? null : label));
  }

  function toggleMobileSection(label: string) {
    setMobileExpanded((current) =>
      current === label ? null : label
    );
  }

  /*
   * Close all navigation states before navigating.
   *
   * This replaces the previous pathname based useEffect.
   * It avoids synchronous state updates inside an effect while
   * preserving the same navigation behaviour.
   */
  function closeNavigation() {
    setOpenMenu(null);
    setMobileOpen(false);
    setMobileExpanded(null);
  }

  return (
    <header
      ref={headerRef}
      className="rx-header"
    >
      <div className="rx-header-inner">

        {/* =====================================================
            BRAND
        ====================================================== */}

        <Link
          href="/"
          className="rx-logo"
          aria-label="Rhinox Scientifica home"
          onClick={closeNavigation}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/rhinox-logo-for-light-backgrounds.svg"
            alt="Rhinox Scientifica"
            className="rx-logo-img"
            width={170}
            height={50}
          />
        </Link>

        {/* =====================================================
            DESKTOP NAVIGATION
        ====================================================== */}

        <nav
          className="rx-desktop-nav"
          aria-label="Main navigation"
        >
          <Link
            href="/"
            className={`rx-nav-link ${
              pathname === "/" ? "is-active" : ""
            }`}
            onClick={closeNavigation}
          >
            HOME
          </Link>

          {navigation.map((item) => {
            const hasMegaMenu = Boolean(item.megaMenu);
            const active = isActive(item.href);
            const menuOpen = openMenu === item.label;

            if (!hasMegaMenu) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`rx-nav-link ${
                    active ? "is-active" : ""
                  }`}
                  onClick={closeNavigation}
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <div
                key={item.label}
                className={`rx-nav-item ${
                  menuOpen ? "is-open" : ""
                }`}
              >
                <button
                  type="button"
                  className={`rx-nav-link rx-nav-trigger ${
                    active ? "is-active" : ""
                  }`}
                  aria-expanded={menuOpen}
                  aria-haspopup="true"
                  onClick={() => toggleMenu(item.label)}
                >
                  <span>{item.label}</span>

                  <span
                    className="rx-nav-chevron"
                    aria-hidden="true"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M3 4.5L6 7.5L9 4.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>

                {menuOpen && item.megaMenu && (
                  <MegaMenuPanel
                    menu={item.megaMenu}
                    counts={counts}
                    exploreLabel={item.label}
                    onNavigate={closeNavigation}
                  />
                )}
              </div>
            );
          })}
        </nav>

        {/* =====================================================
            HEADER ACTIONS
        ====================================================== */}

        <div className="rx-header-actions">

          <Link
            href="/contact"
            className="rx-header-cta"
            onClick={closeNavigation}
          >
            GET STARTED
          </Link>

          <button
            type="button"
            className={`rx-menu-toggle ${
              mobileOpen ? "is-open" : ""
            }`}
            aria-label={
              mobileOpen
                ? "Close navigation"
                : "Open navigation"
            }
            aria-expanded={mobileOpen}
            onClick={() => {
              setOpenMenu(null);
              setMobileOpen((current) => !current);
              setMobileExpanded(null);
            }}
          >
            <span />
            <span />
            <span />
          </button>

        </div>
      </div>

      {/* =======================================================
          MOBILE NAVIGATION
      ======================================================== */}

      {mobileOpen && (
        <div className="rx-mobile-navigation">

          <nav
            className="rx-mobile-nav"
            aria-label="Mobile navigation"
          >

            <Link
              href="/"
              className={`rx-mobile-link ${
                pathname === "/" ? "is-active" : ""
              }`}
              onClick={closeNavigation}
            >
              HOME
            </Link>

            {navigation.map((item) => {
              const hasMegaMenu = Boolean(item.megaMenu);
              const active = isActive(item.href);
              const expanded =
                mobileExpanded === item.label;

              if (!hasMegaMenu) {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`rx-mobile-link ${
                      active ? "is-active" : ""
                    }`}
                    onClick={closeNavigation}
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <div
                  key={item.label}
                  className={`rx-mobile-section ${
                    expanded ? "is-expanded" : ""
                  }`}
                >
                  <div className="rx-mobile-section-header">

                    <Link
                      href={item.href}
                      className={`rx-mobile-link ${
                        active ? "is-active" : ""
                      }`}
                      onClick={closeNavigation}
                    >
                      {item.label}
                    </Link>

                    <button
                      type="button"
                      className="rx-mobile-expand"
                      aria-label={`Expand ${item.label}`}
                      aria-expanded={expanded}
                      onClick={() =>
                        toggleMobileSection(item.label)
                      }
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M4 6L8 10L12 6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                  </div>

                  {expanded && item.megaMenu && (
                    <div className="rx-mobile-submenu">

                      {item.megaMenu.columns.map(
                        (column) => (
                          <div
                            key={column.title}
                            className="rx-mobile-column"
                          >
                            <p className="rx-mobile-column-title">
                              {column.title}
                            </p>

                            {column.items.map(
                              (subItem) => (
                                <Link
                                  key={subItem.label}
                                  href={subItem.href}
                                  className="rx-mobile-subitem"
                                  onClick={closeNavigation}
                                >
                                  <span>
                                    {subItem.label}
                                  </span>

                                  {subItem.badge && (
                                    <span className="rx-mobile-badge">
                                      {subItem.badge}
                                    </span>
                                  )}

                                  {counts[subItem.href] > 0 && (
                                    <span className="rx-mobile-badge">
                                      {counts[subItem.href]}
                                    </span>
                                  )}
                                </Link>
                              )
                            )}
                          </div>
                        )
                      )}

                      {item.megaMenu.featured && (
                        <div className="rx-mobile-featured">
                          <span className="rx-mobile-featured-eyebrow">
                            {item.megaMenu.featured.eyebrow}
                          </span>

                          <strong>
                            {item.megaMenu.featured.title}
                          </strong>

                          <p>
                            {item.megaMenu.featured.description}
                          </p>

                          <Link
                            href={
                              item.megaMenu.featured.href
                            }
                            className="rx-mobile-featured-link"
                            onClick={closeNavigation}
                          >
                            {
                              item.megaMenu.featured.label
                            }
                          </Link>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="rx-mobile-actions">

            <Link
              href="/contact"
              className="rx-mobile-cta"
              onClick={closeNavigation}
            >
              GET STARTED
            </Link>

          </div>
        </div>
      )}
    </header>
  );
}

/* =============================================================
   MEGA MENU PANEL
============================================================= */

function MegaMenuPanel({
  menu,
  counts,
  exploreLabel,
  onNavigate,
}: {
  menu: MegaMenu;
  counts: Record<string, number>;
  exploreLabel: string;
  onNavigate: () => void;
}) {
  const canBrowse = EXPLORE_MENUS.includes(exploreLabel);
  return (
    <div className="rx-mega-menu">

      <div className="rx-mega-menu-inner">

        {/* =====================================================
            MENU COLUMNS
        ====================================================== */}

        <div className="rx-mega-columns">

          {menu.columns.map((column) => (
            <div
              key={column.title}
              className="rx-mega-column"
            >

              <p className="rx-mega-column-title">
                {column.title}
              </p>

              <div className="rx-mega-items">

                {column.items.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="rx-mega-item"
                    onClick={onNavigate}
                  >
                    <span className="rx-mega-item-content">

                      <span className="rx-mega-item-label">
                        {item.label}
                      </span>

                      {item.description && (
                        <span className="rx-mega-item-description">
                          {item.description}
                        </span>
                      )}

                    </span>

                    {item.badge && (
                      <span className="rx-mega-badge">
                        {item.badge}
                      </span>
                    )}

                    {counts[item.href] > 0 && (
                      <span
                        className="rx-mega-count"
                        title="Live items in the Explore library"
                      >
                        {counts[item.href]}
                      </span>
                    )}

                  </Link>
                ))}

              </div>
            </div>
          ))}

        </div>

        {/* =====================================================
            FEATURED PANEL
        ====================================================== */}

        {menu.featured && (
          <div className="rx-mega-featured">

            <span className="rx-mega-featured-eyebrow">
              {menu.featured.eyebrow}
            </span>

            <h3>
              {menu.featured.title}
            </h3>

            <p>
              {menu.featured.description}
            </p>

            <Link
              href={menu.featured.href}
              className="rx-mega-featured-link"
              onClick={onNavigate}
            >
              <span>
                {menu.featured.label}
              </span>
            </Link>

            {canBrowse && (
              <Link
                href={menuHref(exploreLabel)}
                className="rx-mega-explore-link"
                onClick={onNavigate}
              >
                Browse in Explore
              </Link>
            )}

          </div>
        )}

      </div>
    </div>
  );
}