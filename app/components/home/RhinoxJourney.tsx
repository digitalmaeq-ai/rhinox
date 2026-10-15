"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CSSProperties,
  useEffect,
  useState,
} from "react";

type JourneyIconProps = {
  active?: boolean;
};

// Stage icons: each one pictures the skill the stage builds.

// Discover — scientific inquiry: a microscope.
function DiscoverIcon({ active }: JourneyIconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className={`rx-journey-icon-svg ${active ? "is-active" : ""}`}
    >
      <path d="M17 8.5 22 6l7 14-5 2.5Z" />
      <path d="m24 22.5-2 5.5" />
      <path d="M15 30h14" />
      <path d="M28 19c5.5 1.5 8.5 6.5 7 12.5V40" />
      <path d="M11 40h27" />
      <path d="M19 40c0-3.3 2.7-6 6-6h10" />
    </svg>
  );
}

// Learn — critical thinking: a head with a thinking gear.
function LearnIcon({ active }: JourneyIconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className={`rx-journey-icon-svg ${active ? "is-active" : ""}`}
    >
      <path d="M17 41v-6.5c-4.4-2.3-7-6.6-7-11.8C10 14.6 16.3 8.5 24 8.5c7.4 0 13.3 5.6 13.5 12.7l3.3 6.3h-3.3V33a3 3 0 0 1-3 3H31v5" />
      <circle cx="23.5" cy="22" r="3.2" />
      <path d="M23.5 14.8v2.4M23.5 26.8v2.4M16.3 22h2.4M28.3 22h2.4M18.4 16.9l1.7 1.7M26.9 25.4l1.7 1.7M28.6 16.9l-1.7 1.7M20.1 25.4l-1.7 1.7" />
    </svg>
  );
}

// Practise — computational thinking: a decision flowchart.
function PractiseIcon({ active }: JourneyIconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className={`rx-journey-icon-svg ${active ? "is-active" : ""}`}
    >
      <rect x="18" y="5" width="12" height="7" rx="1.5" />
      <path d="M24 12v4" />
      <path d="m24 16 6.5 6.5L24 29l-6.5-6.5Z" />
      <path d="M17.5 22.5H11V32" />
      <path d="M30.5 22.5H37V32" />
      <rect x="6" y="32" width="10" height="7" rx="1.5" />
      <rect x="32" y="32" width="10" height="7" rx="1.5" />
    </svg>
  );
}

// Build — engineering design: a robot.
function BuildIcon({ active }: JourneyIconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className={`rx-journey-icon-svg ${active ? "is-active" : ""}`}
    >
      <rect x="12" y="16" width="24" height="19" rx="5" />
      <path d="M24 16v-5" />
      <circle cx="24" cy="9" r="2" />
      <circle cx="19" cy="24" r="2.4" />
      <circle cx="29" cy="24" r="2.4" />
      <path d="M19.5 30h9" />
      <path d="M8.5 22v7M39.5 22v7" />
      <path d="M18 35v5M30 35v5" />
    </svg>
  );
}

// Create — creative innovation: a rocket taking off.
function CreateIcon({ active }: JourneyIconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className={`rx-journey-icon-svg ${active ? "is-active" : ""}`}
    >
      <path d="M24 5.5c6.2 5 8.7 12.3 7.6 21.5H16.4C15.3 17.8 17.8 10.5 24 5.5Z" />
      <circle cx="24" cy="17" r="3" />
      <path d="m16.6 23.5-5.1 6.3 5.4 1.2" />
      <path d="m31.4 23.5 5.1 6.3-5.4 1.2" />
      <path d="M20.5 31c0 4 1.5 6.8 3.5 9.5 2-2.7 3.5-5.5 3.5-9.5" />
    </svg>
  );
}

