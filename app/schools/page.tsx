import type { Metadata } from "next";
import Link from "next/link";

import Breadcrumbs from "../components/Breadcrumbs";
import { contactDetails, telHref } from "../contact/contact-details";
import { schoolFacts } from "@/lib/schools/data";
import Chooser from "./Chooser";
import styles from "./schools.module.css";

export const metadata: Metadata = {
  title: "Schools & Institutions | Rhinox Scientifica",
  description:
    "STEM education, laboratory solutions, coding and robotics programmes, teacher training, STEM clubs and quotations for schools and institutions.",
};

const STEPS = [
  { title: "Consult", text: "We learn about your learners, space and goals." },
  { title: "Plan", text: "We shape a practical programme or laboratory plan." },
  { title: "Deliver", text: "Training, equipment and resources are put in place." },
  { title: "Support", text: "We stay close so the programme keeps working." },
];

export default function SchoolsPage() {
  const f = schoolFacts();
  return (
    <main className={styles.page}>
      <div className={`rx-container ${styles.crumbs}`}>
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Schools & Institutions" }]} />
      </div>

      <header className={styles.top}>
        <div className={`rx-container ${styles.topInner}`}>
          <div className={styles.topText}>
            <p className={styles.eyebrow}>Schools &amp; institutions</p>
            <h1 className={styles.h1}>STEM for your whole school, <span>from a single partner.</span></h1>
            <p className={styles.lead}>
              A complete Nursery 1 coding programme, practical laboratories, coding and robotics pathways, teacher training and school clubs. Tell us what your school needs and we will come back with a clear, practical proposal.
            </p>
            <div className={styles.actions}>
              <Link href="/schools/request-a-quote" className="rx-button rx-button-primary">Request a quote</Link>
              <Link href="/contact" className="rx-button rx-button-secondary">Talk to us</Link>
            </div>
          </div>
          <Chooser />
        </div>
      </header>

      <section className={styles.facts} aria-label="What is ready now">
        <div className={`rx-container ${styles.factsInner}`}>
          <p><strong>{f.weeks}</strong><span>weeks of Nursery 1 lessons, free to download</span></p>
          <p><strong>{f.labs}</strong><span>virtual science labs for secondary classes</span></p>
          <p><strong>3</strong><span>browser coding studios, no installation</span></p>
          <p><strong>{f.equipment}</strong><span>laboratory equipment items in the shop</span></p>
        </div>
      </section>

      <section className={styles.bento} aria-labelledby="offer-title">
        <div className={`rx-container ${styles.bentoInner}`}>
          <h2 id="offer-title" className={styles.h2}>What we offer</h2>
          <div className={styles.grid}>
            <Link href="/schools/stem-school-solutions" className={`${styles.tile} ${styles.tBig}`}>
              <span className={styles.tag}>Whole school</span>
              <strong>STEM School Solutions</strong>
              <span>A year-long plan with books, weekly lesson packs, teacher guides, assessment and a showcase.</span>
              <em>See the school year →</em>
            </Link>
            <Link href="/schools/laboratory-solutions" className={styles.tile}>
              <span className={styles.tag}>Practical science</span>
              <strong>Laboratory Solutions</strong>
              <span>Plan, supply, set up and support.</span>
              <em>Plan a lab →</em>
            </Link>
            <Link href="/schools/coding-robotics" className={styles.tile}>
              <span className={styles.tag}>Coding</span>
              <strong>Coding &amp; Robotics</strong>
              <span>A pathway from nursery to secondary.</span>
              <em>See the pathway →</em>
            </Link>
            <Link href="/schools/teacher-training" className={styles.tile}>
              <span className={styles.tag}>Staff</span>
              <strong>Teacher Training</strong>
              <span>Four practical tracks for educators.</span>
              <em>Browse tracks →</em>
            </Link>
            <Link href="/schools/stem-clubs" className={`${styles.tile} ${styles.tWide}`}>
              <span className={styles.tag}>Pilot · Express interest</span>
              <strong>STEM Clubs</strong>
              <span>Hands-on school clubs for Primary, Junior and Senior Secondary, with inter-school challenges under development.</span>
              <em>Join the pilot →</em>
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.how} aria-labelledby="how-title">
        <div className={`rx-container ${styles.howInner}`}>
          <h2 id="how-title" className={styles.h2}>How we work</h2>
          <ol className={styles.steps}>
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span className={styles.stepNum} aria-hidden="true">{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.request} aria-labelledby="request-title">
        <div className={`rx-container ${styles.requestInner}`}>
          <div>
            <h2 id="request-title" className={styles.h2}>Ready when you are</h2>
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
