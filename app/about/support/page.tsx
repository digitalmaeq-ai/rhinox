import type { Metadata } from "next";
import Link from "next/link";

import { contactDetails, telHref } from "../../contact/contact-details";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Support | Rhinox Scientifica",
  description:
    "Get help with Rhinox books, kits, training, laboratory solutions and interactive learning experiences.",
};

const topics = [
  {
    title: "Books & learning resources",
    text: "Questions about the Think, Move, Code! series and other STEM books and resources.",
    icon: "M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3ZM5 17a3 3 0 0 1 3-3h10M9 8h5",
  },
  {
    title: "Training & workshops",
    text: "Coding, robotics and teacher training for classes, clubs and schools.",
    icon: "m8 7-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16",
  },
  {
    title: "Laboratories & equipment",
    text: "Laboratory design, equipment, kits and supply for schools and institutions.",
    icon: "M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3M7.5 14h9",
  },
  {
    title: "Orders & shop",
    text: "Help with an order, a product or a quotation for your school or organisation.",
    icon: "M6 7h13l-1.5 8h-10ZM6 7 5 3H2M9 20h.01M16 20h.01",
  },
  {
    title: "Interactive experiences",
    text: "Trouble opening or using a game, quiz or challenge on this site.",
    icon: "M13 2 4 14h7l-1 8 9-12h-7Z",
  },
  {
    title: "Partnerships",
    text: "Plans for a long-term STEM programme with your school or institution.",
    icon: "M3 9l9-5 9 5-9 5Zm4 3v5c0 1.5 2.2 3 5 3s5-1.5 5-3v-5",
  },
];

const faqs = [
  {
    q: "How do I get help with an order or a product?",
    a: "Send us a message with what you ordered or what you need and we will come back to you. Use the contact page or call us directly.",
  },
  {
    q: "Can Rhinox train our teachers or run a coding club?",
    a: "Yes. We run coding, robotics and teacher training for classes, clubs and whole schools. Tell us your learners' age and level and we will suggest a plan.",
  },
  {
    q: "Do you help schools set up a laboratory?",
    a: "Yes. We work on laboratory design, equipment and supply for schools and institutions. Share your space and goals and we will advise on a practical setup.",
  },
  {
    q: "An experience on the site is not loading. What should I do?",
    a: "Refresh the page first, then try another browser or device. If it still fails, message us with the experience name and what you saw.",
  },
  {
    q: "Where can learners practise at home?",
    a: "The Explore section has games, challenges and virtual labs for different subjects and ages. Start from the experiences library.",
  },
];

export default function SupportPage() {
  return (
    <main className={styles.page}>
      <section className={`${styles.hero} ${styles.heroTight}`}>
        <div className={styles.heroBackdrop} aria-hidden="true" />
        <div className={`rx-container ${styles.heroInner}`}>
          <div className={styles.heroMain}>
            <p className={`rx-eyebrow ${styles.eyebrow}`}>Support</p>
            <h1 className={styles.heroTitle}>
              <span>We are here to help</span>
              <span className={styles.muted}>you keep learning.</span>
            </h1>
            <p className={styles.heroLead}>
              Find answers about Rhinox books, kits, training, laboratory
              solutions and interactive experiences, or talk to our team
              directly.
            </p>
            <div className={styles.heroActions}>
              <Link href="/contact" className="rx-button rx-button-primary">Contact us</Link>
              <a href="#faq" className="rx-button rx-button-secondary">Read the FAQ</a>
            </div>
          </div>

          <aside className={styles.heroCard}>
            <p className={styles.heroCardTop}>
              <span className={styles.dot} aria-hidden="true" />
              Talk to a person
            </p>
            <div className={styles.heroCardBody}>
              <span className={styles.badge}>R</span>
              <h2 className={styles.heroCardTitle}>
                <span>Questions about</span>
                <span className={styles.muted}>your learners?</span>
              </h2>
              <p>
                Email or call the Rhinox team and tell us what you need.
              </p>
            </div>
            <p className={styles.heroCardFoot}>
              <span />
              {contactDetails.email}
            </p>
          </aside>
        </div>
      </section>

      <section className={styles.story}>
        <div className="rx-container">
          <div className={styles.sectionHead}>
            <p className={`rx-eyebrow ${styles.eyebrow}`}>Contact us</p>
            <h2 className={styles.sectionTitle}>
              <span>Reach the team</span>
              <span className={styles.muted}>directly.</span>
            </h2>
          </div>
          <ul className={styles.channelGrid}>
            <li className={styles.offerCard}>
              <span className={styles.offerIcon} aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
              </span>
              <h3>Email</h3>
              <div className={styles.channelCard}>
                <a href={`mailto:${contactDetails.email}`}>{contactDetails.email}</a>
              </div>
            </li>
            <li className={styles.offerCard}>
              <span className={styles.offerIcon} aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
                </svg>
              </span>
              <h3>Phone</h3>
              <div className={styles.channelCard}>
                {contactDetails.phones.map((phone) => (
                  <a key={phone} href={telHref(phone)}>{phone}</a>
                ))}
              </div>
            </li>
            <li className={styles.offerCard}>
              <span className={styles.offerIcon} aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
                  <circle cx="12" cy="9.5" r="2.5" />
                </svg>
              </span>
              <h3>Visit</h3>
              <p>{contactDetails.addressLines.join(" ")}</p>
            </li>
          </ul>
        </div>
      </section>

      <section className={styles.offer}>
        <div className="rx-container">
          <div className={styles.sectionHead}>
            <p className={`rx-eyebrow ${styles.eyebrow}`}>What we help with</p>
            <h2 className={styles.sectionTitle}>
              <span>Pick the topic,</span>
              <span className={styles.muted}>we will point the way.</span>
            </h2>
          </div>
          <ul className={styles.offerGrid}>
            {topics.map((item) => (
              <li key={item.title} className={styles.offerCard}>
                <span className={styles.offerIcon} aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon} />
                  </svg>
                </span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.approach} id="faq" style={{ scrollMarginTop: 80 }}>
        <div className="rx-container">
          <div className={styles.sectionHead}>
            <p className={`rx-eyebrow ${styles.eyebrow}`}>FAQ</p>
            <h2 className={styles.sectionTitle}>
              <span>Quick answers to</span>
              <span className={styles.muted}>common questions.</span>
            </h2>
          </div>
          <div className={styles.faq}>
            {faqs.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.closing}>
        <div className="rx-container">
          <div className={styles.closingCard}>
            <p className={styles.closingKicker}><span />Still need help?<span /></p>
            <h2 className={styles.closingTitle}>
              <span>Send us a message and</span>
              <span className={styles.muted}>we will take it from there.</span>
            </h2>
            <p className={styles.closingLead}>
              Tell us what you need and the Rhinox team will respond with the
              right next step.
            </p>
            <div className={styles.closingActions}>
              <Link href="/contact" className="rx-button rx-button-primary">Contact Rhinox</Link>
              <Link href="/about" className="rx-button rx-button-secondary">About Rhinox</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
