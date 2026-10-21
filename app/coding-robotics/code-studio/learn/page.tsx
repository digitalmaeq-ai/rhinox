import type { Metadata } from "next";

import LearningHome from "@/app/components/code-studio-v2/LearningHome";

export const metadata: Metadata = {
  title: "Learn | Rhinox Code Studio",
  description: "A beginner-first, curriculum-led learning journey from Rhinox Scientifica.",
};

export default function Page() {
  return <LearningHome />;
}
