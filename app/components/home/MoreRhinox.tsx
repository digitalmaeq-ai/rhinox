"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";

import { navigation } from "@/lib/site-navigation";

import styles from "./MoreRhinox.module.css";

/**
 * "More from Rhinox": a bento grid for everything that is not a product or a
 * service: learning resources, the learner's own space (library, badges,
 * certificates) and the company. Links and descriptions come from the
 * Resources and About menus in lib/site-navigation.ts. Each tile carries a
 * small visual instead of an icon, and a soft spotlight follows the pointer.
 */

function itemsOf(href: string) {
  const menu = navigation.find((item) => item.href === href);
  return (menu?.megaMenu?.columns ?? []).flatMap((column) => column.items);
}

function spotlight(event: MouseEvent<HTMLElement>) {
  const box = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--mx", `${event.clientX - box.left}px`);
  event.currentTarget.style.setProperty("--my", `${event.clientY - box.top}px`);
}

const arrow = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

function Tile({ href, className, kind, title, text, children }: { href: string; className: string; kind: string; title: string; text?: string; children?: ReactNode }) {
  return (
    <Link href={href} className={`${styles.tile} ${className}`} onMouseMove={spotlight}>
      <span className={styles.visual} aria-hidden="true">{children}</span>
      <span className={styles.copy}>
        <span className={styles.kind}>{kind}</span>
        <strong className={styles.name}>{title}</strong>
        {text && <span className={styles.text}>{text}</span>}
      </span>
      <span className={styles.go} aria-hidden="true">{arrow}</span>
    </Link>
  );
}

export default function MoreRhinox() {
  const resources = itemsOf("/resources");
  const about = itemsOf("/about");
  const find = (list: typeof resources, href: string) => list.find((item) => item.href === href);

  const library = find(resources, "/resources/my-rhinox-library");
  const badges = find(resources, "/resources/badges");
  const certificates = find(resources, "/resources/certificates");
  const learn = ["/resources/articles", "/resources/videos", "/resources/free-downloads"]
    .map((href) => find(resources, href))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const aboutLinks = about.filter((item) => item.href !== "/about");
  const contact = navigation.find((item) => item.href === "/contact");

  return (
    <section className={styles.more} aria-labelledby="more-title">
      <div className={`rx-container ${styles.inner}`}>
        <header className={styles.head}>
          <div>
            <span className="rx-eyebrow">Resources &amp; about</span>
            <h2 id="more-title" className={styles.title}>
              Keep learning,
              <span>and keep what you earn</span>
            </h2>
          </div>
          <p className={styles.intro}>
            Read, watch and download, build your own Rhinox library, collect badges and certificates, and get to know the team behind it all.
          </p>
        </header>

        <div className={styles.grid}>
          {/* Learn: the large tile */}
          <article className={`${styles.tile} ${styles.learn}`} onMouseMove={spotlight}>
            <div className={styles.learnTop}>
              <span className={styles.kindLight}>Learn</span>
              <h3 className={styles.learnTitle}>Articles, videos and downloads for curious minds.</h3>
              <Link href="/resources" className={styles.learnAll}>
                Browse all resources
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </Link>
            </div>
            <ul className={styles.learnList}>
              {learn.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <span className={styles.learnIcon} aria-hidden="true">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d={item.href.endsWith("articles") ? "M5 4h14v16H5ZM8 8h8M8 12h8M8 16h5" : item.href.endsWith("videos") ? "M3 6h13v12H3ZM16 10l5-3v10l-5-3" : "M12 4v11M7 11l5 5 5-5M5 20h14"} />
                      </svg>
                    </span>
                    <span className={styles.learnBody}>
                      <strong>{item.label}</strong>
                      <small>{item.description}</small>
                    </span>
                    <span className={styles.learnGo} aria-hidden="true">{arrow}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </article>

          {library && (
            <Tile href={library.href} className={styles.library} kind="My Rhinox" title={library.label} text={library.description}>
              <span className={styles.shelf}>
                <i /><i /><i /><i />
              </span>
            </Tile>
          )}

          {badges && (
            <Tile href={badges.href} className={styles.badges} kind="My Rhinox" title={badges.label} text={badges.description}>
              <span className={styles.medals}>
                {[0, 1, 2].map((n) => (
                  <b key={n}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.3 6.8 19.1l1-5.8L3.5 9.2l5.9-.9Z" /></svg>
                  </b>
                ))}
              </span>
            </Tile>
          )}

          {certificates && (
            <Tile href={certificates.href} className={styles.certs} kind="My Rhinox" title={certificates.label} text={certificates.description}>
              <span className={styles.paper}>
                <i /><i /><i />
                <b />
              </span>
            </Tile>
          )}

          {/* About: the wide tile */}
          <article className={`${styles.tile} ${styles.about}`} onMouseMove={spotlight}>
            <div className={styles.aboutCopy}>
              <span className={styles.kind}>About</span>
              <h3 className={styles.aboutTitle}>Science. Technology. Creativity.</h3>
              <p>Building practical STEM experiences that help learners discover, create and progress.</p>
              <Link href="/about" className={styles.aboutMain}>
                About Rhinox
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </Link>
            </div>
            <ul className={styles.aboutLinks}>
              {aboutLinks.map((item) => (
                <li key={item.href}><Link href={item.href}>{item.label}</Link></li>
              ))}
              {contact && <li><Link href={contact.href}>Contact</Link></li>}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
