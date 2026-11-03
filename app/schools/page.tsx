import type { Metadata } from "next";
import Link from "next/link";

import Breadcrumbs from "../components/Breadcrumbs";
import { contactDetails, telHref } from "../contact/contact-details";
import SchoolsIndex from "./SchoolsIndex";
import styles from "./schools.module.css";

export const metadata: Metadata = {
  title: "Schools & Institutions | Rhinox Scientifica",
  description:
    "STEM education, laboratory solutions, coding and robotics programmes, teacher training and quotations for schools and institutions.",
};

const OFFERS = [
  { title: "STEM School Solutions", text: "Practical STEM programmes and learning solutions for your school.", href: "/schools/stem-school-solutions" },
  { title: "Laboratory Solutions", text: "Laboratory planning, supply and development.", href: "/schools/laboratory-solutions" },
  { title: "Coding & Robotics", text: "Coding and robotics programmes for institutions.", href: "/schools/coding-robotics" },
  { title: "STEM Clubs", text: "Hands-on school clubs. Express interest in the pilot.", href: "/schools/stem-clubs" },
  { title: "Teacher Training", text: "Practical professional development for educators.", href: "/schools/teacher-training" },
];

const STEPS = [
  { title: "Consult", text: "We learn about your learners, space and goals." },
  { title: "Plan", text: "We shape a practical programme or laboratory plan." },
  { title: "Deliver", text: "Training, equipment and resources are put in place." },
  { title: "Support", text: "We stay close so the programme keeps working." },
];

const INDEX = [
  { id: "offer", label: "What we offer" },
  { id: "how", label: "How we work" },
  { id: "request", label: "Request a quote" },
];

export default function SchoolsPage() {
  return (
    <main className={styles.page}>
      <div className={`rx-container ${styles.crumbs}`}>
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Schools & Institutions" }]} />
      </div>

      <header className={styles.statement}>
        <div className={`rx-container ${styles.statementInner}`}>
          <p className={styles.eyebrow}>Schools &amp; institutions</p>
          <h1 className={styles.h1}>STEM solutions for schools and institutions</h1>
          <p className={styles.lead}>
            Rhinox supports schools with STEM education, laboratory solutions, coding, robotics, teacher training and practical programmes. Tell us what your school needs and we will come back with a clear, practical proposal.
          </p>
          <div className={styles.actions}>
            <Link href="/schools/request-a-quote" className="rx-button rx-button-primary">Request a quote</Link>
            <Link href="/contact" className="rx-button rx-button-secondary">Talk to us</Link>
          </div>
        </div>
      </header>

      <div className={`rx-container ${styles.layout}`}>
        <SchoolsIndex entries={INDEX} />

        <div className={styles.body}>
          <section id="offer" className={styles.section} aria-labelledby="offer-title">
            <h2 id="offer-title" tabIndex={-1} className={styles.h2}>What we offer</h2>
            <ul className={styles.offers}>
              {OFFERS.map((o) => (
                <li key={o.href}>
                  <Link href={o.href} className={styles.offer}>
                    <span className={styles.offerName}>{o.title}</span>
                    <span className={styles.offerText}>{o.text}</span>
                    <span className={styles.offerGo}>Details <span aria-hidden="true">→</span></span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/schools/request-a-quote" className={`rx-button rx-button-primary ${styles.afterOffers}`}>Request a quote</Link>
          </section>

          <section id="how" className={styles.section} aria-labelledby="how-title">
            <h2 id="how-title" tabIndex={-1} className={styles.h2}>How we work</h2>
            <ol className={styles.steps}>
              {STEPS.map((s, i) => (
                <li key={s.title}>
                  <span className={styles.stepNum} aria-hidden="true">{i + 1}</span>
                  <h3 className={styles.stepTitle}>{s.title}</h3>
                  <p className={styles.stepText}>{s.text}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      <section id="request" className={styles.request} aria-labelledby="request-title">
        <div className={`rx-container ${styles.requestInner}`}>
          <div>
            <h2 id="request-title" tabIndex={-1} className={styles.h2}>Request a quote</h2>
            <p className={styles.requestLead}>Share your requirements and the Rhinox team will reply with a practical proposal.</p>
            <Link href="/schools/request-a-quote" className="rx-button rx-button-primary">Request a quote</Link>
          </div>
          <address className={styles.contact}>
            <a href={`mailto:${contactDetails.email}`}>{contactDetails.email}</a>
            {contactDetails.phones.map((p) => (
              <a key={p} href={telHref(p)}>{p}</a>
            ))}
            <span>{contactDetails.addressLines.join(" ")}</span>
          </address>
        </div>
      </section>
    </main>
  );
}
