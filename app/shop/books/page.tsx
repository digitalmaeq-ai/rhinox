import type { Metadata } from "next";

import ShopCatalogue from "@/app/components/shop/ShopCatalogue";

export const metadata: Metadata = {
  title: "Books | Rhinox Shop",
  description: "Rhinox books and workbooks, including the Think, Move, Code! series.",
};

export default function Page() {
  return <ShopCatalogue category="books" />;
}
