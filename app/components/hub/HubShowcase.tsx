"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import styles from "./hub.module.css";

export interface ShowcaseItem {
  title: string;
  text: string;
  href: string;
  image: string;
  alt: string;
  tag?: string;
}

// One large picture that follows the list: hover (or focus) a row and the
// photo changes. On small screens each row carries its own thumbnail.
export default function HubShowcase({ items }: { items: ShowcaseItem[] }) {
  const [active, setActive] = useState(0);
  const current = items[active] ?? items[0];

  return (
    <div className={styles.showcase}>
      <div className={styles.stage} aria-hidden="true">
        {items.map((item, index) => (
          <div
            key={item.href}
            className={`${styles.stageImage} ${index === active ? styles.stageOn : ""}`}
          >
            <Image
              src={item.image}
              alt=""
              fill
              sizes="(max-width: 900px) 0px, 560px"
              style={{ objectFit: "cover" }}
            />
          </div>
        ))}
        <div className={styles.stageShade} />
        <p className={styles.stageCaption} key={current.href}>
          <span>{current.tag ?? "Rhinox"}</span>
          {current.title}
        </p>
      </div>

      <ul className={styles.list}>
        {items.map((item, index) => (
          <li
            key={item.href}
            className={index === active ? styles.rowActive : undefined}
            onMouseEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
          >
            <Link href={item.href} className={styles.row}>
              <span className={styles.thumb}>
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="72px"
                  style={{ objectFit: "cover" }}
                />
              </span>
              <span className={styles.rowText}>
                <span className={styles.rowTitle}>
                  {item.title}
                  {item.tag ? <em>{item.tag}</em> : null}
                </span>
                <span className={styles.rowDesc}>{item.text}</span>
              </span>
              <svg className={styles.rowArrow} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 12h15M14 7l5 5-5 5" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
