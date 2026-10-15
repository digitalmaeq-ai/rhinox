// Human Body Explorer: the body, described as data.
//
// Every part of the body (skin, a muscle, an organ, a bone) is a list of simple
// shapes. The 3D scene and the flat 2D fallback both draw from this one list,
// so a part looks and behaves the same in either view.
//
// Coordinates: y is up (feet at -1.8, top of the head at +1.8), the body faces
// +z, and +x is the person's LEFT (the right of the screen when you face them).
// Teaching model, drawn for clarity, not a medical atlas.

export type LayerId = "skin" | "muscle" | "organs" | "skeleton";

export type Vec3 = [number, number, number];

/** A single solid. `rot` turns it about the z axis (leans it left or right). */
export type Shape =
  /** Ellipsoid: a sphere stretched to the radii `r`. */
  | { t: "e"; p: Vec3; r: Vec3; rot?: number }
  /** Capsule standing along y. `len` is the full end-to-end length. */
  | { t: "c"; p: Vec3; rad: number; len: number; rot?: number }
  /** A rib: a flat ring open at the front. `rx`/`rz` are half-width and half-depth. */
  | { t: "ring"; p: Vec3; rx: number; rz: number; tube: number };

export interface BodyPart {
  id: string;
  name: string;
  layer: LayerId;
  /** Body system, e.g. "Muscular system". */
  system: string;
  /** What it does, in a sentence or two. */
  does: string;
  /** One surprising fact. */
  fact: string;
  color: string;
  shapes: Shape[];
  /** True when the part comes in a left/right pair (the shapes are mirrored in x). */
  pair?: boolean;
  /** Where the 3D label and camera focus go. Defaults to the first shape. */
  focus?: Vec3;
}

export interface LayerInfo {
  id: LayerId;
  label: string;
  blurb: string;
  /** Accent colour for the layer's tab. */
  color: string;
}

export const LAYERS: LayerInfo[] = [
  { id: "skin", label: "Skin", blurb: "Your largest organ. It keeps water in and germs out.", color: "#f2b48d" },
  { id: "muscle", label: "Muscles", blurb: "About 600 muscles pull on bones to move you.", color: "#e0524a" },
  { id: "organs", label: "Organs", blurb: "The working machinery inside your head and torso.", color: "#e9809a" },
  { id: "skeleton", label: "Skeleton", blurb: "206 bones hold you up and protect what is inside.", color: "#e9dfc6" },
];

// ---- Shape helpers: keep the data below short and readable ----
const e = (x: number, y: number, z: number, rx: number, ry: number, rz: number, rot = 0): Shape => ({ t: "e", p: [x, y, z], r: [rx, ry, rz], rot });
const c = (x: number, y: number, z: number, rad: number, len: number, rot = 0): Shape => ({ t: "c", p: [x, y, z], rad, len, rot });
const rib = (y: number, rx: number): Shape => ({ t: "ring", p: [0, y, -0.01], rx, rz: rx * 0.62, tube: 0.011 });

const MUSCLE = "#c8453c";
const BONE = "#efe6cf";

// A column of vertebrae down the back, curving gently like a real spine.
const vertebrae: Shape[] = Array.from({ length: 13 }, (_, i) => {
  const y = 1.2 - i * 0.085;
  const z = -0.085 - 0.03 * Math.sin((i / 12) * Math.PI);
  return e(0, y, z, 0.034 + i * 0.0015, 0.027, 0.036);
});

