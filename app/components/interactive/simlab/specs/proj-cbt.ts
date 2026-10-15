// CBT practice for the projectile motion lab: an original bank following the
// Nigerian secondary Physics topics, plus fresh calculations in every exam.
// Written for Rhinox; not copied from past papers.

import { calcQuestion, makeBank, seed } from "../shell/cbt";
import { CALC_KINDS, generateCalc } from "./proj-practice";

export const TOPICS = [
  { id: "basics", label: "Path and components" },
  { id: "angle", label: "Angle, speed and range" },
  { id: "equations", label: "Equations" },
  { id: "practical", label: "Practical technique" },
  { id: "calculations", label: "Calculations" },
];

const Q = seed;

const SEEDS = [
  // Path and components
  Q("b1", "basics", "easy", "What is the shape of the path of a projectile (ignoring air resistance)?", "A parabola", ["A straight line", "A circle", "A zigzag"], "Constant sideways speed together with constant downward acceleration gives a parabola."),
  Q("b2", "basics", "easy", "Which force acts on a projectile after it leaves the launcher (ignoring air)?", "Gravity only", ["The force of the launch", "Gravity and a forward force", "No force"], "Once launched, only gravity acts on it."),
  Q("b3", "basics", "easy", "What happens to the horizontal speed of a projectile during flight (no air resistance)?", "It stays constant", ["It increases steadily", "It decreases steadily", "It becomes zero at the top"], "No horizontal force acts, so there is no horizontal acceleration."),
  Q("b4", "basics", "medium", "At the highest point of its path a projectile launched at an angle has", "zero vertical speed but still moves sideways", ["zero speed", "its greatest speed", "zero acceleration"], "The vertical velocity is zero at the top, but the horizontal velocity remains."),
  Q("b5", "basics", "medium", "The acceleration of a projectile at the top of its path is", "9.8 m/s² downward", ["zero", "9.8 m/s² upward", "9.8 m/s² forward"], "Gravity acts all the time, including at the top."),
  Q("b6", "basics", "medium", "Two balls are released at the same time from the same height: one dropped, one thrown horizontally. They hit the ground", "at the same time", ["the dropped ball first", "the thrown ball first", "never"], "Horizontal motion does not affect the vertical fall."),
  Q("b7", "basics", "hard", "The horizontal and vertical motions of a projectile are", "independent of each other", ["always equal", "both affected by gravity", "both constant"], "Gravity changes the vertical motion only."),
  Q("b8", "basics", "medium", "The launch speed u at angle θ has a vertical component of", "u sin θ", ["u cos θ", "u tan θ", "u ÷ sin θ"], "The vertical component is u sin θ and the horizontal component is u cos θ."),
  Q("b9", "basics", "medium", "A ball is launched at 20 m/s at 30° above the horizontal. Its horizontal speed is about", "17.3 m/s", ["10 m/s", "20 m/s", "34.6 m/s"], "20 × cos 30° ≈ 17.3 m/s."),

  // Angle, speed and range
  Q("a1", "angle", "easy", "On level ground and ignoring air, the greatest range is obtained at", "45°", ["30°", "60°", "90°"], "sin 2θ is largest when 2θ = 90°."),
  Q("a2", "angle", "easy", "A launch at 90° (straight up) gives", "no range", ["the greatest range", "half the greatest range", "the greatest height and range"], "All the speed is vertical, so the ball lands back where it started."),
  Q("a3", "angle", "medium", "Launch angles of 30° and 60° at the same speed give", "the same range", ["a longer range at 30°", "a longer range at 60°", "no range at 60°"], "Angles that add up to 90° have equal range."),
  Q("a4", "angle", "medium", "Which launch angle gives the greatest maximum height at a given speed?", "90°", ["45°", "30°", "0°"], "All the speed goes into the vertical direction."),
  Q("a5", "angle", "medium", "The launch speed is doubled at the same angle. The range", "becomes four times as large", ["doubles", "stays the same", "halves"], "Range is proportional to u²."),
  Q("a6", "angle", "medium", "On the Moon, where g is smaller, the same launch gives", "a longer range and a longer flight", ["a shorter range", "the same range", "no flight"], "A smaller g means slower deceleration upward, so more time and more distance."),
  Q("a7", "angle", "hard", "Launched from a cliff, the best angle for the greatest range is", "a little less than 45°", ["exactly 45°", "more than 45°", "0°"], "Starting from a height changes the optimum to below 45°."),
  Q("a8", "angle", "hard", "Two projectiles have the same range from level ground. One is launched at 25°. The other was launched at", "65°", ["35°", "45°", "75°"], "The angles add up to 90°."),
  Q("a9", "angle", "easy", "A ball is launched higher above the ground (same speed and angle). The range", "increases", ["decreases", "stays the same", "is zero"], "It stays in the air longer."),

  // Equations
  Q("e1", "equations", "medium", "The time of flight for a launch from level ground is", "T = 2u sin θ ÷ g", ["T = u cos θ ÷ g", "T = u ÷ g", "T = 2u cos θ ÷ g"], "The ball rises for u sin θ ÷ g and takes the same time to come down."),
  Q("e2", "equations", "medium", "The greatest height of a projectile is", "H = (u sin θ)² ÷ 2g", ["H = u² ÷ g", "H = u sin θ ÷ g", "H = (u cos θ)² ÷ 2g"], "From v² = u_y² − 2gH with v = 0."),
  Q("e3", "equations", "medium", "The range on level ground is", "R = u² sin 2θ ÷ g", ["R = u sin θ ÷ g", "R = u² ÷ g", "R = u² cos θ ÷ g"], "Range = horizontal speed × time of flight."),
  Q("e4", "equations", "hard", "A ball is thrown horizontally from a cliff of height h. The time to reach the ground is", "√(2h ÷ g)", ["h ÷ g", "2h ÷ g", "√(h ÷ g)"], "The vertical motion starts from rest: h = ½gt²."),
  Q("e5", "equations", "hard", "A ball is thrown horizontally at 10 m/s from a cliff 20 m high (g = 10 m/s²). How far from the cliff does it land?", "20 m", ["10 m", "40 m", "200 m"], "t = √(2×20÷10) = 2 s, and distance = 10 × 2 = 20 m."),
  Q("e6", "equations", "medium", "Which quantity is the same at launch and landing on level ground?", "The speed", ["The velocity", "The vertical velocity", "The kinetic energy is zero"], "Without air resistance the speed is the same at the same height (the direction differs)."),
  Q("e7", "equations", "hard", "For a launch from level ground, the time to reach the top is", "half the time of flight", ["equal to the time of flight", "a quarter of the time of flight", "double the time of flight"], "The path is symmetrical."),

  // Practical technique
  Q("x1", "practical", "easy", "How can the range of a ball be measured in a field?", "With a long tape measure from the launch point to the landing point", ["With a thermometer", "With a balance", "By counting"], "Range is a horizontal distance."),
  Q("x2", "practical", "medium", "To find how the angle affects the range, a student should keep ... the same.", "the launch speed and the height", ["the angle", "the range", "nothing"], "Only the angle should change in a fair test."),
  Q("x3", "practical", "medium", "A stopwatch is used to time the flight. Why is the measured time less accurate than a tape measurement?", "Human reaction time is a large part of a short time", ["The stopwatch is always wrong", "Time cannot be measured", "Tape measures are exact"], "Reaction time of about 0.2 s matters when the flight lasts only a second or two."),
  Q("x4", "practical", "medium", "Repeating each launch and taking an average helps to", "reduce the effect of random errors", ["remove all errors", "increase the range", "change the angle"], "Averages smooth out random differences."),
  Q("x5", "practical", "hard", "A graph of range against angle (same speed) rises to a maximum near 45° and falls. This shows", "45° gives the greatest range on level ground", ["range is proportional to angle", "range does not depend on angle", "the speed changes with angle"], "It confirms that sin 2θ has its peak at 45°."),
  Q("x6", "practical", "hard", "In the lab, real range is shorter than the calculated one. A likely cause is", "air resistance", ["gravity being zero", "the ball getting heavier", "the angle being negative"], "Air drag slows the ball down, and the calculation ignores it."),
  Q("x7", "practical", "medium", "Which launch angles would you test to find the best angle?", "A range of angles such as 15°, 30°, 45°, 60° and 75°", ["Only 45°", "Only 10°", "Only 90°"], "A spread of angles on both sides shows where the maximum is."),
];

export const projBank = makeBank({
  id: "projectile-motion",
  intro: "Randomised multiple-choice questions on projectile motion, with fresh numbers in the calculations. You get a score and an explanation for every question at the end.",
  note: "Original Rhinox practice questions following the Nigerian secondary Physics topics. They are not taken from past papers.",
  topics: TOPICS,
  seeds: SEEDS,
  generated: {
    topic: "calculations",
    make: (rnd) => CALC_KINDS.map((k) => calcQuestion(generateCalc(Math.floor(rnd() * 1e9), k.id), rnd, "calculations")),
  },
});
