import type { CelestialBody, SolarSystemModule, Source, SpeedPreset } from "./solar-system-types";

// Central planetary database for the Solar System Explorer.
//
// ACTUAL values come from NASA's Planetary Fact Sheets (Goddard Space Flight
// Center) and NASA Solar System Exploration. Moon counts change as new moons
// are confirmed, so each carries an "asOf" date.
//
// DISPLAY values (colour, displayRadius, phase) are visual choices only. The
// Sun and planets are NOT drawn to scale, and orbits are simplified circles:
// a teaching approximation, not an ephemeris.

export const sources: Source[] = [
  { label: "NASA Planetary Fact Sheet (Goddard Space Flight Center)", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/" },
  { label: "NASA Solar System Exploration", url: "https://science.nasa.gov/solar-system/" },
];

export const AU_KM = 149_597_870.7;
export const EARTH_GRAVITY = 9.8;
export const EARTH_DIAMETER_KM = 12_756;

export const celestialBodies: CelestialBody[] = [
  {
    id: "sun",
    name: "Sun",
    classification: "Star",
    tagline: "The star at the centre of our Solar System.",
    diameterKm: 1_392_700,
    massKg: 1.989e30,
    rotationHours: 609.12,
    temperatureC: 5500,
    temperatureNote: "Visible surface (photosphere)",
    gravityMs2: 274,
    axialTiltDeg: 7.25,
    characteristics: [
      "Holds about 99.8% of all the mass in the Solar System.",
      "Makes energy by fusing hydrogen into helium in its core.",
      "Its gravity keeps every planet in orbit.",
    ],
    facts: [
      "Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.",
      "More than one million Earths could fit inside the Sun.",
      "The Sun spins faster at its equator than near its poles.",
    ],
    color: "#ffc533",
    colorDeep: "#ff8a00",
    displayRadius: 2.6,
    phase: 0,
  },
  {
    id: "mercury",
    name: "Mercury",
    classification: "Terrestrial planet",
    tagline: "The smallest planet and the closest to the Sun.",
    diameterKm: 4879,
    massKg: 3.30e23,
    distanceKm: 57.9e6,
    distanceAu: 0.387,
    rotationHours: 1407.6,
    orbitalDays: 88.0,
    temperatureC: 167,
    temperatureNote: "Mean surface temperature",
    gravityMs2: 3.7,
    axialTiltDeg: 0.03,
    moons: { count: 0, asOf: "NASA, 2025" },
    characteristics: [
      "A rocky world covered in craters.",
      "Almost no atmosphere, so temperatures swing from about 430°C by day to -180°C by night.",
      "One day-night cycle takes 176 Earth days.",
    ],
    facts: [
      "A year on Mercury is only 88 Earth days long.",
      "Despite being closest to the Sun, it is not the hottest planet. Venus is.",
    ],
    color: "#a8a39d",
    colorDeep: "#6f6b66",
    displayRadius: 0.34,
    phase: 0.6,
  },
  {
    id: "venus",
    name: "Venus",
    classification: "Terrestrial planet",
    tagline: "The hottest planet, wrapped in thick clouds.",
    diameterKm: 12104,
    massKg: 4.87e24,
    distanceKm: 108.2e6,
    distanceAu: 0.723,
    rotationHours: -5832.5,
    orbitalDays: 224.7,
    temperatureC: 464,
    temperatureNote: "Mean surface temperature",
    gravityMs2: 8.9,
    axialTiltDeg: 177.4,
    moons: { count: 0, asOf: "NASA, 2025" },
    characteristics: [
      "Its thick carbon dioxide atmosphere traps heat, so it is hotter than Mercury.",
      "Spins backwards (retrograde) compared with most planets.",
      "A day on Venus is longer than its year.",
    ],
    facts: [
      "Venus rotates once in about 243 Earth days but orbits the Sun in about 225.",
      "The surface pressure is about 90 times that of Earth.",
    ],
    color: "#e8c98a",
    colorDeep: "#b98a3e",
    displayRadius: 0.55,
    phase: 2.3,
  },
  {
    id: "earth",
    name: "Earth",
    classification: "Terrestrial planet",
    tagline: "Our home: the only world known to support life.",
    diameterKm: 12756,
    massKg: 5.97e24,
    distanceKm: 149.6e6,
    distanceAu: 1.0,
    rotationHours: 23.9,
    orbitalDays: 365.2,
    temperatureC: 15,
    temperatureNote: "Mean surface temperature",
    gravityMs2: 9.8,
    axialTiltDeg: 23.4,
    moons: { count: 1, asOf: "NASA, 2025", note: "The Moon" },
    characteristics: [
      "About 71% of the surface is covered by liquid water.",
      "Its tilt of 23.4° gives us the seasons.",
      "Protected by a magnetic field and an atmosphere rich in nitrogen and oxygen.",
    ],
    facts: [
      "Earth is the densest planet in the Solar System.",
      "It travels around the Sun at about 30 km every second.",
    ],
    color: "#3a86e8",
    colorDeep: "#16407f",
    displayRadius: 0.58,
    phase: 4.0,
  },
  {
    id: "mars",
    name: "Mars",
    classification: "Terrestrial planet",
    tagline: "The cold, dusty Red Planet.",
    diameterKm: 6792,
    massKg: 6.42e23,
    distanceKm: 228.0e6,
    distanceAu: 1.524,
    rotationHours: 24.6,
    orbitalDays: 687.0,
    temperatureC: -65,
    temperatureNote: "Mean surface temperature",
    gravityMs2: 3.7,
    axialTiltDeg: 25.2,
    moons: { count: 2, asOf: "NASA, 2025", note: "Phobos and Deimos" },
    characteristics: [
      "Iron oxide (rust) in the dust gives it a red colour.",
      "Home to Olympus Mons, the tallest volcano in the Solar System.",
      "A day is almost the same length as an Earth day.",
    ],
    facts: [
      "Mars has seasons like Earth because its axis is tilted by a similar amount.",
      "Robots from Earth are exploring it right now.",
    ],
    color: "#d9683f",
    colorDeep: "#8f3a1d",
    displayRadius: 0.4,
    phase: 5.2,
  },
  {
    id: "jupiter",
    name: "Jupiter",
    classification: "Gas giant",
    tagline: "The largest planet, with a storm older than modern science.",
    diameterKm: 142984,
    massKg: 1.898e27,
    distanceKm: 778.5e6,
    distanceAu: 5.203,
    rotationHours: 9.9,
    orbitalDays: 4331,
    temperatureC: -110,
    temperatureNote: "Temperature at the 1 bar cloud-top level (no solid surface)",
    gravityMs2: 23.1,
    axialTiltDeg: 3.1,
    moons: { count: 95, asOf: "NASA, 2025", note: "Counts rise as moons are confirmed" },
    characteristics: [
      "More than twice as massive as all the other planets combined.",
      "The Great Red Spot is a storm wider than Earth.",
      "The fastest-spinning planet: a day lasts under 10 hours.",
    ],
    facts: [
      "Jupiter's four largest moons were seen by Galileo in 1610.",
      "It has faint rings, but they are far thinner than Saturn's.",
    ],
    color: "#d9a066",
    colorDeep: "#9a5f34",
    displayRadius: 1.4,
    phase: 1.1,
  },
  {
    id: "saturn",
    name: "Saturn",
    classification: "Gas giant",
    tagline: "The ringed planet, light enough to float on water.",
    diameterKm: 120536,
    massKg: 5.68e26,
    distanceKm: 1432.0e6,
    distanceAu: 9.582,
    rotationHours: 10.7,
    orbitalDays: 10747,
    temperatureC: -140,
    temperatureNote: "Temperature at the 1 bar cloud-top level (no solid surface)",
    gravityMs2: 9.0,
    axialTiltDeg: 26.7,
    moons: { count: 274, asOf: "NASA, 2025", note: "Counts rise as moons are confirmed" },
    characteristics: [
      "Its bright rings are made mostly of water ice.",
      "The least dense planet: it is lighter than water.",
      "Titan, its largest moon, has a thick atmosphere and lakes of liquid methane.",
    ],
    facts: [
      "Saturn's rings are wide but extremely thin, often only about 10 metres thick.",
      "One year on Saturn is nearly 29.5 Earth years.",
    ],
    color: "#e3c78d",
    colorDeep: "#a88a4f",
    displayRadius: 1.15,
    phase: 3.4,
    hasRings: true,
  },
  {
    id: "uranus",
    name: "Uranus",
    classification: "Ice giant",
    tagline: "The planet that rolls on its side.",
    diameterKm: 51118,
    massKg: 8.68e25,
    distanceKm: 2867.0e6,
    distanceAu: 19.2,
    rotationHours: -17.2,
    orbitalDays: 30589,
    temperatureC: -195,
    temperatureNote: "Temperature at the 1 bar level (no solid surface)",
    gravityMs2: 8.7,
    axialTiltDeg: 97.8,
    moons: { count: 28, asOf: "NASA, 2025" },
    characteristics: [
      "Tilted by 97.8°, so it orbits almost on its side.",
      "Methane in its atmosphere gives it a pale blue-green colour.",
      "One of the coldest planetary atmospheres measured.",
    ],
    facts: [
      "Each pole gets about 42 years of sunlight, then 42 years of darkness.",
      "Uranus was the first planet discovered with a telescope (1781).",
    ],
    color: "#8fe0e3",
    colorDeep: "#4aa9b3",
    displayRadius: 0.85,
    phase: 0.2,
  },
  {
    id: "neptune",
    name: "Neptune",
    classification: "Ice giant",
    tagline: "The distant, windy blue world.",
    diameterKm: 49528,
    massKg: 1.02e26,
    distanceKm: 4515.0e6,
    distanceAu: 30.07,
    rotationHours: 16.1,
    orbitalDays: 59800,
    temperatureC: -200,
    temperatureNote: "Temperature at the 1 bar level (no solid surface)",
    gravityMs2: 11.0,
    axialTiltDeg: 28.3,
    moons: { count: 16, asOf: "NASA, 2025" },
    characteristics: [
      "Has the fastest winds in the Solar System, over 2,000 km/h.",
      "Found by calculation before it was seen through a telescope.",
      "So far from the Sun that sunlight is about 900 times dimmer than on Earth.",
    ],
    facts: [
      "Neptune has completed only one orbit since its discovery in 1846.",
      "Its largest moon, Triton, orbits backwards.",
    ],
    color: "#4a6fe0",
    colorDeep: "#243a9c",
    displayRadius: 0.82,
    phase: 5.8,
  },
];

export const planets = celestialBodies.filter((body) => body.id !== "sun");
export const sun = celestialBodies[0];

export function getBody(id: string | null | undefined): CelestialBody | null {
  return celestialBodies.find((body) => body.id === id) ?? null;
}

export const speedPresets: SpeedPreset[] = [
  { id: "slow", label: "1 week/s", daysPerSecond: 7 },
  { id: "month", label: "1 month/s", daysPerSecond: 30 },
  { id: "quarter", label: "3 months/s", daysPerSecond: 91 },
  { id: "year", label: "1 year/s", daysPerSecond: 365 },
  { id: "decade", label: "10 years/s", daysPerSecond: 3652 },
];

export const DEFAULT_SPEED = speedPresets[1];

// Later learning modules plug in here (see SolarSystemModule). Nothing in this
// list is shown in the interface until its status is "available".
export const learningModules: SolarSystemModule[] = [
  { id: "compare", title: "Compare planetary characteristics", status: "planned" },
  { id: "earth-moon", title: "Investigate Earth and the Moon", status: "planned" },
  { id: "gravity", title: "Understand planetary gravity", status: "planned" },
  { id: "investigations", title: "Guided investigations", status: "planned" },
  { id: "quiz", title: "Interactive quizzes", status: "planned" },
  { id: "cbt", title: "CBT assessment", status: "planned" },
];
