"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RhinoxJourney from "./components/home/RhinoxJourney";
import PlayRhinox from "./components/home/PlayRhinox";
import PlayLabs from "./components/home/PlayLabs";
import RhinoCodeBand from "./components/home/RhinoCodeBand";
import ExploreRhinox from "./components/home/ExploreRhinox";
import ShopRhinox from "./components/home/ShopRhinox";
import SchoolsRhinox from "./components/home/SchoolsRhinox";
import MoreRhinox from "./components/home/MoreRhinox";
import "./home-polish.css";

const slides = [
  {
    id: "microscope",
    image: "/images/hero/microscope.jpg",
    category: "SCIENCE & EQUIPMENT",
    title: "Science",
    description:
      "Scientific equipment, laboratory supplies and practical tools for learning, discovery and professional work.",
  },
  {
    id: "classroom",
    image: "/images/hero/classroom.jpg",
    category: "EDUCATION & LEARNING",
    title: "Education",
    description:
      "STEM and STEAM education, books, resources and practical learning experiences for learners and educators.",
  },
  {
    id: "coding",
    image: "/images/hero/coding.jpg",
    category: "TECHNOLOGY & CODING",
    title: "Technology",
    description:
      "Coding, robotics and technology experiences that help learners move from ideas to practical creation.",
  },
  {
    id: "stem-lab",
    image: "/images/hero/stem-lab.jpg",
    category: "LABORATORY SOLUTIONS",
    title: "Laboratory Solutions",
    description:
      "Laboratory design, construction, equipment, supply and practical solutions for schools and institutions.",
  },
];

function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 7000);

    return () => window.clearInterval(timer);
  }, []);

  const active = slides[activeSlide];

  return (
    <section
      className="rx-hero"
      aria-label="Rhinox Scientifica introduction"
    >
      <div className="rx-hero-slides" aria-hidden="true">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`rx-hero-slide ${
              index === activeSlide ? "is-active" : ""
            }`}
            style={{
              backgroundImage: `url(${slide.image})`,
            }}
          />
        ))}
      </div>

      <div className="rx-hero-overlay" />
      <div className="rx-hero-grid" aria-hidden="true" />

      <div className="rx-container rx-hero-inner">
        <div className="rx-hero-content">
          <p className="rx-eyebrow">
            SCIENCE <span>•</span> TECHNOLOGY <span>•</span> EDUCATION{" "}
            <span>•</span> INNOVATION
          </p>

          {/* Two-tone title: navy first line, Rhinox Blue second line. */}
          <h1>
            <span style={{ display: "block" }}>Everything you need</span>
            <span style={{ display: "block", color: "var(--rx-blue)" }}>
              to learn, build and create.
            </span>
          </h1>

          <p className="rx-hero-description">
            Rhinox Scientifica brings together scientific equipment,
            laboratory solutions, STEM and STEAM education, books, learning
            resources, kits, technology, training and practical experiences
            for learners, families, schools, institutions and professionals.
          </p>

          <div className="rx-hero-actions">
            <Link
              href="/explore"
              className="rx-button rx-button-primary"
            >
              <span>Explore Rhinox</span>
            </Link>

            <Link
              href="/shop"
              className="rx-button rx-button-secondary"
            >
              <span>Shop & Discover</span>
            </Link>
          </div>
        </div>

        <div className="rx-hero-panel">
          <p className="rx-hero-panel-category">
            {active.category}
          </p>

          <h2>{active.title}</h2>

          <p className="rx-hero-panel-description">
            {active.description}
          </p>

          <Link
            href="/explore"
            className="rx-hero-panel-link"
          >
            Discover more
          </Link>
        </div>
      </div>

      <div className="rx-hero-bottom">
        <div className="rx-hero-categories">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={`rx-hero-category ${
                index === activeSlide ? "is-active" : ""
              }`}
              onClick={() => setActiveSlide(index)}
              aria-label={`Show ${slide.title} slide`}
              aria-current={
                index === activeSlide ? "true" : undefined
              }
            >
              <span>{slide.title}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main>
      <Hero />

      <RhinoxJourney />

      <PlayRhinox />

      <PlayLabs />

      <RhinoCodeBand />

      <ExploreRhinox />

      <ShopRhinox />

      <SchoolsRhinox />

      <MoreRhinox />
    </main>
  );
}
