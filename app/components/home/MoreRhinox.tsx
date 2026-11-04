import Link from "next/link";

import { navigation } from "@/lib/site-navigation";

import styles from "./MoreRhinox.module.css";

/**
 * Band 8, More from Rhinox: resources on the left, "My Rhinox" and "About" as
 * plain rows on the right. Every link and description comes from the
 * Resources and About menus in lib/site-navigation.ts.
 */

function itemsOf(href: string) {
  const menu = navigation.find((item) => item.href === href);
  return (menu?.megaMenu?.columns ?? []).flatMap((column) => column.items);
}

function Row({ href, label, text }: { href: string; label: string; text?: string }) {
  return (
    <li>
      <Link href={href} className={styles.row}>
        <span className={styles.rowBody}>
          <strong>{label}</strong>
          {text && <small>{text}</small>}
        </span>
        <span className={styles.go} aria-hidden="true">→</span>
      </Link>
    </li>
  );
}

export default function MoreRhinox() {
  const resources = itemsOf("/resources");
  const about = itemsOf("/about");
  const find = (href: string) => resources.find((item) => item.href === href);

  const learn = ["/resources/articles", "/resources/videos", "/resources/free-downloads"]
    .map(find)
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const mine = ["/resources/my-rhinox-library", "/resources/badges", "/resources/certificates"]
    .map(find)
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const aboutLinks = about.filter((item) => item.href !== "/about");
  const contact = navigation.find((item) => item.href === "/contact");

  return (
    <section className={styles.more} aria-labelledby="more-title">
      <div className="rx-container">
        <header className={styles.head}>
          <p className={styles.eyebrow}>Resources &amp; about</p>
          <h2 id="more-title" className={styles.title}>
            Keep learning, <span>and keep what you earn</span>
          </h2>
        </header>

        <div className={styles.cols}>
          <div>
            <h3 className={styles.colTitle}>
              <Link href="/resources">Learn: browse all resources →</Link>
            </h3>
            <ul className={styles.list}>
              {learn.map((i) => (
                <Row key={i.href} href={i.href} label={i.label} text={i.description} />
              ))}
            </ul>
          </div>

          <div>
            <h3 className={styles.colTitle}>My Rhinox</h3>
            <ul className={styles.list}>
              {mine.map((i) => (
                <Row key={i.href} href={i.href} label={i.label} text={i.description} />
              ))}
            </ul>

            <h3 className={`${styles.colTitle} ${styles.colGap}`}>
              <Link href="/about">About Rhinox →</Link>
            </h3>
            <ul className={styles.list}>
              {aboutLinks.map((i) => (
                <Row key={i.href} href={i.href} label={i.label} />
              ))}
              {contact && <Row href={contact.href} label="Contact" />}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
