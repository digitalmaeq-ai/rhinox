"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Environment, Html, Lightformer, Line, RoundedBox } from "@react-three/drei";

import { solveCircuit } from "../specs/electric-circuit";
import { flight, TARGET, TOLERANCE } from "../specs/projectile-motion";
import { motion } from "../specs/forces-motion";
import { buildLayout, PX } from "../specs/gear-system";
import { Arrow, BulbReal, Brass, Cell, Floor, Flow, Rod, Steel, Tag, type V3 } from "./kit";

import type { SimState } from "../types";

type P = { state: SimState };

// ---------- Electric circuit ----------
function Joint({ at, color }: { at: V3; color: string }) {
  return (
    <mesh position={at}>
      <sphereGeometry args={[0.075, 14, 14]} />
      <meshPhysicalMaterial color={color} roughness={0.4} clearcoat={0.6} />
    </mesh>
  );
}

function Lead({ points, color }: { points: V3[]; color: string }) {
  return (
    <group>
      {points.slice(1).map((p, i) => (
        <Rod key={i} a={points[i]} b={p} color={color} r={0.065} />
      ))}
      {points.slice(1, -1).map((p, i) => (
        <Joint key={i} at={p} color={color} />
      ))}
    </group>
  );
}

function BulbHolder({ x, z, level, blown }: { x: number; z: number; level: number; blown: boolean }) {
  return (
    <group position={[x, 0, z]}>
      <RoundedBox args={[1.1, 0.34, 1.1]} radius={0.07} smoothness={3} position={[0, 0.17, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#e5e7eb" roughness={0.3} clearcoat={0.7} />
      </RoundedBox>
      <BulbReal position={[0, 0.3, 0]} level={level} blown={blown} />
    </group>
  );
}

export function Circuit3D({ state }: P) {
  const s = state as unknown as { closed: boolean; cells: number; bulbs: number; layout: string; rheo?: number };
  const r = solveCircuit(s);
  const live = s.closed && !r.blown;
  const series = r.series;
  const y = 0.42;
  const wire = live ? "#2563eb" : "#64748b";
  const R = series ? 5 : 1.5 + s.bulbs * 2;
  const batLen = s.cells * 0.95;
  const speed = 0.05 + r.totalAmps * 0.07;
  const sx = Array.from({ length: s.bulbs }, (_, i) => 0 + ((i + 0.5) * (R - -1)) / s.bulbs - 0.5);
  const px = Array.from({ length: s.bulbs }, (_, i) => 1 + ((i + 0.5) * (R - 1)) / s.bulbs);
  const swOpen = !s.closed;

  return (
    <group>
      <Floor size={[24, 12]} />
      {/* battery holder with its cells */}
      <RoundedBox args={[1.2, 0.34, batLen + 0.5]} radius={0.08} smoothness={3} position={[-5, 0.17, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#111827" roughness={0.5} clearcoat={0.4} />
      </RoundedBox>
      {Array.from({ length: s.cells }, (_, i) => (
        <Cell key={i} position={[-5, 0.62, -batLen / 2 + 0.475 + i * 0.95]} sleeve={i % 2 ? "#0f172a" : "#1d4ed8"} />
      ))}
      <Lead points={[[-5, y, -3], [-5, y, -batLen / 2 - 0.25]]} color={wire} />
      <Lead points={[[-5, y, batLen / 2 + 0.25], [-5, y, 3]]} color={wire} />
      <Tag position={[-5, 1.9, 0]}>{r.volts.toFixed(1)} V</Tag>
      {/* switch on a bakelite base with brass terminals */}
      <Lead points={[[-5, y, -3], [-3.6, y, -3]]} color={wire} />
      <RoundedBox args={[2.2, 0.22, 0.8]} radius={0.06} smoothness={3} position={[-2.9, 0.11, -3]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#1f2937" roughness={0.4} clearcoat={0.5} />
      </RoundedBox>
      {[-3.6, -2.2].map((x) => (
        <mesh key={x} position={[x, 0.34, -3]} castShadow>
          <cylinderGeometry args={[0.16, 0.18, 0.28, 20]} />
          <Brass />
        </mesh>
      ))}
      <group position={[-3.6, 0.5, -3]} rotation-z={swOpen ? 0.75 : 0}>
        <mesh position={[0.7, 0, 0]} castShadow>
          <boxGeometry args={[1.5, 0.1, 0.22]} />
          <Brass rough={0.22} />
        </mesh>
        <mesh position={[1.1, 0.22, 0]} castShadow>
          <sphereGeometry args={[0.2, 18, 18]} />
          <meshPhysicalMaterial color="#b91c1c" roughness={0.35} clearcoat={0.8} />
        </mesh>
      </group>
      <Tag position={[-2.9, 1.7, -3]}>Switch</Tag>
      <Lead points={[[-2.2, y, -3], [R, y, -3]]} color={wire} />
      <Lead points={[[-5, y, 3], [R, y, 3]]} color={wire} />
      {series ? (
        <>
          <Lead points={[[R, y, -3], [R, y, 3]]} color={wire} />
          {sx.map((x, i) => (
            <BulbHolder key={i} x={x} z={-3} level={r.brightness} blown={r.blown} />
          ))}
          <Flow active={live} speed={speed} count={16} points={[[-5, y, 3], [-5, y, -3], [R, y, -3], [R, y, 3], [-5, y, 3]]} />
        </>
      ) : (
        <>
          {px.map((x, i) => (
            <group key={i}>
              <Lead points={[[x, y, -3], [x, y, 3]]} color={wire} />
              <BulbHolder x={x} z={0} level={r.brightness} blown={r.blown} />
            </group>
          ))}
          <Flow active={live} speed={speed} count={8} points={[[-5, y, 3], [-5, y, -3], [R, y, -3]]} />
          <Flow active={live} speed={speed} count={8} points={[[R, y, 3], [-5, y, 3]]} />
          {px.map((x, i) => (
            <Flow key={i} active={live} speed={speed} count={5} points={[[x, y, -3], [x, y, 3]]} />
          ))}
        </>
      )}
    </group>
  );
}

// ---------- Projectile motion ----------
// An open playing field under a bright sky: striped lawn, painted distance
// lines, a flag at the target, trees and hills for depth, a trail behind the
// ball, time marks along the path, the top of the flight and the launch angle.
const SKY_TOP = "#6db6ee";
const SKY_HORIZON = "#eaf5fc";

function SkyDome() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: { top: { value: new THREE.Color(SKY_TOP) }, horizon: { value: new THREE.Color(SKY_HORIZON) } },
        vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
        fragmentShader:
          "uniform vec3 top; uniform vec3 horizon; varying vec3 vP; void main(){ float h = clamp(vP.y * 1.6 + 0.08, 0.0, 1.0); gl_FragColor = vec4(mix(horizon, top, pow(h, 0.7)), 1.0); }",
      }),
    [],
  );
  return (
    <mesh scale={150} renderOrder={-1}>
      <sphereGeometry args={[1, 32, 20]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

const TREES: [number, number, number][] = [
  [-9, -5.2, 1.1], [-6.5, -6.4, 0.9], [-2, -6, 1.2], [3, -6.6, 1], [7, -5.6, 1.15], [10.5, -6.2, 0.95],
  [-12.5, -1.5, 1], [12.8, -2.2, 1.1],
];

function Tree({ x, z, k }: { x: number; z: number; k: number }) {
  return (
    <group position={[x, 0, z]} scale={k}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.16, 0.9, 8]} />
        <meshStandardMaterial color="#7c5a3a" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.45, 0]} castShadow>
        <coneGeometry args={[0.7, 1.7, 10]} />
        <meshStandardMaterial color="#3f8f5a" roughness={0.85} />
      </mesh>
      <mesh position={[0, 2.1, 0]} castShadow>
        <coneGeometry args={[0.5, 1.3, 10]} />
        <meshStandardMaterial color="#4aa066" roughness={0.85} />
      </mesh>
    </group>
  );
}

