import Image from "next/image";
import Link from "next/link";

import styles from "./hub.module.css";

export interface HubAction {
  label: string;
  href: string;
  secondary?: boolean;
}

function Actions({ actions, className }: { actions: HubAction[]; className?: string }) {
  return (
    <div className={className}>
      {actions.map((action) => (
        <Link
          key={action.href + action.label}
          href={action.href}
          className={`rx-button ${action.secondary ? "rx-button-secondary" : "rx-button-primary"}`}
        >
          {action.label}
        </Link>
      ))}
    </div>
  );
}

export function HubHero({
  eyebrow,
  lineOne,
  lineTwo,
  lead,
  actions,
  image,
  alt,
  chips,
}: {
  eyebrow: string;
  lineOne: string;
  lineTwo: string;
  lead: string;
  actions: HubAction[];
  image: string;
  alt: string;
  chips: string[];
}) {
  return (
    <section className={styles.hero}>
      <div className={styles.heroBackdrop} aria-hidden="true" />
      <div className={`rx-container ${styles.heroInner}`}>
        <div className={styles.heroText}>
          <p className={`rx-eyebrow ${styles.eyebrow}`}>{eyebrow}</p>
          <h1 className={styles.heroTitle}>
            <span>{lineOne}</span>
            <span className={styles.muted}>{lineTwo}</span>
          </h1>
          <p className={styles.heroLead}>{lead}</p>
          <Actions actions={actions} className={styles.actions} />
        </div>

        <div className={styles.heroMedia}>
          <div className={styles.heroPhoto}>
            <Image
              src={image}
              alt={alt}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 560px"
              style={{ objectFit: "cover" }}
            />
          </div>
          <ul className={styles.chips} aria-label="Highlights">
            {chips.map((chip) => (
              <li key={chip}>{chip}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function HubSectionHead({
  eyebrow,
  lineOne,
  lineTwo,
}: {
  eyebrow: string;
  lineOne: string;
  lineTwo: string;
}) {
  return (
    <div className={styles.sectionHead}>
      <p className={`rx-eyebrow ${styles.eyebrow}`}>{eyebrow}</p>
      <h2 className={styles.sectionTitle}>
        <span>{lineOne}</span>
        <span className={styles.muted}>{lineTwo}</span>
      </h2>
    </div>
  );
}

export interface HighlightItem {
  title: string;
  text: string;
  icon: string;
}

// Three short points separated by hairlines: no boxes.
export function HubHighlights({ items }: { items: HighlightItem[] }) {
  return (
    <section className={styles.highlights}>
      <ul className={`rx-container ${styles.highlightList}`}>
        {items.map((item) => (
          <li key={item.title}>
            <span className={styles.highlightIcon} aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
            </span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function HubSteps({ steps }: { steps: { title: string; text: string }[] }) {
  return (
    <ol className={styles.steps}>
      {steps.map((step, index) => (
        <li key={step.title}>
          <span className={styles.stepDot}>{index + 1}</span>
          <h3>{step.title}</h3>
          <p>{step.text}</p>
        </li>
      ))}
    </ol>
  );
}

export function HubFeature({
  eyebrow,
  lineOne,
  lineTwo,
  text,
  action,
  image,
  alt,
}: {
  eyebrow: string;
  lineOne: string;
  lineTwo: string;
  text: string;
  action: HubAction;
  image: string;
  alt: string;
}) {
  return (
    <section className={styles.feature}>
      <div className={`rx-container ${styles.featureInner}`}>
        <div className={styles.featurePhoto}>
          <Image src={image} alt={alt} fill sizes="(max-width: 900px) 100vw, 560px" style={{ objectFit: "cover" }} />
        </div>
        <div>
          <p className={`rx-eyebrow ${styles.eyebrow}`}>{eyebrow}</p>
          <h2 className={styles.sectionTitle}>
            <span>{lineOne}</span>
            <span className={styles.muted}>{lineTwo}</span>
          </h2>
          <p className={styles.bodyText}>{text}</p>
          <Actions actions={[action]} className={styles.actions} />
        </div>
      </div>
    </section>
  );
}

export function HubClosing({
  kicker,
  lineOne,
  lineTwo,
  lead,
  actions,
  image,
}: {
  kicker: string;
  lineOne: string;
  lineTwo: string;
  lead: string;
  actions: HubAction[];
  image: string;
}) {
  return (
    <section className={styles.closing}>
      <div className="rx-container">
        <div className={styles.closingBand}>
          <Image src={image} alt="" fill sizes="1280px" style={{ objectFit: "cover" }} />
          <div className={styles.closingVeil} aria-hidden="true" />
          <div className={styles.closingBody}>
            <p className={styles.closingKicker}>{kicker}</p>
            <h2 className={styles.closingTitle}>
              <span>{lineOne}</span>
              <span className={styles.muted}>{lineTwo}</span>
            </h2>
            <p className={styles.closingLead}>{lead}</p>
            <Actions actions={actions} className={styles.actions} />
          </div>
        </div>
      </div>
    </section>
  );
}
