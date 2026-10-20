import type { Metadata } from "next";

import CodeStudioLoader from "@/app/components/code-studio/CodeStudioLoader";

export const metadata: Metadata = {
  title: "Rhinox Code Studio | Rhinox Scientifica",
  description:
    "Write and run real Python in your browser. Work through guided exercises, see your output and save your programs to My Projects.",
  // Lets Code Studio be installed as an app and saved for offline use.
  manifest: "/code-studio/manifest.webmanifest",
};

export default function Page() {
  return <CodeStudioLoader />;
}
