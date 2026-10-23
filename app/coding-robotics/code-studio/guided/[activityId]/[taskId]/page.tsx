import type { Metadata } from "next";

import GuidedRobotWorkspace, { GuidedUnavailable } from "@/app/components/code-studio-v2/GuidedRobotWorkspace";
import { resolveGuidedRobotLaunch } from "@/lib/code-studio-v2/guided-launch";
import { resolveDraftPreviewLaunch } from "@/lib/code-studio-v2/guided-draft-preview";

export const metadata: Metadata = {
  title: "Guided coding activity | Rhinox Code Studio",
  robots: { index: false, follow: false },
};

export default async function Page({ params }: { params: Promise<{ activityId: string; taskId: string }> }) {
  const { activityId, taskId } = await params;
  // Only reviewed launches are served. Unreviewed drafts open in local development only.
  const reviewed = resolveGuidedRobotLaunch(activityId, taskId);
  if (reviewed) return <GuidedRobotWorkspace launch={reviewed} draft={false} />;
  const draft = process.env.NODE_ENV === "development" ? resolveDraftPreviewLaunch(activityId, taskId) : null;
  if (draft) return <GuidedRobotWorkspace launch={draft} draft />;
  return <GuidedUnavailable />;
}
