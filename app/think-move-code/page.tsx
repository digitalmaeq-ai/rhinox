import type { Metadata } from "next";

import TmcHome from "./TmcHome";

export const metadata: Metadata = {
  title: "Think • Move • Code! | Rhinox Scientifica",
  description: "Printable cards, games, parent notes and teacher packs for every week of Think • Move • Code! Nursery 1.",
};

export default function ThinkMoveCodePage() {
  return <TmcHome />;
}
