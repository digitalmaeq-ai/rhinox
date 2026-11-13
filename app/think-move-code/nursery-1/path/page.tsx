import LearningPathPage, { learningPathMetadata } from "../../_path/LearningPathPage";
import { lessonGuideKeys } from "@/lib/tmc/lesson-guide";

export const metadata = learningPathMetadata("nursery-1");

export default function Nursery1PathPage() {
  return <LearningPathPage levelSlug="nursery-1" guideKeys={lessonGuideKeys()} />;
}
