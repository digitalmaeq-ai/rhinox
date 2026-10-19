// Human Body Explorer: realistic 3D shapes for the organs, skull, muscles and bones.
//
// body-data.ts describes every part as a few simple shapes (used by the flat 2D
// view and for camera focus). Here those same parts are rebuilt as detailed,
// colour-painted meshes for the 3D view: pebbled lungs, a heart with its blood
// vessels, a folded brain, coiled intestines, striped muscle fibres, knobbed
// bones. Everything is generated from maths, so there are no model files to
// download. A part with no builder here keeps drawing from its simple shapes.

import * as THREE from "three";
import { mergeGeometries, mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

import { shapesOf, type BodyPart, type Shape, type Vec3 } from "./body-data";

const { sin, cos, exp, abs, pow, PI } = Math;
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const BONE = new THREE.Color("#efe6cf");
const BONE_DARK = new THREE.Color("#cfc2a2");
const TENDON = new THREE.Color("#ecdfc8");

interface Vert {
  pos: THREE.Vector3;
  color: THREE.Color;
}

/** Drop UVs, weld the seam vertices and rebuild smooth normals. */
function finish(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
  geometry.deleteAttribute("uv");
  geometry.deleteAttribute("normal");
  const merged = mergeVertices(geometry, 1e-6);
  merged.computeVertexNormals();
  return merged;
}

/** Move a unit-space geometry to its place in the body: scale, lean about z, then move. */
function place(geometry: THREE.BufferGeometry, p: Vec3, r: Vec3, rot = 0) {
  const pos = geometry.attributes.position;
  const cs = cos(rot);
  const sn = sin(rot);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) * r[0];
    const y = pos.getY(i) * r[1];
    const z = pos.getZ(i) * r[2];
    pos.setXYZ(i, p[0] + x * cs - y * sn, p[1] + x * sn + y * cs, p[2] + z);
  }
}

/**
 * A sphere reshaped by `fn`. `fn` gets the unit direction and may move the point
 * (out.pos) and paint it (out.color); the result is then scaled to `r` and placed at `p`.
 */
function blob(
  p: Vec3,
  r: Vec3,
  rot: number,
  fn: (d: THREE.Vector3, out: Vert) => void,
  seg: [number, number] = [72, 48],
): THREE.BufferGeometry {
  const geometry = new THREE.SphereGeometry(1, seg[0], seg[1]);
  const pos = geometry.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const d = new THREE.Vector3();
  const out: Vert = { pos: new THREE.Vector3(), color: new THREE.Color() };
  for (let i = 0; i < pos.count; i++) {
    d.fromBufferAttribute(pos, i);
    out.pos.copy(d);
    out.color.set(0xffffff);
    fn(d, out);
    pos.setXYZ(i, out.pos.x, out.pos.y, out.pos.z);
    colors[i * 3] = out.color.r;
    colors[i * 3 + 1] = out.color.g;
    colors[i * 3 + 2] = out.color.b;
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  place(geometry, p, r, rot);
  return finish(geometry);
}

/** Shrinks to zero at both ends so a tube closes into rounded tips. */
const cap = (t: number, e = 0.04) => {
  const u = Math.min(t, 1 - t) / e;
  return u >= 1 ? 1 : Math.sqrt(Math.max(0, 1 - (1 - u) * (1 - u)));
};

/** A tube along a smooth curve through `points`, with its own radius and colour along the way. */
function tube(
  points: Vec3[],
  radius: (t: number, a: number) => number,
  color: (t: number, a: number) => THREE.Color | string,
  opts: { segs?: number; radial?: number; xf?: (g: THREE.BufferGeometry) => void } = {},
): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3(points.map((q) => new THREE.Vector3(...q)), false, "centripetal");
  const N = opts.segs ?? 120;
  const M = opts.radial ?? 14;
  const frames = curve.computeFrenetFrames(N, false);
  const positions = new Float32Array((N + 1) * M * 3);
  const colors = new Float32Array((N + 1) * M * 3);
  const indices: number[] = [];
  const centre = new THREE.Vector3();
  const tint = new THREE.Color();
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    curve.getPointAt(t, centre);
    const nrm = frames.normals[i];
    const bin = frames.binormals[i];
    for (let j = 0; j < M; j++) {
      const a = (j / M) * PI * 2;
      const rr = radius(t, a);
      const k = (i * M + j) * 3;
      positions[k] = centre.x + (nrm.x * cos(a) + bin.x * sin(a)) * rr;
      positions[k + 1] = centre.y + (nrm.y * cos(a) + bin.y * sin(a)) * rr;
      positions[k + 2] = centre.z + (nrm.z * cos(a) + bin.z * sin(a)) * rr;
      tint.set(color(t, a));
      colors[k] = tint.r;
      colors[k + 1] = tint.g;
      colors[k + 2] = tint.b;
    }
  }
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < M; j++) {
      const a = i * M + j;
      const d = i * M + ((j + 1) % M);
      const b = (i + 1) * M + j;
      const c = (i + 1) * M + ((j + 1) % M);
      indices.push(a, d, b, b, d, c);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  opts.xf?.(geometry);
  const welded = mergeVertices(geometry, 1e-6);
  welded.computeVertexNormals();
  return welded;
}

