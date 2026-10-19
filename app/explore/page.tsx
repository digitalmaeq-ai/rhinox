import type { Metadata } from "next";

import ExploreRhinox from "@/app/components/home/ExploreRhinox";

export const metadata: Metadata = {
  title: "Explore | Rhinox Scientifica",
  description:
    "Explore Rhinox: experiences, virtual labs, projects, books, kits and laboratory products.",
};

export default function ExplorePage() {
  return (
    <>
      <h1 className="rx-sr-only">Explore Rhinox</h1>
      <ExploreRhinox />
    </>
  );
}
