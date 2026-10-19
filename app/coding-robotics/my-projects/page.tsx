import type { Metadata } from "next";

import MyProjects from "@/app/components/rhinocode/MyProjects";

export const metadata: Metadata = {
  title: "My Projects | Rhinox Scientifica",
  description: "Your RhinoCode programmes and games, kept together on this device.",
};

export default function Page() {
  return <MyProjects />;
}