/** The mirror image of a geometry across the body's middle (x -> -x). */
function mirror(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
  const copy = geometry.clone();
  const pos = copy.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setX(i, -pos.getX(i));
  const nrm = copy.attributes.normal;
  for (let i = 0; i < nrm.count; i++) nrm.setX(i, -nrm.getX(i));
  const index = copy.index;
  if (index) {
    for (let i = 0; i < index.count; i += 3) {
      const b = index.getX(i + 1);
      index.setX(i + 1, index.getX(i + 2));
      index.setX(i + 2, b);
    }
  }
  return copy;
}

const mix = (a: THREE.Color, b: THREE.Color, t: number) => a.clone().lerp(b, Math.min(1, Math.max(0, t)));
const hex = (value: string) => new THREE.Color(value);
const first = (part: BodyPart): Extract<Shape, { t: "e" }> => part.shapes[0] as Extract<Shape, { t: "e" }>;

/** A small box, painted and ready to merge (a tooth). */
function tooth(x: number, y: number, z: number, angle: number, w: number, h: number, d: number, color: THREE.Color) {
  const box = new THREE.BoxGeometry(w, h, d, 2, 2, 2);
  const pos = box.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  for (let i = 0; i < pos.count; i++) {
    // Round the corners a little by pulling vertices toward the centre.
    const lx = pos.getX(i);
    const ly = pos.getY(i);
    const lz = pos.getZ(i);
    const k = 1 - 0.18 * (abs(lx / (w / 2)) * abs(ly / (h / 2)) * abs(lz / (d / 2)));
    const px = lx * k;
    const pz = lz * k;
    pos.setXYZ(i, x + px * c + pz * s, y + ly * k, z - px * s + pz * c);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  box.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return finish(box);
}

// ---------------------------------------------------------------- organs

function lungs(part: BodyPart): THREE.BufferGeometry[] {
  const s = first(part);
  const pink = hex("#ec96a2");
  const grey = hex("#c98391");
  const lung = blob(
    s.p,
    s.r,
    s.rot ?? 0,
    (d, out) => {
      const { y } = d;
      let { x, z } = d;
      const wide = 0.5 - 0.5 * y; // 0 at the top (apex), 1 at the base
      x *= 0.66 + 0.4 * wide;
      z *= 0.78 + 0.26 * wide;
      if (x < 0) x *= 1 - 0.42 * exp(-pow(y - 0.05, 2) / 0.3); // flatter side facing the heart
      const bump = 0.026 * sin(27 * d.x + 1) * sin(29 * d.y + 2) * sin(26 * d.z + 0.5) + 0.016 * sin(13 * d.x + 4 * d.y) * sin(11 * d.z - 2 * d.y);
      const fissure = exp(-pow(d.y * 0.55 + d.z * 0.8 - 0.12, 2) / 0.012);
      const scale = 1 + bump - 0.09 * fissure;
      out.pos.set(x * scale, y * scale, z * scale);
      out.color.copy(mix(pink, grey, 0.45 * (0.5 - 0.5 * sin(9 * d.x + 6 * d.y + 3 * d.z)) + 0.55 * fissure + 0.5 * (bump * 10)));
    },
    [96, 64],
  );
  return [lung, mirror(lung)];
}

function brain(part: BodyPart): THREE.BufferGeometry[] {
  const s = first(part);
  const light = hex("#f4b3c4");
  const dark = hex("#c7758f");
  const cortex = blob(
    s.p,
    s.r,
    0,
    (d, out) => {
      const { x, y, z } = d;
      const f1 = sin(10 * x + 3 * sin(6 * y + 4 * z));
      const f2 = sin(9 * y + 3 * sin(7 * z + 5 * x));
      const f3 = sin(9 * z + 3 * sin(5 * x + 6 * y));
      const fold = (abs(f1 * f2) + abs(f2 * f3) + abs(f1 * f3)) / 3;
      const crest = smooth(0.04, 0.4, fold);
      let scale = 1 + 0.07 * (crest - 0.5);
      scale -= 0.13 * exp(-(x * x) / 0.004) * smooth(-0.35, 0.2, y); // fissure between the two halves
      const flat = y < -0.55 ? smooth(-0.55, -0.9, y) * 0.18 : 0; // underside is flatter
      out.pos.set(x * scale, y * scale * (1 - flat), z * scale);
      out.color.copy(mix(dark, light, crest));
    },
    [120, 80],
  );
  const cerebellum = blob([0, s.p[1] - s.r[1] * 0.6, s.p[2] - s.r[2] * 0.62], [s.r[0] * 0.55, s.r[1] * 0.36, s.r[2] * 0.4], 0, (d, out) => {
    const ridge = sin(36 * d.y + 2 * d.x);
    out.pos.copy(d).multiplyScalar(1 + 0.045 * ridge);
    out.color.copy(mix(hex("#d9809a"), hex("#ee9fb6"), 0.5 + 0.5 * ridge));
  });
  const stem = tube(
    [
      [0, s.p[1] - s.r[1] * 0.5, s.p[2] - s.r[2] * 0.2],
      [0, s.p[1] - s.r[1] * 0.85, s.p[2] - s.r[2] * 0.22],
      [0, s.p[1] - s.r[1] * 1.45, s.p[2] - s.r[2] * 0.2],
    ],
    (t) => 0.016 * (1 - 0.35 * t) * cap(t, 0.08),
    () => "#f1c6b0",
    { segs: 20, radial: 10 },
  );
  return [cortex, cerebellum, stem];
}

function heart(part: BodyPart): THREE.BufferGeometry[] {
  const s = first(part);
  const red = hex("#c71f31");
  const deep = hex("#9c1327");
  const fat = hex("#eab879");
  const body = blob(
    [0, 0, 0],
    [1, 1, 1],
    0,
    (d, out) => {
      const { y } = d;
      let { x, z } = d;
      const taper = 0.55 + 0.45 * smooth(-1, 0.35, y);
      x = x * taper + 0.28 * (1 - smooth(-1, 0.3, y));
      z *= taper;
      const groove = exp(-pow(d.x * 0.9 - d.z * 0.55 + 0.05, 2) / 0.012) * smooth(-0.9, 0.3, y);
      const scale = 1 - 0.05 * groove + 0.012 * sin(18 * d.x) * sin(17 * d.y) * sin(16 * d.z);
      out.pos.set(x * scale, y * scale, z * scale);
      const fatAmount = smooth(0.1, 0.7, y) * (0.5 + 0.5 * sin(8 * d.x + 2) * sin(7 * d.z + 1)) + groove * 0.6;
      out.color.copy(mix(mix(red, deep, smooth(-0.3, 0.6, d.x)), fat, fatAmount));
    },
    [72, 48],
  );
  const redVessel = hex("#d12236");
  const blueVessel = hex("#3d6fd0");
  const aorta = tube(
    [[-0.15, 0.7, 0], [-0.2, 1.4, -0.05], [0.1, 1.9, -0.1], [0.6, 1.72, -0.15], [0.82, 1.1, -0.25], [0.82, 0.2, -0.3]],
    (t) => 0.25 * cap(t, 0.03),
    () => redVessel,
    { segs: 60, radial: 12 },
  );
  const pulmonary = tube(
    [[0.2, 0.6, 0.6], [0.22, 1.3, 0.5], [0.6, 1.58, 0.3], [1.15, 1.5, 0.05]],
    (t) => 0.22 * cap(t, 0.04),
    () => blueVessel,
    { segs: 50, radial: 12 },
  );
  const cava = tube(
    [[-0.8, -0.9, 0.1], [-0.88, 0, 0], [-0.86, 1.2, -0.05], [-0.78, 2.4, -0.1]],
    (t) => 0.22 * cap(t, 0.03),
    () => blueVessel,
    { segs: 50, radial: 12 },
  );
  const parts = [body, aorta, pulmonary, cava];
  parts.forEach((g) => place(g, s.p, s.r, s.rot ?? 0));
  return parts.map((g) => {
    g.computeVertexNormals();
    return g;
  });
}

function liver(part: BodyPart): THREE.BufferGeometry[] {
  const s = first(part);
  const base = hex("#8f3b2d");
  const warm = hex("#aa4d3a");
  const body = blob(
    s.p,
    s.r,
    s.rot ?? 0,
    (d, out) => {
      const { x } = d;
      let { y, z } = d;
      y *= 0.85 - 0.55 * smooth(0, 1, x);
      z *= 0.82 - 0.3 * smooth(0.2, 1, x);
      const dent = exp(-(pow(d.x + 0.1, 2) * 2 + pow(d.y + 0.9, 2) * 4 + d.z * d.z * 3) / 0.2);
      const scale = 1 - 0.1 * dent;
      out.pos.set(x * scale, y * scale, z * scale);
      out.color.copy(mix(base, warm, 0.5 + 0.5 * sin(5 * d.x + 3 * d.z)));
    },
    [72, 48],
  );
  const gall = blob([s.p[0] + 0.03, s.p[1] - 0.06, s.p[2] + 0.02], [0.013, 0.024, 0.013], 0.2, (_d, out) => out.color.set("#6f8d2e"), [20, 14]);
  return [body, gall];
}

function stomach(part: BodyPart): THREE.BufferGeometry[] {
  void part;
  const wall = hex("#e58a6c");
  const shade = hex("#c96d56");
  const main = tube(
    [[0.04, 0.585, 0.05], [0.1, 0.57, 0.06], [0.15, 0.52, 0.06], [0.145, 0.45, 0.07], [0.09, 0.41, 0.075], [0.04, 0.425, 0.065]],
    (t) => (0.02 + 0.034 * pow(sin(PI * Math.min(1, t * 1.05)), 0.8)) * cap(t, 0.06),
    (t, a) => mix(wall, shade, 0.3 + 0.3 * sin(a * 2 + t * 5)),
    { segs: 80, radial: 20 },
  );
  const gullet = tube(
    [[0, 1.2, -0.01], [0, 0.92, -0.04], [0.03, 0.64, 0.0], [0.055, 0.585, 0.045]],
    (t) => 0.011 * cap(t, 0.02),
    () => "#d77a74",
    { segs: 50, radial: 10 },
  );
  return [main, gullet];
}

function spleen(part: BodyPart): THREE.BufferGeometry[] {
  const s = first(part);
  return [
    blob(s.p, s.r, s.rot ?? 0, (d, out) => {
      const notch = exp(-(pow(d.x + 1, 2) + d.y * d.y * 0.6 + d.z * d.z) / 0.5);
      out.pos.copy(d).multiplyScalar(1 - 0.18 * notch);
      out.color.copy(mix(hex("#7c3158"), hex("#9a4570"), 0.5 + 0.5 * sin(6 * d.y)));
    }, [40, 28]),
  ];
}

function pancreas(part: BodyPart): THREE.BufferGeometry[] {
  void part;
  return [
    tube(
      [[-0.1, 0.405, 0.0], [-0.04, 0.41, 0.01], [0.04, 0.42, 0.005], [0.12, 0.435, -0.005]],
      (t, a) => 0.022 * (1.15 - 0.55 * t) * (1 + 0.16 * sin(t * 46 + a * 3)) * cap(t, 0.05),
      (t) => mix(hex("#e7b56b"), hex("#f0cf92"), 0.5 + 0.5 * sin(t * 30)),
      { segs: 90, radial: 14 },
    ),
  ];
}

function kidneys(part: BodyPart): THREE.BufferGeometry[] {
  const s = first(part);
  const bean = blob(s.p, s.r, s.rot ?? 0, (d, out) => {
    const notch = exp(-(pow(d.x + 1, 2) * 1.5 + d.y * d.y * 3 + d.z * d.z) / 0.35);
    out.pos.copy(d).multiplyScalar(1 - 0.5 * notch);
    out.color.copy(mix(hex("#8f3a4b"), hex("#6f2a3a"), notch));
  }, [48, 36]);
  const ureter = tube(
    [[s.p[0] - 0.02, s.p[1] - 0.04, s.p[2]], [s.p[0] - 0.035, s.p[1] - 0.12, s.p[2] + 0.01], [s.p[0] - 0.06, s.p[1] - 0.28, s.p[2] + 0.04], [s.p[0] - 0.09, s.p[1] - 0.4, s.p[2] + 0.1]],
    (t) => 0.005 * cap(t, 0.03),
    () => "#e8c07a",
    { segs: 40, radial: 8 },
  );
  return [bean, ureter, mirror(bean), mirror(ureter)];
}

function smallIntestine(part: BodyPart): THREE.BufferGeometry[] {
  void part;
  // Loops that sweep left and right, row after row, like the real coils.
  const pts: Vec3[] = [];
  const rows = 6;
  for (let k = 0; k < rows; k++) {
    const dir = k % 2 === 0 ? 1 : -1;
    const y = 0.235 - k * 0.043;
    for (let i = 0; i <= 8; i++) {
      const u = i / 8;
      const x = dir * (-0.105 + 0.21 * u);
      pts.push([x, y + 0.012 * sin(i * 1.9 + k), 0.055 + 0.028 * sin(i * 1.4 + k * 1.7)]);
    }
  }
  return [
    tube(
      pts,
      (t, a) => 0.0185 * (1 + 0.06 * sin(a * 2)) * cap(t, 0.01),
      (t) => mix(hex("#eba07f"), hex("#f2b79b"), 0.5 + 0.5 * sin(t * 90)),
      { segs: 520, radial: 10 },
    ),
  ];
}

function largeIntestine(part: BodyPart): THREE.BufferGeometry[] {
  void part;
  const frame = tube(
    [[-0.17, 0.045, 0.06], [-0.18, 0.15, 0.06], [-0.175, 0.26, 0.065], [-0.15, 0.315, 0.07], [-0.07, 0.33, 0.075], [0.04, 0.325, 0.075], [0.13, 0.32, 0.07], [0.175, 0.26, 0.065], [0.18, 0.15, 0.06], [0.165, 0.07, 0.06], [0.1, 0.03, 0.065], [0.05, 0.0, 0.07]],
    (t, a) => 0.029 * (1 + 0.15 * sin(t * 150)) * (1 + 0.04 * sin(a * 3)) * cap(t, 0.02),
    (t) => mix(hex("#d98b6b"), hex("#b97253"), 0.5 + 0.5 * sin(t * 150)),
    { segs: 400, radial: 14 },
  );
  const appendix = tube(
    [[-0.165, 0.035, 0.07], [-0.14, 0.01, 0.085], [-0.12, -0.015, 0.09]],
    (t) => 0.007 * cap(t, 0.1),
    () => "#c98a6c",
    { segs: 20, radial: 8 },
  );
  return [frame, appendix];
}

function bladder(part: BodyPart): THREE.BufferGeometry[] {
  const s = first(part);
  return [
    blob(s.p, s.r, 0, (d, out) => {
      const x = d.x * (0.82 + 0.18 * smooth(-1, 0.6, d.y));
      out.pos.set(x, d.y, d.z);
      out.color.copy(mix(hex("#e6b34d"), hex("#f0cb7a"), 0.5 + 0.5 * d.y));
    }, [40, 28]),
  ];
}

function trachea(part: BodyPart): THREE.BufferGeometry[] {
  void part;
  const ring = hex("#c4e6f3");
  const gap = hex("#8fc6de");
  const pipe = tube(
    [[0, 1.27, 0.02], [0, 1.0, 0.02], [0, 0.8, 0.02]],
    (t) => 0.019 * (1 + 0.1 * sin(t * 52 * PI)) * cap(t, 0.03),
    (t) => mix(gap, ring, 0.5 + 0.5 * sin(t * 52 * PI)),
    { segs: 220, radial: 14 },
  );
  const larynx = blob([0, 1.275, 0.026], [0.026, 0.022, 0.022], 0, (_d, out) => out.color.set("#d4eef7"), [24, 16]);
  const bronchus = tube(
    [[0, 0.8, 0.02], [0.03, 0.765, 0.02], [0.09, 0.7, 0.0]],
    (t) => 0.012 * cap(t, 0.05),
    () => "#a8d6e9",
    { segs: 30, radial: 10 },
  );
  const lowBranch = tube(
    [[0.09, 0.7, 0], [0.14, 0.62, -0.01], [0.17, 0.55, -0.02]],
    (t) => 0.007 * cap(t, 0.05),
    () => "#a8d6e9",
    { segs: 24, radial: 8 },
  );
  const highBranch = tube(
    [[0.09, 0.7, 0], [0.14, 0.78, 0.0], [0.19, 0.85, -0.02]],
    (t) => 0.007 * cap(t, 0.05),
    () => "#a8d6e9",
    { segs: 24, radial: 8 },
  );
  return [pipe, larynx, bronchus, lowBranch, highBranch, mirror(bronchus), mirror(lowBranch), mirror(highBranch)];
}

// ---------------------------------------------------------------- skull and jaw

function skull(part: BodyPart): THREE.BufferGeometry[] {
  const s = first(part);
  const dark = hex("#463b2e");
  const cranium = blob(
    s.p,
    s.r,
    0,
    (d, out) => {
      const { y } = d;
      let { x, z } = d;
      const low = smooth(-0.15, -0.85, y);
      x *= 1 - 0.3 * low;
      if (z > 0) z *= 1 - 0.24 * low;
      let scale = 1;
      let shade = 0;
      for (const side of [-1, 1]) {
        const eye = exp(-(pow(d.x - 0.4 * side, 2) + pow(d.y + 0.18, 2) * 1.4 + pow(d.z - 0.9, 2) * 0.5) / 0.025);
        scale -= 0.2 * eye;
        shade = Math.max(shade, smooth(0.15, 0.7, eye));
        scale += 0.065 * exp(-(pow(d.x - 0.66 * side, 2) + pow(d.y + 0.42, 2) + pow(d.z - 0.62, 2)) / 0.03); // cheekbone
        scale -= 0.05 * exp(-(pow(d.x - 0.92 * side, 2) + pow(d.y + 0.1, 2) + pow(d.z - 0.1, 2)) / 0.05); // temple
      }
      const nose = exp(-(d.x * d.x * 3 + pow(d.y + 0.46, 2) * 0.6 + pow(d.z - 0.95, 2) * 0.4) / 0.012);
      scale -= 0.2 * nose;
      shade = Math.max(shade, smooth(0.2, 0.8, nose));
      scale += 0.03 * exp(-pow(d.y + 0.0, 2) / 0.01) * smooth(0.3, 0.9, d.z); // brow ridge
      out.pos.set(x * scale, y * scale, z * scale);
      out.color.copy(mix(mix(BONE, BONE_DARK, 0.5 + 0.5 * sin(5 * d.x + 4 * d.y + 3 * d.z)), dark, shade));
    },
    [96, 64],
  );
  const teeth: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 12; k++) {
    const a = -1.0 + (k / 11) * 2.0;
    teeth.push(tooth(0.058 * sin(a), s.p[1] - 0.138, 0.04 + 0.08 * cos(a), a, 0.0115, 0.02, 0.009, hex("#fffbea")));
  }
  return [cranium, ...teeth];
}

