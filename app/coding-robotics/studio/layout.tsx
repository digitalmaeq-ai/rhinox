import type { ReactNode } from "react";

import StudioShell from "@/app/components/studio-shell/StudioShell";

export default function Layout({ children }: { children: ReactNode }) {
  return <StudioShell>{children}</StudioShell>;
}
