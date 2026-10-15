import type { Metadata } from "next";

import SectionPage from "@/app/components/hub/SectionPage";
import { pages } from "@/app/components/hub/pageData";

const config = pages["schools-stem-school-solutions"];

export const metadata: Metadata = {
  title: `${config.title} | Rhinox Scientifica`,
  description: config.description,
};

export default function Page() {
  return <SectionPage config={config} />;
}
