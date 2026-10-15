import { fetchWooProducts, isWooConfigured } from "@/lib/woocommerce";

// The shop reads WooCommerce products through this route. Results are cached
// for five minutes, so WooCommerce is not hit on every page view and a price
// change shows up on the site within a few minutes.
export const revalidate = 300;

export async function GET() {
  if (!isWooConfigured()) {
    return Response.json({ connected: false, products: [] });
  }
  try {
    const products = await fetchWooProducts({ revalidate });
    return Response.json({ connected: true, products: products ?? [] });
  } catch {
    // Never leak the store address or keys in an error; the shop falls back to its built-in products.
    return Response.json({ connected: false, products: [], error: "Store unavailable" }, { status: 502 });
  }
}
