import type { Metadata } from "next";

import ShopCatalogue from "@/app/components/shop/ShopCatalogue";

export const metadata: Metadata = {
  title: "Laboratory Equipment | Rhinox Shop",
  description: "Glassware, meters, models and instruments for school and research laboratories.",
};

export default function Page() {
  return <ShopCatalogue category="laboratory-equipment" />;
}
