import type { Metadata } from "next";

import ShopCatalogue from "@/app/components/shop/ShopCatalogue";

export const metadata: Metadata = {
  title: "Digital Resources | Rhinox Shop",
  description: "Downloadable worksheets, guides and lesson bundles for class and home.",
};

export default function Page() {
  return <ShopCatalogue category="digital-resources" />;
}
