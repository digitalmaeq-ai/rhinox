"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";

import { contactDetails, enquiryAreas } from "./contact-details";
import styles from "./page.module.css";

// Enquiry form. There is no mail server or database behind the site yet,
// so a valid submission opens the visitor's email app with the enquiry
// already written out to Rhinox, and the form shows a confirmation.
// To receive messages directly later, swap the body of handleSubmit for a
// call to a form service or an API route.

type Fields = {
  name: string;
  organisation: string;
  email: string;
  phone: string;
  area: string;
  location: string;
  message: string;
};

const empty: Fields = {
  name: "",
  organisation: "",
  email: "",
  phone: "",
  area: "",
  location: "",
  message: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactForm() {
  const [fields, setFields] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [sent, setSent] = useState(false);

  function update(name: keyof Fields, value: string) {
    setFields((current) => ({ ...current, [name]: value }));
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: undefined }));
    }
  }

  function validate() {
    const next: Partial<Record<keyof Fields, string>> = {};
    if (!fields.name.trim()) next.name = "Please enter your name.";
    if (!EMAIL_PATTERN.test(fields.email.trim())) next.email = "Please enter a valid email address.";
    if (!fields.message.trim()) next.message = "Please tell us a little about what you need.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    const subject = `Enquiry: ${fields.area || "General"} — ${fields.name.trim()}`;
    const details = [
      `Name: ${fields.name.trim()}`,
      fields.organisation && `School / organisation: ${fields.organisation}`,
      `Email: ${fields.email.trim()}`,
      fields.phone && `Phone: ${fields.phone}`,
      fields.area && `Area of interest: ${fields.area}`,
      fields.location && `Location: ${fields.location}`,
    ].filter(Boolean);
    const body = `${details.join("\n")}\n\n${fields.message.trim()}`;

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
          Your email app has opened with your message to Rhinox Scientifica. Press
          send there and our team will get back to you. If it did not open, write
          to us at <a href={`mailto:${contactDetails.email}`}>{contactDetails.email}</a>.
        </p>
        <button
          type="button"
          className={styles.textButton}
          onClick={() => {
            setFields(empty);
            setSent(false);
          }}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.formHead}>
        <h3>Start a conversation</h3>
        <p>Tell us what you need and we&apos;ll get back to you.</p>
      </div>

      <div className={styles.formGrid}>
        <Field id="cf-name" label="Full name" required error={errors.name}>
          <input id="cf-name" type="text" autoComplete="name" placeholder="Your name" value={fields.name} onChange={(e) => update("name", e.target.value)} aria-invalid={Boolean(errors.name)} />
        </Field>

        <Field id="cf-organisation" label="School / organisation">
          <input id="cf-organisation" type="text" autoComplete="organization" placeholder="School or organisation" value={fields.organisation} onChange={(e) => update("organisation", e.target.value)} />
        </Field>

        <Field id="cf-email" label="Email" required error={errors.email}>
          <input id="cf-email" type="email" autoComplete="email" placeholder="you@example.com" value={fields.email} onChange={(e) => update("email", e.target.value)} aria-invalid={Boolean(errors.email)} />
        </Field>

        <Field id="cf-phone" label="Phone">
          <input id="cf-phone" type="tel" autoComplete="tel" placeholder="+234" value={fields.phone} onChange={(e) => update("phone", e.target.value)} />
        </Field>

        <Field id="cf-area" label="Area of interest">
          <select id="cf-area" value={fields.area} onChange={(e) => update("area", e.target.value)} className={fields.area ? "" : styles.selectEmpty}>
            <option value="">Select an area</option>
            {enquiryAreas.map((area) => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </Field>

        <Field id="cf-location" label="Location">
          <input id="cf-location" type="text" autoComplete="address-level2" placeholder="City, State" value={fields.location} onChange={(e) => update("location", e.target.value)} />
        </Field>

        <Field id="cf-message" label="Your message" required error={errors.message} wide>
          <textarea id="cf-message" rows={6} placeholder="Tell us about your school, project or learning goal..." value={fields.message} onChange={(e) => update("message", e.target.value)} aria-invalid={Boolean(errors.message)} />
        </Field>
      </div>

      <button type="submit" className={`rx-button rx-button-primary ${styles.submit}`}>
        Send message
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 12h15M14 7l5 5-5 5" />
        </svg>
      </button>
    </form>
  );
}

function Field({
  id,
  label,
  required = false,
  error,
  wide = false,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  wide?: boolean;
  children: ReactNode;
}) {
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
