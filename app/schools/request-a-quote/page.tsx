import type { Metadata } from "next";

import { HubClosing, HubHero } from "../../components/hub/HubParts";
import hub from "../../components/hub/hub.module.css";
import QuoteForm from "./QuoteForm";

export const metadata: Metadata = {
  title: "Request a Quote | Rhinox Scientifica",
  description: "Tell Rhinox Scientifica what your school or institution needs and receive a clear quotation.",
};

const next = [
  { title: "You send the details", text: "Choose what you need and tell us about your learners." },
  { title: "We review", text: "Our team checks availability and what would suit you best." },
  { title: "You receive a quotation", text: "A clear, practical proposal to approve or adjust." },
];

export default function RequestAQuotePage() {
  return (
    <main style={{ background: "var(--rx-white)" }}>
      <HubHero
        eyebrow="Schools · Request a quote"
        lineOne="Tell us what your"
        lineTwo="institution needs."
        lead="Books, kits, laboratory equipment and chemicals, laboratory setup, coding and robotics, teacher training or a full STEM programme: ask for a quotation in one place."
        actions={[{ label: "Fill in the form", href: "#quote-form" }, { label: "Talk to us instead", href: "/contact", secondary: true }]}
        image="/images/hero/stem-lab.jpg"
        alt="A modern school laboratory"
        chips={["Equipment", "Training", "Programmes"]}
      />

      <section className={hub.quoteSection} id="quote-form" style={{ scrollMarginTop: 80 }}>
        <div className={`rx-container ${hub.quoteInner}`}>
          <div className={hub.splitHead}>
            <p className={`rx-eyebrow ${hub.eyebrow}`}>What happens next</p>
            <h2 className={hub.sectionTitle}>
              <span>A clear quotation,</span>
              <span className={hub.muted}>without the back and forth.</span>
            </h2>
            <ul className={hub.offerList} style={{ marginTop: 20 }}>
              {next.map((item, index) => (
                <li key={item.title}>
                  <span className={hub.highlightIcon} aria-hidden="true">{index + 1}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className={hub.quotePanel}>
            <QuoteForm />
          </div>
        </div>
      </section>

      <HubClosing
        kicker="Prefer to talk?"
        lineOne="Call or write to"
        lineTwo="the Rhinox team."
        lead="We are happy to talk through your requirements before you send anything."
        actions={[{ label: "Contact Rhinox", href: "/contact" }, { label: "Get support", href: "/about/support", secondary: true }]}
        image="/images/hero/classroom.jpg"
      />
    </main>
  );
}
