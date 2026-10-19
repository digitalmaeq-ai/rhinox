"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";

import { contactDetails } from "../../contact/contact-details";
import hub from "../../components/hub/hub.module.css";
import styles from "../../contact/page.module.css";

// Pilot interest form. Like the quotation form, a valid submission opens the
// visitor's email app with the details written out; nothing is stored or sent
// by the website itself. Only school and adult coordinator details are
// collected: never learner names, dates of birth, addresses or photographs.

const schoolTypes = ["Public school", "Private school", "Mission or faith-based school", "Other"];
const levels = ["Primary", "Junior Secondary", "Senior Secondary"];
const ranges = ["Under 25", "25 to 50", "51 to 100", "101 to 200", "More than 200", "Not sure yet"];
const interests = [
  "Science experiments",
  "Coding",
  "Robotics",
  "Engineering design",
  "STEM quizzes",
  "Innovation projects",
  "Sustainability",
  "Inter-school challenges",
];

type Fields = {
  school: string;
  schoolType: string;
  state: string;
  lga: string;
  town: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  range: string;
};
type Key = keyof Fields | "levels";

const empty: Fields = { school: "", schoolType: "", state: "", lga: "", town: "", name: "", role: "", email: "", phone: "", range: "" };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function StemClubsForm() {
  const [fields, setFields] = useState<Fields>(empty);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [errors, setErrors] = useState<Partial<Record<Key, string>>>({});
  const [sent, setSent] = useState(false);

  function update(name: keyof Fields, value: string) {
    setFields((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  }

  function toggle(list: string[], setList: (next: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
    if (errors.levels) setErrors((current) => ({ ...current, levels: undefined }));
  }

  function validate() {
    const next: Partial<Record<Key, string>> = {};
    if (!fields.school.trim()) next.school = "Please enter the name of the school.";
    if (!fields.state.trim()) next.state = "Please enter the state.";
    if (!fields.lga.trim()) next.lga = "Please enter the local government area.";
    if (!fields.town.trim()) next.town = "Please enter the town.";
    if (!fields.name.trim()) next.name = "Please enter the coordinator's name.";
    if (!fields.role.trim()) next.role = "Please enter the coordinator's role at the school.";
    if (!EMAIL_PATTERN.test(fields.email.trim())) next.email = "Please enter a valid official email address.";
    if (!fields.phone.trim()) next.phone = "Please enter a contact phone number.";
    if (selectedLevels.length === 0) next.levels = "Choose at least one education level.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    const subject = `STEM Clubs pilot interest: ${fields.school.trim()}`;
    const details = [
      `School: ${fields.school.trim()}`,
      fields.schoolType && `School type: ${fields.schoolType}`,
      `Location: ${fields.town.trim()}, ${fields.lga.trim()}, ${fields.state.trim()}`,
      `Coordinator: ${fields.name.trim()} (${fields.role.trim()})`,
      `Official email: ${fields.email.trim()}`,
      `Phone: ${fields.phone.trim()}`,
      `Education levels: ${selectedLevels.join(", ")}`,
      fields.range && `Estimated student participation: ${fields.range}`,
      selectedInterests.length > 0 && `Areas of interest: ${selectedInterests.join(", ")}`,
    ].filter(Boolean);

    window.location.href = `mailto:${contactDetails.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(details.join("\n"))}`;
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
          Your email app should now have opened with your pilot interest message. <strong>Your interest is only registered once you press send there.</strong>{" "}
          If nothing opened, email the same details to <a href={`mailto:${contactDetails.email}`}>{contactDetails.email}</a>.
          Expressing interest does not guarantee a place in the pilot.
        </p>
        <button
          type="button"
          className={styles.textButton}
          onClick={() => {
            setFields(empty);
            setSelectedLevels([]);
            setSelectedInterests([]);
            setSent(false);
          }}
        >
          Register another school
        </button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.formHead}>
        <h3>Express interest in the pilot</h3>
        <p>For a school coordinator or another responsible adult. Please do not enter any learner details.</p>
      </div>

      <div className={styles.formGrid}>
        <Field id="sc-school" label="School name" required error={errors.school}>
          <input id="sc-school" type="text" autoComplete="organization" value={fields.school} onChange={(e) => update("school", e.target.value)} aria-invalid={Boolean(errors.school)} />
        </Field>

        <Field id="sc-type" label="School type">
          <select id="sc-type" value={fields.schoolType} onChange={(e) => update("schoolType", e.target.value)} className={fields.schoolType ? "" : styles.selectEmpty}>
            <option value="">Select a type</option>
            {schoolTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </Field>

        <Field id="sc-state" label="State" required error={errors.state}>
          <input id="sc-state" type="text" value={fields.state} onChange={(e) => update("state", e.target.value)} aria-invalid={Boolean(errors.state)} />
        </Field>

        <Field id="sc-lga" label="Local government area" required error={errors.lga}>
          <input id="sc-lga" type="text" value={fields.lga} onChange={(e) => update("lga", e.target.value)} aria-invalid={Boolean(errors.lga)} />
        </Field>

        <Field id="sc-town" label="Town" required error={errors.town} wide>
          <input id="sc-town" type="text" autoComplete="address-level2" value={fields.town} onChange={(e) => update("town", e.target.value)} aria-invalid={Boolean(errors.town)} />
        </Field>

        <Field id="sc-name" label="Adult coordinator's name" required error={errors.name}>
          <input id="sc-name" type="text" autoComplete="name" value={fields.name} onChange={(e) => update("name", e.target.value)} aria-invalid={Boolean(errors.name)} />
        </Field>

        <Field id="sc-role" label="Role at the school" required error={errors.role}>
          <input id="sc-role" type="text" placeholder="For example head of science" value={fields.role} onChange={(e) => update("role", e.target.value)} aria-invalid={Boolean(errors.role)} />
        </Field>

        <Field id="sc-email" label="Official school email" required error={errors.email}>
          <input id="sc-email" type="email" autoComplete="email" value={fields.email} onChange={(e) => update("email", e.target.value)} aria-invalid={Boolean(errors.email)} />
        </Field>

        <Field id="sc-phone" label="Contact phone" required error={errors.phone}>
          <input id="sc-phone" type="tel" autoComplete="tel" placeholder="+234" value={fields.phone} onChange={(e) => update("phone", e.target.value)} aria-invalid={Boolean(errors.phone)} />
        </Field>

        <div className={`${styles.field} ${styles.fieldWide} ${errors.levels ? styles.fieldError : ""}`}>
          <fieldset className={hub.needs}>
            <legend>Education levels served <span aria-hidden="true" style={{ color: "var(--rx-blue)" }}>*</span></legend>
            {levels.map((level) => (
              <label key={level} className={hub.need}>
                <input type="checkbox" checked={selectedLevels.includes(level)} onChange={() => toggle(selectedLevels, setSelectedLevels, level)} />
                <span>{level}</span>
              </label>
            ))}
          </fieldset>
          {errors.levels && <p className={styles.errorText} role="alert">{errors.levels}</p>}
        </div>

        <Field id="sc-range" label="Estimated number of students who might take part" wide>
          <select id="sc-range" value={fields.range} onChange={(e) => update("range", e.target.value)} className={fields.range ? "" : styles.selectEmpty}>
            <option value="">Select a range</option>
            {ranges.map((range) => (
              <option key={range} value={range}>{range}</option>
            ))}
          </select>
        </Field>

        <div className={`${styles.field} ${styles.fieldWide}`}>
          <fieldset className={hub.needs}>
            <legend>Areas of interest</legend>
            {interests.map((interest) => (
              <label key={interest} className={hub.need}>
                <input type="checkbox" checked={selectedInterests.includes(interest)} onChange={() => toggle(selectedInterests, setSelectedInterests, interest)} />
                <span>{interest}</span>
              </label>
            ))}
          </fieldset>
        </div>
      </div>

      <p style={{ fontSize: 13, lineHeight: 1.55, color: "var(--rx-muted, #5b6b82)", margin: "4px 0 16px" }}>
        <strong>Privacy:</strong> we ask only for school and adult coordinator details, and use them to contact you about the STEM Clubs pilot. Please
        do not send learner names, dates of birth, home addresses, personal phone numbers or photographs. This form opens your email app, so your
        message is sent through your own email account.
      </p>

      <button type="submit" className={`rx-button rx-button-primary ${styles.submit}`}>
        Prepare my email to Rhinox
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