function mandible(part: BodyPart): THREE.BufferGeometry[] {
  void part;
  const jaw = tube(
    [[-0.095, 1.49, -0.045], [-0.098, 1.42, -0.04], [-0.085, 1.345, 0.0], [-0.05, 1.315, 0.07], [0, 1.305, 0.105], [0.05, 1.315, 0.07], [0.085, 1.345, 0.0], [0.098, 1.42, -0.04], [0.095, 1.49, -0.045]],
    (t) => (0.0105 + 0.006 * exp(-pow((t - 0.5) / 0.13, 2))) * cap(t, 0.03),
    (t) => mix(BONE, BONE_DARK, 0.3 + 0.3 * sin(t * 20)),
    { segs: 120, radial: 12 },
  );
  const teeth: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 12; k++) {
    const a = -0.95 + (k / 11) * 1.9;
    teeth.push(tooth(0.054 * sin(a), 1.337, 0.04 + 0.076 * cos(a), a, 0.0105, 0.018, 0.008, hex("#fffbea")));
  }
  return [jaw, ...teeth];
}

// ---------------------------------------------------------------- muscles and bones

/** Every muscle: a spindle with parallel fibres running its length and pale tendons at the ends. */
function muscle(part: BodyPart): THREE.BufferGeometry[] {
  const base = hex(part.color);
  return shapesOf(part).flatMap((shape) => {
    if (shape.t === "ring") return [];
    const r: Vec3 = shape.t === "e" ? shape.r : [shape.rad, shape.len / 2, shape.rad];
    return [
      blob(shape.p, r, shape.rot ?? 0, (d, out) => {
        const phi = Math.atan2(d.z, d.x);
        const fibre = sin(phi * 16 + d.y * 2);
        const end = abs(d.y);
        const pinch = 1 - 0.18 * pow(end, 4);
        out.pos.copy(d).multiplyScalar(pinch * (1 + 0.028 * fibre));
        out.color.copy(mix(base.clone().multiplyScalar(0.86 + 0.14 * fibre), TENDON, smooth(0.78, 0.98, end)));
      }, [64, 40]),
    ];
  });
}

