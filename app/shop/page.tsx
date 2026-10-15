import type { Metadata } from "next";

import ShopCatalogue from "@/app/components/shop/ShopCatalogue";

export const metadata: Metadata = {
  title: "Shop | Rhinox Scientifica",
  description:
    "Books, STEM kits, digital resources, laboratory equipment and laboratory chemicals from Rhinox Scientifica.",
};

export default function ShopPage() {
  return <ShopCatalogue category="all" />;
}
