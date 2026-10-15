import type { Metadata } from "next";

import ShopCatalogue from "@/app/components/shop/ShopCatalogue";

export const metadata: Metadata = {
  title: "Laboratory Chemicals | Rhinox Shop",
  description: "Reagents, indicators and consumables for practical science.",
};

export default function Page() {
  return <ShopCatalogue category="laboratory-chemicals" />;
}