function Label({ position, children, tone = "#0b1f4a", fill = "rgba(255,255,255,0.94)" }: { position: V3; children: React.ReactNode; tone?: string; fill?: string }) {
  return (
    <Html position={position} center distanceFactor={12} style={{ pointerEvents: "none" }}>
      <div
        style={{
          font: "700 12.5px Inter, system-ui, sans-serif",
          color: tone,
          whiteSpace: "nowrap",
          background: fill,
          padding: "4px 10px",
          borderRadius: 999,
          boxShadow: "0 4px 14px rgba(15,40,80,0.22)",
          border: "1px solid rgba(255,255,255,0.7)",
        }}
      >
        {children}
      </div>
    </Html>
  );
}

export function Projectile3D({ state }: P) {
  const s = state as unknown as { angle: number; speed: number; gravity: string; height?: number };
  const h0 = s.height ?? 0;
  const f = flight(s);
  const span = Math.max(f.range, TARGET + 15);
  const S = 12 / span;
  const x0 = -6;
  const Y0 = 0.5;
  const at = (t: number): V3 => [x0 + f.vx * t * S, Y0 + Math.max(0, h0 + f.vy * t - 0.5 * f.g * t * t) * S, 0];

  const pts = useMemo(
    () => Array.from({ length: 49 }, (_, i) => at((f.time * i) / 48)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s.angle, s.speed, s.gravity, h0],
  );
  const marks = useMemo(() => {
    const dt = f.time <= 2 ? 0.5 : f.time <= 6 ? 1 : 2;
    const out: { t: number; p: V3 }[] = [];
    for (let t = dt; t < f.time - dt / 3; t += dt) out.push({ t, p: at(t) });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.angle, s.speed, s.gravity, h0]);
  const apex = at(f.apexTime);
  const arc = useMemo(() => {
    const r = 1.35;
    return Array.from({ length: 21 }, (_, i) => {
      const a = ((s.angle * Math.PI) / 180) * (i / 20);
      return [x0 + Math.cos(a) * r, Y0 + h0 * S + Math.sin(a) * r, 0.02] as V3;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.angle, h0, S]);

  const ball = useRef<THREE.Mesh>(null);
  const trail = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const phase = (clock.elapsedTime % 3.6) / 3.6;
    const u = Math.min(1, phase / 0.78);
    const t = f.time * u;
    const p = at(t);
    ball.current?.position.set(p[0], p[1], p[2]);
    trail.current?.children.forEach((child, k) => {
      const q = at(Math.max(0, t - k * f.time * 0.02));
      child.position.set(q[0], q[1], q[2]);
      const m = child as THREE.Mesh;
      m.scale.setScalar(Math.max(0.05, 1 - k / 14) * (u > 0 && u < 1 ? 1 : 0.0001));
    });
  });

  const hit = Math.abs(f.range - TARGET) <= TOLERANCE;
  const rad = (s.angle * Math.PI) / 180;
  const tx = x0 + TARGET * S;
  const rr = Math.max(0.4, TOLERANCE * S * 1.6);
  const lx = x0 + f.range * S;
  const launchY = Y0 + h0 * S;
  const lines = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90].filter((m) => x0 + m * S < 8.4);

  return (
    <group>
      <color attach="background" args={[SKY_HORIZON]} />
      <fog attach="fog" args={[SKY_HORIZON, 34, 96]} />
      <SkyDome />

      <hemisphereLight args={["#e6f3ff", "#6a9f6e", 0.85]} />
      <directionalLight
        position={[-7, 11, 9]}
        intensity={2.3}
        color="#fff4e0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-13}
        shadow-camera-right={13}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-far={45}
        shadow-bias={-0.0004}
        shadow-radius={4}
      />
      <directionalLight position={[8, 4, -6]} intensity={0.45} color="#bcd9ff" />
      <Environment resolution={128} frames={1} environmentIntensity={0.7}>
        <Lightformer form="rect" intensity={3} position={[0, 8, 4]} scale={[14, 6, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.6} position={[-8, 3, 4]} scale={[8, 5, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.2} position={[8, 3, 2]} scale={[8, 5, 1]} rotation-y={-Math.PI / 2} />
      </Environment>

      {/* ground, distant hills and the mown field */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[120, 64]} />
        <meshStandardMaterial color="#86bf8f" roughness={1} />
      </mesh>
      {[[-34, -40, 11], [-8, -46, 14], [22, -42, 12], [46, -30, 10], [-52, -22, 9]].map(([hx, hz, hr], i) => (
        <mesh key={i} position={[hx, -hr * 0.62, hz]} scale={[1.9, 1, 1]}>
          <sphereGeometry args={[hr, 32, 20]} />
          <meshStandardMaterial color={i % 2 ? "#78b283" : "#6aa578"} roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, -0.14, 0]} receiveShadow>
        <boxGeometry args={[17.4, 0.26, 7.4]} />
        <meshStandardMaterial color="#cbd6c9" roughness={0.9} />
      </mesh>
      {Array.from({ length: 17 }, (_, i) => (
        <mesh key={i} position={[-8 + i + 0.5, 0.005, 0]} receiveShadow>
          <boxGeometry args={[1, 0.02, 7]} />
          <meshStandardMaterial color={i % 2 ? "#5fae6b" : "#72bd7c"} roughness={0.95} />
        </mesh>
      ))}
      {/* boundary and painted distance lines */}
      {[-3.5, 3.5].map((z) => (
        <mesh key={z} position={[0, 0.02, z]}>
          <boxGeometry args={[17, 0.01, 0.06]} />
          <meshBasicMaterial color="#f8fafc" />
        </mesh>
      ))}
      {lines.map((m) => (
        <group key={m}>
          <mesh position={[x0 + m * S, 0.02, 0]}>
            <boxGeometry args={[m % 20 === 0 ? 0.07 : 0.035, 0.01, 7]} />
            <meshBasicMaterial color="#f8fafc" transparent opacity={m % 20 === 0 ? 0.95 : 0.55} />
          </mesh>
          {m % 20 === 0 && (
            <Html position={[x0 + m * S, 0.04, 4.2]} center distanceFactor={13} style={{ pointerEvents: "none" }}>
              <div style={{ whiteSpace: "nowrap", font: "800 12px Inter, system-ui, sans-serif", color: "#0f3d2a", background: "rgba(255,255,255,0.85)", padding: "2px 8px", borderRadius: 999 }}>{m} m</div>
            </Html>
          )}
        </group>
      ))}
      {TREES.map(([x, z, k], i) => <Tree key={i} x={x} z={z} k={k} />)}

      {/* path: the full predicted curve, time marks, top of the flight */}
      <Line points={pts} color="#ffffff" lineWidth={5} transparent opacity={0.9} />
      <Line points={pts} color="#2f8fe6" lineWidth={2.4} />
      {marks.map((m) => (
        <mesh key={m.t} position={m.p}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
      <Line points={[[apex[0], 0.03, 0], apex]} color="#7c3aed" lineWidth={1.6} dashed dashSize={0.14} gapSize={0.1} transparent opacity={0.8} />
      <mesh position={apex}>
        <torusGeometry args={[0.16, 0.025, 8, 24]} />
        <meshBasicMaterial color="#7c3aed" />
      </mesh>
      <Label position={[apex[0], apex[1] + 0.5, 0]} tone="#6d28d9">Top {f.height.toFixed(1)} m</Label>

      {/* launch platform, carriage, barrel and the angle arc */}
      {h0 > 0 && (
        <group>
          <mesh position={[x0, (h0 * S) / 2 + 0.1, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.5, h0 * S + 0.2, 1.3]} />
            <meshStandardMaterial color="#c9d3df" roughness={0.75} />
          </mesh>
          <mesh position={[x0, h0 * S + 0.22, 0]} receiveShadow>
            <boxGeometry args={[1.62, 0.1, 1.42]} />
            <meshStandardMaterial color="#9fb0c4" roughness={0.6} />
          </mesh>
          <Label position={[x0 - 1.3, (h0 * S) / 2, 0]} tone="#334155">{h0} m</Label>
        </group>
      )}
      <group position={[x0, launchY, 0]}>
        <group rotation-z={rad} position={[0, 0.0, 0]}>
          <mesh position={[0.7, 0, 0]} rotation-z={-Math.PI / 2} castShadow>
            <cylinderGeometry args={[0.2, 0.3, 1.9, 32]} />
            <Steel colour="#5f6b7d" rough={0.28} />
          </mesh>
          {[0.1, 1.45].map((px) => (
            <mesh key={px} position={[px, 0, 0]} rotation-z={-Math.PI / 2}>
              <torusGeometry args={[px < 1 ? 0.3 : 0.21, 0.04, 12, 32]} />
              <Brass />
            </mesh>
          ))}
        </group>
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[0.36, 28, 28]} />
          <Steel colour="#3f4a5c" rough={0.3} />
        </mesh>
      </group>
      <RoundedBox args={[1.5, 0.2, 0.8]} radius={0.06} position={[x0 - 0.05, launchY - 0.34, 0]} castShadow>
        <meshStandardMaterial color="#2d3a4f" metalness={0.5} roughness={0.5} />
      </RoundedBox>
      {[-0.5, 0.5].map((dx) => (
        <group key={dx} position={[x0 + dx, launchY - 0.34, 0.5]} rotation-x={Math.PI / 2}>
          <mesh castShadow>
            <cylinderGeometry args={[0.26, 0.26, 0.12, 28]} />
            <meshStandardMaterial color="#1c2536" roughness={0.6} />
          </mesh>
          <mesh>
            <torusGeometry args={[0.26, 0.035, 10, 28]} />
            <Brass />
          </mesh>
        </group>
      ))}
      <Line points={arc} color="#0b1f4a" lineWidth={2.2} />
      <Label position={[x0 + 1.9, launchY - 0.25, 0.4]}>θ = {s.angle}°</Label>

      {/* the ball with its trail */}
      <group ref={trail}>
        {Array.from({ length: 14 }, (_, k) => (
          <mesh key={k}>
            <sphereGeometry args={[0.2, 14, 14]} />
            <meshBasicMaterial color="#fdba74" transparent opacity={0.45 * (1 - k / 14)} depthWrite={false} />
          </mesh>
        ))}
      </group>
      <mesh ref={ball} castShadow>
        <sphereGeometry args={[0.27, 32, 32]} />
        <meshPhysicalMaterial color="#f97316" roughness={0.22} clearcoat={1} emissive="#f97316" emissiveIntensity={0.22} />
      </mesh>

      {/* target: painted rings, flag and a landing marker */}
      {[1, 0.7, 0.4].map((k, i) => (
        <mesh key={k} position={[tx, 0.03 + i * 0.004, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[rr * k, 48]} />
          <meshStandardMaterial color={i === 1 ? "#ffffff" : hit ? "#16a34a" : "#dc2626"} roughness={0.5} emissive={hit ? "#16a34a" : "#000000"} emissiveIntensity={hit ? 0.4 : 0} />
        </mesh>
      ))}
      <mesh position={[tx, 0.9, -rr - 0.15]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 1.8, 10]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[tx + 0.28, 1.58, -rr - 0.15]} castShadow>
        <boxGeometry args={[0.56, 0.3, 0.02]} />
        <meshStandardMaterial color={hit ? "#16a34a" : "#dc2626"} roughness={0.7} />
      </mesh>
      <Label position={[tx, 2.15, -rr - 0.15]} tone={hit ? "#166534" : "#991b1b"}>Target {TARGET} m{hit ? " ✓" : ""}</Label>

      <mesh position={[lx, 0.04, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.2, 0.3, 32]} />
        <meshBasicMaterial color="#f59e0b" />
      </mesh>
      <mesh position={[lx, 0.3, 0]} castShadow>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshPhysicalMaterial color="#f97316" roughness={0.3} clearcoat={1} />
      </mesh>
      <Label position={[lx, 0.8, 1.9]} tone="#92400e">Lands {f.range.toFixed(1)} m</Label>
    </group>
  );
}

// ---------- Forces and motion ----------
type Surface = { top: string; rough: number; clear: number; metal: number };
const GROUND: Record<string, Surface> = {
  ice: { top: "#bfe3f7", rough: 0.05, clear: 1, metal: 0.05 },
  wood: { top: "#b98a55", rough: 0.55, clear: 0.2, metal: 0 },
  rough: { top: "#5b6470", rough: 1, clear: 0, metal: 0 },
};

export function Forces3D({ state }: P) {
  const s = state as unknown as { force: number; mass: number; surface: string };
  const m = motion(s);
  const g = GROUND[s.surface];
  const stripes = useRef<(THREE.Mesh | null)[]>([]);
  useFrame((_, dt) => {
    const v = Math.min(m.accel * 0.7, 6);
    stripes.current.forEach((mesh) => {
      if (!mesh) return;
      mesh.position.x -= v * dt;
      if (mesh.position.x < -9) mesh.position.x += 18;
    });
  });
  const size = 0.9 + s.mass * 0.09;
  return (
    <group>
      <Floor size={[20, 7]} />
      <mesh position={[0, -0.02, 0]} receiveShadow>
        <boxGeometry args={[18, 0.06, 5]} />
        <meshPhysicalMaterial color={g.top} roughness={g.rough} clearcoat={g.clear} metalness={g.metal} envMapIntensity={g.clear ? 1.4 : 0.4} />
      </mesh>
      {/* floor markings that slide past as the block speeds up */}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} position={[-9 + i * 1.5, 0.012, 1.9]} ref={(el) => { stripes.current[i] = el; }}>
          <boxGeometry args={[0.7, 0.012, 0.16]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>
      ))}
      {/* the weight: anodised steel block with a carrying ring */}
      <RoundedBox args={[size * 1.3, size, size * 1.3]} radius={0.1} smoothness={4} position={[0, size / 2, 0]} castShadow>
        <meshPhysicalMaterial color="#4a8bff" metalness={0.6} roughness={0.3} clearcoat={0.4} envMapIntensity={1.4} />
      </RoundedBox>
      <mesh position={[0, size + 0.02, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.22, 0.05, 12, 28]} />
        <Steel colour="#e5e7eb" rough={0.2} />
      </mesh>
      <Tag position={[0, size + 0.6, 0]}>{s.mass} kg</Tag>
      {s.force > 0 && <Arrow from={[-size * 0.65 - s.force * 0.045 - 0.3, size * 0.6, 0]} to={[-size * 0.65 - 0.1, size * 0.6, 0]} color="#22c55e" />}
      {s.force > 0 && <Tag position={[-size * 0.65 - s.force * 0.045 - 0.3, size * 0.6 + 0.6, 0]} tone="#166534">Push {s.force} N</Tag>}
      {m.friction > 0 && <Arrow from={[size * 0.65 + m.friction * 0.045 + 0.3, 0.3, 0]} to={[size * 0.65 + 0.1, 0.3, 0]} color="#ef4444" />}
      {m.friction > 0 && <Tag position={[size * 0.65 + m.friction * 0.045 + 0.3, 0.9, 0]} tone="#991b1b">Friction {m.friction.toFixed(0)} N</Tag>}
    </group>
  );
}

// ---------- Gears ----------
const K = 0.02;

function gearShape(teeth: number) {
  const r = teeth * PX;
  const root = r - 5;
  const tip = r + 5;
  const p = (Math.PI * 2) / teeth;
  const shape = new THREE.Shape();
  const pt = (rad: number, a: number): [number, number] => [Math.cos(a) * rad * K, -Math.sin(a) * rad * K];
  for (let i = 0; i < teeth; i++) {
    const c = i * p;
    const list = [pt(root, c - 0.3 * p), pt(tip, c - 0.14 * p), pt(tip, c + 0.14 * p), pt(root, c + 0.3 * p)];
    list.forEach(([x, y], j) => (i === 0 && j === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)));
  }
  shape.closePath();
  const hole = new THREE.Path();
  hole.absarc(0, 0, 0.3, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  // lightening holes in the web of larger gears
  if (teeth >= 22) {
    const rr = (root * K) * 0.62;
    const n = 5;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const h = new THREE.Path();
      h.absarc(Math.cos(a) * rr, Math.sin(a) * rr, root * K * 0.17, 0, Math.PI * 2, true);
      shape.holes.push(h);
    }
  }
  return shape;
}

