import type { Metadata } from "next";

import ShopCatalogue from "@/app/components/shop/ShopCatalogue";

export const metadata: Metadata = {
  title: "Kits | Rhinox Shop",
  description: "Hands-on STEM kits for coding, robotics, electronics and science experiments.",
};

export default function Page() {
  return <ShopCatalogue category="kits" />;
}