/** Long bones: a slim shaft with a knob at each end. */
function longBone(p: Vec3, rad: number, len: number, rot: number): THREE.BufferGeometry {
  const pts: Vec3[] = [];
  for (let i = 0; i <= 6; i++) {
    const yy = (i / 6 - 0.5) * len;
    pts.push([p[0] - yy * sin(rot), p[1] + yy * cos(rot), p[2]]);
  }
  return tube(
    pts,
    (t, a) => rad * (0.58 + 0.92 * exp(-pow(t / 0.09, 2)) + 0.92 * exp(-pow((1 - t) / 0.09, 2)) + 0.04 * sin(a * 2 + t * 6)) * cap(t, 0.035),
    (t) => mix(BONE, BONE_DARK, 0.15 + 0.85 * (exp(-pow(t / 0.12, 2)) + exp(-pow((1 - t) / 0.12, 2))) * 0.4),
    { segs: 60, radial: 14 },
  );
}

function bones(part: BodyPart): THREE.BufferGeometry[] {
  return shapesOf(part).flatMap((shape) => {
    if (shape.t === "ring") return [];
    if (shape.t === "c") return [longBone(shape.p, shape.rad, shape.len, shape.rot ?? 0)];
    return [
      blob(shape.p, shape.r, shape.rot ?? 0, (d, out) => {
        out.pos.copy(d).multiplyScalar(1 + 0.03 * sin(9 * d.x + 7 * d.y) * sin(8 * d.z));
        out.color.copy(mix(BONE, BONE_DARK, 0.4 + 0.4 * sin(6 * d.y + 3 * d.x)));
      }, [32, 24]),
    ];
  });
}

