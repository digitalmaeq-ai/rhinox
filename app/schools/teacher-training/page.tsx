import type { Metadata } from "next";

import Breadcrumbs from "../../components/Breadcrumbs";
import { TRAINING_TRACKS } from "@/lib/schools/training";
import Syllabus from "./Syllabus";
import styles from "./training.module.css";

export const metadata: Metadata = {
  title: "Teacher Training | Rhinox Scientifica",
  description: "Four practical training tracks for teachers: STEM methods, coding and robotics, laboratory skills and safety, and using Rhinox resources.",
};

export default function Page() {
  return (
    <main className={styles.page}>
      <div className={`rx-container ${styles.crumbs}`}>
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Schools & Institutions", href: "/schools" }, { label: "Teacher Training" }]} />
      </div>
      <Syllabus tracks={TRAINING_TRACKS} />
    </main>
  );
}
