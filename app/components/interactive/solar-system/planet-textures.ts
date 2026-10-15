import * as THREE from "three";

import type { CelestialBody } from "@/lib/solar-system/solar-system-types";

// Procedural planet textures, drawn once on a canvas. They are original
// artwork generated in code, so no third-party image licence applies. If a
// body has `textureUrl` (for example a CC-BY NASA-derived map dropped into
// public/textures/planets/), that photographic map is used instead.

const WIDTH = 512;
const HEIGHT = 256;

function rng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Tileable value noise (wraps horizontally so the seam never shows).
function makeNoise(seed: number, cellsX: number, cellsY: number) {
  const random = rng(seed);
  const grid: number[] = [];
  for (let i = 0; i < cellsX * cellsY; i += 1) grid.push(random());
  const smooth = (t: number) => t * t * (3 - 2 * t);
  return (u: number, v: number) => {
    const x = u * cellsX;
    const y = v * cellsY;
    const x0 = Math.floor(x) % cellsX;
    const y0 = Math.floor(y) % cellsY;
    const x1 = (x0 + 1) % cellsX;
    const y1 = (y0 + 1) % cellsY;
    const fx = smooth(x - Math.floor(x));
    const fy = smooth(y - Math.floor(y));
    const a = grid[y0 * cellsX + x0] * (1 - fx) + grid[y0 * cellsX + x1] * fx;
    const b = grid[y1 * cellsX + x0] * (1 - fx) + grid[y1 * cellsX + x1] * fx;
    return a * (1 - fy) + b * fy;
  };
}

function hexToRgb(hex: string): [number, number, number] {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function mix(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  const k = Math.min(1, Math.max(0, t));
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
}

type Painter = (u: number, v: number, n: (scale: number) => number) => [number, number, number];

function paint(seed: number, painter: Painter): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) return canvas;
  const octaves = [makeNoise(seed, 4, 4), makeNoise(seed + 1, 8, 8), makeNoise(seed + 2, 16, 16), makeNoise(seed + 3, 32, 32)];
  const image = context.createImageData(WIDTH, HEIGHT);
  // Layered noise at a given frequency; wraps in both directions.
  const sample = (u: number, v: number) => (scale: number) => {
    const su = (u * scale) % 1;
    const sv = (v * scale) % 1;
    return (octaves[0](su, sv) * 0.5 + octaves[1](su, sv) * 0.25 + octaves[2](su, sv) * 0.15 + octaves[3](su, sv) * 0.1);
  };
  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      const u = x / WIDTH;
      const v = y / HEIGHT;
      const [r, g, b] = painter(u, v, sample(u, v));
      const i = (y * WIDTH + x) * 4;
      image.data[i] = r;
      image.data[i + 1] = g;
      image.data[i + 2] = b;
      image.data[i + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
  return canvas;
}

function bandedGiant(seed: number, bands: string[], contrast: number, warp: number): Painter {
  const palette = bands.map(hexToRgb);
  return (u, v, n) => {
    const turbulence = (n(1) - 0.5) * warp;
    const t = (v + turbulence) * palette.length * 1.6;
    const index = Math.floor(t);
    const frac = t - index;
    const a = palette[((index % palette.length) + palette.length) % palette.length];
    const b = palette[(((index + 1) % palette.length) + palette.length) % palette.length];
    const base = mix(a, b, frac * frac * (3 - 2 * frac));
    const detail = (n(3) - 0.5) * contrast;
    return [base[0] + detail * 60, base[1] + detail * 55, base[2] + detail * 45];
  };
}