function handBones(part: BodyPart): THREE.BufferGeometry[] {
  const s = first(part);
  const cx = s.p[0];
  const cy = s.p[1];
  const list: THREE.BufferGeometry[] = [
    blob([cx, cy + 0.03, 0], [0.034, 0.035, 0.013], 0, (d, out) => out.color.copy(BONE), [24, 16]),
  ];
  const fingers: Array<[number, number, number]> = [[-0.026, 0.07, 0.1], [-0.013, 0.082, 0.04], [0.0, 0.086, 0], [0.013, 0.08, -0.04], [0.027, 0.066, -0.1]];
  fingers.forEach(([ox, length, lean]) => {
    list.push(
      tube(
        [[cx + ox, cy, 0], [cx + ox + lean * length * 0.5, cy - length * 0.5, 0.004], [cx + ox + lean * length, cy - length, 0.006]],
        (t) => 0.0052 * (1 + 0.25 * exp(-pow(t / 0.1, 2)) + 0.2 * sin(t * 18)) * cap(t, 0.12),
        (t) => mix(BONE, BONE_DARK, 0.3 + 0.3 * sin(t * 14)),
        { segs: 14, radial: 8 },
      ),
    );
  });
  return list;
}


// ---------------------------------------------------------------- skin

const SKIN = new THREE.Color("#f1bf9b");
const SKIN_WARM = new THREE.Color("#e8a584");

