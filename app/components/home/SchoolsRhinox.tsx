import Link from "next/link";

import { navigation } from "@/lib/site-navigation";

import styles from "./SchoolsRhinox.module.css";

/**
 * Band 7, Schools: one statement, the school services as plain rows, and one
 * button. Service names, descriptions and links come from the Schools menu in
 * lib/site-navigation.ts. No photograph and no figures: a proof row is added
 * only when verified facts are supplied.
 */

export default function SchoolsRhinox() {
  const menu = navigation.find((item) => item.href === "/schools");
  const items = (menu?.megaMenu?.columns ?? []).flatMap((column) => column.items);
  const quote = items.find((item) => item.href === "/schools/request-a-quote");
  const services = items.filter((item) => item !== quote);

  return (
    <section className={styles.schools} aria-labelledby="schools-title">
      <div className={`rx-container ${styles.inner}`}>
        <div className={styles.statement}>
          <p className={styles.eyebrow}>Schools &amp; institutions</p>
          <h2 id="schools-title" className={styles.title}>
            Build a stronger STEM <span>ecosystem for your school.</span>
          </h2>
          <p className={styles.text}>
            From laboratories and equipment to coding programmes and teacher training, we plan, supply and support practical STEM learning.
          </p>
          <Link href={quote?.href ?? "/schools/request-a-quote"} className="rx-button rx-button-primary">
            <span>Request a quote</span>
          </Link>
        </div>

        <ul className={styles.list}>
          {services.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={styles.row}>
                <span className={styles.rowBody}>
                  <strong>{item.label}</strong>
                  {item.description && <small>{item.description}</small>}
                </span>
                <span className={styles.go} aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