function build(body: CelestialBody): HTMLCanvasElement {
  const seed = body.id.split("").reduce((sum, char) => sum * 31 + char.charCodeAt(0), 7);
  const base = hexToRgb(body.color);
  const deep = hexToRgb(body.colorDeep);

  switch (body.id) {
    case "sun":
      return paint(seed, (u, v, n) => mix(hexToRgb("#ffb21a"), hexToRgb("#fff1a8"), n(2) * 1.4 - 0.2));
    case "mercury":
      return paint(seed, (u, v, n) => {
        const craters = Math.pow(n(5), 3);
        return mix(deep, mix(base, [220, 214, 205], 0.35), 0.45 + n(2) * 0.55 - craters * 0.9);
      });
    case "venus":
      return paint(seed, (u, v, n) => mix(deep, [250, 233, 190], 0.35 + n(1) * 0.9 + (n(4) - 0.5) * 0.25));
    case "earth": {
      const ocean = hexToRgb("#1763c2");
      const shallow = hexToRgb("#3f9fe9");
      const land = hexToRgb("#4ea35a");
      const dry = hexToRgb("#b79b58");
      const ice = [240, 247, 255] as [number, number, number];
      return paint(seed, (u, v, n) => {
        const height = n(1) * 0.8 + n(2) * 0.2;
        const latitude = Math.abs(v - 0.5) * 2;
        // Polar ice fades in softly instead of ending on a hard edge.
        const capEdge = 0.86 + (n(3) - 0.5) * 0.12;
        const cap = Math.min(1, Math.max(0, (latitude - capEdge) / 0.07));
        if (cap >= 1) return ice;
        if (height > 0.52) {
          const arid = Math.abs(latitude - 0.3) < 0.14 ? 0.7 : 0.25;
          const tone = mix(land, dry, arid + (n(4) - 0.5) * 0.6);
          return mix(height > 0.66 ? mix(tone, [120, 100, 80], 0.5) : tone, ice, cap);
        }
        const cloud = Math.max(0, n(2) - 0.62) * 2.6;
        const sea = mix(ocean, shallow, Math.max(0, (height - 0.4) * 5));
        return mix(mix(sea, [255, 255, 255], Math.min(cloud, 0.7)), ice, cap);
      });
    }
    case "mars":
      return paint(seed, (u, v, n) => {
        const latitude = Math.abs(v - 0.5) * 2;
        if (latitude > 0.93) return [245, 240, 235];
        const dark = Math.pow(n(1), 2) * 1.1;
        return mix(mix(base, [236, 150, 90], n(3)), deep, dark * 0.7);
      });
    case "jupiter": {
      const painter = bandedGiant(seed, ["#e8cfa6", "#b9774a", "#f1dcb8", "#a5623a", "#e6c79a", "#c58a58", "#f0d7b0"], 0.5, 0.18);
      return paint(seed, (u, v, n) => {
        const base2 = painter(u, v, n);
        // The Great Red Spot.
        const dx = (u - 0.62) / 0.07;
        const dy = (v - 0.62) / 0.045;
        const spot = Math.max(0, 1 - (dx * dx + dy * dy));
        return mix(base2, [190, 70, 45], spot * 0.85);
      });
    }
    case "saturn":
      return paint(seed, bandedGiant(seed, ["#efdcae", "#d6b878", "#f4e6bf", "#c9a766", "#ead5a2", "#d9bd80"], 0.22, 0.06));
    case "uranus":
      return paint(seed, (u, v, n) => mix(deep, [190, 245, 245], 0.55 + (v - 0.5) * 0.3 + (n(1) - 0.5) * 0.12));
    case "neptune": {
      const painter = bandedGiant(seed, ["#3a5bd9", "#4f74ee", "#2c46b3", "#4466e0"], 0.35, 0.1);
      return paint(seed, (u, v, n) => {
        const base2 = painter(u, v, n);
        const dx = (u - 0.35) / 0.06;
        const dy = (v - 0.58) / 0.04;
        const spot = Math.max(0, 1 - (dx * dx + dy * dy));
        return mix(base2, [18, 30, 110], spot * 0.8);
      });
    }
    default:
      return paint(seed, () => base);
  }
}

export function createPlanetTexture(body: CelestialBody): THREE.Texture {
  if (body.textureUrl) {
    const loaded = new THREE.TextureLoader().load(body.textureUrl);
    loaded.colorSpace = THREE.SRGBColorSpace;
    return loaded;
  }
  const texture = new THREE.CanvasTexture(build(body));
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}

// Saturn's ring: a radial strip with gaps (the Cassini Division and fine
// ringlets), mapped across the ring geometry with a custom UV remap.
export function createRingTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 4;
  const context = canvas.getContext("2d");
  if (context) {
    const random = rng(99);
    for (let x = 0; x < 512; x += 1) {
      const t = x / 511;
      let alpha = t < 0.08 ? 0.15 : t < 0.36 ? 0.55 : t < 0.42 ? 0.04 : t < 0.9 ? 0.8 : 0.3;
      alpha *= 0.7 + random() * 0.3;
      const shade = 190 + Math.floor(random() * 40);
      context.fillStyle = `rgba(${shade}, ${shade - 20}, ${shade - 58}, ${alpha})`;
      context.fillRect(x, 0, 1, 4);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// ---------------------------------------------------------------------------
// Atmosphere, glow and backdrop textures (premium look, tiny memory cost).
// ---------------------------------------------------------------------------

/** Soft round glow, white to transparent. Tinted by the sprite material. */
export function createGlowTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.25, "rgba(255,255,255,0.55)");
    gradient.addColorStop(0.55, "rgba(255,255,255,0.16)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** White cloud cover with transparency, wraps around Earth. */
export function createCloudTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext("2d");
  if (context) {
    const octaves = [makeNoise(401, 4, 4), makeNoise(402, 8, 8), makeNoise(403, 16, 16), makeNoise(404, 32, 32)];
    const image = context.createImageData(WIDTH, HEIGHT);
    for (let y = 0; y < HEIGHT; y += 1) {
      for (let x = 0; x < WIDTH; x += 1) {
        const u = x / WIDTH;
        const v = y / HEIGHT;
        const value = octaves[0](u, v) * 0.3 + octaves[1](u, v) * 0.3 + octaves[2](u, v) * 0.24 + octaves[3](u, v) * 0.16;
        const alpha = Math.min(1, Math.max(0, (value - 0.55) * 5));
        const i = (y * WIDTH + x) * 4;
        image.data[i] = 255;
        image.data[i + 1] = 255;
        image.data[i + 2] = 255;
        image.data[i + 3] = Math.round(alpha * 205);
      }
    }
    context.putImageData(image, 0, 0);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

/** A faint deep-space backdrop: a few large, soft colour clouds on near-black. */
export function createNebulaTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = "#02060f";
    context.fillRect(0, 0, 1024, 512);
    const random = rng(2026);
    const tints = ["27,58,138", "91,42,134", "15,111,222", "20,90,150"];
    for (let i = 0; i < 16; i += 1) {
      const x = random() * 1024;
      const y = random() * 512;
      const radius = 90 + random() * 220;
      const tint = tints[Math.floor(random() * tints.length)];
      const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(${tint},${0.16 + random() * 0.12})`);
      gradient.addColorStop(1, `rgba(${tint},0)`);
      context.fillStyle = gradient;
      context.fillRect(0, 0, 1024, 512);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
