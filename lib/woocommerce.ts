import type { ProductContent, ProductKind, ShopCategory } from "@/types/products";

/**
 * WooCommerce connection (hybrid set-up: the Rhinox site is the storefront,
 * WooCommerce is the product, stock, order and payment back office).
 *
 * Read-only on purpose. The site only ever READS products with a read-only
 * REST API key; orders and payments happen on WooCommerce's own cart and
 * checkout, so card details never touch this site. Keys stay on the server:
 * these functions run only in server code (route handlers, server components)
 * and the browser never sees them.
 *
 * Set these three in `.env.local` (see `.env.example`):
 *   WOOCOMMERCE_URL              e.g. https://shop.rhinoxscientifica.com
 *   WOOCOMMERCE_CONSUMER_KEY     ck_...  (read-only key)
 *   WOOCOMMERCE_CONSUMER_SECRET  cs_...
 * With any of them missing, `isWooConfigured()` is false and the site keeps
 * using its built-in product content, so nothing breaks before the store exists.
 */

export interface WooConfig {
  url: string;
  key: string;
  secret: string;
}

export function getWooConfig(): WooConfig | null {
  const url = process.env.WOOCOMMERCE_URL?.trim().replace(/\/+$/, "");
  const key = process.env.WOOCOMMERCE_CONSUMER_KEY?.trim();
  const secret = process.env.WOOCOMMERCE_CONSUMER_SECRET?.trim();
  if (!url || !key || !secret) return null;
  return { url, key, secret };
}

export function isWooConfigured() {
  return getWooConfig() !== null;
}

/** The parts of a WooCommerce REST v3 product that the site uses. */
interface WooProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  status: string;
  type: string;
  featured: boolean;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  purchasable: boolean;
  virtual: boolean;
  downloadable: boolean;
  stock_status: "instock" | "outofstock" | "onbackorder";
  stock_quantity: number | null;
  date_created: string;
  date_modified: string;
  categories: { id: number; name: string; slug: string }[];
  tags: { id: number; name: string; slug: string }[];
  images: { src: string; alt: string }[];
}

/** A product as the shop shows it: the site's own ProductContent plus its WooCommerce links. */
export interface WooShopProduct extends ProductContent {
  wooId: number;
  /** Adds one to the WooCommerce cart and opens it (WooCommerce's own add-to-cart link). */
  buyUrl: string;
  /** The product page on the WooCommerce store. */
  storeUrl: string;
}

// Which Woo category slugs (or words in them) place a product in which shop category.
const CATEGORY_RULES: { match: RegExp; category: ShopCategory; kind: ProductKind }[] = [
  { match: /book|workbook|activity/, category: "books", kind: "book" },
  { match: /kit|robot|coding/, category: "kits", kind: "kit" },
  { match: /digital|download|worksheet|lesson/, category: "digital-resources", kind: "digital" },
  { match: /chemical|reagent|consumable/, category: "laboratory-chemicals", kind: "chemical" },
  { match: /lab|equipment|glass|microscope/, category: "laboratory-equipment", kind: "equipment" },
];

function classify(product: WooProduct): { category: ShopCategory; kind: ProductKind } {
  const slugs = product.categories.map((c) => c.slug.toLowerCase());
  for (const rule of CATEGORY_RULES) {
    if (slugs.some((slug) => rule.match.test(slug))) return { category: rule.category, kind: rule.kind };
  }
  if (product.virtual || product.downloadable) return { category: "digital-resources", kind: "digital" };
  return { category: "kits", kind: "kit" };
}

/** Strips the HTML WooCommerce stores in descriptions down to plain text. */
function plain(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function mapWooProduct(product: WooProduct, config: Pick<WooConfig, "url">): WooShopProduct {
  const { category, kind } = classify(product);
  const price = parseFloat(product.price);
  const description = plain(product.description) || plain(product.short_description) || product.name;
  const excerpt = plain(product.short_description) || undefined;
  return {
    id: `woo-${product.id}`,
    title: product.name,
    slug: product.slug,
    contentType: "product",
    status: "published",
    shopCategory: category,
    productKind: kind,
    description,
    excerpt,
    featured: product.featured,
    placements: ["shop"],
    tags: product.tags.map((t) => t.name),
    coverImage: product.images[0]?.src,
    price: Number.isFinite(price) ? price : undefined,
    currency: "NGN",
    sku: product.sku || undefined,
    inStock: product.stock_status !== "outofstock",
    stockCount: product.stock_quantity ?? undefined,
    createdAt: product.date_created.slice(0, 10),
    updatedAt: product.date_modified.slice(0, 10),
    wooId: product.id,
    buyUrl: `${config.url}/?add-to-cart=${product.id}`,
    storeUrl: product.permalink,
  };
}

/**
 * Fetches every published product from WooCommerce (up to `maxPages` x 100).
 * Returns null when WooCommerce is not configured, and throws if the store
 * answers with an error, so callers can fall back to the built-in content.
 */
export async function fetchWooProducts(options: { maxPages?: number; revalidate?: number } = {}): Promise<WooShopProduct[] | null> {
  const config = getWooConfig();
  if (!config) return null;

  const { maxPages = 5, revalidate = 300 } = options;
  const products: WooShopProduct[] = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const url = new URL(`${config.url}/wp-json/wc/v3/products`);
    url.searchParams.set("status", "publish");
    url.searchParams.set("per_page", "100");
    url.searchParams.set("page", String(page));

    // Basic auth over HTTPS: the standard way to call the WooCommerce REST API.
    const auth = Buffer.from(`${config.key}:${config.secret}`).toString("base64");
    const response = await fetch(url, {
      headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
      next: { revalidate },
    });
    if (!response.ok) throw new Error(`WooCommerce answered ${response.status} for products page ${page}`);

    const batch = (await response.json()) as WooProduct[];
    products.push(...batch.filter((p) => p.status === "publish").map((p) => mapWooProduct(p, config)));

    const totalPages = parseInt(response.headers.get("x-wp-totalpages") ?? "1", 10);
    if (page >= totalPages || batch.length === 0) break;
  }
  return products;
}
