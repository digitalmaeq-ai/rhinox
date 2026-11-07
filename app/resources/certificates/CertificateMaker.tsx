"use client";

import Image from "next/image";
import { useState } from "react";

import type { BadgeInfo } from "@/lib/resources/library";
import styles from "./certificates.module.css";

const WORDING: Record<string, { award: string; line: string }> = {
  t1: { award: "Step Thinker · Term 1", line: "has shown that things happen in order: putting steps in order, giving clear commands and fixing mistakes." },
  t2: { award: "Step Thinker · Term 2", line: "has learned to spot patterns: copying them, continuing them, making them and saying what comes next." },
  t3: { award: "Step Thinker · Term 3", line: "has learned to solve small problems: saying the problem, breaking it small and trying another way." },
  year: { award: "Step Thinker · Nursery 1", line: "has finished a whole year of Think • Move • Code! and thinks in steps, patterns and solutions." },
};

export default function CertificateMaker({ badges }: { badges: BadgeInfo[] }) {
  const [id, setId] = useState("t1");
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const badge = badges.find((b) => b.id === id) ?? badges[0];
  const text = WORDING[id];

  return (
    <section className={styles.maker} aria-labelledby="maker-title">
      <style>{`@media print{body *{visibility:hidden!important}.rx-cert-print,.rx-cert-print *{visibility:visible!important}.rx-cert-print{position:fixed;left:0;top:0;width:100%;margin:0!important;box-shadow:none!important}@page{size:A4 landscape;margin:8mm}}`}</style>
      <div className={`rx-container ${styles.makerInner}`}>
        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <h2 id="maker-title" className={styles.formTitle}>Make a certificate</h2>
          <fieldset className={styles.choices}>
            <legend>Which certificate?</legend>
            {badges.map((b) => (
              <label key={b.id} className={`${styles.choice} ${id === b.id ? styles.choiceOn : ""}`}>
                <input type="radio" name="cert" value={b.id} checked={id === b.id} onChange={() => setId(b.id)} />
                <span>{b.term ? `Term ${b.term}` : "Whole year"}</span>
              </label>
            ))}
          </fieldset>
          <label className={styles.field}>
            <span>Child’s name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ada Okafor" maxLength={40} autoComplete="off" />
          </label>
          <label className={styles.field}>
            <span>School or class (optional)</span>
            <input value={school} onChange={(e) => setSchool(e.target.value)} placeholder="e.g. Sunrise Nursery School" maxLength={50} autoComplete="off" />
          </label>
          <button type="button" className={styles.print} onClick={() => window.print()}>Print certificate</button>
          <p className={styles.tip}>Tip: in the print window, choose Landscape and turn on “Background graphics”. Your typing stays on this page and is not saved or sent anywhere.</p>
        </form>

        <div className={`rx-cert-print ${styles.cert}`} style={{ ["--main" as string]: badge.colour.main }} role="img" aria-label={`Certificate preview for ${name || "the child"}`}>
          <div className={styles.frame}>
            <div className={styles.corner} aria-hidden="true" />
            <p className={styles.brand}>Think • Move • Code!</p>
            <h3 className={styles.certTitle}>Certificate of Achievement</h3>
            <p className={styles.certifies}>This certifies that</p>
            <p className={styles.who}>{name.trim() || "Child’s name"}</p>
            {school.trim() && <p className={styles.school}>{school.trim()}</p>}
            <p className={styles.line}>{text.line}</p>
            <p className={styles.award}>{text.award}</p>
            <div className={styles.seal}>
              <Image src={badge.image} alt="" width={96} height={116} />
            </div>
            <div className={styles.sign}>
              <span>Date</span>
              <span>Teacher’s signature</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
