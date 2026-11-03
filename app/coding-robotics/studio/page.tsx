import type { Metadata } from "next";

import StudioOverview, { type ResourceRow } from "@/app/components/studio-shell/StudioOverview";
import { ARDUINO_EXERCISES } from "@/lib/code-studio/exercises-arduino";
import { EXERCISES } from "@/lib/code-studio/exercises";
import { WEB_EXERCISES } from "@/lib/code-studio/exercises-web";

export const metadata: Metadata = {
  title: "Overview | Rhinox Code Studio",
  description: "Every Code Studio tool in one place: search, sort and open coding, robotics and game design workspaces, and pick up your saved projects.",
};

// Counts come from the real exercise lists, so this page cannot drift from them.
function resourceRows(): ResourceRow[] {
  const python = new Map<string, number>();
  for (const exercise of EXERCISES) python.set(exercise.group, (python.get(exercise.group) ?? 0) + 1);
  return [
    {
      id: "learn",
      title: "Think • Move • Code! lessons and games",
      detail: "Open the Nursery 1 weeks, term by term",
      href: "/think-move-code",
    },
    ...[...python.entries()].map(([group, count]) => ({
      id: `python-${group}`,
      title: `Python exercises: ${group}`,
      detail: `${count} guided exercises`,
      href: "/coding-robotics/code-studio",
    })),
    { id: "web", title: "Web Studio exercises", detail: `${WEB_EXERCISES.length} guided exercises`, href: "/coding-robotics/code-studio/web" },
    { id: "arduino", title: "Arduino exercises", detail: `${ARDUINO_EXERCISES.length} guided exercises`, href: "/coding-robotics/code-studio/arduino" },
  ];
}

export default function Page() {
  return <StudioOverview resources={resourceRows()} />;
}
