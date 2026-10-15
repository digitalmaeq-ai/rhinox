import type { Metadata } from "next";

import ContactForm from "./ContactForm";
import { contactDetails, telHref } from "./contact-details";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Contact | Rhinox Scientifica",
  description:
    "Talk to Rhinox Scientifica about STEM education, coding and robotics training, laboratory solutions, books and school partnerships.",
};

const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(contactDetails.mapQuery)}&output=embed`;
const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(contactDetails.mapQuery)}`;

export default function ContactPage() {
  return (
    <main className={styles.page}>
      {/* ---------- Hero ---------- */}
      <section className={styles.hero}>
        <div className={styles.heroBackdrop} aria-hidden="true" />

        <div className={`rx-container ${styles.heroInner}`}>
          <div className={styles.heroMain}>
            <p className={`rx-eyebrow ${styles.eyebrow}`}>Direct connection</p>

            <h1 className={styles.heroTitle}>
              <span>Let&apos;s build what</span>
              <span className={styles.muted}>they learn next.</span>
            </h1>

            <p className={styles.heroLead}>
              From STEM curriculum and coding and robotics training to
              laboratory design and equipment, connect directly with Rhinox
              Scientifica.
            </p>

            <div className={styles.heroMeta}>
              <div>
                <p className={styles.metaLabel}>Capability</p>
                <p className={styles.metaValue}>STEM education • Coding &amp; robotics • Lab solutions</p>
              </div>
              <div>
                <p className={styles.metaLabel}>Approach</p>
                <p className={styles.metaValue}>Practical • Curriculum-aligned • Hands-on</p>
              </div>
            </div>
          </div>

          <aside className={styles.heroCard}>
            <p className={styles.heroCardTop}>
              <span className={styles.dot} aria-hidden="true" />
              Start a conversation
            </p>

            <div className={styles.heroCardBody}>
              <span className={styles.badge}>R</span>
              <h2 className={styles.heroCardTitle}>
                <span>Have a learning</span>
                <span className={styles.muted}>project in mind?</span>
              </h2>
              <p>
                Tell us what you are teaching, building or planning. Our team
                can help you shape the right STEM path for your learners.
              </p>
              <a href="#contact-form" className={styles.cardLink}>
                Go to the enquiry form
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 5v14M6 13l6 6 6-6" />
                </svg>
              </a>
            </div>

            <p className={styles.heroCardFoot}>
              <span />
              STEM consultation
            </p>
          </aside>
        </div>

        <p className={styles.heroStrip}>
          <span />
          Discover • Learn • Practise • Build • Create
          <span />
        </p>
      </section>

      {/* ---------- Details + form ---------- */}
      <section className={styles.connect} id="contact-form">
        <div className={`rx-container ${styles.connectInner}`}>
          <div className={styles.connectInfo}>
            <h2 className={styles.sectionTitle}>
              <span>Have a STEM learning</span>
              <span className={styles.muted}>challenge?</span>
            </h2>

            <p className={styles.sectionLead}>
              Tell us what your learners need, what you are setting up or
              what you want to solve. Our team will review your request and
              respond with a tailored approach.
            </p>

            <ul className={styles.channels}>
              <li>
                <span className={styles.channelIcon} aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m4 7 8 6 8-6" />
                  </svg>
                </span>
                <div>
                  <p className={styles.channelLabel}>Email</p>
                  <a href={`mailto:${contactDetails.email}`}>{contactDetails.email}</a>
                </div>
              </li>

              <li>
                <span className={styles.channelIcon} aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
                  </svg>
                </span>
                <div>
                  <p className={styles.channelLabel}>Phone</p>
                  {contactDetails.phones.map((phone) => (
                    <a key={phone} href={telHref(phone)}>{phone}</a>
                  ))}
                </div>
              </li>

              <li>
                <span className={styles.channelIcon} aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
                    <circle cx="12" cy="9.5" r="2.5" />
                  </svg>
                </span>
                <div>
                  <p className={styles.channelLabel}>Location</p>
                  <p className={styles.channelText}>{contactDetails.addressLines.join(" ")}</p>
                </div>
              </li>
            </ul>
          </div>

          <div className={styles.formPanel}>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* ---------- Find us ---------- */}
      <section className={styles.findUs}>
        <div className="rx-container">
          <div className={styles.mapCard}>
            <div className={styles.mapInfo}>
              <p className={`rx-eyebrow ${styles.eyebrow}`}>Find us</p>
              <h2 className={styles.sectionTitleSmall}>
                <span>Lagos,</span>
                <span className={styles.muted}>Nigeria.</span>
              </h2>
              <address className={styles.address}>
                {contactDetails.addressLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </address>
              <a href={directions} target="_blank" rel="noopener noreferrer" className={`rx-button rx-button-secondary ${styles.outlineButton}`}>
                Get directions
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 12h15M14 7l5 5-5 5" />
                </svg>
              </a>
            </div>

            <div className={styles.mapFrame}>
              <iframe
                title="Map showing Rhinox Scientifica in Idimu, Lagos"
                src={mapEmbed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Closing call to action ---------- */}
      <section className={styles.closing}>
        <div className="rx-container">
          <div className={styles.closingCard}>
            <p className={styles.closingKicker}>
              <span />
              Ready to start?
              <span />
            </p>
            <p className={styles.closingEyebrow}>Have a project in mind?</p>
            <h2 className={styles.closingTitle}>
              <span>Let&apos;s shape the</span>
              <span className={styles.muted}>future of learning.</span>
            </h2>
            <p className={styles.closingLead}>
              From curriculum and books to training, kits and laboratories,
              let&apos;s build the right STEM solution for your learners.
            </p>
            <a href="#contact-form" className={`rx-button rx-button-primary ${styles.primaryButton}`}>
              Start a conversation
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
            </a>
            <div className={styles.closingFoot}>
              <span>Education • Technology • Laboratories</span>
              <span className={styles.closingRule} />
              <span>Lagos, Nigeria</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