/** Interpolate a list of [t, value] keys smoothly. */
function along(keys: Array<[number, number]>, t: number): number {
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1];
      const [t1, v1] = keys[i];
      const k = smooth(0, 1, (t - t0) / (t1 - t0));
      return v0 + (v1 - v0) * k;
    }
  }
  return keys[keys.length - 1][1];
}

/** A body section stacked along y with an oval cross-section (the torso). */
function loft(keys: Array<[number, number, number, number]>, bump: (x: number, y: number, z: number) => number): THREE.BufferGeometry {
  const N = 70;
  const M = 40;
  const y0 = keys[0][0];
  const y1 = keys[keys.length - 1][0];
  const pick = (i: number, y: number) => along(keys.map((k) => [k[0], k[i]] as [number, number]), y);
  const positions = new Float32Array((N + 1) * M * 3);
  const colors = new Float32Array((N + 1) * M * 3);
  const tint = new THREE.Color();
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const y = y0 + (y1 - y0) * t;
    const shrink = cap(t, 0.05);
    const rx = pick(1, y) * shrink;
    const rz = pick(2, y) * shrink;
    const zc = pick(3, y);
    for (let j = 0; j < M; j++) {
      const a = (j / M) * PI * 2;
      const x = rx * cos(a);
      const z = zc + rz * sin(a);
      const out = bump(x, y, z);
      const k = (i * M + j) * 3;
      positions[k] = x * (1 + out * 0.4);
      positions[k + 1] = y;
      positions[k + 2] = z + out;
      tint.copy(mix(SKIN, SKIN_WARM, 0.5 + 0.5 * sin(9 * x + 5 * y)));
      colors[k] = tint.r;
      colors[k + 1] = tint.g;
      colors[k + 2] = tint.b;
    }
  }
  const indices: number[] = [];
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < M; j++) {
      const a = i * M + j;
      const d = i * M + ((j + 1) % M);
      const b = (i + 1) * M + j;
      const c = (i + 1) * M + ((j + 1) % M);
      indices.push(a, b, d, b, c, d);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  const welded = mergeVertices(geometry, 1e-6);
  welded.computeVertexNormals();
  return welded;
}