const journeyStages = [
  {
    id: "discover",
    label: "DISCOVER",
    shortLabel: "Scientific Inquiry",
    idea: "Curiosity starts everything.",
    description:
      "Explore questions, ideas, scientific phenomena, technologies and possibilities that make you want to understand more.",
    image: "/images/journey/journey-unsplash.jpg",
    link: "/resources",
    linkLabel: "Explore resources",
    icon: DiscoverIcon,
  },
  {
    id: "learn",
    label: "LEARN",
    shortLabel: "Critical Thinking",
    idea: "Understanding turns curiosity into knowledge.",
    description:
      "Build a foundation through books, lessons, explanations, experiments and guided experiences that reveal how things work and why they matter.",
    image: "/images/journey/journey-science.jpg",
    link: "/education",
    linkLabel: "Explore education",
    icon: LearnIcon,
  },
  {
    id: "practise",
    label: "PRACTISE",
    shortLabel: "Computational Thinking",
    idea: "Knowledge becomes capability through action.",
    description:
      "Test what you have learned. Experiment, code, solve problems, simulate, measure, make mistakes and try again until understanding becomes skill.",
    image: "/images/hero/coding.jpg",
    link: "/explore",
    linkLabel: "Explore experiences",
    icon: PractiseIcon,
  },
  {
    id: "build",
    label: "BUILD",
    shortLabel: "Engineering Design",
    idea: "Skills become meaningful when you apply them.",
    description:
      "Bring knowledge and practical ability together through projects, STEM kits, laboratory activities, technology and real world problem solving.",
    image: "/images/journey/journey-pexels.jpg",
    link: "/explore/project-lab",
    linkLabel: "Enter Project Lab",
    icon: BuildIcon,
  },
  {
    id: "create",
    label: "CREATE",
    shortLabel: "Creative Innovation",
    idea: "Creation is where your own thinking takes over.",
    description:
      "Develop original ideas, improve what already exists, solve problems differently, share your work and create something that can lead to a new discovery.",
    image: "/images/journey/journey-robotics.jpg",
    link: "/explore/stem-challenges",
    linkLabel: "Explore challenges",
    icon: CreateIcon,
  },
];

const AUTO_DURATION = 8000;

