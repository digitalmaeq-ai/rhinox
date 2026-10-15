import Link from "next/link";

import { getAllContent, type ContentItem } from "@/lib/content";
import { getContentHref } from "@/lib/content-registry";
import { isLiveContent } from "@/lib/interactive-experiences";
import type { ProductContent, ShopCategory } from "@/types/products";

import shop from "../shop/ShopCatalogue.module.css";
import styles from "./ProductDetail.module.css";

/**
 * A single product page (/shop/<category>/<slug>): the product's own picture
 * beside its name, price and buy button; then the full description, a
 * details table built from the product file, and more from the same
 * category. Everything comes from the product's content, so a new product
 * gets a complete page without extra work. When WooCommerce is connected the
 * main button becomes "Add to cart"; until then it asks for the product
 * through the quote form, so it is never a dead button.
 */

const CATEGORY: Record<ShopCategory, { label: string; short: string; href: string }> = {
  books: { label: "Books", short: "Books", href: "/shop/books" },
  kits: { label: "Kits", short: "Kits", href: "/shop/kits" },
  "digital-resources": { label: "Digital resources", short: "Digital", href: "/shop/digital-resources" },
  "laboratory-equipment": { label: "Laboratory equipment", short: "Lab equipment", href: "/shop/laboratory-equipment" },
  "laboratory-chemicals": { label: "Laboratory chemicals", short: "Lab chemicals", href: "/shop/laboratory-chemicals" },
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

function Picture({ product, large }: { product: ProductContent; large?: boolean }) {
  if (product.coverImage) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={product.coverImage} alt={large ? product.title : ""} className={large ? styles.heroImg : shop.pictureImg} />;
  }
  if (product.productKind === "book") {
    return (
      <span className={`${shop.book} ${large ? styles.heroBook : ""}`} role={large ? "img" : undefined} aria-label={large ? product.title : undefined}>
        <span className={shop.bookSpine} />
        <span className={shop.bookFace}>
          <span className={shop.bookSeries}>{product.series ?? "Rhinox Scientifica"}</span>
          <span className={shop.bookTitle}>{product.title}</span>
        </span>
      </span>
    );
  }
  return (
    <svg className={shop.pictureIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8l9-5 9 5v8l-9 5-9-5ZM3 8l9 5 9-5M12 13v8" />
    </svg>
  );
}

export default function ProductDetailRenderer({ item }: { item: ContentItem }) {
  if (!isProduct(item)) return null;
  const product = item;
  const category = CATEGORY[product.shopCategory];
  const price = formatPrice(product);

  const details: [string, string][] = [];
  details.push(["Category", category.label]);
  if (product.subjects?.length) details.push(["Subject", product.subjects.join(", ")]);
  if (product.topics?.length) details.push(["Topics", product.topics.join(", ")]);
  if (product.skills?.length) details.push(["Skills", product.skills.join(", ")]);
  if (product.authors?.length) details.push(["Author", product.authors.join(", ")]);
  if (product.format) details.push(["Format", product.format.replace(/-/g, " ")]);
  if (product.sku) details.push(["Product code", product.sku]);
  if (typeof product.inStock === "boolean") details.push(["Availability", product.inStock ? "In stock" : "Out of stock"]);

  // More from the same category first, then the rest of the shop: one row of five.
  const others = getAllContent()
    .filter(isLiveContent)
    .filter(isProduct)
    .filter((p) => p.id !== product.id);
  const related = [
    ...others.filter((p) => p.shopCategory === product.shopCategory),
    ...others.filter((p) => p.shopCategory !== product.shopCategory),
  ].slice(0, 5);

  return (
    <main className={styles.page}>
      <div className={`rx-container ${styles.inner}`}>
        <nav aria-label="Breadcrumb" className={styles.crumbs}>
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/shop">Shop</Link>
          <span aria-hidden="true">/</span>
          <Link href={category.href}>{category.label}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{product.title}</span>
        </nav>

        <section className={styles.top}>
          <div className={styles.gallery}>
            <Picture product={product} large />
          </div>

          <div className={styles.summary}>
            <Link href={category.href} className={styles.tag}>
              {category.label}
            </Link>
            <h1 className={styles.title}>{product.title}</h1>
            {product.excerpt && <p className={styles.lead}>{product.excerpt}</p>}

            <p className={price ? styles.price : styles.priceSoon}>{price ?? "Price on request"}</p>

            <div className={styles.actions}>
              {/* Becomes "Add to cart" (WooCommerce) once the shop is connected. */}
              <Link href="/schools/request-a-quote" className={styles.primary}>
                Request this product
              </Link>
              <Link href="/contact" className={styles.secondary}>
                Ask a question
              </Link>
            </div>

            <ul className={styles.assurance}>
              <li>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6" />
                </svg>
                Bulk orders and school invoices available
              </li>
              <li>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
                </svg>
                Questions? Our team will help you choose
              </li>
            </ul>
          </div>
        </section>

        <section className={styles.info}>
          <div className={styles.description}>
            <h2>Description</h2>
            <p>{product.description}</p>
          </div>
          {details.length > 0 && (
            <div className={styles.details}>
              <h2>Details</h2>
              <dl>
                {details.map(([label, value]) => (
                  <div key={label} className={styles.row}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </section>

        {related.length > 0 && (
          <section className={styles.related} aria-labelledby="related-title">
            <div className={styles.relatedHead}>
              <h2 id="related-title">You may also like</h2>
              <Link href={category.href} className={styles.more}>
                More {category.label.toLowerCase()} →
              </Link>
            </div>
            <ul className={shop.grid}>
              {related.map((p) => {
                const href = getContentHref(p);
                const pPrice = formatPrice(p);
                return (
                  <li key={p.id} className={shop.card}>
                    <Link href={href} className={shop.picture} tabIndex={-1} aria-hidden="true">
                      <Picture product={p} />
                      <span className={shop.tag}>{CATEGORY[p.shopCategory].short}</span>
                    </Link>
                    <div className={shop.body}>
                      <h3 className={shop.name}>
                        <Link href={href}>{p.title}</Link>
                      </h3>
                      <p className={shop.text}>{p.excerpt || p.description}</p>
                      <div className={shop.buy}>
                        <span className={pPrice ? shop.price : shop.priceSoon}>{pPrice ?? "Price on request"}</span>
                        <Link href={href} className={shop.button} aria-label={`View ${p.title}`}>
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
