import type { Metadata } from "next";

import ArduinoStudio from "@/app/components/code-studio/ArduinoStudio";

export const metadata: Metadata = {
  title: "Arduino Studio | Rhinox Scientifica",
  description: "Write Arduino programs and watch them run on a simulated board with LEDs, buttons, dials, a buzzer and a Serial Monitor.",
};

export default function Page() {
  return <ArduinoStudio />;
}
