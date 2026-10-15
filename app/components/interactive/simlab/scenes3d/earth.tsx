"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";

import { eclipseKind, phaseName } from "../specs/moon-phases";
import { layerAt } from "../specs/earth-structure";
import { COURSES, water } from "../specs/river-processes";
import { Floor, Glow, Tag } from "./kit";

import type { SimState } from "../types";

type P = { state: SimState };

// Small seeded random so the planets look the same on every visit.
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function paint(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function earthTexture() {
  return paint(1024, 512, (g) => {
    const r = rng(7);
    const sea = g.createLinearGradient(0, 0, 0, 512);
    sea.addColorStop(0, "#2b6fbf");
    sea.addColorStop(0.5, "#1c5db0");
    sea.addColorStop(1, "#2b6fbf");
    g.fillStyle = sea;
    g.fillRect(0, 0, 1024, 512);
    for (let i = 0; i < 9; i++) {
      const cx = r() * 1024;
      const cy = 90 + r() * 330;
      g.fillStyle = r() > 0.4 ? "#3f8f4a" : "#a38a52";
      g.beginPath();
      for (let k = 0; k < 14; k++) {
        const a = (k / 14) * Math.PI * 2;
        const rad = 40 + r() * 70;
        g.lineTo(cx + Math.cos(a) * rad * 1.5, cy + Math.sin(a) * rad);
      }
      g.closePath();
      g.fill();
    }
    g.fillStyle = "rgba(255,255,255,0.9)";
    g.fillRect(0, 0, 1024, 26);
    g.fillRect(0, 486, 1024, 26);
    for (let i = 0; i < 46; i++) {
      g.fillStyle = `rgba(255,255,255,${0.15 + r() * 0.3})`;
      g.beginPath();
      g.ellipse(r() * 1024, r() * 512, 20 + r() * 60, 6 + r() * 14, 0, 0, Math.PI * 2);
      g.fill();
    }
  });
}

function moonTexture() {
  return paint(512, 256, (g) => {
    const r = rng(21);
    g.fillStyle = "#b9b9b9";
    g.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 1800; i++) {
      const v = 150 + r() * 80;
      g.fillStyle = `rgba(${v},${v},${v},0.35)`;
      g.fillRect(r() * 512, r() * 256, 2 + r() * 3, 2 + r() * 3);
    }
    for (let i = 0; i < 6; i++) {
      g.fillStyle = "rgba(90,90,96,0.45)";
      g.beginPath();
      g.ellipse(r() * 512, 40 + r() * 170, 30 + r() * 50, 20 + r() * 30, 0, 0, Math.PI * 2);
      g.fill();
    }
    for (let i = 0; i < 70; i++) {
      const x = r() * 512;
      const y = r() * 256;
      const rad = 3 + r() * 14;
      const gr = g.createRadialGradient(x, y, rad * 0.3, x, y, rad);
      gr.addColorStop(0, "rgba(70,70,76,0.7)");
      gr.addColorStop(0.85, "rgba(70,70,76,0.45)");
      gr.addColorStop(1, "rgba(230,230,235,0.7)");
      g.fillStyle = gr;
      g.beginPath();
      g.arc(x, y, rad, 0, Math.PI * 2);
      g.fill();
    }
  });
}

