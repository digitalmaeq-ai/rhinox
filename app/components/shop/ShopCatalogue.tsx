"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { getAllContent, type ContentItem } from "@/lib/content";
import { getContentHref } from "@/lib/content-registry";
import { isLiveContent } from "@/lib/interactive-experiences";
import type { ProductContent, ShopCategory } from "@/types/products";

import styles from "./ShopCatalogue.module.css";

/**
 * The /shop page and its category pages (/shop/kits, /shop/books, ...).
 * One catalogue: a headline, search, category tabs with live counts, simple
 * filters and a grid of products. Every product, count and picture comes from
 * the content source, so adding a product (or a coverImage / price to one)
 * updates this page by itself. When WooCommerce is connected, only the data
 * source and the card button change; the layout stays.
 */

export type ShopTab = ShopCategory | "all";

const TABS: { id: ShopTab; label: string; href: string }[] = [
  { id: "all", label: "All products", href: "/shop" },
  { id: "books", label: "Books", href: "/shop/books" },
  { id: "kits", label: "Kits", href: "/shop/kits" },
  { id: "digital-resources", label: "Digital resources", href: "/shop/digital-resources" },
  { id: "laboratory-equipment", label: "Laboratory equipment", href: "/shop/laboratory-equipment" },
  { id: "laboratory-chemicals", label: "Laboratory chemicals", href: "/shop/laboratory-chemicals" },
];

const SHORT_LABEL: Record<ShopCategory, string> = {
  books: "Books",
  kits: "Kits",
  "digital-resources": "Digital",
  "laboratory-equipment": "Lab equipment",
  "laboratory-chemicals": "Lab chemicals",
};

const EMPTY_TEXT: Record<ShopCategory, string> = {
  books: "New books are on the way.",
  kits: "New kits are on the way.",
  "digital-resources": "Digital resources are coming soon.",
  "laboratory-equipment": "Laboratory equipment is coming soon.",
  "laboratory-chemicals": "Laboratory chemicals are coming soon.",
};

// Age bands for the filter, matched against each product's ageGroups ("8-14").
const AGE_BANDS = [
  { id: "primary", label: "Ages 6–10 (Primary)", from: 6, to: 10 },
  { id: "jss", label: "Ages 11–14 (JSS)", from: 11, to: 14 },
  { id: "sss", label: "Ages 15–18 (SSS)", from: 15, to: 18 },
];

const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "az", label: "Name: A to Z" },
  { id: "za", label: "Name: Z to A" },
];

function isProduct(item: ContentItem): item is ProductContent {
  return item.contentType === "product";
}

