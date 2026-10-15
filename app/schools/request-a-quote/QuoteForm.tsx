"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";

import { contactDetails } from "../../contact/contact-details";
import hub from "../../components/hub/hub.module.css";
import styles from "../../contact/page.module.css";

// Quotation request. There is no mail server yet, so a valid submission
// opens the visitor's email app with the request already written out to
// Rhinox, then shows a confirmation. To receive requests directly later,
// replace the body of handleSubmit with a call to a form service or API.

const needs = [
  "Books & workbooks",
  "STEM & STEAM kits",
  "Laboratory equipment",
  "Laboratory chemicals",
  "Laboratory setup",
  "Coding & robotics",
  "Teacher training",
  "STEM programme",
];

const types = ["Primary school", "Secondary school", "College or university", "Training centre", "Other institution"];

type Fields = {
  institution: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  learners: string;
  location: string;
  message: string;
};

const empty: Fields = { institution: "", name: "", email: "", phone: "", type: "", learners: "", location: "", message: "" };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function QuoteForm() {
  const [fields, setFields] = useState<Fields>(empty);
  const [selected, setSelected] = useState<string[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields | "needs", string>>>({});
  const [sent, setSent] = useState(false);

  function update(name: keyof Fields, value: string) {
    setFields((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  }

  function toggle(need: string) {
    setSelected((current) => (current.includes(need) ? current.filter((n) => n !== need) : [...current, need]));
    if (errors.needs) setErrors((current) => ({ ...current, needs: undefined }));
  }

  function validate() {
    const next: Partial<Record<keyof Fields | "needs", string>> = {};
    if (!fields.institution.trim()) next.institution = "Please enter your school or institution.";
    if (!fields.name.trim()) next.name = "Please enter your name.";
    if (!EMAIL_PATTERN.test(fields.email.trim())) next.email = "Please enter a valid email address.";
    if (selected.length === 0) next.needs = "Choose at least one thing you need.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    const subject = `Quote request: ${fields.institution.trim()}`;
    const details = [
      `Institution: ${fields.institution.trim()}`,
      fields.type && `Type: ${fields.type}`,
      `Contact: ${fields.name.trim()}`,
      `Email: ${fields.email.trim()}`,
      fields.phone && `Phone: ${fields.phone}`,
      fields.location && `Location: ${fields.location}`,
      fields.learners && `Approximate learners: ${fields.learners}`,
      `Needs: ${selected.join(", ")}`,
    ].filter(Boolean);
    const body = `${details.join("\n")}${fields.message.trim() ? `\n\n${fields.message.trim()}` : ""}`;

    window.location.href = `mailto:${contactDetails.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  if (sent) {
    return (
      <div className={styles.formSent} role="status">
        <span className={styles.formSentIcon} aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </span>
        <h3>Thank you, {fields.name.trim().split(" ")[0]}.</h3>
        <p>
          Your email app has opened with your quotation request to Rhinox Scientifica. Press send there and our team
          will come back to you. If it did not open, write to us at{" "}
          <a href={`mailto:${contactDetails.email}`}>{contactDetails.email}</a>.
        </p>
        <button
          type="button"
          className={styles.textButton}
          onClick={() => {
            setFields(empty);
            setSelected([]);
            setSent(false);
          }}
        >
          Send another request
        </button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.formHead}>
        <h3>Request a quotation</h3>
        <p>Tell us what your institution needs and we will respond with a clear quotation.</p>
      </div>

      <div className={styles.formGrid}>
        <Field id="qf-institution" label="School / institution" required error={errors.institution}>
          <input id="qf-institution" type="text" autoComplete="organization" placeholder="Name of institution" value={fields.institution} onChange={(e) => update("institution", e.target.value)} aria-invalid={Boolean(errors.institution)} />
        </Field>

        <Field id="qf-type" label="Type of institution">
          <select id="qf-type" value={fields.type} onChange={(e) => update("type", e.target.value)} className={fields.type ? "" : styles.selectEmpty}>
            <option value="">Select a type</option>
            {types.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </Field>

        <Field id="qf-name" label="Contact person" required error={errors.name}>
          <input id="qf-name" type="text" autoComplete="name" placeholder="Your name" value={fields.name} onChange={(e) => update("name", e.target.value)} aria-invalid={Boolean(errors.name)} />
        </Field>

        <Field id="qf-email" label="Email" required error={errors.email}>
          <input id="qf-email" type="email" autoComplete="email" placeholder="you@school.ng" value={fields.email} onChange={(e) => update("email", e.target.value)} aria-invalid={Boolean(errors.email)} />
        </Field>

        <Field id="qf-phone" label="Phone">
          <input id="qf-phone" type="tel" autoComplete="tel" placeholder="+234" value={fields.phone} onChange={(e) => update("phone", e.target.value)} />
        </Field>

        <Field id="qf-location" label="Location">
          <input id="qf-location" type="text" autoComplete="address-level2" placeholder="City, State" value={fields.location} onChange={(e) => update("location", e.target.value)} />
        </Field>

        <Field id="qf-learners" label="Approximate number of learners" wide>
          <input id="qf-learners" type="text" inputMode="numeric" placeholder="For example 250" value={fields.learners} onChange={(e) => update("learners", e.target.value)} />
        </Field>

        <div className={`${styles.field} ${styles.fieldWide} ${errors.needs ? styles.fieldError : ""}`}>
          <fieldset className={hub.needs}>
            <legend>What do you need? <span aria-hidden="true" style={{ color: "var(--rx-blue)" }}>*</span></legend>
            {needs.map((need) => (
              <label key={need} className={hub.need}>
                <input type="checkbox" checked={selected.includes(need)} onChange={() => toggle(need)} />
                <span>{need}</span>
              </label>
            ))}
          </fieldset>
          {errors.needs && <p className={styles.errorText} role="alert">{errors.needs}</p>}
        </div>

        <Field id="qf-message" label="Anything else we should know?" wide>
          <textarea id="qf-message" rows={4} placeholder="Quantities, timelines, specific items or questions..." value={fields.message} onChange={(e) => update("message", e.target.value)} />
        </Field>
      </div>

      <button type="submit" className={`rx-button rx-button-primary ${styles.submit}`}>
        Send quotation request
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 12h15M14 7l5 5-5 5" />
        </svg>
      </button>
    </form>
  );
}

function Field({ id, label, required = false, error, wide = false, children }: { id: string; label: string; required?: boolean; error?: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className={`${styles.field} ${wide ? styles.fieldWide : ""} ${error ? styles.fieldError : ""}`}>
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children}
      {error && <p className={styles.errorText} role="alert">{error}</p>}
    </div>
  );
}
