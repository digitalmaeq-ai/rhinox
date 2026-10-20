import type { Metadata } from "next";

import WebLoader from "@/app/components/code-studio/WebLoader";

export const metadata: Metadata = {
  title: "Web Studio | Rhinox Scientifica",
  description: "Write HTML and CSS and watch your web page appear as you type. Work through guided exercises and save your pages to My Projects.",
};

export default function Page() {
  return <WebLoader />;
}
