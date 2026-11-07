import type { Metadata } from "next";
import Link from "next/link";

import { badges } from "@/lib/resources/library";
import CertificateMaker from "./CertificateMaker";
import styles from "./certificates.module.css";

export const metadata: Metadata = {
  title: "Certificates | Rhinox Scientifica",
  description: "Make and print a Think • Move • Code! Nursery 1 certificate for a child: type the name, choose the term and print.",
};

export default function CertificatesPage() {
  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={`rx-container ${styles.heroInner}`}>
          <p className={styles.eyebrow}>Resources · Certificates</p>
          <h1 className={styles.title}>A certificate to <em>be proud of.</em></h1>
          <p className={styles.lead}>
            Type a child’s name, choose the term, and print a certificate for the Week 13 Showcase. It is a free classroom template: the teacher dates and signs it.
          </p>
        </div>
      </header>

      <CertificateMaker badges={badges} />

      <section className={styles.after}>
        <div className={`rx-container ${styles.afterInner}`}>
          <p>
            Teachers: certificates go with the <Link href="/resources/badges">Step Thinker badges</Link> and the <Link href="/resources/free-downloads">Step Star stickers</Link>. For teacher training certificates, see <Link href="/schools/teacher-training">teacher training</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}