function Gear({ lane, teeth, phase, sign, x, ratio, rpm, running, colour, label }: { lane: number; teeth: number; phase: number; sign: number; x: number; ratio: number; rpm: number; running: boolean; colour: string; label: string }) {
  const group = useRef<THREE.Group>(null);
  const angle = useRef(0);
  const geom = useMemo(
    () => new THREE.ExtrudeGeometry(gearShape(teeth), { depth: 0.6, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.05, bevelSegments: 2 }),
    [teeth],
  );
  useFrame((_, dt) => {
    if (running) angle.current += rpm * 6 * dt;
    if (group.current) group.current.rotation.z = -((phase * 180) / Math.PI + sign * angle.current * ratio) * (Math.PI / 180);
  });
  const rim = teeth * PX * K;
  return (
    <group position={[x, 0, 0]}>
      <group ref={group}>
        <mesh geometry={geom} position={[0, 0, -0.3]} castShadow receiveShadow>
          <meshStandardMaterial color={colour} metalness={0.72} roughness={0.38} envMapIntensity={1.5} />
        </mesh>
        {/* a red paint mark so you can see which way it turns */}
        <mesh position={[rim * 0.72, 0, 0.36]}>
          <boxGeometry args={[rim * 0.34, 0.12, 0.02]} />
          <meshStandardMaterial color="#ef4444" roughness={0.4} />
        </mesh>
      </group>
      {/* axle pin with a hex nut */}
      <mesh position={[0, 0, 0.1]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.16, 0.16, 1.2, 20]} />
        <Steel colour="#e5e7eb" rough={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.62]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.24, 0.24, 0.16, 6]} />
        <Steel colour="#cbd5e1" rough={0.25} />
      </mesh>
      <Tag position={[0, lane ? rim + 0.9 : -(rim + 0.9), 0]}>{label} · {teeth} teeth</Tag>
    </group>
  );
}

