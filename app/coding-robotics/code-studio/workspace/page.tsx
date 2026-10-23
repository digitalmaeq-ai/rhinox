import type { Metadata } from "next";
import Workspace from "@/app/components/code-studio-v2/Workspace";

export const metadata: Metadata = {
  title: "Beginner Workspace | Rhinox Code Studio",
  description: "Build an instruction sequence, run a robot simulation, and learn how algorithms work.",
};

export default function Page() {
  return <Workspace />;
}
