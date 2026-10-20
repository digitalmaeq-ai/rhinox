import type { Metadata } from "next";

import ArduinoLoader from "@/app/components/code-studio/ArduinoLoader";

export const metadata: Metadata = {
  title: "Arduino Studio | Rhinox Scientifica",
  description: "Write Arduino programs and watch them run on a simulated board with LEDs, buttons, dials, a buzzer and a Serial Monitor.",
};

export default function Page() {
  return <ArduinoLoader />;
}
