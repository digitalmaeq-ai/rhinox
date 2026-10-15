import Link from "next/link";

import { contactDetails, telHref } from "@/app/contact/contact-details";
import { navigation } from "@/lib/site-navigation";

import BackToTop from "./BackToTop";
import styles from "./Footer.module.css";

/**
 * Site footer: one clear call to action, a grouped sitemap built from the
 * header menus (so it can never disagree with the header), the contact
 * details and a bottom bar.
 */

function itemsOf(href: string) {
  const menu = navigation.find((item) => item.href === href);
  return (menu?.megaMenu?.columns ?? []).flatMap((column) => column.items);
}

const icon = (path: string) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={path} />
  </svg>
);

export default function Footer() {
  const columns = [
    { title: "Education", href: "/education", links: itemsOf("/education") },
    { title: "Explore", href: "/explore", links: itemsOf("/explore") },
    { title: "Schools", href: "/schools", links: itemsOf("/schools") },
    { title: "Resources", href: "/resources", links: itemsOf("/resources") },
    { title: "Rhinox", href: "/about", links: [...itemsOf("/about"), { label: "Contact", href: "/contact" }] },
  ];

  return (
    <footer className={styles.footer}>
      <div className={`rx-container ${styles.shell}`}>
        <div className={styles.sheet}>
          <div className={styles.cta}>
            <div className={styles.ctaCopy}>
              <span className={styles.eyebrow}>Rhinox Scientifica</span>
              <h2 className={styles.ctaTitle}>
                Let&rsquo;s build what
                <span>they learn next.</span>
              </h2>
              <p>Books, kits, laboratories and practical STEM programmes for learners, families, teachers and schools.</p>
            </div>
            <div className={styles.ctaActions}>
              <Link href="/schools/request-a-quote" className={styles.primary}>
                Request a quote
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg>
              </Link>
              <Link href="/contact" className={styles.ghost}>Talk to us</Link>
            </div>
          </div>

          <div className={styles.main}>
            <div className={styles.about}>
              <Link href="/" className={styles.logo} aria-label="Rhinox Scientifica home">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/rhinox-logo-for-dark-backgrounds.svg"
                  alt="Rhinox Scientifica"
                  className={styles.logoImg}
                  width={197}
                  height={58}
                />
              </Link>
              <address className={styles.contact}>
                <a href={`mailto:${contactDetails.email}`}>{icon("M4 6h16v12H4ZM4 7l8 6 8-6")}{contactDetails.email}</a>
                {contactDetails.phones.map((phone) => (
                  <a key={phone} href={telHref(phone)}>{icon("M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z")}{phone}</a>
                ))}
                <span>{icon("M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11ZM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z")}Idimu, Lagos, Nigeria</span>
              </address>
            </div>

            <nav className={styles.columns} aria-label="Footer">
              {columns.map((column) => (
                <div key={column.title} className={styles.column}>
                  <h3><Link href={column.href}>{column.title}</Link></h3>
                  <ul>
                    {column.links.map((link) => (
                      <li key={link.href}><Link href={link.href}>{link.label}</Link></li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          <div className={styles.bottom}>
            <p>© {new Date().getFullYear()} Rhinox Scientifica. All rights reserved.</p>
            <BackToTop className={styles.top} />
          </div>

        </div>
      </div>
    </footer>
  );
}
