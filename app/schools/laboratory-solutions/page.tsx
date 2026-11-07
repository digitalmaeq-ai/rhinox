import type { Metadata } from "next";

import Breadcrumbs from "../../components/Breadcrumbs";
import { labEquipment, virtualLabs } from "@/lib/schools/data";
import LabPlanner from "./LabPlanner";
import styles from "./lab.module.css";

export const metadata: Metadata = {
  title: "Laboratory Solutions | Rhinox Scientifica",
  description: "Plan, supply, set up and support a school science laboratory, with real equipment from the Rhinox shop and virtual labs for every subject.",
};

export default function Page() {
  return (
    <main className={styles.page}>
      <div className={`rx-container ${styles.crumbs}`}>
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Schools & Institutions", href: "/schools" }, { label: "Laboratory Solutions" }]} />
      </div>
      <LabPlanner equipment={labEquipment()} labs={virtualLabs()} />
    </main>
  );
}
