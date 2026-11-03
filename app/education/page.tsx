import type { Metadata } from "next";
import Link from "next/link";

import Accordion, { type AccordionItem } from "../components/Accordion";
import Breadcrumbs from "../components/Breadcrumbs";
import PageHeader from "../components/PageHeader";
import { getContentHref } from "@/lib/content-registry";
import { getSectionByPath, getSectionItems } from "@/lib/content-sections";
import { getDestinationItems } from "@/lib/menu-destinations";
import { isLiveContent } from "@/lib/interactive-experiences";
import styles from "./education.module.css";

export const metadata: Metadata = {
  title: "Education | Rhinox Scientifica",
  description:
    "Choose where to start: STEM and STEAM learning, Think, Move, Code!, and resources for teachers and parents.",
};

function countLabel(href: string): string | undefined {
  const n = getDestinationItems(href)?.length ?? 0;
  return n > 0 ? `${n} ${n === 1 ? "item" : "items"}` : undefined;
}

// The three real destinations. Counts are read from the same source as the menu.
const INDEX = [
  {
    title: "STEM & STEAM Education",
    text: "Lessons, activities and hands-on experiences in science, mathematics, engineering and more.",
    href: "/education/stem-steam",
  },
  {
    title: "Think • Move • Code!",
    text: "The Think, Move, Code! book series and the coding and robotics activities that go with it.",
    href: "/education/think-move-code",
  },
  {
    title: "Teacher & Parent Resources",
    text: "Teaching guides, worksheets, assessments and ideas for learning at home.",
    href: "/education/teacher-parent-resources",
  },
];

function adultsAccordion(): AccordionItem[] {
  const section = getSectionByPath("/education/teacher-parent-resources");
  const items = section ? getSectionItems(section).filter(isLiveContent) : [];
  const groups = [
    { id: "teacher", title: "Teacher resources", types: ["teacher-resource"] },
    { id: "parent", title: "Parent resources", types: ["parent-resource"] },
    { id: "worksheets", title: "Worksheets and assessments", types: ["worksheet", "assessment"] },
  ];
  return groups
    .map((group) => ({ group, list: items.filter((item) => group.types.includes(item.contentType)) }))
    .filter(({ list }) => list.length > 0)
    .map(({ group, list }) => ({
      id: group.id,
      title: `${group.title} (${list.length})`,
      content: (
        <ul className={styles.adultList}>
          {list.map((item) => (
            <li key={`${item.contentType}-${item.slug}`}>
              <Link href={getContentHref(item)}>{item.title}</Link>
            </li>
          ))}
        </ul>
      ),
    }));
}

export default function EducationPage() {
  const adults = adultsAccordion();
  return (
    <main className={styles.page}>
      <div className={`rx-container ${styles.crumbs}`}>
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Education" }]} />
      </div>
      <PageHeader
        eyebrow="Rhinox education"
        title="Learning that starts with doing"
        lead="Choose where to start. Each one opens a library of lessons, activities and resources."
      />

      <section className={styles.indexSection} aria-label="Where to start">
        <div className="rx-container">
          <ol className={styles.index}>
            {INDEX.map((row, i) => {
              const count = countLabel(row.href);
              return (
                <li key={row.href}>
                  <Link href={row.href} className={styles.row}>
                    <span className={styles.num} aria-hidden="true">{i + 1}</span>
                    <span className={styles.text}>
                      <span className={styles.rowTitle}>{row.title}</span>
                      <span className={styles.desc}>{row.text}</span>
                      {count && <span className={styles.countMobile}>{count}</span>}
                    </span>
                    {count && <span className={styles.count}>{count}</span>}
                    <span className={styles.arrow} aria-hidden="true">{"→"}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
          <p className={styles.also}>
            Also see: <Link href="/shop/books">Rhinox books in the Shop</Link> <span aria-hidden="true">·</span>{" "}
            <Link href="/coding-robotics">Coding &amp; Robotics</Link>
          </p>
        </div>
      </section>

      {adults.length > 0 && (
        <section className={styles.adults} aria-labelledby="adults-title">
          <div className={`rx-container ${styles.adultsInner}`}>
            <div>
              <p className={styles.eyebrow}>For adults</p>
              <h2 id="adults-title" className={styles.adultsTitle}>Teacher and parent resources</h2>
              <p className={styles.adultsLead}>Guides, worksheets and assessments to help at school and at home.</p>
            </div>
            <Accordion items={adults} defaultOpen={[adults[0].id]} />
          </div>
        </section>
      )}

      <section className={styles.closing} aria-label="Teacher training">
        <div className={`rx-container ${styles.closingInner}`}>
          <p>Teaching a class? Talk to us about training.</p>
          <Link href="/schools/teacher-training" className="rx-button rx-button-primary">Teacher training</Link>
        </div>
      </section>
    </main>
  );
}
