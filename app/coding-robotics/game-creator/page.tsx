import type { Metadata } from "next";

import GameCreatorLoader from "@/app/components/rhinocode/game-creator/GameCreatorLoader";

export const metadata: Metadata = {
  title: "RhinoCode Game Creator | Rhinox Scientifica",
  description: "Design a maze game, set its rules, play it and save it to My Projects.",
};

export default function Page() {
  return <GameCreatorLoader />;
}