function ageRanges(product: ProductContent): [number, number][] {
  return (product.ageGroups ?? [])
    .map((group) => group.split(/[-–]/).map((n) => parseInt(n, 10)))
    .filter((pair) => pair.length === 2 && pair.every((n) => !Number.isNaN(n)))
    .map(([a, b]) => [a, b] as [number, number]);
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

function Picture({ product }: { product: ProductContent }) {
  if (product.coverImage) {
    // Plain <img>: cut-out product pictures shown whole on the light panel.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={product.coverImage} alt="" className={styles.pictureImg} loading="lazy" />;
  }
  if (product.productKind === "book") {
    return (
      <span className={styles.book}>
        <span className={styles.bookSpine} />
        <span className={styles.bookFace}>
          <span className={styles.bookSeries}>{product.series ?? "Rhinox Scientifica"}</span>
          <span className={styles.bookTitle}>{product.title}</span>
        </span>
      </span>
    );
  }
  return (
    <svg className={styles.pictureIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8l9-5 9 5v8l-9 5-9-5ZM3 8l9 5 9-5M12 13v8" />
    </svg>
  );
}

export default function ShopCatalogue({ category = "all" }: { category?: ShopTab }) {
  const products = useMemo(() => getAllContent().filter(isLiveContent).filter(isProduct), []);
  const [query, setQuery] = useState("");
  const [age, setAge] = useState("");
  const [subject, setSubject] = useState("");
  const [sort, setSort] = useState("featured");

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: products.length };
    for (const product of products) map[product.shopCategory] = (map[product.shopCategory] ?? 0) + 1;
    return map;
  }, [products]);

  const subjects = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.subjects ?? []))).sort((a, b) => a.localeCompare(b)),
    [products]
  );

  const shown = useMemo(() => {
    const order = TABS.map((t) => t.id as string);
    const q = query.trim().toLowerCase();
    const band = AGE_BANDS.find((b) => b.id === age);
    const list = products.filter((p) => {
      if (category !== "all" && p.shopCategory !== category) return false;
      if (subject && !(p.subjects ?? []).includes(subject)) return false;
      if (band && !ageRanges(p).some(([a, b]) => a <= band.to && b >= band.from)) return false;
      if (q) {
        const haystack = [p.title, p.excerpt, p.description, ...(p.tags ?? []), ...(p.topics ?? [])].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    return list.sort((a, b) => {
      if (sort === "az") return a.title.localeCompare(b.title);
      if (sort === "za") return b.title.localeCompare(a.title);
      return (
        Number(!!b.featured) - Number(!!a.featured) ||
        order.indexOf(a.shopCategory) - order.indexOf(b.shopCategory) ||
        a.title.localeCompare(b.title)
      );
    });
  }, [products, category, query, age, subject, sort]);

  const filtering = Boolean(query || age || subject);
  const current = TABS.find((t) => t.id === category) ?? TABS[0];

  return (
    <main className={styles.page}>
      <div className={`rx-container ${styles.inner}`}>
        <nav aria-label="Breadcrumb" className={styles.crumbs}>
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          {category === "all" ? (
            <span aria-current="page">Shop</span>
          ) : (
            <>
              <Link href="/shop">Shop</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{current.label}</span>
            </>
          )}
        </nav>

        <header className={styles.head}>
          <div className={styles.headCopy}>
            <p className={styles.eyebrow}>The Rhinox shop</p>
            <h1 className={styles.title}>
              Everything for the lab
              <span> and the classroom</span>
            </h1>
          </div>
          <label className={styles.search}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <span className={styles.srOnly}>Search the shop</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search books, kits, lab equipment…"
            />
          </label>
        </header>

        <nav aria-label="Shop categories" className={styles.tabs}>
          {TABS.map((tab) => {
            const count = counts[tab.id] ?? 0;
            const active = tab.id === category;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`${styles.tab} ${active ? styles.tabActive : ""}`}
              >
                {tab.label}
                {count === 0 && <span className={styles.tabCount}>Soon</span>}
              </Link>
            );
          })}
        </nav>

        <div className={styles.toolbar}>
          <p className={styles.result}>
            <strong>{shown.length}</strong> {shown.length === 1 ? "product" : "products"}
            {filtering && (
              <button
                type="button"
                className={styles.clear}
                onClick={() => {
                  setQuery("");
                  setAge("");
                  setSubject("");
                }}
              >
                Clear filters
              </button>
            )}
          </p>
          <div className={styles.filters}>
            <label className={styles.select}>
              <span className={styles.srOnly}>Age group</span>
              <select value={age} onChange={(event) => setAge(event.target.value)}>
                <option value="">All ages</option>
                {AGE_BANDS.map((band) => (
                  <option key={band.id} value={band.id}>
                    {band.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.select}>
              <span className={styles.srOnly}>Subject</span>
              <select value={subject} onChange={(event) => setSubject(event.target.value)}>
                <option value="">All subjects</option>
                {subjects.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.select}>
              <span className={styles.srOnly}>Sort</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                {SORTS.map((option) => (
                  <option key={option.id} value={option.id}>
                    Sort: {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {shown.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>
              {filtering ? "No products match those filters." : category === "all" ? "The shop is stocking up." : EMPTY_TEXT[category]}
            </p>
            <p className={styles.emptyText}>
              Need something for a school or laboratory now? <Link href="/schools/request-a-quote">Request a quote</Link>.
            </p>
          </div>
        ) : (
          <ul className={styles.grid}>
            {shown.map((product) => {
              const href = getContentHref(product);
              const price = formatPrice(product);
              return (
                <li key={product.id} className={styles.card}>
                  <Link href={href} className={styles.picture} tabIndex={-1} aria-hidden="true">
                    <Picture product={product} />
                    <span className={styles.tag}>{SHORT_LABEL[product.shopCategory]}</span>
                  </Link>
                  <div className={styles.body}>
                    <h2 className={styles.name}>
                      <Link href={href}>{product.title}</Link>
                    </h2>
                    <p className={styles.text}>{product.excerpt || product.description}</p>
                    <div className={styles.buy}>
                      <span className={price ? styles.price : styles.priceSoon}>{price ?? "Price on request"}</span>
                      {/* Becomes "Add to cart" (WooCommerce) once the shop is connected. */}
                      <Link href={href} className={styles.button} aria-label={`View ${product.title}`}>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <section className={styles.schools} aria-labelledby="shop-schools-title">
          <div>
            <h2 id="shop-schools-title" className={styles.schoolsTitle}>
              Buying for a school or laboratory?
            </h2>
            <p className={styles.schoolsText}>Bulk orders, invoices and full laboratory set-ups. Tell us what you need.</p>
          </div>
          <Link href="/schools/request-a-quote" className={styles.schoolsButton}>
            Request a quote
          </Link>
        </section>
      </div>
    </main>
  );
}
