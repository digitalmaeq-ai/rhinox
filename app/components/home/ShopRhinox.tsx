"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getAllContent, type ContentItem } from "@/lib/content";
import { getContentHref } from "@/lib/content-registry";
import { isLiveContent } from "@/lib/interactive-experiences";
import type { ProductContent } from "@/types/products";

import styles from "./ShopRhinox.module.css";

/**
 * The Shop showcase: one large lead product, the other products beside it,
 * and a chip for every shop category with a live count. Products, counts,
 * links, cover images and prices all come from the content source, so adding
 * a product (or a `coverImage` / `price` to one) updates this by itself.
 * Only the heading and intro below are fixed copy.
 */

const categories: { id: ProductContent["shopCategory"]; label: string; icon: string }[] = [
  { id: "books", label: "Books", icon: "M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3ZM5 17a3 3 0 0 1 3-3h10" },
  { id: "kits", label: "Kits", icon: "M3 8l9-5 9 5v8l-9 5-9-5ZM3 8l9 5 9-5M12 13v8" },
  { id: "digital-resources", label: "Digital resources", icon: "M4 5h16v11H4ZM8 20h8M12 16v4" },
  { id: "laboratory-equipment", label: "Laboratory equipment", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" },
  { id: "laboratory-chemicals", label: "Laboratory chemicals", icon: "M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3M7.5 14h9" },
];

// The showcase offers, in the order they appear after the Think, Move, Code
// book: Coding & Robotics Kits, Glassware & Plasticware, Teacher's Training,
// Digital Downloads and Resources. They point at the existing pages and shop
// categories. Edit the copy, links or pictures here.
const extras: { id: string; kind: string; title: string; text: string; href: string; icon: string; cta: string; images?: string[] }[] = [
  {
    id: "coding-robotics-kits",
    kind: "Kits",
    title: "Coding & Robotics Kits",
    text: "Starter kits for hands-on coding, electronics and robotics, from first circuits to programmable robots.",
    href: "/shop/kits",
    icon: "M3 8l9-5 9 5v8l-9 5-9-5ZM3 8l9 5 9-5M12 13v8",
    cta: "Shop kits",
    images: ["/shop/coding-kit.png"],
  },
  {
    id: "lab-glassware-plasticware",
    kind: "Laboratory",
    title: "Glassware & Plasticware",
    text: "Beakers, flasks, cylinders, test tubes and plastic labware for school and research laboratories.",
    href: "/shop/laboratory-equipment",
    icon: "M6 3h12M7 3v16a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V3M7 10h10M7 15h10",
    cta: "Shop glassware",
    images: ["/shop/glass-beaker.png"],
  },
  {
    id: "teacher-training",
    kind: "Training",
    title: "Teacher's Training",
    text: "Hands-on training so teachers can run STEM lessons and practicals with confidence.",
    href: "/schools/teacher-training",
    icon: "M4 5h16v11H4ZM8 20h8M12 16v4M9 9h6",
    cta: "Explore training",
  },
  {
    id: "digital-downloads",
    kind: "Digital downloads",
    title: "Digital Downloads",
    text: "Worksheets, guides and lesson bundles you can download and use straight away.",
    href: "/shop/digital-resources",
    icon: "M12 4v11M7 11l5 5 5-5M5 20h14",
    cta: "Browse downloads",
  },
  {
    id: "resources",
    kind: "Resources",
    title: "Resources",
    text: "Articles, videos, free downloads, certificates and badges to support STEM learning at home and in school.",
    href: "/resources",
    icon: "M4 6h6l2 2h8v11H4ZM4 11h16",
    cta: "Explore resources",
  },
];

/** Everything either card can show: the products first, then the two offers. */
type ShopItem =
  | { kind: "product"; id: string; product: ProductContent }
  | { kind: "extra"; id: string; extra: (typeof extras)[number] };

const categoryIcon = (id: string) => categories.find((c) => c.id === id)?.icon ?? categories[1].icon;
const categoryLabel = (id: string) => categories.find((c) => c.id === id)?.label ?? "Shop";

// Sample placeholders: they fill any category that has fewer than two live
// products, so the layout can be judged. A real product always takes a
// placeholder's slot, and they disappear once a category has two real ones.
const PER_CATEGORY = 2;
// One cycle every CYCLE_MS: the small card on the right switches first, then the
// large card follows LEAD_DELAY_MS later, so the eye is led from small to big.
const CYCLE_MS = 9000;
const LEAD_DELAY_MS = 3200;


// `image` is optional: a sample with one shows that picture instead of the category icon.
const placeholders: Record<string, { title: string; text: string; image?: string; images?: string[] }[]> = {
  books: [
    { title: "Workbook", text: "A second STEM workbook for Primary and JSS learners.", image: "/shop/stem-workbook.png" },
    { title: "Activity book", text: "Hands-on activities that build thinking and making skills." },
  ],
  kits: [
    { title: "Arduino Starter Kit", text: "Breadboard, LEDs, resistors, jumper wires and more for first electronics and coding projects.", images: ["/shop/arduino-starter-kit.png"] },
    { title: "Coding kit", text: "A starter kit for first steps in coding and logic.", image: "/shop/coding-kit.png" },
    { title: "Robotics kit", text: "Build, wire and program a simple robot." },
  ],
  "digital-resources": [
    { title: "Worksheet pack", text: "Printable worksheets with answer keys.", image: "/shop/worksheet-pack.png" },
    { title: "Lesson bundle", text: "Ready-to-teach digital lessons for the classroom.", image: "/shop/lesson-bundle.png" },
  ],
  "laboratory-equipment": [
    { title: "Microscope", text: "A school-grade microscope for practical biology." },
    { title: "Volumetric flask", text: "Class A flask for preparing standard solutions accurately.", images: ["/shop/glass-volumetric-flask.png"] },
  ],
  "laboratory-chemicals": [
    { title: "Beaker", text: "Graduated borosilicate beaker for mixing and heating.", images: ["/shop/glass-beaker.png"] },
    { title: "Conical flask", text: "Erlenmeyer flask for titrations and swirling solutions.", images: ["/shop/glass-conical-flask.png"] },
  ],
};

function isProduct(item: ContentItem): item is ProductContent {
  return item.contentType === "product";
}

function formatPrice(product: ProductContent) {
  if (typeof product.price !== "number") return null;
  const currency = product.currency || "NGN";
  try {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(product.price);
  } catch {
    return `${currency} ${product.price}`;
  }
}

/** Cover for an offer: its pictures when it has them (one, or a pair side by side), otherwise its icon. */
function OfferCover({ extra, large }: { extra: (typeof extras)[number]; large?: boolean }) {
  if (extra.images?.length) {
    return (
      <div className={`${styles.cover} ${styles.coverArtBox} ${large ? styles.coverLarge : ""}`} aria-hidden="true">
        <div className={styles.coverArt}>
          {extra.images.map((src) => (
            // Plain <img>: these are small SVG illustrations, so no image optimiser is needed.
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" className={styles.coverArtImg} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className={`${styles.cover} ${styles.coverIcon} ${large ? styles.coverLarge : ""}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
        <path d={extra.icon} />
      </svg>
    </div>
  );
}

function Cover({ product, large }: { product: ProductContent; large?: boolean }) {
  // Equipment, kit and chemical pictures are cut-out illustrations: show them
  // whole on the light panel instead of cropping them like a book cover.
  if (product.coverImage && product.productKind !== "book") {
    return (
      <div className={`${styles.cover} ${styles.coverArtBox} ${large ? styles.coverLarge : ""}`} aria-hidden="true">
        <div className={styles.coverArt}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.coverImage} alt="" className={styles.coverArtImg} />
        </div>
      </div>
    );
  }

  if (product.coverImage) {
    return (
      <div className={`${styles.cover} ${large ? styles.coverLarge : ""}`} aria-hidden="true">
        <Image src={product.coverImage} alt="" fill sizes="(max-width: 900px) 100vw, 480px" className={styles.coverImg} />
      </div>
    );
  }

  // No picture yet: a clean placeholder. Books get a book-cover mock-up.
  if (product.productKind === "book") {
    return (
      <div className={`${styles.cover} ${large ? styles.coverLarge : ""}`} aria-hidden="true">
        <div className={styles.book}>
          <span className={styles.bookSpine} />
          <span className={styles.bookFace}>
            <span className={styles.bookSeries}>{product.series ?? "Rhinox Scientifica"}</span>
            <span className={styles.bookTitle}>{product.title}</span>
            <span className={styles.bookBy}>{product.authors?.[0] ?? "Rhinox Scientifica"}</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.cover} ${styles.coverIcon} ${large ? styles.coverLarge : ""}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
        <path d={categoryIcon(product.shopCategory)} />
      </svg>
    </div>
  );
}

export default function ShopRhinox() {
  const products = getAllContent().filter(isLiveContent).filter(isProduct);

  // Featured first, then books/kits in menu order, then by title.
  const order = categories.map((c) => c.id as string);
  const sorted = [...products].sort(
    (a, b) =>
      Number(!!b.featured) - Number(!!a.featured) ||
      order.indexOf(a.shopCategory) - order.indexOf(b.shopCategory) ||
      a.title.localeCompare(b.title)
  );
  // The showcase is a curated window of six: the featured book (Think, Move,
  // Code) first, then the five offers above. Every other product still appears
  // in its category column and on its shop page.
  // The small card starts one step ahead, so the two are never on the same item.
  const showcase = sorted.filter((product) => product.featured && product.productKind === "book");
  const items: ShopItem[] = [
    ...showcase.map((product) => ({ kind: "product" as const, id: product.id, product })),
    ...extras.map((extra) => ({ kind: "extra" as const, id: extra.id, extra })),
  ];
  const total = items.length;

  const [leadIndex, setLeadIndex] = useState(0);
  const [rowIndex, setRowIndex] = useState(1);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const leadCurrent = total ? leadIndex % total : 0;
  const rowCurrent = total ? rowIndex % total : 0;
  const lead = items[leadCurrent] ?? null;

  // Every cycle the small card switches first; the large card follows a moment later.
  useEffect(() => {
    if (paused || reduceMotion || total < 2) return;
    let followTimer = 0;
    const tick = () => {
      setRowIndex((value) => (value + 1) % total);
      followTimer = window.setTimeout(() => setLeadIndex((value) => (value + 1) % total), LEAD_DELAY_MS);
    };
    const timer = window.setInterval(tick, CYCLE_MS);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(followTimer);
    };
  }, [paused, reduceMotion, total]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <section className={`rx-shop ${styles.shop}`} id="shop" aria-labelledby="rhinox-shop-title">
      <div className={`rx-container ${styles.inner}`}>
        <header className={styles.head}>
          <div>
            <span className="rx-eyebrow">Shop</span>
            <h2 id="rhinox-shop-title" className={styles.title}>
              Everything for the lab
              <span> and the classroom</span>
            </h2>
          </div>
          <div className={styles.headSide}>
            <p className={styles.intro}>
              Books, kits, teacher training, digital downloads and laboratory supplies from Rhinox Scientifica, made for learners, teachers and schools.
            </p>
            <Link href="/shop" className={styles.visit}>
              Visit the shop →
            </Link>
          </div>
        </header>

        {lead ? (
          <div className={styles.grid}>
            <div
              className={styles.leadWrap}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocus={() => setPaused(true)}
              onBlur={() => setPaused(false)}
            >
              <div className={styles.leadStack}>
                {items.map((item, index) => {
                  const isActive = index === leadCurrent;
                  const key = item.id;
                  if (item.kind === "extra") {
                    const extra = item.extra;
                    return (
                      <article key={key} className={`${styles.lead} ${isActive ? styles.leadActive : ""}`} aria-hidden={!isActive} inert={!isActive}>
                        <OfferCover extra={extra} large />
                        <div className={styles.leadBody}>
                          <span className={styles.badge}>{extra.kind}</span>
                          <h3 className={styles.leadTitle}>
                            <Link href={extra.href} className={styles.stretch}>
                              {extra.title}
                            </Link>
                          </h3>
                          <p className={styles.leadText}>{extra.text}</p>
                          <span className={styles.leadCta}>{extra.cta} →</span>
                        </div>
                      </article>
                    );
                  }
                  const product = item.product;
                  return (
                    <article key={key} className={`${styles.lead} ${isActive ? styles.leadActive : ""}`} aria-hidden={!isActive} inert={!isActive}>
                      <Cover product={product} large />
                      <div className={styles.leadBody}>
                        <span className={styles.badge}>
                          {product.featured ? "Featured · " : ""}
                          {categoryLabel(product.shopCategory)}
                        </span>
                        <h3 className={styles.leadTitle}>
                          <Link href={getContentHref(product)} className={styles.stretch}>
                            {product.title}
                          </Link>
                        </h3>
                        <p className={styles.leadText}>{product.excerpt || product.description}</p>
                        <p className={styles.meta}>
                          {formatPrice(product) || "Rhinox Scientifica"}
                        </p>
                        <span className={styles.leadCta}>View {product.productKind === "book" ? "book" : "product"} →</span>
                      </div>
                    </article>
                  );
                })}
              </div>
              {total > 1 && (
                <div className={styles.dots} role="group" aria-label="Choose what to show">
                  {items.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`${styles.dot} ${index === leadCurrent ? styles.dotActive : ""}`}
                      aria-label={`Show ${item.kind === "product" ? item.product.title : item.extra.title}`}
                      aria-current={index === leadCurrent}
                      onClick={() => setLeadIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {total > 0 && (
              <div
                className={styles.side}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                onFocus={() => setPaused(true)}
                onBlur={() => setPaused(false)}
              >
                <ul className={styles.list}>
                  {items.map((item, index) => {
                    const active = index === rowCurrent;
                    const rowClass = `${styles.row} ${active ? styles.rowActive : ""}`;
                    if (item.kind === "product") {
                      const product = item.product;
                      return (
                        <li key={item.id} className={rowClass} aria-hidden={!active} inert={!active}>
                          <Cover product={product} />
                          <div className={styles.rowBody}>
                            <span className={styles.rowKind}>{categoryLabel(product.shopCategory)}</span>
                            <h3 className={styles.rowTitle}>
                              <Link href={getContentHref(product)} className={styles.stretch}>
                                {product.title}
                              </Link>
                            </h3>
                            <p className={styles.rowText}>{product.excerpt || product.description}</p>
                            {formatPrice(product) && <p className={styles.meta}>{formatPrice(product)}</p>}
                          </div>
                          <span className={styles.rowArrow} aria-hidden="true">→</span>
                        </li>
                      );
                    }
                    const extra = item.extra;
                    return (
                      <li key={item.id} className={rowClass} aria-hidden={!active} inert={!active}>
                        <OfferCover extra={extra} />
                        <div className={styles.rowBody}>
                          <span className={styles.rowKind}>{extra.kind}</span>
                          <h3 className={styles.rowTitle}>
                            <Link href={extra.href} className={styles.stretch}>
                              {extra.title}
                            </Link>
                          </h3>
                          <p className={styles.rowText}>{extra.text}</p>
                        </div>
                        <span className={styles.rowArrow} aria-hidden="true">→</span>
                      </li>
                    );
                  })}
                </ul>
                {total > 1 && (
                  <div className={styles.rowNav}>
                    <div className={styles.dots} role="group" aria-label="Choose offer">
                      {Array.from({ length: total }, (_, index) => (
                        <button
                          key={index}
                          type="button"
                          className={`${styles.dot} ${index === rowCurrent ? styles.dotActive : ""}`}
                          aria-label={`Show offer ${index + 1} of ${total}`}
                          aria-current={index === rowCurrent}
                          onClick={() => setRowIndex(index)}
                        />
                      ))}
                    </div>
                    <button type="button" className={styles.next} onClick={() => setRowIndex((rowCurrent + 1) % total)}>
                      Next →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className={styles.empty}>The shop is stocking up. Check back soon.</div>
        )}

        <ul className={styles.chips} aria-label="Shop categories">
          {categories.map((category) => {
            const inCategory = products.filter((p) => p.shopCategory === category.id);
            const count = inCategory.length;
            const real = sorted.filter((p) => p.shopCategory === category.id).slice(0, PER_CATEGORY);
            const fill = (placeholders[category.id] ?? []).slice(0, PER_CATEGORY - real.length);
            return (
              <li key={category.id} className={styles.column}>
                <Link href={`/shop/${category.id}`} className={`${styles.chip} ${count === 0 ? styles.chipSoon : ""}`}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={category.icon} />
                  </svg>
                  <span className={styles.chipLabel}>{category.label}</span>
                  <span className={styles.chipCount}>{count === 0 ? "Soon" : count}</span>
                </Link>
                <ul className={styles.groupCards}>
                  {real.map((product) => (
                    <li key={product.id} className={styles.card}>
                      <Cover product={product} />
                      <div className={styles.cardBody}>
                        <h4 className={styles.cardTitle}>
                          <Link href={getContentHref(product)} className={styles.stretch}>
                            {product.title}
                          </Link>
                        </h4>
                        <p className={styles.cardText}>{product.excerpt || product.description}</p>
                        {formatPrice(product) && <p className={styles.meta}>{formatPrice(product)}</p>}
                      </div>
                    </li>
                  ))}
                  {fill.map((sample) => (
                    <li key={sample.title} className={`${styles.card} ${styles.cardSample}`}>
                      {sample.images ? (
                        <div className={`${styles.cover} ${styles.coverSample}`} aria-hidden="true">
                          <span className={styles.sampleArt}>
                            {sample.images.map((src) => (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img key={src} src={src} alt="" className={styles.sampleImg} loading="lazy" />
                            ))}
                          </span>
                        </div>
                      ) : sample.image ? (
                        <div className={`${styles.cover} ${styles.coverArtBox}`} aria-hidden="true">
                          <div className={styles.coverArt}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={sample.image} alt="" className={styles.coverArtImg} />
                          </div>
                        </div>
                      ) : (
                        <div className={`${styles.cover} ${styles.coverSample}`} aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d={category.icon} />
                          </svg>
                        </div>
                      )}
                      <div className={styles.cardBody}>
                                                <h4 className={styles.cardTitle}>
                          <Link href={`/shop/${category.id}`} className={styles.stretch}>
                            {sample.title}
                          </Link>
                        </h4>
                        <p className={styles.cardText}>{sample.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>

        <div className={styles.cta}>
          <div className={styles.ctaCopy}>
            <h3 className={styles.ctaTitle}>Looking for something else?</h3>
            <p className={styles.ctaText}>
              Browse the full Rhinox shop for every book, kit, resource and laboratory supply in one place.
            </p>
          </div>
          <Link href="/shop" className={`rx-button rx-button-primary ${styles.ctaButton}`}>
            Shop all products
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