export const BODY_PARTS: BodyPart[] = [
  // ============================ SKIN ============================
  {
    id: "skin",
    name: "Skin",
    layer: "skin",
    system: "Integumentary system",
    does: "Covers and protects the whole body, keeps water in and germs out, senses touch, heat and pain, and helps control your temperature by sweating.",
    fact: "Skin is your largest organ. An adult's skin weighs around 4 kg and renews itself about every month.",
    color: "#f1bf9b",
    focus: [0, 0.6, 0.2],
    shapes: [
      e(0, 1.5, 0, 0.19, 0.23, 0.21), // head
      c(0, 1.22, 0, 0.085, 0.3), // neck
      e(0, 0.58, 0, 0.37, 0.58, 0.23), // chest and belly
      e(0, -0.05, 0, 0.34, 0.24, 0.22), // hips
      e(0.42, 1.02, 0, 0.1, 0.11, 0.1), e(-0.42, 1.02, 0, 0.1, 0.11, 0.1), // shoulders
      c(0.46, 0.72, 0, 0.075, 0.58, 0.15), c(-0.46, 0.72, 0, 0.075, 0.58, -0.15), // upper arms
      c(0.53, 0.215, 0, 0.062, 0.56, 0.12), c(-0.53, 0.215, 0, 0.062, 0.56, -0.12), // forearms
      e(0.57, -0.14, 0, 0.05, 0.1, 0.035), e(-0.57, -0.14, 0, 0.05, 0.1, 0.035), // hands
      c(0.185, -0.575, 0, 0.125, 0.82, 0.04), c(-0.185, -0.575, 0, 0.125, 0.82, -0.04), // thighs
      c(0.195, -1.3, 0, 0.085, 0.76, 0), c(-0.195, -1.3, 0, 0.085, 0.76, 0), // calves
      e(0.19, -1.74, 0.07, 0.075, 0.05, 0.16), e(-0.19, -1.74, 0.07, 0.075, 0.05, 0.16), // feet
    ],
  },

  // ============================ MUSCLES ============================
  {
    id: "deltoid", name: "Deltoid", layer: "muscle", system: "Muscular system", pair: true, color: "#cf4d44",
    does: "The rounded cap of the shoulder. It lifts your arm up and out to the side and swings it forwards and back.",
    fact: "Throwing a ball uses all three parts of the deltoid: front, side and back.",
    shapes: [e(0.43, 1.0, 0, 0.1, 0.12, 0.1)],
  },
  {
    id: "pectoralis", name: "Pectoralis major", layer: "muscle", system: "Muscular system", pair: true, color: MUSCLE,
    does: "The big chest muscle. It pulls your arm across your body and pushes it forwards, as in a push-up or a throw.",
    fact: "Its name means \"chest\" in Latin. You use it every time you hug someone.",
    shapes: [e(0.17, 0.88, 0.12, 0.19, 0.13, 0.07, -0.15)],
  },
  {
    id: "abs", name: "Rectus abdominis", layer: "muscle", system: "Muscular system", color: "#d25a4e",
    does: "The \"six-pack\". It bends your body forwards, holds your belly in and helps you breathe out hard when you cough or laugh.",
    fact: "Everyone has a six-pack. It is usually hidden under a layer of fat.",
    focus: [0, 0.52, 0.2],
    shapes: [0.68, 0.52, 0.36].flatMap((y) => [e(0.055, y, 0.15, 0.075, 0.07, 0.06), e(-0.055, y, 0.15, 0.075, 0.07, 0.06)]),
  },
  {
    id: "obliques", name: "External obliques", layer: "muscle", system: "Muscular system", pair: true, color: "#bf3f37",
    does: "The muscles along the sides of your waist. They twist and bend your trunk and keep your spine steady.",
    fact: "Their fibres run diagonally, like the fingers of a hand slipped into a pocket.",
    shapes: [e(0.27, 0.5, 0.1, 0.1, 0.26, 0.1, -0.1)],
  },
  {
    id: "biceps", name: "Biceps", layer: "muscle", system: "Muscular system", pair: true, color: "#d6574d",
    does: "Sits on the front of your upper arm. It bends your elbow and turns your forearm palm-up, as when you lift a bag.",
    fact: "\"Biceps\" means \"two heads\": it starts as two tendons at the shoulder.",
    shapes: [e(0.47, 0.78, 0.04, 0.065, 0.2, 0.065, 0.15)],
  },
  {
    id: "triceps", name: "Triceps", layer: "muscle", system: "Muscular system", pair: true, color: "#b83a33",
    does: "Sits on the back of your upper arm. It straightens your elbow, so it works against the biceps.",
    fact: "Muscles only pull, never push. The triceps and biceps are a pair that pull in opposite directions.",
    shapes: [e(0.47, 0.76, -0.045, 0.062, 0.2, 0.058, 0.15)],
  },
  {
    id: "forearm", name: "Forearm flexors", layer: "muscle", system: "Muscular system", pair: true, color: "#cb4a40",
    does: "Muscles that curl your wrist and fingers so you can grip, write and type.",
    fact: "Your fingers have no big muscles of their own. Long tendons run down from these forearm muscles.",
    shapes: [c(0.53, 0.215, 0, 0.05, 0.46, 0.12)],
  },
  {
    id: "quadriceps", name: "Quadriceps", layer: "muscle", system: "Muscular system", pair: true, color: "#d0504a",
    does: "Four muscles on the front of the thigh. They straighten your knee for walking, running, jumping and standing up.",
    fact: "The quadriceps is the largest muscle group in the body.",
    shapes: [e(0.185, -0.55, 0.06, 0.1, 0.33, 0.08, 0.04)],
  },
  {
    id: "hamstrings", name: "Hamstrings", layer: "muscle", system: "Muscular system", pair: true, color: "#b93c36",
    does: "Three muscles on the back of the thigh. They bend your knee and help pull your leg back when you run.",
    fact: "The name comes from butchers, who hung hams by these tendons.",
    shapes: [e(0.185, -0.55, -0.06, 0.095, 0.32, 0.075, 0.04)],
  },
  {
    id: "calf", name: "Gastrocnemius (calf)", layer: "muscle", system: "Muscular system", pair: true, color: "#cb473f",
    does: "The calf muscle. It lifts your heel so you can stand on tiptoe, walk, run and jump.",
    fact: "It joins the heel by the Achilles tendon, the thickest tendon in the body.",
    shapes: [e(0.195, -1.2, -0.04, 0.07, 0.2, 0.07)],
  },
  {
    id: "trapezius", name: "Trapezius", layer: "muscle", system: "Muscular system", pair: true, color: "#c04139",
    does: "A kite-shaped muscle across the upper back and neck. It lifts your shoulders and moves your head and shoulder blades.",
    fact: "Stress often tightens it, which is why shoulders feel stiff when you are tense.",
    focus: [0.1, 0.95, -0.2],
    shapes: [e(0.13, 0.95, -0.11, 0.2, 0.24, 0.05)],
  },
  {
    id: "latissimus", name: "Latissimus dorsi", layer: "muscle", system: "Muscular system", pair: true, color: "#c94a41",
    does: "The widest muscle of the back. It pulls your arm down and back, as when you swim or climb.",
    fact: "\"Latissimus dorsi\" simply means \"the widest muscle of the back\".",
    focus: [0.2, 0.55, -0.2],
    shapes: [e(0.22, 0.55, -0.12, 0.14, 0.3, 0.06, -0.2)],
  },
  {
    id: "gluteus", name: "Gluteus maximus", layer: "muscle", system: "Muscular system", pair: true, color: "#d2564b",
    does: "The muscle of the buttock. It straightens your hip and powers climbing stairs, running and rising from a chair.",
    fact: "It is the largest single muscle in the human body.",
    focus: [0.13, -0.1, -0.2],
    shapes: [e(0.13, -0.1, -0.12, 0.14, 0.14, 0.09)],
  },
  {
    id: "scm", name: "Sternocleidomastoid", layer: "muscle", system: "Muscular system", pair: true, color: "#cc5046",
    does: "A strap-like muscle on each side of the neck. It turns and tilts your head.",
    fact: "It has one of the longest names in anatomy, but just two jobs: turn and nod.",
    shapes: [c(0.07, 1.22, 0.03, 0.026, 0.22, -0.35)],
  },

  // ============================ ORGANS ============================
  {
    id: "brain", name: "Brain", layer: "organs", system: "Nervous system", color: "#f0a1b6",
    does: "The control centre. It receives signals from your senses, stores memories, makes decisions and sends orders to every muscle.",
    fact: "Your brain is about 2% of your body weight but uses about 20% of your energy.",
    shapes: [e(0, 1.53, -0.01, 0.15, 0.13, 0.16)],
  },
  {
    id: "trachea", name: "Windpipe (trachea)", layer: "organs", system: "Respiratory system", color: "#9ad4ea",
    does: "The tube that carries air from your throat down to the lungs. Rings of cartilage keep it open.",
    fact: "Tiny hairs lining it sweep dust and germs upward so you can cough them out.",
    shapes: [c(0, 1.03, 0.02, 0.02, 0.5)],
  },
  {
    id: "lungs", name: "Lungs", layer: "organs", system: "Respiratory system", pair: true, color: "#e98d99",
    does: "Take oxygen from the air into the blood and pass carbon dioxide out. You breathe in and out about 20,000 times a day.",
    fact: "Spread flat, the tiny air sacs inside your lungs would cover about half a tennis court.",
    shapes: [e(0.2, 0.84, -0.03, 0.105, 0.26, 0.1)],
  },
  {
    id: "heart", name: "Heart", layer: "organs", system: "Circulatory system", color: "#d1243b",
    does: "A muscular pump about the size of your fist. It pushes blood round the body through blood vessels, carrying oxygen and food to every cell.",
    fact: "It beats about 100,000 times a day and never takes a rest.",
    shapes: [e(0.04, 0.77, 0.09, 0.075, 0.095, 0.065, 0.5)],
  },
  {
    id: "liver", name: "Liver", layer: "organs", system: "Digestive system", color: "#8f3b2d",
    does: "Cleans the blood, makes bile to help digest fat, and stores energy. It is the body's chemical factory.",
    fact: "The liver can regrow: a healthy one can rebuild itself after part of it is removed.",
    shapes: [e(-0.12, 0.52, 0.06, 0.17, 0.1, 0.1, 0.1)],
  },
  {
    id: "stomach", name: "Stomach", layer: "organs", system: "Digestive system", color: "#e58a6c",
    does: "A stretchy bag that churns food with acid and enzymes into a soupy mix, ready for the small intestine.",
    fact: "The stomach lining makes a new layer of mucus every couple of weeks so the acid does not digest the stomach itself.",
    shapes: [e(0.11, 0.5, 0.06, 0.09, 0.12, 0.07, -0.6)],
  },
  {
    id: "spleen", name: "Spleen", layer: "organs", system: "Immune system", color: "#7c3158",
    does: "Filters old blood cells out of the blood and helps fight germs.",
    fact: "You can live without a spleen, because other organs take over most of its jobs.",
    shapes: [e(0.25, 0.52, -0.04, 0.04, 0.08, 0.04)],
  },
  {
    id: "pancreas", name: "Pancreas", layer: "organs", system: "Digestive system", color: "#e7b56b",
    does: "Makes juices that digest food and the hormone insulin, which controls the sugar in your blood.",
    fact: "It does two jobs at once: digestion, and blood-sugar control.",
    shapes: [e(0, 0.4, 0, 0.12, 0.03, 0.04, 0.1)],
  },
  {
    id: "kidneys", name: "Kidneys", layer: "organs", system: "Urinary system", pair: true, color: "#8f3a4b",
    does: "Filter the blood, remove waste and extra water as urine, and keep the body's salts balanced.",
    fact: "Together your kidneys filter about 180 litres of blood every day.",
    shapes: [e(0.12, 0.42, -0.1, 0.04, 0.07, 0.035)],
  },
  {
    id: "smallint", name: "Small intestine", layer: "organs", system: "Digestive system", color: "#eba07f",
    does: "A long coiled tube where food is broken down and nutrients pass into the blood.",
    fact: "Stretched out it is about 6 metres long, longer than a family car.",
    focus: [0, 0.14, 0.12],
    shapes: [
      [-0.1, 0.2], [0, 0.2], [0.1, 0.2], [-0.08, 0.1], [0.04, 0.1], [0.12, 0.12], [-0.04, 0.02], [0.06, 0.01],
    ].map(([x, y]) => e(x, y, 0.05, 0.055, 0.05, 0.05)),
  },
  {
    id: "largeint", name: "Large intestine", layer: "organs", system: "Digestive system", color: "#d98b6b",
    does: "Soaks up water from what is left of your food and packs the rest as waste to leave the body.",
    fact: "It is wider but shorter than the small intestine, only about 1.5 metres long.",
    focus: [0, 0.3, 0.12],
    shapes: [c(-0.19, 0.17, 0.05, 0.04, 0.3), c(0, 0.32, 0.05, 0.04, 0.4, Math.PI / 2), c(0.19, 0.17, 0.05, 0.04, 0.3)],
  },
  {
    id: "bladder", name: "Bladder", layer: "organs", system: "Urinary system", color: "#e6b34d",
    does: "A stretchy bag that stores urine until you are ready to go to the toilet.",
    fact: "It can hold roughly half a litre before you feel you must go.",
    shapes: [e(0, -0.06, 0.05, 0.06, 0.06, 0.055)],
  },

  // ============================ SKELETON ============================
  {
    id: "skull", name: "Skull", layer: "skeleton", system: "Skeletal system", color: BONE,
    does: "Protects the brain and gives your face its shape. It is made of 22 bones joined together.",
    fact: "Babies are born with gaps between skull bones so the head can squeeze through birth.",
    shapes: [e(0, 1.52, 0, 0.17, 0.2, 0.19)],
  },
  {
    id: "mandible", name: "Jaw (mandible)", layer: "skeleton", system: "Skeletal system", color: BONE,
    does: "The only skull bone that moves. It lets you chew, talk and smile.",
    fact: "It is the strongest and hardest bone of the face.",
    shapes: [e(0, 1.37, 0.06, 0.1, 0.05, 0.1)],
  },
  {
    id: "spine", name: "Spine (vertebral column)", layer: "skeleton", system: "Skeletal system", color: "#e6dcc0",
    does: "A column of 33 small bones called vertebrae. It holds you upright, lets you bend and twist, and protects the spinal cord.",
    fact: "A giraffe and a human both have seven neck vertebrae.",
    focus: [0, 0.65, -0.12],
    shapes: [...vertebrae, e(0, -0.02, -0.11, 0.06, 0.08, 0.04)],
  },
  {
    id: "ribcage", name: "Ribcage", layer: "skeleton", system: "Skeletal system", color: BONE,
    does: "Twelve pairs of ribs and the breastbone form a cage that protects the heart and lungs and moves as you breathe.",
    fact: "The ribs swing up and out when you breathe in, making room for the lungs to fill.",
    focus: [0, 0.78, 0.15],
    shapes: [rib(0.98, 0.23), rib(0.9, 0.27), rib(0.82, 0.31), rib(0.74, 0.33), rib(0.66, 0.33), rib(0.58, 0.31), c(0, 0.82, 0.17, 0.022, 0.34)],
  },
  {
    id: "clavicle", name: "Collarbone (clavicle)", layer: "skeleton", system: "Skeletal system", pair: true, color: BONE,
    does: "A thin bone that links your breastbone to your shoulder and holds the arm out from the body.",
    fact: "It is the most commonly broken bone in the body.",
    shapes: [c(0.185, 1.05, 0.06, 0.018, 0.32, Math.PI / 2 - 0.05)],
  },
  {
    id: "humerus", name: "Humerus", layer: "skeleton", system: "Skeletal system", pair: true, color: BONE,
    does: "The upper-arm bone. It joins the shoulder to the elbow.",
    fact: "Its nerve at the elbow gives the \"funny bone\" tingle when you knock it.",
    shapes: [c(0.46, 0.72, 0, 0.032, 0.52, 0.15)],
  },
  {
    id: "forearmbones", name: "Radius and ulna", layer: "skeleton", system: "Skeletal system", pair: true, color: BONE,
    does: "The two bones of the forearm. They cross over each other to turn your hand palm up or palm down.",
    fact: "Twisting these two bones is how you turn a door handle or a screwdriver.",
    shapes: [c(0.515, 0.215, 0.015, 0.026, 0.46, 0.12), c(0.55, 0.215, -0.015, 0.024, 0.46, 0.12)],
  },
  {
    id: "handbones", name: "Hand bones", layer: "skeleton", system: "Skeletal system", pair: true, color: BONE,
    does: "27 small bones in each hand give you a grip strong enough to climb and fine enough to thread a needle.",
    fact: "Each hand holds about a quarter of all the bones in your body.",
    shapes: [e(0.57, -0.12, 0, 0.04, 0.09, 0.016)],
  },
  {
    id: "pelvis", name: "Pelvis", layer: "skeleton", system: "Skeletal system", color: BONE,
    does: "A bowl of bone that carries the weight of your upper body, joins the spine to the legs and protects the organs below.",
    fact: "The hip sockets are in the pelvis, so every step you take passes through it.",
    focus: [0, -0.04, 0.05],
    shapes: [e(0.18, -0.02, -0.02, 0.14, 0.12, 0.06, 0.5), e(-0.18, -0.02, -0.02, 0.14, 0.12, 0.06, -0.5), e(0, -0.17, 0.08, 0.08, 0.03, 0.03)],
  },
  {
    id: "femur", name: "Femur (thigh bone)", layer: "skeleton", system: "Skeletal system", pair: true, color: BONE,
    does: "The longest, strongest bone in the body. It carries your weight when you stand, walk and run.",
    fact: "The femur is about a quarter of your height and strong enough to hold several times your body weight.",
    shapes: [c(0.185, -0.575, 0, 0.035, 0.78, 0.04), e(0.12, -0.2, 0, 0.05, 0.05, 0.05)],
  },
  {
    id: "patella", name: "Kneecap (patella)", layer: "skeleton", system: "Skeletal system", pair: true, color: BONE,
    does: "A small shield-shaped bone that protects the knee joint and helps the thigh muscles pull.",
    fact: "Babies are born without kneecaps: they are soft cartilage that turns to bone by about age 6.",
    shapes: [e(0.2, -0.96, 0.07, 0.04, 0.045, 0.02)],
  },
  {
    id: "tibia", name: "Shin bones (tibia and fibula)", layer: "skeleton", system: "Skeletal system", pair: true, color: BONE,
    does: "The two bones of the lower leg. The thick tibia carries your weight, and the thin fibula steadies the ankle.",
    fact: "You can feel your tibia along the front of your shin, just under the skin.",
    shapes: [c(0.195, -1.3, 0.01, 0.03, 0.68), c(0.23, -1.3, -0.015, 0.018, 0.66)],
  },
  {
    id: "footbones", name: "Foot bones", layer: "skeleton", system: "Skeletal system", pair: true, color: BONE,
    does: "26 bones in each foot form arches that act like springs and carry your whole weight.",
    fact: "Your feet hold about a quarter of all the bones in the body.",
    shapes: [e(0.19, -1.74, 0.07, 0.06, 0.035, 0.14)],
  },
];

export const PART_BY_ID: Record<string, BodyPart> = Object.fromEntries(BODY_PARTS.map((part) => [part.id, part]));

export function partsInLayer(layer: LayerId): BodyPart[] {
  return BODY_PARTS.filter((part) => part.layer === layer);
}

/** Mirror a shape across the body's middle (x -> -x), for left/right pairs. */
export function mirrorShape(shape: Shape): Shape {
  if (shape.t === "ring") return shape;
  const p: Vec3 = [-shape.p[0], shape.p[1], shape.p[2]];
  return { ...shape, p, rot: -(shape.rot ?? 0) };
}

/** All the shapes of a part, including the mirrored side of a pair. */
export function shapesOf(part: BodyPart): Shape[] {
  return part.pair ? [...part.shapes, ...part.shapes.map(mirrorShape)] : part.shapes;
}

/** The point the camera focuses on and the 3D label hangs from. */
export function focusOf(part: BodyPart): Vec3 {
  const [x, y, z] = part.focus ?? part.shapes[0].p;
  // Paired parts focus on the middle of the body so both sides stay in view.
  return part.pair ? [0, y, z] : [x, y, z];
}
