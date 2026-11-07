import type { Metadata } from "next";
import Link from "next/link";

import Breadcrumbs from "../../components/Breadcrumbs";
import QuoteForm from "./QuoteForm";
import styles from "./quote.module.css";

export const metadata: Metadata = {
  title: "Request a Quote | Rhinox Scientifica",
  description: "Tell Rhinox Scientifica what your school or institution needs and receive a clear quotation.",
};

const CAN_ASK = [
  { label: "Books & workbooks", href: "/shop" },
  { label: "STEM & STEAM kits", href: "/shop" },
  { label: "Laboratory equipment", href: "/shop/laboratory-equipment" },
  { label: "Laboratory chemicals", href: "/shop" },
  { label: "Laboratory setup", href: "/schools/laboratory-solutions" },
  { label: "Coding & robotics", href: "/schools/coding-robotics" },
  { label: "Teacher training", href: "/schools/teacher-training" },
  { label: "A full STEM programme", href: "/schools/stem-school-solutions" },
];

const NEXT = [
  { title: "You send the details", text: "Choose what you need and tell us about your learners." },
  { title: "We review", text: "Our team checks availability and what would suit you best." },
  { title: "You receive a quotation", text: "A clear, practical proposal to approve or adjust." },
];

export default function RequestAQuotePage() {
  return (
    <main className={styles.page}>
      <div className={`rx-container ${styles.crumbs}`}>
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Schools & Institutions", href: "/schools" }, { label: "Request a Quote" }]} />
      </div>

      <div className={styles.bar}>
        <div className={`rx-container ${styles.barInner}`}>
          <h1>Request a quote</h1>
          <p>Tell us what your institution needs and we will reply with a clear quotation.</p>
        </div>
      </div>

      <div className={`rx-container ${styles.desk}`}>
        <aside className={styles.side} aria-label="What you can ask for">
          <h2>You can ask for</h2>
          <ul className={styles.ask}>
            {CAN_ASK.map((c) => (
              <li key={c.label}><Link href={c.href}>{c.label}<span aria-hidden="true">↗</span></Link></li>
            ))}
          </ul>
          <h2>What happens next</h2>
          <ol className={styles.next}>
            {NEXT.map((n, i) => (
              <li key={n.title}><span aria-hidden="true">{i + 1}</span><div><strong>{n.title}</strong><em>{n.text}</em></div></li>
            ))}
          </ol>
          <p className={styles.talk}>Prefer to talk first? <Link href="/contact">Contact the Rhinox team</Link>.</p>
        </aside>
        <section className={styles.form} id="quote-form" aria-label="Quotation request form">
          <QuoteForm />
        </section>
      </div>
    </main>
  );
}