function Stars({ count = 700 }: { count?: number }) {
  const geometry = useMemo(() => {
    const r = rng(3);
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = r() * 2 - 1;
      const a = r() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const d = 70;
      pos.set([s * Math.cos(a) * d, u * d, s * Math.sin(a) * d], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count]);
  return (
    <points geometry={geometry}>
      <pointsMaterial color="#ffffff" size={0.22} sizeAttenuation transparent opacity={0.85} depthWrite={false} />
    </points>
  );
}

// ---------- Moon phases (real light and shadow) ----------
export function Moon3D({ state }: P) {
  const s = state as unknown as { angle: number; tilt: boolean };
  const a = (s.angle * Math.PI) / 180;
  const R = 3.4;
  const offset = s.tilt ? 0.55 * Math.sin(a + 1.0) : 0;
  const earth = useRef<THREE.Mesh>(null);
  const earthMap = useMemo(() => earthTexture(), []);
  const moonMap = useMemo(() => moonTexture(), []);
  useFrame((_, dt) => {
    if (earth.current) earth.current.rotation.y += dt * 0.4;
  });
  const kind = eclipseKind(s);
  // A fragment, so the background attaches to the scene itself.
  return (
    <>
      <color attach="background" args={["#03060f"]} />
      <Stars />
      <ambientLight intensity={0.1} />
      <directionalLight position={[-10, 0, 0]} intensity={3.4} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={4} shadow-camera-bottom={-4} shadow-camera-near={1} shadow-camera-far={20} />
      <mesh position={[-10, 0, 0]}>
        <sphereGeometry args={[1.8, 48, 48]} />
        <meshBasicMaterial color="#ffd36b" toneMapped={false} />
      </mesh>
      <Glow position={[-10, 0, 0]} size={9} colour="#ffb347" opacity={0.7} />
      <Tag position={[-10, 2.9, 0]} tone="#92400e">Sun</Tag>
      <mesh ref={earth} castShadow receiveShadow>
        <sphereGeometry args={[0.8, 64, 64]} />
        <meshStandardMaterial map={earthMap} roughness={0.7} />
      </mesh>
      <mesh rotation-x={Math.PI / 2}>
        <torusGeometry args={[R, 0.012, 8, 160]} />
        <meshBasicMaterial color="#5b6b86" />
      </mesh>
      <mesh position={[-R * Math.cos(a), offset, R * Math.sin(a)]} castShadow receiveShadow>
        <sphereGeometry args={[0.3, 48, 48]} />
        <meshStandardMaterial map={moonMap} bumpMap={moonMap} bumpScale={1.2} roughness={1} />
      </mesh>
      <Tag position={[0, 1.5, 0]} tone="#bfdbfe">Earth</Tag>
      <Tag position={[-R * Math.cos(a), 0.9 + offset, R * Math.sin(a)]} tone="#334155">{kind === "solar" ? "Solar eclipse" : kind === "lunar" ? "Lunar eclipse" : phaseName(s.angle)}</Tag>
    </>
  );
}

// ---------- Earth layers and plate tectonics ----------
const LAYER_R = { crust: 3, mantle: 2.85, outer: 1.64, inner: 0.57 };

function Core({ r, colour, glow }: { r: number; colour: string; glow: number }) {
  return (
    <mesh>
      <sphereGeometry args={[r, 64, 48, 0, Math.PI * 1.5]} />
      <meshStandardMaterial color={colour} emissive={colour} emissiveIntensity={glow} side={THREE.DoubleSide} roughness={0.55} toneMapped={glow < 0.5} />
    </mesh>
  );
}

export function Earth3D({ state }: P) {
  const s = state as unknown as { view: string; depth: number; boundary: string; time: number };
  if (s.view === "layers") {
    const markerR = 3 * (1 - s.depth / 6371);
    const dir = new THREE.Vector3(-Math.SQRT1_2, 0, -Math.SQRT1_2);
    const layer = layerAt(s.depth);
    const p = dir.clone().multiplyScalar(markerR);
    return (
      <group>
        <Core r={LAYER_R.crust} colour="#7c5a2e" glow={0.05} />
        <Core r={LAYER_R.mantle} colour="#e0541a" glow={0.55} />
        <Core r={LAYER_R.outer} colour="#f59e0b" glow={0.9} />
        <Core r={LAYER_R.inner} colour="#ffe27a" glow={1.4} />
        <Glow position={[0, 0, 0]} size={3.6} colour="#ffb347" opacity={0.35} />
        <mesh position={p}>
          <sphereGeometry args={[0.18, 20, 20]} />
          <meshStandardMaterial color="#0b1f4a" emissive="#38bdf8" emissiveIntensity={1.2} toneMapped={false} />
        </mesh>
        <Tag position={[p.x - 0.9, p.y + 0.5, p.z - 0.9]}>{layer.name} · {s.depth.toLocaleString()} km</Tag>
      </group>
    );
  }
  return <Plates boundary={s.boundary} time={s.time} />;
}

const ROCK = <meshStandardMaterial color="#8a6b43" roughness={0.9} />;
const SEAFLOOR = <meshStandardMaterial color="#4b5563" roughness={0.85} />;
const MANTLE = <meshStandardMaterial color="#e0541a" emissive="#c2410c" emissiveIntensity={0.7} roughness={0.7} />;
const MAGMA = <meshStandardMaterial color="#ffae3a" emissive="#ff7a1a" emissiveIntensity={1.8} toneMapped={false} />;

function Plates({ boundary, time }: { boundary: string; time: number }) {
  if (boundary === "divergent") {
    const g = time * 0.035;
    return (
      <group>
        <Floor size={[20, 10]} y={-2.4} />
        <RoundedBox args={[14, 2.4, 5]} radius={0.08} position={[0, -1.2, 0]}>{MANTLE}</RoundedBox>
        <RoundedBox args={[7, 0.6, 5]} radius={0.08} position={[-3.5 - g, 0.2, 0]} castShadow>{ROCK}</RoundedBox>
        <RoundedBox args={[7, 0.6, 5]} radius={0.08} position={[3.5 + g, 0.2, 0]} castShadow>{ROCK}</RoundedBox>
        <mesh position={[0, 0.2, 0]}><boxGeometry args={[Math.max(0.01, 2 * g), 0.6, 5]} /><meshStandardMaterial color="#3b2a16" roughness={1} /></mesh>
        <mesh position={[0, 0.05, 0]}><boxGeometry args={[0.5 + g, 0.3, 4.6]} />{MAGMA}</mesh>
        <Tag position={[0, 1.8, 0]}>Divergent: plates pull apart, new crust forms</Tag>
      </group>
    );
  }
  if (boundary === "convergent") {
    const slab = time * 0.05;
    const rise = time * 0.012;
    return (
      <group>
        <Floor size={[20, 10]} y={-2.4} />
        <RoundedBox args={[14, 2.4, 5]} radius={0.08} position={[0, -1.2, 0]}>{MANTLE}</RoundedBox>
        <RoundedBox args={[7, 0.5, 5]} radius={0.06} position={[-3.6, 0.2, 0]} castShadow>{SEAFLOOR}</RoundedBox>
        <group position={[0, 0.2, 0]} rotation-z={-0.65}>
          <mesh position={[slab / 2 + 0.01, 0, 0]}><boxGeometry args={[slab + 0.02, 0.5, 5]} />{SEAFLOOR}</mesh>
        </group>
        <RoundedBox args={[7, 0.9 + rise, 5]} radius={0.08} position={[3.5, 0.45 + rise / 2, 0]} castShadow>{ROCK}</RoundedBox>
        {[2.2, 3.4, 4.8].map((x, i) => (
          <mesh key={i} position={[x, 0.9 + rise + (rise * (3 - i)) / 6, 0]} castShadow>
            <coneGeometry args={[0.9, 0.9 + rise * (1 + i * 0.2), 5]} />
            <meshStandardMaterial color={i === 1 ? "#d1d5db" : "#6b5638"} roughness={0.95} flatShading />
          </mesh>
        ))}
        {time >= 30 && <mesh position={[3.4, 1.9 + rise, 0]}><sphereGeometry args={[0.28, 20, 20]} />{MAGMA}</mesh>}
        <Tag position={[0, 2.8, 0]}>Convergent: the oceanic plate sinks under the continent</Tag>
      </group>
    );
  }
  const off = time * 0.03;
  return (
    <group>
      <Floor size={[20, 11]} y={-0.8} />
      <RoundedBox args={[14, 0.8, 7]} radius={0.06} position={[0, -0.4, 0]}>{MANTLE}</RoundedBox>
      <RoundedBox args={[12, 0.5, 3.4]} radius={0.06} position={[-off, 0.25, -1.8]} castShadow>{ROCK}</RoundedBox>
      <RoundedBox args={[12, 0.5, 3.4]} radius={0.06} position={[off, 0.25, 1.8]} castShadow>{ROCK}</RoundedBox>
      <mesh position={[-off, 0.55, -1.8]}><boxGeometry args={[0.35, 0.1, 3.4]} /><meshStandardMaterial color="#fde047" emissive="#facc15" emissiveIntensity={0.6} /></mesh>
      <mesh position={[off, 0.55, 1.8]}><boxGeometry args={[0.35, 0.1, 3.4]} /><meshStandardMaterial color="#fde047" emissive="#facc15" emissiveIntensity={0.6} /></mesh>
      <Tag position={[0, 2.0, 0]}>Transform: plates slide past each other</Tag>
      {time >= 20 && <Tag position={[0, 1.2, 0]} tone="#b91c1c">Earthquake zone</Tag>}
    </group>
  );
}

// ---------- River ----------
function valleyShape(course: string) {
  const sh = new THREE.Shape();
  if (course === "upper") {
    sh.moveTo(-5.5, 0); sh.lineTo(-5.5, 5.3); sh.lineTo(-1, 0.83); sh.lineTo(1, 0.83); sh.lineTo(5.5, 5.3); sh.lineTo(5.5, 0);
  } else if (course === "middle") {
    sh.moveTo(-5.5, 0); sh.lineTo(-5.5, 4.2); sh.quadraticCurveTo(-3.6, 3.9, -2.4, 0.83); sh.lineTo(2.4, 0.83); sh.quadraticCurveTo(3.6, 3.9, 5.5, 4.2); sh.lineTo(5.5, 0);
  } else {
    sh.moveTo(-5.5, 0); sh.lineTo(-5.5, 2); sh.lineTo(-1.7, 2); sh.lineTo(-1.2, 0.83); sh.lineTo(1.2, 0.83); sh.lineTo(1.7, 2); sh.lineTo(5.5, 2); sh.lineTo(5.5, 0);
  }
  sh.closePath();
  return sh;
}

function halfWidth(course: string, y: number) {
  if (course === "upper") return 1 + (y - 0.83) * (4.5 / 4.47);
  if (course === "middle") return 2.4 + (y - 0.83) * (3.1 / 3.37);
  return y <= 2 ? 1.2 + (y - 0.83) * (0.5 / 1.17) : 5.5;
}

export function River3D({ state }: P) {
  const s = state as unknown as { course: string; flow: number };
  const { level, flooding } = water(s);
  const top = Math.min((50 + level) / 60, 5.0);
  const hw = Math.min(5.5, Math.max(0.4, halfWidth(s.course, top)));
  const geom = useMemo(() => new THREE.ExtrudeGeometry(valleyShape(s.course), { depth: 8, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 2 }), [s.course]);
  const bits = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    bits.current.forEach((m, i) => {
      if (!m) return;
      const u = (clock.elapsedTime * (0.05 + s.flow * 0.035) + i / 14) % 1;
      m.position.set(((i * 37) % 10) / 10 * hw * 1.6 - hw * 0.8, top + 0.03, -4 + u * 8);
    });
  });
  const rock = s.course === "upper" ? 0.28 : s.course === "middle" ? 0.15 : 0.07;
  return (
    <group position={[0, -1.4, 0]}>
      <Floor size={[18, 12]} y={0} />
      <mesh geometry={geom} position={[0, 0, -4]} castShadow receiveShadow>
        <meshStandardMaterial color="#9a7447" roughness={0.95} />
      </mesh>
      {/* grassy shoulders on the valley top */}
      {[-1, 1].map((d) => (
        <mesh key={d} position={[d * 5.3, s.course === "upper" ? 5.3 : s.course === "middle" ? 4.2 : 2.0, 0]} receiveShadow>
          <boxGeometry args={[0.7, 0.08, 8.1]} />
          <meshStandardMaterial color="#4f9d57" roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, (0.83 + top) / 2, 0]}>
        <boxGeometry args={[hw * 2, Math.max(0.05, top - 0.83), 8]} />
        <meshPhysicalMaterial color={flooding ? "#8a9a66" : "#2aa3df"} transparent opacity={0.82} roughness={0.2} clearcoat={0.1} envMapIntensity={0.25} depthWrite={false} />
      </mesh>
      {Array.from({ length: 14 }, (_, i) => (
        <mesh key={i} ref={(el) => { bits.current[i] = el; }}>
          <sphereGeometry args={[0.07, 10, 10]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} position={[((i * 53) % 11) / 11 * 1.6 - 0.8, 0.83 + rock * 0.5, -3.5 + (i * 0.65)]} rotation={[i, i * 2, 0]}>
          <dodecahedronGeometry args={[rock, 0]} />
          <meshStandardMaterial color="#7c746d" roughness={1} flatShading />
        </mesh>
      ))}
      <Tag position={[0, 6.6, 0]}>{COURSES[s.course].name}: {COURSES[s.course].shape}</Tag>
      {flooding && <Tag position={[0, 5.4, 0]} tone="#b91c1c">FLOOD! The river has burst its banks</Tag>}
    </group>
  );
}