function skin(part: BodyPart): THREE.BufferGeometry[] {
  void part;
  const tone = (t: number, a: number) => mix(SKIN, SKIN_WARM, 0.25 + 0.25 * sin(t * 9 + a * 2));

  // Torso, waist and hips in one piece, with chest and stomach muscles showing through.
  const torso = loft(
    [[-0.2, 0.2, 0.15, 0], [-0.1, 0.3, 0.2, 0], [0.1, 0.275, 0.18, 0.005], [0.35, 0.3, 0.2, 0.01], [0.7, 0.355, 0.225, 0.0], [0.97, 0.385, 0.2, -0.01], [1.1, 0.27, 0.14, -0.01], [1.2, 0.1, 0.09, 0]],
    (x, y, z) => {
      if (z < 0.05) return 0;
      let b = 0;
      for (const side of [-1, 1]) {
        b += 0.03 * exp(-(pow(x - 0.16 * side, 2) / 0.012 + pow(y - 0.85, 2) / 0.012)); // chest
        b += 0.008 * exp(-(pow(x - 0.05 * side, 2) / 0.004 + pow(((y - 0.5) % 0.16) / 0.16 - 0.0, 2) / 0.05)) * smooth(0.2, 0.4, y) * (1 - smooth(0.7, 0.8, y)); // abs
      }
      b -= 0.012 * exp(-(x * x / 0.002 + pow(y - 0.22, 2) / 0.0015)); // belly button
      return b;
    },
  );

  const neck = tube([[0, 1.12, 0.0], [0, 1.24, 0.01], [0, 1.4, 0.02]], (t) => 0.066 * (1 - 0.05 * t) * cap(t, 0.02), tone, { segs: 12, radial: 20 });

  const head = blob([0, 1.52, 0.01], [0.16, 0.215, 0.185], 0, (d, out) => {
    const low = smooth(-0.1, -1, d.y);
    const x = d.x * (1 - 0.12 * low);
    const z = d.z * (1 - 0.06 * low) + 0.05 * low * smooth(0.3, 1, d.z);
    out.pos.set(x, d.y, z);
    out.color.copy(mix(SKIN, SKIN_WARM, 0.2 + 0.2 * sin(8 * d.x + 6 * d.y)));
    // Short dark hair over the top and back of the head.
    const hair = smooth(0.3, 0.5, d.y) + smooth(-0.1, -0.5, d.z) * smooth(-0.3, 0.1, d.y);
    if (hair > 0) out.color.copy(mix(out.color, new THREE.Color("#2f2219"), Math.min(1, hair)));
  }, [64, 44]);
  const face: THREE.BufferGeometry[] = [
    blob([0, 1.49, 0.178], [0.02, 0.036, 0.03], 0, (d, out) => out.color.copy(mix(SKIN, SKIN_WARM, 0.3)), [20, 14]), // nose
    blob([0, 1.4, 0.158], [0.032, 0.007, 0.012], 0, (_d, out) => out.color.set("#b4604f"), [16, 10]), // mouth
    blob([0.055, 1.53, 0.158], [0.016, 0.009, 0.01], 0, (_d, out) => out.color.set("#3a2a20"), [14, 10]), // eye
    blob([-0.055, 1.53, 0.158], [0.016, 0.009, 0.01], 0, (_d, out) => out.color.set("#3a2a20"), [14, 10]),
    blob([0.06, 1.565, 0.16], [0.024, 0.005, 0.008], 0, (_d, out) => out.color.set("#2f2219"), [14, 8]), // brows
    blob([-0.06, 1.565, 0.16], [0.024, 0.005, 0.008], 0, (_d, out) => out.color.set("#2f2219"), [14, 8]),
    blob([0.148, 1.5, 0.0], [0.01, 0.034, 0.022], 0, (_d, out) => out.color.copy(SKIN_WARM), [14, 10]), // ears
    blob([-0.148, 1.5, 0.0], [0.01, 0.034, 0.022], 0, (_d, out) => out.color.copy(SKIN_WARM), [14, 10]),
  ];

  // One side of the body (the left, +x); the other side is mirrored below.
  const arm = tube(
    [[0.41, 1.02, 0], [0.425, 0.95, 0], [0.46, 0.7, 0.005], [0.503, 0.45, 0], [0.53, 0.2, 0.01], [0.563, -0.06, 0.01]],
    (t) => along([[0, 0.085], [0.1, 0.082], [0.3, 0.07], [0.5, 0.056], [0.62, 0.062], [1, 0.036]], t) * 1.2 * cap(t, 0.03),
    tone,
    { segs: 60, radial: 18 },
  );
  const shoulder = blob([0.42, 1.0, 0], [0.1, 0.095, 0.095], 0, (_d, out) => out.color.copy(mix(SKIN, SKIN_WARM, 0.3)), [28, 20]);
  const hand: THREE.BufferGeometry[] = [blob([0.567, -0.11, 0.005], [0.045, 0.062, 0.02], 0, (_d, out) => out.color.copy(SKIN), [24, 16])];
  const fingers: Array<[number, number, number]> = [[-0.026, 0.075, 0.1], [-0.013, 0.088, 0.04], [0.0, 0.092, 0], [0.013, 0.085, -0.04], [0.027, 0.07, -0.1]];
  fingers.forEach(([ox, length, lean]) => {
    const cx = 0.567 + ox;
    hand.push(
      tube(
        [[cx, -0.14, 0.006], [cx + lean * length * 0.5, -0.14 - length * 0.5, 0.008], [cx + lean * length, -0.14 - length, 0.01]],
        (t) => 0.011 * (1 - 0.2 * t) * cap(t, 0.15),
        tone,
        { segs: 10, radial: 8 },
      ),
    );
  });

  const leg = tube(
    [[0.12, -0.05, 0], [0.165, -0.3, 0.005], [0.185, -0.6, 0.01], [0.2, -0.98, 0.01], [0.203, -1.15, -0.005], [0.2, -1.4, 0], [0.198, -1.68, 0]],
    (t) => along([[0, 0.14], [0.1, 0.13], [0.35, 0.105], [0.55, 0.078], [0.66, 0.085], [0.85, 0.058], [1, 0.045]], t) * 1.15 * cap(t, 0.02),
    tone,
    { segs: 90, radial: 22 },
  );
  const foot = blob([0.2, -1.75, 0.07], [0.058, 0.045, 0.145], 0, (d, out) => {
    const toe = smooth(0.2, 1, d.z);
    out.pos.set(d.x * (1 + 0.15 * toe), d.y * (1 - 0.45 * toe), d.z);
    out.color.copy(mix(SKIN, SKIN_WARM, 0.3));
  }, [32, 22]);

  const side = [arm, shoulder, ...hand, leg, foot];
  return [torso, neck, head, ...face, ...side, ...side.map(mirror)];
}