export default function RhinoxJourney() {
  const [activeStage, setActiveStage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) {
      return;
    }

    const timer = window.setTimeout(() => {
      setActiveStage((current) => {
        return (current + 1) % journeyStages.length;
      });
    }, AUTO_DURATION);

    return () => {
      window.clearTimeout(timer);
    };
  }, [activeStage, isPaused]);

  const active = journeyStages[activeStage];

  if (!active) {
    return null;
  }

  const progress =
    ((activeStage + 1) / journeyStages.length) * 100;

  const ActiveIcon = active.icon;

  return (
    <section
      className="rx-journey"
      aria-labelledby="rhinox-journey-title"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="rx-container">

        <div className="rx-journey-shell">

          {/* =====================================================
              LEFT: JOURNEY SYSTEM
              ===================================================== */}

          <div className="rx-journey-visual">

            <div
              className="rx-journey-visual-grid"
              aria-hidden="true"
            />

            <div className="rx-journey-visual-heading">
              <p className="rx-eyebrow">
                THE RHINOX JOURNEY
              </p>

              <h2 id="rhinox-journey-title">
                From curiosity
                <br />
                to creation.
              </h2>
            </div>

            <div
              className="rx-journey-cycle"
              aria-label="Rhinox learning journey"
            >

              <div
                className="rx-journey-orbit rx-journey-orbit-outer"
                aria-hidden="true"
              />

              <div
                className="rx-journey-orbit rx-journey-orbit-inner"
                aria-hidden="true"
              />

              <div
                className="rx-journey-cycle-track"
                aria-hidden="true"
              />

              <div
                className="rx-journey-cycle-progress"
                style={{
                  transform: `rotate(${activeStage * 72}deg)`,
                }}
                aria-hidden="true"
              />

              {journeyStages.map((stage, index) => {
                const angle = index * 72;
                const isActive = index === activeStage;
                const StageIcon = stage.icon;

                return (
                  <button
                    key={stage.id}
                    type="button"
                    className={`rx-journey-node ${
                      isActive ? "is-active" : ""
                    }`}
                    style={
                      {
                        "--rx-node-angle": `${angle}deg`,
                      } as CSSProperties
                    }
                    onClick={() => {
                      setActiveStage(index);
                      setIsPaused(false);
                    }}
                    aria-label={`Show ${stage.label}: ${stage.idea}`}
                    aria-current={
                      isActive ? "step" : undefined
                    }
                  >
                    <span className="rx-journey-node-icon">
                      <StageIcon active={isActive} />
                    </span>

                    <span className="rx-journey-node-text">
                      <span className="rx-journey-node-label">
                        {stage.label}
                      </span>

                      <span className="rx-journey-node-caption">
                        {stage.shortLabel}
                      </span>
                    </span>
                  </button>
                );
              })}

              <div className="rx-journey-cycle-centre">
                <span className="rx-journey-centre-icon">
                  <ActiveIcon active />
                </span>

                <span className="rx-journey-centre-label">
                  {active.label}
                </span>

                <strong>RHINOX</strong>
              </div>
            </div>

            <div className="rx-journey-cycle-footer">
              <span>
                CONTINUOUS LEARNING
              </span>

              <span
                className={`rx-journey-status ${
                  isPaused ? "is-paused" : ""
                }`}
              >
                <span aria-hidden="true" />
                {isPaused ? "PAUSED" : "ACTIVE"}
              </span>
            </div>
          </div>

          {/* =====================================================
              RIGHT: ACTIVE JOURNEY EXPERIENCE
              ===================================================== */}

          <div className="rx-journey-content">

            <div className="rx-journey-image">

              <Image
                key={active.id}
                src={active.image}
                alt=""
                fill
                sizes="(max-width: 900px) 100vw, 42vw"
                className="rx-journey-image-element"
                priority={activeStage === 0}
              />

              <div
                className="rx-journey-image-overlay"
                aria-hidden="true"
              />

              <div className="rx-journey-image-label">
                <span>{active.label}</span>
                <span>{active.shortLabel}</span>
              </div>
            </div>

            <div className="rx-journey-copy">

              <div className="rx-journey-copy-top">
                <div className="rx-journey-active-marker">
                  <span className="rx-journey-active-marker-icon">
                    <ActiveIcon active />
                  </span>

                  <span>
                    {active.label}
                  </span>
                </div>

                <span className="rx-journey-copy-state">
                  CONTINUOUS CYCLE
                </span>
              </div>

              <div
                key={active.id}
                className="rx-journey-copy-content"
              >
                <h3>{active.idea}</h3>

                <p className="rx-journey-description">
                  {active.description}
                </p>

                <Link
                  href={active.link}
                  className="rx-journey-link"
                >
                  {active.linkLabel}
                </Link>
              </div>

              <div
                className="rx-journey-progress"
                aria-hidden="true"
              >
                <span
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>

              <div className="rx-journey-stage-list">
                {journeyStages.map((stage, index) => {
                  const StageIcon = stage.icon;
                  const isActive =
                    index === activeStage;

                  return (
                    <button
                      key={stage.id}
                      type="button"
                      className={
                        isActive ? "is-active" : ""
                      }
                      onClick={() => {
                        setActiveStage(index);
                        setIsPaused(false);
                      }}
                      aria-label={stage.label}
                      aria-current={
                        isActive ? "step" : undefined
                      }
                    >
                      <StageIcon active={isActive} />

                      <span>{stage.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="rx-journey-bottom">
          <p>
            Every experience moves you forward.
            Every creation opens a new question.
            The journey begins again.
          </p>

          <span>
            CONTINUOUS LEARNING SYSTEM
          </span>
        </div>
      </div>
    </section>
  );
}