import type { Metadata } from "next";

import { HubClosing, HubHero, HubSectionHead, HubSteps } from "../../components/hub/HubParts";
import hub from "../../components/hub/hub.module.css";
import StemClubsForm from "./StemClubsForm";

export const metadata: Metadata = {
  title: "Rhinox STEM Clubs | Rhinox Scientifica",
  description:
    "Rhinox STEM Clubs bring hands-on science, coding, robotics and engineering to schools, with inter-school challenges under development. Express interest in the pilot.",
};

const gains = [
  { title: "Hands-on learning", text: "Learners investigate, build and test ideas instead of only reading about them." },
  { title: "A club that fits the school", text: "Run by an adult coordinator, with activities suited to your learners and resources." },
  { title: "Connection beyond the school", text: "Opportunities to share work with other schools through inter-school challenges." },
];

const divisions = [
  { title: "Primary", text: "Curiosity-led activities that introduce learners to science, making and simple coding." },
  { title: "Junior Secondary", text: "Projects that build practical skills in investigation, design and problem solving." },
  { title: "Senior Secondary", text: "Deeper engineering, coding and innovation work that connects to further study." },
];

const activities = [
  "Science experiments",
  "Coding",
  "Robotics",
  "Engineering design",
  "STEM quizzes",
  "Innovation projects",
  "Sustainability",
];

const steps = [
  { title: "Express interest", text: "A school coordinator completes the short form below." },
  { title: "We get in touch", text: "Rhinox contacts the school to talk through the pilot." },
  { title: "Shape the pilot", text: "Details are agreed with participating schools as the pilot is planned." },
];

const faqs = [
  {
    q: "What is a Rhinox STEM Club?",
    a: "A school club where learners take part in practical science, technology, engineering and mathematics activities, led by an adult at the school.",
  },
  {
    q: "Which schools can take part?",
    a: "The pilot is intended for a small group of schools, between five and ten, in a single area. Primary, Junior Secondary and Senior Secondary schools can express interest.",
  },
  {
    q: "Where and when will the pilot run?",
    a: "The area and timing have not been decided. We will share them directly with schools that express interest.",
  },
  {
    q: "What does it cost?",
    a: "Costs have not been decided. Expressing interest does not commit your school to anything.",
  },
  {
    q: "What are the inter-school challenges?",
    a: "Inter-school challenges are a programme area under development. Categories, formats and any events have not been confirmed.",
  },
  {
    q: "What information do you collect?",
    a: "Only school and adult coordinator details. Please do not send learner names, dates of birth, home addresses, personal phone numbers or photographs.",
  },
  {
    q: "What happens when I submit the form?",
    a: "The form opens your email app with the details already written out. Your interest is registered once you press send. If your device has no email app, write to us using the address on the Contact page.",
  },
];

export default function StemClubsPage() {
  return (
    <main style={{ background: "var(--rx-white)" }}>
      <HubHero
        eyebrow="Schools · Rhinox STEM Clubs"
        lineOne="Hands-on STEM clubs"
        lineTwo="for schools."
        lead="Rhinox STEM Clubs help schools run practical science, coding, robotics and engineering activities, with inter-school challenges being developed. We are now inviting schools to express interest in a pilot."
        actions={[
          { label: "Express interest", href: "#interest-form" },
          { label: "Talk to us", href: "/contact", secondary: true },
        ]}
        image="/images/journey/journey-robotics.jpg"
        alt="Young people building a robotics project"
        chips={["Primary", "Junior Secondary", "Senior Secondary"]}
      />

      <section className={hub.stepsSection}>
        <div className="rx-container">
          <HubSectionHead eyebrow="What schools gain" lineOne="Learning that learners" lineTwo="can see and touch." />
          <HubSteps steps={gains} />
        </div>
      </section>

      <section className={hub.showcaseSection}>
        <div className="rx-container">
          <HubSectionHead eyebrow="Inside the school" lineOne="Intra-school activities" lineTwo="that run all year." />
          <p style={{ maxWidth: 680, lineHeight: 1.7 }}>
            Each club meets within the school, guided by an adult coordinator. Learners work in small teams on practical activities and share what they
            discover with their classmates.
          </p>
          <ul style={{ display: "flex", flexWrap: "wrap", gap: 10, padding: 0, margin: "20px 0 0", listStyle: "none" }}>
            {activities.map((activity) => (
              <li key={activity} style={{ padding: "8px 14px", border: "1px solid #cfe0f7", borderRadius: 999, background: "#f3f8ff", fontSize: 14 }}>
                {activity}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={hub.stepsSection}>
        <div className="rx-container">
          <HubSectionHead eyebrow="Between schools" lineOne="Inter-school challenges" lineTwo="under development." />
          <p style={{ maxWidth: 680, lineHeight: 1.7 }}>
            We are developing challenges and competitions in which clubs from different schools can take part. Competition categories are programme areas
            under development, and no events, dates, venues or prizes have been confirmed.
          </p>
        </div>
      </section>

      <section className={hub.showcaseSection}>
        <div className="rx-container">
          <HubSectionHead eyebrow="Divisions" lineOne="A place for every" lineTwo="age group." />
          <HubSteps steps={divisions} />
        </div>
      </section>

      <section className={hub.quoteSection} id="interest-form" style={{ scrollMarginTop: 80 }}>
        <div className={`rx-container ${hub.quoteInner}`}>
          <div className={hub.splitHead}>
            <p className={`rx-eyebrow ${hub.eyebrow}`}>Join the pilot</p>
            <h2 className={hub.sectionTitle}>
              <span>Express interest</span>
              <span className={hub.muted}>in the pilot.</span>
            </h2>
            <p style={{ lineHeight: 1.7, marginTop: 16 }}>
              We plan to work with five to ten schools in one area. Tell us about your school and we will be in touch.
            </p>
            <HubSteps steps={steps} />
          </div>
          <div className={hub.quotePanel}>
            <StemClubsForm />
          </div>
        </div>
      </section>

      <section className={hub.stepsSection}>
        <div className="rx-container">
          <HubSectionHead eyebrow="Questions" lineOne="Frequently asked" lineTwo="questions." />
          <div style={{ maxWidth: 780 }}>
            {faqs.map((faq) => (
              <details key={faq.q} style={{ borderBottom: "1px solid #dbe6f5", padding: "14px 0" }}>
                <summary style={{ cursor: "pointer", fontWeight: 600 }}>{faq.q}</summary>
                <p style={{ marginTop: 10, lineHeight: 1.7 }}>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <HubClosing
        kicker="Questions first?"
        lineOne="Talk to the"
        lineTwo="Rhinox team."
        lead="We are glad to explain the pilot before your school decides."
        actions={[
          { label: "Contact Rhinox", href: "/contact" },
          { label: "Back to schools", href: "/schools", secondary: true },
        ]}
        image="/images/hero/classroom.jpg"
      />
    </main>
  );
}