// ---------------------------------------------------------------- public

const BUILDERS: Record<string, (part: BodyPart) => THREE.BufferGeometry[]> = {
  skin,
  lungs,
  brain,
  heart,
  liver,
  stomach,
  spleen,
  pancreas,
  kidneys,
  smallint: smallIntestine,
  largeint: largeIntestine,
  bladder,
  trachea,
  skull,
  mandible,
  handbones: (part) => {
    const one = handBones(part);
    return [...one, ...one.map(mirror)];
  },
  clavicle: bones,
  humerus: bones,
  forearmbones: bones,
  femur: bones,
  tibia: bones,
  patella: bones,
  footbones: bones,
};

const cache = new Map<string, THREE.BufferGeometry | null>();

/**
 * The realistic mesh for a part, or null when the part has no custom builder
 * (it then draws from its simple shapes). Built once and shared.
 */
export function realisticGeometry(part: BodyPart): THREE.BufferGeometry | null {
  if (cache.has(part.id)) return cache.get(part.id) ?? null;
  const builder = part.layer === "muscle" ? muscle : BUILDERS[part.id];
  let result: THREE.BufferGeometry | null = null;
  if (builder) {
    const pieces = builder(part).filter((g) => g.attributes.position.count > 0);
    // Every piece must carry the same attributes and an index before it can be merged.
    pieces.forEach((g) => {
      if (!g.index) g.setIndex([...Array(g.attributes.position.count).keys()]);
    });
    result = mergeGeometries(pieces, false);
    pieces.forEach((g) => g.dispose());
  }
  cache.set(part.id, result);
  return result;
}
