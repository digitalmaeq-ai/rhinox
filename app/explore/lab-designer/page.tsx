import ExploreHero from "@/app/components/ExploreHero";

export default function LabDesignerPage() {
  return (
    <main>
      <ExploreHero
        image="/images/journey/journey-unsplash.jpg"
        alt="A student looking through a microscope"
        imagePosition="50% 30%"
        eyebrow="Explore · Rhinox Interactive"
        lineOne="STEM Lab Designer."
        lineTwo="Coming soon."
        lead="A future interactive tool for planning and designing practical STEM laboratory spaces."
        actions={[{ label: "Laboratory Solutions for schools", href: "/schools/laboratory-solutions" }, { label: "Virtual labs", href: "/explore/virtual-lab", secondary: true }]}
        stats={[{ label: "In planning" }]}
        align="left"
        tone="amber"
      />
      <section className="rx-section">
        <div className="rx-container">
          <div className="rx-content-card">
            <h2 className="rx-content-card-title">Coming soon</h2>
            <p className="rx-content-card-description">The STEM Lab Designer will become an interactive Rhinox application.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
