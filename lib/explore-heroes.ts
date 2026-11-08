// Hero for each Explore listing page. Each page has its own photograph (from /public/images),
// its own wording and its own layout. Counts are added by the page from the live catalogue.

import type { ExploreHeroProps } from "@/app/components/ExploreHero";

export type ExploreHeroConfig = Omit<ExploreHeroProps, "stats"> & { noun: string; extraStats: { value?: string; label: string }[] };

export const EXPLORE_HEROES: Record<string, ExploreHeroConfig> = {
  "/explore/project-lab": {
    image: "/images/journey/journey-pexels.jpg",
    alt: "Students working with laboratory apparatus",
    eyebrow: "Explore · Project Lab",
    lineOne: "Build it. Test it.",
    lineTwo: "Make it better.",
    lead: "Practical STEM projects that turn an idea into something that works, with materials you can find.",
    actions: [{ label: "Browse projects", href: "#library" }, { label: "Try a challenge", href: "/explore/stem-challenges", secondary: true }],
    align: "left",
    tone: "amber",
    noun: "projects",
    extraStats: [{ label: "Build, test, improve" }, { label: "Hands-on" }],
  },
  "/explore/stem-challenges": {
    image: "/images/hero/classroom.jpg",
    alt: "Learners working together in a classroom",
    eyebrow: "Explore · STEM Challenges",
    lineOne: "Open challenges.",
    lineTwo: "No single answer.",
    lead: "Problems that reward creativity and teamwork. Plan it, make it, and explain why it works.",
    actions: [{ label: "See the challenges", href: "#library" }, { label: "Code challenges", href: "/coding-robotics/challenges", secondary: true }],
    align: "right",
    tone: "amber",
    noun: "challenges",
    extraStats: [{ label: "Solo or in teams" }, { label: "Design and solve" }],
  },
  "/explore/stem-quizzes": {
    image: "/images/journey/journey-science.jpg",
    alt: "A teacher and a young learner at a chalkboard of equations",
    imagePosition: "50% 40%",
    eyebrow: "Explore · STEM Quizzes",
    lineOne: "Check what you know.",
    lineTwo: "Then go further.",
    lead: "Short, scored quizzes with instant feedback, so you can see what has stuck and what to revisit.",
    actions: [{ label: "Start a quiz", href: "#library" }, { label: "Play a game", href: "/explore/stem-games", secondary: true }],
    align: "center",
    tone: "sky",
    noun: "quizzes",
    extraStats: [{ label: "Instant feedback" }, { label: "Plays in your browser" }],
  },
  "/explore/experiments": {
    image: "/images/hero/microscope.jpg",
    alt: "A compound microscope on a laboratory bench",
    imagePosition: "50% 25%",
    eyebrow: "Explore · Experiments",
    lineOne: "Look closer.",
    lineTwo: "Ask why.",
    lead: "Practical investigations for curious learners: predict, observe, and explain what you find.",
    actions: [{ label: "Browse experiments", href: "#library" }, { label: "Virtual labs", href: "/explore/virtual-lab", secondary: true }],
    align: "left",
    tone: "sky",
    noun: "experiments",
    extraStats: [{ label: "Predict, observe, explain" }],
  },
};
