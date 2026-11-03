import Image from "next/image";
import Link from "next/link";

import { getAllContent, type ContentItem } from "@/lib/content";
import { getContentHref } from "@/lib/content-registry";
import { isLiveContent } from "@/lib/interactive-experiences";
import type { ProductContent } from "@/types/products";

import styles from "./ShopRhinox.module.css";

/**
 * Band 6, Shop: a horizontal rail of six items. The first is the featured book,
 * read from the product data (title, link, cover and price all come from it).
 * The other five point at existing shop categories and pages. No sample or
 * placeholder products are shown. Static: nothing rotates or moves.
 */

type Offer = { id: string; kind: string; title: string; text: string; href: string; cta: string; image?: string };

const OFFERS: Offer[] = [
  {
    id: "kits",
    kind: "Kits",
    title: "Coding & Robotics Kits",
    text: "Starter kits for hands-on coding, electronics and robotics.",
    href: "/shop/kits",
    cta: "Shop kits",
    image: "/shop/coding-kit.png",
  },
  {
    id: "glassware",
    kind: "Laboratory",
    title: "Glassware & Plasticware",
    text: "Beakers, flasks, cylinders and test tubes for school laboratories.",
    href: "/shop/laboratory-equipment",
    cta: "Shop glassware",
    image: "/shop/glass-beaker.png",
  },
  {
    id: "training",
    kind: "Training",
    title: "Teacher's Training",
    text: "Hands-on training for running STEM lessons and practicals with confidence.",
    href: "/schools/teacher-training",
    cta: "Explore training",
  },
  {
    id: "downloads",
    kind: "Digital downloads",
    title: "Digital Downloads",
    text: "Worksheets, guides and lesson bundles you can use straight away.",
    href: "/shop/digital-resources",
    cta: "Browse downloads",
  },
  {
    id: "resources",
    kind: "Resources",
    title: "Resources",
    text: "Articles, videos, free downloads, certificates and badges.",
    href: "/resources",
    cta: "Explore resources",
  },
];

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

export default function ShopRhinox() {
  const book = getAllContent()
    .filter(isLiveContent)
    .filter(isProduct)
    .find((p) => p.featured && p.productKind === "book");

  const bookPrice = book ? formatPrice(book) : null;

  return (
    <section className={styles.shop} id="shop" aria-labelledby="rhinox-shop-title">
      <div className="rx-container">
        <header className={styles.head}>
          <div>
            <p className={styles.eyebrow}>Shop</p>
            <h2 id="rhinox-shop-title" className={styles.title}>
              Everything for the lab <span>and the classroom</span>
            </h2>
          </div>
          <Link href="/shop" className={styles.all}>
            Shop all products <span aria-hidden="true">→</span>
          </Link>
        </header>

        <ul className={styles.rail} aria-label="Shop highlights">
          {book ? (
            <li className={styles.item}>
              <Link href={getContentHref(book)} className={styles.card}>
                <span className={styles.art} aria-hidden="true">
                  {book.coverImage ? (
                    <Image src={book.coverImage} alt="" fill sizes="240px" className={styles.bookImg} />
                  ) : (
                    <span className={styles.bookMark}>{book.title}</span>
                  )}
                </span>
                <span className={styles.kind}>Featured book</span>
                <span className={styles.name}>{book.title}</span>
                <span className={styles.text}>{book.description}</span>
                <span className={styles.cta}>
                  {bookPrice ? `${bookPrice} · ` : ""}View book <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
          ) : null}

          {OFFERS.map((o) => (
            <li key={o.id} className={styles.item}>
              <Link href={o.href} className={styles.card}>
                <span className={styles.art} aria-hidden="true">
                  {o.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={o.image} alt="" className={styles.artImg} />
                  ) : (
                    <span className={styles.artWord}>{o.kind}</span>
                  )}
                </span>
                <span className={styles.kind}>{o.kind}</span>
                <span className={styles.name}>{o.title}</span>
                <span className={styles.text}>{o.text}</span>
                <span className={styles.cta}>
                  {o.cta} <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