export function Gear3D({ state }: P) {
  const s = state as unknown as { driver: number; driven: number; rpm: number; idler: boolean; running: boolean };
  const { gears } = buildLayout(s);
  const total = gears[gears.length - 1].x + gears[gears.length - 1].teeth * PX;
  const tallest = Math.max(...gears.map((g) => g.teeth * PX * K));
  const colours = s.idler ? ["#d9a441", "#b6c0cd", "#4f93e6"] : ["#d9a441", "#4f93e6"];
  const wide = total * K + 1.4;
  return (
    <group>
      {/* mounting plate */}
      <RoundedBox args={[wide, tallest * 2 + 1.6, 0.3]} radius={0.12} smoothness={4} position={[0, 0, -0.65]} castShadow receiveShadow>
        <meshStandardMaterial color="#2b3a55" metalness={0.5} roughness={0.55} envMapIntensity={0.8} />
      </RoundedBox>
      <group position={[-(total * K) / 2, 0, 0]}>
        {gears.map((g, i) => (
          <Gear lane={i % 2} key={`${i}-${g.teeth}`} teeth={g.teeth} phase={g.phase} sign={g.sign} x={g.x * K} ratio={gears[0].teeth / g.teeth} rpm={s.rpm} running={s.running} colour={colours[i]} label={g.label} />
        ))}
      </group>
    </group>
  );
}
